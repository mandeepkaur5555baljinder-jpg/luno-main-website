import { FIRST_STOP, LOOKS_DESKTOP, LOOKS_MOBILE, SCENES, STOPS, STOP_COUNT, type Look } from "../scenes";
import { VIS_H, type FieldFrame, type LunoField } from "./LunoField";
import type { Quality } from "./quality";

/** Everything React cares about; changes rarely (on scene / mode change). */
export interface SceneState {
  active: number;
  /** 0..3 current mode (Auto, Pro, Deep, Code), -1 outside the modes scene */
  mode: number;
  /** 0..5 highlighted capability stream, -1 outside the capabilities scene */
  stream: number;
  ready: boolean;
  covered: boolean;
}

type Listener = () => void;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The one place that owns time.
 *
 *  - a single passive scroll listener records the target scroll position;
 *  - a single requestAnimationFrame loop advances the smoothed scene
 *    coordinate, writes CSS variables for the DOM scenes and draws the field;
 *  - the loop only runs while something is changing, drops to a capped ambient
 *    rate afterwards, and stops entirely after a period of no input, when the
 *    tab is hidden, or when the page below the scenes covers the canvas.
 */
export class Director {
  private root: HTMLElement;
  private field: LunoField | null;
  private q: Quality;

  private scenes: HTMLElement[] = [];
  private tops: number[] = [];
  private heights: number[] = [];
  private vh = 800;
  private canvasH = 800;
  private canvasW = 1200;
  private endY = Infinity;

  private targetY = 0;
  private lastY = -1;
  private s = 0;
  private sTarget = 0;
  private spinAngle = 0;
  private ptr = { x: 0, y: 0, tx: 0, ty: 0, seen: false, inside: false, amt: 0 };
  private pulseT = 0;
  private pulse = 0;
  private time = 0;
  private assemble = 0;
  private bootStart = -1;

  private running = false;
  private raf = 0;
  private timer = 0;
  private dirty = true;
  private moving = true;
  private lastUpdate = 0;
  private lastRender = 0;
  private lastInput = 0;
  private covered = false;
  private disposed = false;

  // adaptive quality
  private ema = 0.0167;
  private emaN = 0;
  private downgrades = 0;

  private manual: { kind: 0 | 1; idx: number } | null = null;
  private activeAmt = 0;
  private activeIdx = 0;
  private lastActiveKind = 0;

  private state: SceneState = { active: 0, mode: -1, stream: -1, ready: false, covered: false };
  private listeners = new Set<Listener>();
  private cache: { p: number; vis: number }[] = [];
  private frame: FieldFrame;
  private ro: ResizeObserver | null = null;
  private lastP = 0;

  constructor(root: HTMLElement, field: LunoField | null, quality: Quality) {
    this.root = root;
    this.field = field;
    this.q = quality;
    this.frame = {
      from: 0, to: 0, f: 0, tx: 0, ty: 0, scale: 1, rx: 0, ry: 0, time: 0, dim: 1, size: 1, mood: 0.2,
      swirl: 0, spread: 0.5, breath: 0, pointerX: 0, pointerY: 0, pointerAmt: 0, parallaxX: 0, parallaxY: 0, dof: 0, pulse: 0, flow: 0,
      activeKind: 0, active: -1, activeAmt: 0, assemble: 0, glowX: 0, glowY: 0, glowI: 1,
    };
  }

  /* ---------------------------------------------------------- lifecycle */

  start() {
    this.scenes = Array.from(this.root.querySelectorAll<HTMLElement>("[data-scene]"));
    this.cache = this.scenes.map(() => ({ p: -1, vis: -1 }));
    this.measure();
    this.targetY = window.scrollY;
    this.s = this.sTarget = this.computeS(this.targetY);
    if (this.field) this.field.onRestore = () => this.request();

    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onResize, { passive: true });
    if (this.q.pointer) {
      window.addEventListener("pointermove", this.onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", this.onPointerLeave, { passive: true });
      window.addEventListener("blur", this.onPointerLeave, { passive: true });
    }
    document.addEventListener("visibilitychange", this.onVisibility);
    this.ro = new ResizeObserver(() => this.onResize());
    this.ro.observe(this.root);
    // Web fonts change the height of nothing here (scenes use svh), but images / late layout might.
    window.addEventListener("load", this.onResize);

    this.bootStart = -1;
    this.assemble = this.q.reducedMotion || !this.field ? 1 : 0;
    this.lastInput = performance.now();
    this.update(0, true);
    this.state.ready = true;
    this.emit();
    this.request();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.clearTimeout(this.timer);
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointer);
    document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
    window.removeEventListener("blur", this.onPointerLeave);
    window.removeEventListener("load", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.ro?.disconnect();
    this.listeners.clear();
    this.field?.dispose();
    this.field = null;
  }

  /* -------------------------------------------------------------- store */

  subscribe = (fn: Listener) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getState = () => this.state;
  private emit() {
    this.state = { ...this.state };
    this.listeners.forEach((l) => l());
  }

  /* ---------------------------------------------------------- public API */

  /** Hover / focus / tap on a mode or stream label. Pass null to hand control back to scroll. */
  setManual(kind: 0 | 1, idx: number | null) {
    this.manual = idx == null ? null : { kind, idx };
    this.poke();
  }

  /** 0 = calm, ~0.35 = listening, 1 = thinking. The conversation demo drives this. */
  setPulse(level: number) {
    this.pulseT = level;
    this.poke();
  }

  /** Scroll position that puts the modes track on the given mode (0 Auto … 3 Code). */
  modeScrollY(i: number) {
    const im = 3;
    const travel = Math.max(1, this.heights[im] - this.vh);
    return this.tops[im] + travel * ((i + 0.3) / STOP_COUNT[im]);
  }

  /* -------------------------------------------------------------- input */

  private onScroll = () => {
    this.targetY = window.scrollY;
    this.poke();
  };

  private onResize = () => {
    this.measure();
    this.poke();
  };

  private onPointer = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    // canvas NDC (the canvas is top-aligned and canvasH tall)
    this.ptr.tx = (e.clientX / Math.max(1, this.canvasW)) * 2 - 1;
    this.ptr.ty = 1 - (e.clientY / Math.max(1, this.canvasH)) * 2;
    this.ptr.seen = true;
    this.ptr.inside = true;
    this.poke();
  };

  private onPointerLeave = () => {
    // Cursor left the window: let the pull and parallax ease back to rest.
    this.ptr.inside = false;
    this.ptr.tx = 0;
    this.ptr.ty = 0;
    this.poke();
  };

  private onVisibility = () => {
    if (document.hidden) {
      this.running = false;
      cancelAnimationFrame(this.raf);
      window.clearTimeout(this.timer);
      this.timer = 0;
    } else {
      this.poke();
    }
  };

  /** Any input: extend the ambient window and make sure the loop runs at full rate. */
  private poke() {
    this.lastInput = performance.now();
    this.dirty = true;
    this.request();
  }

  private request() {
    if (this.disposed || document.hidden) return;
    if (this.running) {
      // an ambient wait is pending: cut it short
      if (this.timer) {
        window.clearTimeout(this.timer);
        this.timer = 0;
        this.raf = requestAnimationFrame(this.tick);
      }
      return;
    }
    this.running = true;
    this.lastUpdate = 0;
    this.raf = requestAnimationFrame(this.tick);
  }

  /* ------------------------------------------------------------ measure */

  private measure() {
    const probe = this.root.querySelector<HTMLElement>("[data-probe-svh]");
    const probeL = this.root.querySelector<HTMLElement>("[data-probe-lvh]");
    this.vh = probe?.getBoundingClientRect().height || window.innerHeight;
    this.canvasH = probeL?.getBoundingClientRect().height || window.innerHeight;
    this.canvasW = window.innerWidth;
    const y = window.scrollY;
    this.tops = this.scenes.map((el) => el.getBoundingClientRect().top + y);
    this.heights = this.scenes.map((el) => el.getBoundingClientRect().height);
    const end = this.root.querySelector<HTMLElement>("[data-canvas-end]");
    this.endY = end ? end.getBoundingClientRect().top + y : Infinity;

    const f = this.field;
    if (f) {
      const shift = (this.canvasH - this.vh) / this.canvasH;
      const dpr = Math.min(window.devicePixelRatio || 1, this.q.dprMax) * Math.pow(0.8, Math.min(this.downgrades, 2));
      f.resize(this.canvasW, this.canvasH, Math.max(1, dpr), shift);
      f.setLayout(this.canvasW / this.canvasH, this.vh / this.canvasH);
    }
  }

  /**
   * Continuous STOP coordinate for a scroll position.
   * Inside a pinned track a scene walks through its own stops (the modes scene has four);
   * in the empty scroll after a track the object morphs on to the next scene's first stop.
   */
  private computeS(y: number) {
    const n = this.scenes.length;
    for (let i = 0; i < n - 1; i++) {
      const pinEnd = this.tops[i] + (this.heights[i] - this.vh);
      const next = this.tops[i + 1];
      const first = FIRST_STOP[i], count = STOP_COUNT[i];
      if (y < pinEnd) {
        if (count === 1) return first;
        const p = clamp((y - this.tops[i]) / Math.max(1, pinEnd - this.tops[i]));
        const u = p * count;
        const k = Math.min(count - 1, Math.floor(u));
        if (k === count - 1) return first + k;
        return first + k + smooth(clamp((u - k - 0.6) / 0.4));
      }
      if (y < next) return first + count - 1 + smooth(clamp((y - pinEnd) / Math.max(1, next - pinEnd)));
    }
    return STOPS.length - 1;
  }

  /* --------------------------------------------------------------- tick */

  private tick = (now: number) => {
    if (this.disposed) return;
    this.raf = 0;
    const ambientOK = !this.q.reducedMotion && !!this.field && now - this.lastInput < 20000 && !this.covered;
    const gap = 1000 / this.q.ambientFps;

    if (!this.dirty && !this.moving) {
      // Nothing but ambient breathing is left: run at the ambient rate, or stop entirely.
      if (!ambientOK) {
        this.running = false;
        return;
      }
    }

    const dtRaw = this.lastUpdate ? (now - this.lastUpdate) / 1000 : 1 / 60;
    this.lastUpdate = now;
    const dt = Math.min(0.05, dtRaw);
    this.dirty = false;
    const anim = this.update(dt, false, now);
    this.moving = anim;

    if (anim || this.dirty) {
      this.raf = requestAnimationFrame(this.tick);
      if (anim) this.watchPerformance(dtRaw);
    } else if (ambientOK) {
      // sleep between ambient frames instead of waking every vsync
      const wait = Math.max(0, gap - (performance.now() - now) - 4);
      this.timer = window.setTimeout(() => {
        this.timer = 0;
        this.raf = requestAnimationFrame(this.tick);
      }, wait);
    } else {
      this.running = false;
    }
  };

  /** Advance state and draw. Returns true while something is still moving. */
  private update(dt: number, initial: boolean, now = performance.now()): boolean {
    const reduced = this.q.reducedMotion;
    const y = this.targetY;
    const nStops = STOPS.length;

    this.sTarget = this.computeS(y);
    const ds = this.sTarget - this.s;
    if (Math.abs(ds) < 0.0006) this.s = this.sTarget;
    else this.s += ds * (initial ? 1 : 1 - Math.exp(-dt * (reduced ? 16 : 6.5)));
    const sMoving = this.s !== this.sTarget;

    // covered by opaque page content: no need to draw
    const covered = y >= this.endY - 2;
    if (covered !== this.covered) {
      this.covered = covered;
      this.state.covered = covered;
      this.emit();
    }

    this.writeScenes(y);

    // --- boot assembly
    let booting = false;
    if (this.assemble < 1 && this.field) {
      if (this.bootStart < 0) this.bootStart = now;
      const t = clamp((now - this.bootStart) / 2600);
      this.assemble = 1 - Math.pow(1 - t, 3);
      booting = t < 1;
    }

    // --- pointer (smoothed; the pull fades out when the cursor leaves the window)
    const pk = this.q.pointer && this.ptr.seen;
    const px = this.ptr.x, py = this.ptr.y, pa = this.ptr.amt;
    const k5 = 1 - Math.exp(-dt * 5);
    this.ptr.x += (this.ptr.tx - this.ptr.x) * k5;
    this.ptr.y += (this.ptr.ty - this.ptr.y) * k5;
    this.ptr.amt += ((this.ptr.inside ? 1 : 0) - this.ptr.amt) * (1 - Math.exp(-dt * 3.5));
    if (Math.abs(this.ptr.amt - (this.ptr.inside ? 1 : 0)) < 0.004) this.ptr.amt = this.ptr.inside ? 1 : 0;
    const pMoving = pk && (Math.abs(this.ptr.x - px) > 0.0004 || Math.abs(this.ptr.y - py) > 0.0004 || this.ptr.amt !== pa || Math.abs(this.ptr.tx - this.ptr.x) > 0.002 || Math.abs(this.ptr.ty - this.ptr.y) > 0.002);

    // --- thinking pulse
    this.pulse += (this.pulseT - this.pulse) * (1 - Math.exp(-dt * 4));
    if (Math.abs(this.pulse - this.pulseT) < 0.004) this.pulse = this.pulseT;
    const pulsing = this.pulse > 0.004;

    // --- active scene / mode / stream highlight (streams can also be pinned by hover)
    const activeScene = this.activeSceneIndex();
    const { mode, stream } = this.highlightFromScroll();
    let idx = -1, amt = 0;
    if (activeScene === 4) {
      idx = this.manual && this.manual.kind === 1 ? this.manual.idx : stream;
      amt = idx >= 0 ? 1 : 0;
    }
    if (idx >= 0) this.activeIdx = idx;
    const prevAmt = this.activeAmt;
    this.activeAmt += (amt - this.activeAmt) * (1 - Math.exp(-dt * 6));
    if (Math.abs(this.activeAmt - amt) < 0.01) this.activeAmt = amt;
    const activeMoving = this.activeAmt !== prevAmt;

    this.updateState(activeScene, mode, stream);

    // --- compose the frame
    const field = this.field;
    const moving = sMoving || pMoving || pulsing || activeMoving || booting || Math.abs(y - this.lastY) > 0.5;
    if (field && !this.covered) {
      const fr = this.frame;
      const looks = this.q.mobile || field.visibleWorld.portrait ? LOOKS_MOBILE : LOOKS_DESKTOP;
      const i0 = clamp(Math.floor(this.s), 0, nStops - 2);
      const f = this.s >= nStops - 1 ? 1 : this.s - i0;
      const g = smooth(f);
      const a = looks[i0], b = looks[i0 + 1];
      const world = field.visibleWorld;
      const fitCompact = Math.min(1, world.W / (world.portrait ? 3.55 : 4.0));
      const scaleOf = (l: Look) => l.sc * (l.wide ? 1 : fitCompact);
      const mix = (k: keyof Look) => lerp(a[k] as number, b[k] as number, g);

      this.time += dt;
      const spin = mix("spin");
      if (!reduced) this.spinAngle += dt * spin;

      const wave = reduced ? 0 : 1;
      // Layouts authored to the viewport (modes, streams) must not be spun or scroll-rotated.
      const still = 1 - lerp(a.flat ? 1 : 0, b.flat ? 1 : 0, g);
      fr.from = STOPS[i0].shape;
      fr.to = STOPS[i0 + 1].shape;
      fr.f = f;
      fr.tx = lerp(a.ox, b.ox, g) * world.W;
      fr.ty = lerp(a.oy, b.oy, g) * world.H;
      // Scale: a push-in that drifts through each pinned track, plus a swell mid-morph
      // (the camera seems to travel through the change instead of cutting).
      const swell = wave * 0.16 * Math.sin(Math.PI * g);
      const drift = wave * 0.1 * (this.lastP - 0.5);
      fr.scale = lerp(scaleOf(a), scaleOf(b), g) * (1 + swell + drift);
      const pAmt = pk ? this.ptr.amt : 0;
      fr.rx = mix("rx") - this.ptr.y * 0.07 * pAmt * still;
      fr.ry = mix("ry") + (this.spinAngle + this.s * 0.2 * wave + this.ptr.x * 0.1 * pAmt) * still;
      fr.time = this.time;
      fr.dim = mix("dim");
      fr.size = mix("size") * (this.q.mobile ? 1.15 : 1);
      fr.mood = mix("mood");
      fr.swirl = 1.1 * wave;
      fr.spread = reduced ? 0.001 : 0.55;
      fr.breath = wave;
      fr.pointerAmt = pAmt;
      fr.parallaxX = this.ptr.x * 0.1 * pAmt;
      fr.parallaxY = this.ptr.y * 0.07 * pAmt;
      fr.dof = this.q.tier === "high" ? 1 : 0.6;
      fr.pulse = this.pulse * wave;
      // streams light only while the field is (mostly) the streams shape
      fr.flow = wave * (fr.from === 7 ? 1 - g : fr.to === 7 ? g : 0);
      fr.activeKind = 1;
      fr.active = this.activeIdx;
      fr.activeAmt = this.activeAmt;
      fr.assemble = this.assemble;
      fr.glowX = mix("glowX");
      fr.glowY = mix("glowY");
      fr.glowI = mix("glowI") * (0.35 + 0.65 * this.assemble);

      // pointer in world space (matches the shader's post-model space)
      const shift = (this.canvasH - this.vh) / this.canvasH;
      const aspect = this.canvasW / this.canvasH;
      fr.pointerX = this.ptr.x * VIS_H * aspect * 0.5;
      fr.pointerY = (this.ptr.y - shift) * VIS_H * 0.5;

      field.render(fr);
      this.lastRender = now;
    }

    this.lastY = y;
    return moving;
  }

  /* --------------------------------------------------------- DOM / state */

  /**
   * Write --p (progress inside the pinned track) and --vis (fade in / out) to each scene.
   * Text leaves in the first ~40% of the outgoing scroll and returns in the last ~40% of the
   * incoming one, so the middle of every transition belongs to the particles alone.
   */
  private writeScenes(y: number) {
    const vh = this.vh;
    const last = this.scenes.length - 1;
    for (let i = 0; i <= last; i++) {
      const top = this.tops[i];
      const travel = Math.max(1, this.heights[i] - vh);
      const p = clamp((y - top) / travel);
      const enter = smooth(clamp((y - (top - vh * 0.55)) / (vh * 0.5)));
      const exit = i === last ? 0 : smooth(clamp((y - (top + travel)) / (vh * 0.4)));
      const vis = enter * (1 - exit);
      const c = this.cache[i];
      const pr = Math.round(p * 1000) / 1000;
      const vr = Math.round(vis * 100) / 100;
      if (c.p !== pr) { this.scenes[i].style.setProperty("--p", String(pr)); c.p = pr; }
      if (c.vis !== vr) { this.scenes[i].style.setProperty("--vis", String(vr)); c.vis = vr; }
    }
    const act = this.activeSceneIndex();
    this.lastP = clamp((y - this.tops[act]) / Math.max(1, this.heights[act] - vh));
  }

  private activeSceneIndex() {
    return STOPS[clamp(Math.round(this.sTarget), 0, STOPS.length - 1)].scene;
  }

  private highlightFromScroll() {
    let mode = -1, stream = -1;
    const st = this.sTarget;
    const m0 = FIRST_STOP[3], mc = STOP_COUNT[3];
    if (st > m0 - 0.4 && st < m0 + mc - 1 + 0.4) mode = clamp(Math.round(st - m0), 0, mc - 1);
    if (this.activeSceneIndex() === 4) {
      const p = clamp((this.targetY - this.tops[4]) / Math.max(1, this.heights[4] - this.vh));
      stream = Math.min(5, Math.floor(clamp((p - 0.04) / 0.92) * 6));
    }
    return { mode, stream };
  }

  private updateState(active: number, mode: number, stream: number) {
    const s = this.state;
    if (s.active !== active || s.mode !== mode || s.stream !== stream) {
      s.active = active;
      s.mode = mode;
      s.stream = stream;
      this.emit();
    }
  }

  /* ---------------------------------------------------- adaptive quality */

  private watchPerformance(dt: number) {
    if (!this.field || dt > 0.1) return; // ignore stalls (tab switches, GC)
    this.ema = this.ema * 0.92 + dt * 0.08;
    this.emaN++;
    if (this.emaN < 50 || this.ema < 0.026 || this.downgrades >= 4) return;
    this.downgrades++;
    this.emaN = 0;
    this.ema = 0.0167;
    if (this.downgrades <= 2) {
      const dpr = Math.max(1, this.field.currentDpr * 0.8);
      this.field.setDpr(dpr);
    } else {
      this.field.setCount(this.field.particleCount * 0.7);
    }
  }
}
