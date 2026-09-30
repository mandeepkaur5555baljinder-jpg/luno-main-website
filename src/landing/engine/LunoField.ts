import { BG_FRAG, BG_VERT, POINTS_FRAG, POINTS_VERT } from "./shaders";
import { LAYOUT_DEPENDENT, SHAPE_COUNT, buildShape, makeBase, type Base, type Layout } from "./shapes";

/** Everything the shader needs for one frame. Filled in by the director. */
export interface FieldFrame {
  from: number;
  to: number;
  f: number;
  tx: number;
  ty: number;
  scale: number;
  rx: number;
  ry: number;
  time: number;
  dim: number;
  size: number;
  mood: number;
  swirl: number;
  spread: number;
  breath: number;
  pointerX: number;
  pointerY: number;
  pointerAmt: number;
  pulse: number;
  flow: number;
  activeKind: number;
  active: number;
  activeAmt: number;
  assemble: number;
  glowX: number;
  glowY: number;
  glowI: number;
}

export const FOV = (38 * Math.PI) / 180;
export const CAM_Z = 7;
/** visible world height at the object plane */
export const VIS_H = 2 * Math.tan(FOV / 2) * CAM_Z;

/**
 * One WebGL2 context, two draw calls (background + points), no dependencies.
 * Owns GL resources only; it never schedules its own frames.
 */
export class LunoField {
  readonly canvas: HTMLCanvasElement;
  private gl!: WebGL2RenderingContext;
  private pointsProg!: WebGLProgram;
  private bgProg!: WebGLProgram;
  private vao!: WebGLVertexArrayObject;
  private emptyVao!: WebGLVertexArrayObject;
  private buffers: WebGLBuffer[] = [];
  private uni: Record<string, WebGLUniformLocation | null> = {};
  private bgUni: Record<string, WebGLUniformLocation | null> = {};
  private maxPointPx = 12;

  private base: Base;
  private shapes: Float32Array[] = [];
  private layout: Layout = { W: 8, H: VIS_H, portrait: false };
  private total: number;
  private count: number;

  private cssW = 1;
  private cssH = 1;
  private dpr = 1;
  private shift = 0;
  private lost = false;
  private disposed = false;

  /** called after the GL context is restored so the owner can repaint */
  onRestore?: () => void;

  constructor(canvas: HTMLCanvasElement, particles: number) {
    this.canvas = canvas;
    this.total = particles;
    this.count = particles;
    this.base = makeBase(particles);
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "default",
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    canvas.addEventListener("webglcontextlost", this.handleLost);
    canvas.addEventListener("webglcontextrestored", this.handleRestored);
    for (let k = 0; k < SHAPE_COUNT; k++) this.shapes.push(buildShape(k, this.base, this.layout));
    this.init();
  }

  /* ------------------------------------------------------------ setup */

  private compile(type: number, src: string) {
    const gl = this.gl;
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error("Shader compile failed: " + log);
    }
    return sh;
  }

  private link(vs: string, fs: string) {
    const gl = this.gl;
    const prog = gl.createProgram()!;
    const v = this.compile(gl.VERTEX_SHADER, vs);
    const f = this.compile(gl.FRAGMENT_SHADER, fs);
    gl.attachShader(prog, v);
    gl.attachShader(prog, f);
    gl.linkProgram(prog);
    gl.deleteShader(v);
    gl.deleteShader(f);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error("Program link failed: " + gl.getProgramInfoLog(prog));
    }
    return prog;
  }

  private init() {
    const gl = this.gl;
    this.pointsProg = this.link(POINTS_VERT, POINTS_FRAG);
    this.bgProg = this.link(BG_VERT, BG_FRAG);

    for (const name of [
      "uViewProj", "uModel", "uFrom", "uTo", "uF", "uSpread", "uSwirl", "uTime", "uBreath", "uPointer",
      "uPointerAmt", "uPulse", "uFlow", "uActive", "uActiveKind", "uActiveAmt", "uSize", "uPx", "uMaxPx",
      "uDim", "uMood", "uAssemble",
    ]) this.uni[name] = gl.getUniformLocation(this.pointsProg, name);
    for (const name of ["uRes", "uGlow", "uMood", "uDim"]) this.bgUni[name] = gl.getUniformLocation(this.bgProg, name);

    const range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array;
    this.maxPointPx = Math.max(4, Math.min(range[1], 24));

    this.vao = gl.createVertexArray()!;
    this.emptyVao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    this.buffers = [];

    const bind = (name: string, data: Float32Array, size: number) => {
      const loc = gl.getAttribLocation(this.pointsProg, name);
      const buf = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      if (loc >= 0) {
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      }
      this.buffers.push(buf);
    };
    for (let k = 0; k < SHAPE_COUNT; k++) bind("aS" + k, this.shapes[k], 4);
    bind("aSeed", this.base.seed, 4);
    bind("aMeta", this.base.meta, 3);
    gl.bindVertexArray(null);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    this.applySize();
  }

  private handleLost = (e: Event) => {
    e.preventDefault();
    this.lost = true;
  };

  private handleRestored = () => {
    this.lost = false;
    this.uni = {};
    this.bgUni = {};
    this.init();
    this.onRestore?.();
  };

  /* ---------------------------------------------------------- sizing */

  /** cssW/cssH: canvas box in CSS px. shift: NDC y offset that centres the scene on the small viewport. */
  resize(cssW: number, cssH: number, dpr: number, shift: number) {
    this.cssW = Math.max(1, cssW);
    this.cssH = Math.max(1, cssH);
    this.dpr = dpr;
    this.shift = shift;
    this.applySize();
  }

  setDpr(dpr: number) {
    if (Math.abs(dpr - this.dpr) < 0.01) return;
    this.dpr = dpr;
    this.applySize();
  }

  get currentDpr() {
    return this.dpr;
  }

  private applySize() {
    const w = Math.round(this.cssW * this.dpr);
    const h = Math.round(this.cssH * this.dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  get visibleWorld(): Layout {
    return this.layout;
  }

  /** Recompute the world-space size of the visible area and rebuild aspect-dependent shapes if the orientation flipped. */
  setLayout(aspect: number, viewH: number) {
    // viewH: the fraction of the canvas that is actually the small viewport
    const H = VIS_H * viewH;
    const W = VIS_H * aspect;
    const portrait = W / H < 0.95;
    const prev = this.layout;
    const changed = portrait !== prev.portrait || Math.abs(W - prev.W) > 0.35 || Math.abs(H - prev.H) > 0.35;
    this.layout = { W, H, portrait };
    if (!changed) return false;
    const gl = this.gl;
    for (const k of LAYOUT_DEPENDENT) {
      this.shapes[k] = buildShape(k, this.base, this.layout);
      if (!this.lost) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[k]);
        gl.bufferData(gl.ARRAY_BUFFER, this.shapes[k], gl.STATIC_DRAW);
      }
    }
    return true;
  }

  setCount(n: number) {
    this.count = Math.max(2000, Math.min(this.total, Math.floor(n)));
  }

  get particleCount() {
    return this.count;
  }

  /* ---------------------------------------------------------- render */

  render(fr: FieldFrame) {
    if (this.lost || this.disposed) return;
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // -- background
    gl.disable(gl.BLEND);
    gl.useProgram(this.bgProg);
    gl.bindVertexArray(this.emptyVao);
    gl.uniform2f(this.bgUni.uRes, this.canvas.width, this.canvas.height);
    gl.uniform3f(this.bgUni.uGlow, fr.glowX, fr.glowY, fr.glowI);
    gl.uniform1f(this.bgUni.uMood, fr.mood);
    gl.uniform1f(this.bgUni.uDim, Math.min(1, fr.dim));
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // -- particles
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(this.pointsProg);
    gl.bindVertexArray(this.vao);

    const aspect = this.cssW / this.cssH;
    const vp = perspective(FOV, aspect, 0.1, 40, this.shift);
    gl.uniformMatrix4fv(this.uni.uViewProj, false, vp);
    gl.uniformMatrix4fv(this.uni.uModel, false, modelMatrix(fr.tx, fr.ty, fr.scale, fr.rx, fr.ry));

    const u = this.uni;
    gl.uniform1f(u.uFrom, fr.from);
    gl.uniform1f(u.uTo, fr.to);
    gl.uniform1f(u.uF, fr.f);
    gl.uniform1f(u.uSpread, fr.spread);
    gl.uniform1f(u.uSwirl, fr.swirl);
    gl.uniform1f(u.uTime, fr.time);
    gl.uniform1f(u.uBreath, fr.breath);
    gl.uniform2f(u.uPointer, fr.pointerX, fr.pointerY);
    gl.uniform1f(u.uPointerAmt, fr.pointerAmt);
    gl.uniform1f(u.uPulse, fr.pulse);
    gl.uniform1f(u.uFlow, fr.flow);
    gl.uniform1f(u.uActive, fr.active);
    gl.uniform1f(u.uActiveKind, fr.activeKind);
    gl.uniform1f(u.uActiveAmt, fr.activeAmt);
    gl.uniform1f(u.uSize, fr.size * 0.021);
    // pixels per world unit at distance 1 from the camera
    gl.uniform1f(u.uPx, (this.canvas.height / (2 * Math.tan(FOV / 2))));
    gl.uniform1f(u.uMaxPx, this.maxPointPx * this.dpr);
    gl.uniform1f(u.uDim, fr.dim);
    gl.uniform1f(u.uMood, fr.mood);
    gl.uniform1f(u.uAssemble, fr.assemble);
    gl.drawArrays(gl.POINTS, 0, this.count);
    gl.bindVertexArray(null);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.canvas.removeEventListener("webglcontextlost", this.handleLost);
    this.canvas.removeEventListener("webglcontextrestored", this.handleRestored);
    const gl = this.gl;
    if (!this.lost) {
      for (const b of this.buffers) gl.deleteBuffer(b);
      gl.deleteVertexArray(this.vao);
      gl.deleteVertexArray(this.emptyVao);
      gl.deleteProgram(this.pointsProg);
      gl.deleteProgram(this.bgProg);
    }
    // Release the context immediately rather than waiting for GC.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    this.buffers = [];
  }
}

/* --------------------------------------------------------- matrices */

const VP = new Float32Array(16);
function perspective(fov: number, aspect: number, near: number, far: number, shiftNdcY: number) {
  const f = 1 / Math.tan(fov / 2);
  const nf = 1 / (near - far);
  // projection (column-major)
  const p = [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  // vertical NDC shift: row1 += shift * row3
  for (let c = 0; c < 4; c++) p[c * 4 + 1] += shiftNdcY * p[c * 4 + 3];
  // view = translate(0,0,-CAM_Z)
  for (let i = 0; i < 12; i++) VP[i] = p[i];
  for (let i = 0; i < 4; i++) VP[12 + i] = p[12 + i] - CAM_Z * p[8 + i];
  return VP;
}

const M = new Float32Array(16);
function modelMatrix(tx: number, ty: number, s: number, rx: number, ry: number) {
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
  M[0] = cy * s; M[1] = 0; M[2] = -sy * s; M[3] = 0;
  M[4] = sy * sx * s; M[5] = cx * s; M[6] = cy * sx * s; M[7] = 0;
  M[8] = sy * cx * s; M[9] = -sx * s; M[10] = cy * cx * s; M[11] = 0;
  M[12] = tx; M[13] = ty; M[14] = 0; M[15] = 1;
  return M;
}
