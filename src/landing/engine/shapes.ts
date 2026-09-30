/**
 * Point-cloud shape generators for the Luno field.
 *
 * Every particle keeps ONE identity for the whole page. Its position in each
 * of the SHAPE_COUNT shapes is generated here once; the GPU then blends
 * between two of them. Shapes derive from a shared per-particle direction
 * (`dir`) wherever they are sphere-like, and cluster / stream membership is
 * assigned by rank along that direction. That is what makes a morph read as
 * one organism re-organising (a sphere splitting into five slabs that fly to
 * five clusters) rather than as dust cross-fading with dust.
 *
 * Layout units: world space, camera looks down -Z, visible height ≈ layout.H.
 */

export const SHAPE_COUNT = 7;

export interface Layout {
  /** visible world width / height at the object plane */
  W: number;
  H: number;
  portrait: boolean;
}

export interface Base {
  n: number;
  /** unit direction per particle (evenly covers a sphere) */
  dir: Float32Array;
  /** x: stagger delay 0..1, y: colour tone, z: size/brightness random, w: phase */
  seed: Float32Array;
  /** x: mode cluster 0..4, y: stream ribbon 0..3, z: position along stream 0..1 */
  meta: Float32Array;
  /** stable uniform randoms for category choice */
  pick: Float32Array;
}

/* ------------------------------------------------------------------ rng */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(r: () => number) {
  // Box–Muller, one value
  const u = Math.max(1e-6, r());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185307 * r());
}

const hash2 = (a: number, b: number) => {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/* ------------------------------------------------------------- base data */

export function makeBase(n: number): Base {
  const r = mulberry32(0x1a2b3c);
  const dir = new Float32Array(n * 3);
  const seed = new Float32Array(n * 4);
  const meta = new Float32Array(n * 3);
  const pick = new Float32Array(n);

  // Shuffled fibonacci lattice so index ranges never correlate with latitude.
  const perm = new Uint32Array(n);
  for (let i = 0; i < n; i++) perm[i] = i;
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = perm[i];
    perm[i] = perm[j];
    perm[j] = t;
  }
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let p = 0; p < n; p++) {
    const i = perm[p];
    const y = 1 - (2 * (i + 0.5)) / n;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * golden;
    dir[p * 3] = Math.cos(phi) * rad;
    dir[p * 3 + 1] = y;
    dir[p * 3 + 2] = Math.sin(phi) * rad;
    pick[p] = r();
  }

  // Rank-based cluster / ribbon / stream coordinate.
  const byX = Array.from({ length: n }, (_, i) => i).sort((a, b) => dir[a * 3] - dir[b * 3]);
  const byY = Array.from({ length: n }, (_, i) => i).sort((a, b) => dir[a * 3 + 1] - dir[b * 3 + 1]);
  byX.forEach((p, rank) => {
    meta[p * 3] = Math.min(4, Math.floor((rank / n) * 5));
    meta[p * 3 + 2] = Math.min(1, Math.max(0, rank / n + (r() - 0.5) * 0.02));
  });
  byY.forEach((p, rank) => {
    meta[p * 3 + 1] = Math.min(3, Math.floor((rank / n) * 4));
  });

  for (let p = 0; p < n; p++) {
    const yn = dir[p * 3 + 1] * 0.5 + 0.5;
    seed[p * 4] = Math.min(1, Math.max(0, 0.6 * yn + 0.4 * r())); // delay: sweeps top→bottom
    seed[p * 4 + 1] = Math.pow(r(), 1.4); // tone
    seed[p * 4 + 2] = r(); // size random
    seed[p * 4 + 3] = r(); // phase
  }
  return { n, dir, seed, meta, pick };
}

/* ------------------------------------------------------------- helpers */

type Vec = [number, number, number];

function sph(theta: number, phi: number, rad: number): Vec {
  const s = Math.sin(theta);
  return [rad * s * Math.cos(phi), rad * Math.cos(theta), rad * s * Math.sin(phi)];
}

function fibSphere(n: number, rad: number, r: () => number, jitter = 0): Vec[] {
  const out: Vec[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const rr = Math.sqrt(1 - y * y);
    const phi = i * golden;
    const k = rad * (1 + (r() - 0.5) * jitter);
    out.push([Math.cos(phi) * rr * k, y * k, Math.sin(phi) * rr * k]);
  }
  return out;
}

function ballPoints(n: number, rmin: number, rmax: number, r: () => number): Vec[] {
  const out: Vec[] = [];
  while (out.length < n) {
    const v: Vec = [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1];
    const l = Math.hypot(v[0], v[1], v[2]);
    if (l > 1 || l < 1e-3) continue;
    const k = rmin + (rmax - rmin) * l;
    out.push([(v[0] / l) * k, (v[1] / l) * k, (v[2] / l) * k]);
  }
  return out;
}

interface Graph {
  hubs: Vec[];
  edges: [number, number][];
}

function makeGraph(hubs: Vec[], k: number): Graph {
  const seen = new Set<number>();
  const edges: [number, number][] = [];
  for (let i = 0; i < hubs.length; i++) {
    const d = hubs
      .map((h, j) => ({ j, d: (h[0] - hubs[i][0]) ** 2 + (h[1] - hubs[i][1]) ** 2 + (h[2] - hubs[i][2]) ** 2 }))
      .filter((x) => x.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, k);
    for (const { j } of d) {
      const key = Math.min(i, j) * 4096 + Math.max(i, j);
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([i, j]);
    }
  }
  return { hubs, edges };
}

function nearestHub(hubs: Vec[], x: number, y: number, z: number): number {
  let best = 0;
  let bd = Infinity;
  for (let i = 0; i < hubs.length; i++) {
    const d = (hubs[i][0] - x) ** 2 + (hubs[i][1] - y) ** 2 + (hubs[i][2] - z) ** 2;
    if (d < bd) {
      bd = d;
      best = i;
    }
  }
  return best;
}

/* -------------------------------------------------------------- shapes */

/** 0 — the Luno core: a cell-lattice orb, floating fragments, nucleus, orbit ring, sparkle. */
function core(base: Base, out: Float32Array) {
  const r = mulberry32(101);
  const ROWS = 12;
  const dTheta = Math.PI / ROWS;
  const { n, dir, pick } = base;
  for (let p = 0; p < n; p++) {
    const t = pick[p];
    const dx = dir[p * 3], dy = dir[p * 3 + 1], dz = dir[p * 3 + 2];
    let x = 0, y = 0, z = 0, w = 0.5;

    if (t < 0.6) {
      // ---- shell built from square-ish cells
      const theta = Math.acos(Math.max(-1, Math.min(1, dy)));
      const phi = Math.atan2(dz, dx);
      const row = Math.min(ROWS - 1, Math.floor(theta / dTheta));
      const cols = Math.max(3, Math.round(2 * ROWS * Math.sin((row + 0.5) * dTheta)));
      const col = Math.min(cols - 1, Math.floor(((phi + Math.PI) / (2 * Math.PI)) * cols));
      const h = hash2(row, col);
      let u = ((phi + Math.PI) / (2 * Math.PI)) * cols - col;
      let v = theta / dTheta - row;
      u = 0.07 + u * 0.86;
      v = 0.07 + v * 0.86;
      let radius = 1.0;
      if (h > 0.86) {
        // a cell lifted off the surface: a data fragment
        radius = 1.14 + hash2(col, row + 7) * 0.5;
        w = 0.75;
      } else {
        const ex = hash2(row + 31, col + 11);
        radius = 1.0 + (ex > 0.82 ? 0.06 : ex > 0.6 ? 0.03 : 0);
        w = 0.42 + (ex > 0.82 ? 0.18 : 0);
      }
      if (r() < 0.55) {
        // pull onto a cell edge
        if (r() < 0.5) u = u < 0.5 ? 0.07 : 0.93;
        else v = v < 0.5 ? 0.07 : 0.93;
        w += 0.3;
      }
      const th = (row + v) * dTheta;
      const ph = ((col + u) / cols) * 2 * Math.PI - Math.PI;
      [x, y, z] = sph(th, ph, radius);
    } else if (t < 0.68) {
      // ---- free-floating cells outside the shell
      const dirv = sph(Math.acos(2 * r() - 1), r() * 6.283, 1);
      const rad = 1.3 + r() * 0.65;
      const s = 0.05 + r() * 0.07;
      const e = r() < 0.7;
      let ox = (r() * 2 - 1) * s, oy = (r() * 2 - 1) * s;
      if (e) (r() < 0.5 ? (ox = ox < 0 ? -s : s) : (oy = oy < 0 ? -s : s));
      // tangent frame
      const up: Vec = Math.abs(dirv[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
      const tx: Vec = [dirv[1] * up[2] - dirv[2] * up[1], dirv[2] * up[0] - dirv[0] * up[2], dirv[0] * up[1] - dirv[1] * up[0]];
      const tl = Math.hypot(...tx) || 1;
      const ty: Vec = [dirv[1] * tx[2] - dirv[2] * tx[1], dirv[2] * tx[0] - dirv[0] * tx[2], dirv[0] * tx[1] - dirv[1] * tx[0]];
      x = dirv[0] * rad + (tx[0] / tl) * ox + (ty[0] / tl) * oy;
      y = dirv[1] * rad + (tx[1] / tl) * ox + (ty[1] / tl) * oy;
      z = dirv[2] * rad + (tx[2] / tl) * ox + (ty[2] / tl) * oy;
      w = 0.7;
    } else if (t < 0.8) {
      // ---- nucleus
      const k = 0.04 + 0.3 * Math.pow(r(), 1.6);
      x = dx * k; y = dy * k; z = dz * k;
      w = 0.8;
    } else if (t < 0.88) {
      // ---- orbit ring (tilted)
      const a = r() * 6.283;
      const rad = 1.55 + (r() - 0.5) * 0.012;
      let rx = Math.cos(a) * rad, ry = 0, rz = Math.sin(a) * rad;
      const tilt = 0.42;
      const y1 = ry * Math.cos(tilt) - rz * Math.sin(tilt);
      const z1 = ry * Math.sin(tilt) + rz * Math.cos(tilt);
      ry = y1; rz = z1;
      const tz = -0.22;
      x = rx * Math.cos(tz) - ry * Math.sin(tz);
      y = rx * Math.sin(tz) + ry * Math.cos(tz);
      z = rz;
      w = 0.65;
    } else if (t < 0.915) {
      // ---- four-point sparkle (the mark's star)
      const arm = Math.floor(r() * 4);
      const a = arm * (Math.PI / 2);
      const s = Math.pow(r(), 1.6);
      const len = arm % 2 === 0 ? 0.34 : 0.24;
      const off = (r() - 0.5) * 0.012 * (1 - s);
      x = 1.38 + Math.cos(a) * s * len - Math.sin(a) * off;
      y = 1.0 + Math.sin(a) * s * len + Math.cos(a) * off;
      z = 0.3;
      w = 0.9;
    } else {
      // ---- soft interior dust
      const k = 0.95 * Math.cbrt(r());
      x = dx * k; y = dy * k; z = dz * k;
      w = 0.2;
    }
    out[p * 4] = x; out[p * 4 + 1] = y; out[p * 4 + 2] = z; out[p * 4 + 3] = w;
  }
}

/** 1 — dispersal: the core dissolved into a diffuse sphere of points. */
function dispersal(base: Base, out: Float32Array) {
  const r = mulberry32(202);
  const { n, dir, pick } = base;
  for (let p = 0; p < n; p++) {
    const dx = dir[p * 3], dy = dir[p * 3 + 1], dz = dir[p * 3 + 2];
    let rad: number;
    if (pick[p] < 0.86) rad = 1.95 + gauss(r) * 0.07 + (r() - 0.5) * 0.22;
    else rad = 1.9 * Math.cbrt(r());
    out[p * 4] = dx * rad;
    out[p * 4 + 1] = dy * rad * 0.97;
    out[p * 4 + 2] = dz * rad;
    out[p * 4 + 3] = pick[p] > 0.97 ? 0.95 : 0.4 + r() * 0.2;
  }
}

/** 2 — neural sphere: hubs and filaments. */
function neural(base: Base, out: Float32Array) {
  const r = mulberry32(303);
  const surface = fibSphere(96, 1.5, r, 0.06);
  const inner = ballPoints(56, 0.35, 1.25, r);
  const g = makeGraph([...surface, ...inner], 3);
  const { n, dir, pick } = base;
  for (let p = 0; p < n; p++) {
    const t = pick[p];
    let x: number, y: number, z: number, w: number;
    if (t < 0.28) {
      const h = g.hubs[nearestHub(g.hubs.slice(0, surface.length), dir[p * 3] * 1.5, dir[p * 3 + 1] * 1.5, dir[p * 3 + 2] * 1.5)];
      x = h[0] + gauss(r) * 0.03; y = h[1] + gauss(r) * 0.03; z = h[2] + gauss(r) * 0.03;
      w = 1.0;
    } else if (t < 0.85) {
      const e = g.edges[Math.floor(r() * g.edges.length)];
      const a = g.hubs[e[0]], b = g.hubs[e[1]];
      const k = r();
      x = a[0] + (b[0] - a[0]) * k + gauss(r) * 0.006;
      y = a[1] + (b[1] - a[1]) * k + gauss(r) * 0.006;
      z = a[2] + (b[2] - a[2]) * k + gauss(r) * 0.006;
      w = 0.42 + 0.25 * Math.sin(k * Math.PI);
    } else {
      const k = 1.55 * Math.cbrt(r());
      x = dir[p * 3] * k; y = dir[p * 3 + 1] * k; z = dir[p * 3 + 2] * k;
      w = 0.18;
    }
    out[p * 4] = x; out[p * 4 + 1] = y; out[p * 4 + 2] = z; out[p * 4 + 3] = w;
  }
}

/** 3 — five mode clusters, each with its own motif: chat, voice, vision, code, reasoning. */
function modes(base: Base, out: Float32Array, lay: Layout) {
  const r = mulberry32(404);
  const R = lay.portrait ? Math.min(0.34, lay.W * 0.13) : Math.min(0.56, lay.W * 0.062);
  const centers: Vec[] = [];
  for (let i = 0; i < 5; i++) {
    if (lay.portrait) {
      centers.push([Math.sin(i * 1.5) * lay.W * 0.26, (2 - i) * lay.H * 0.082, 0]);
    } else {
      const k = (i - 2) / 2;
      centers.push([(i - 2) * lay.W * 0.172, 0.045 * lay.H * (k * k - 0.5), 0]);
    }
  }
  const reasoning = makeGraph(fibSphere(14, 1, r, 0.1), 3);
  const { n, meta, pick } = base;
  for (let p = 0; p < n; p++) {
    const c = meta[p * 3];
    const t = pick[p];
    let lx = 0, ly = 0, lz = 0, w = 0.5;
    if (c === 0) {
      // chat — two overlapping spheres (a dialogue)
      const side = r() < 0.5 ? -1 : 1;
      const d = sph(Math.acos(2 * r() - 1), r() * 6.283, 0.64 * (0.94 + r() * 0.08));
      lx = d[0] + side * 0.42; ly = d[1] + side * 0.1; lz = d[2];
      w = t < 0.12 ? 1.0 : 0.5;
    } else if (c === 1) {
      // voice — a waveform of vertical bars
      const bars = 11;
      const b = Math.floor(r() * bars);
      const x = (b / (bars - 1)) * 2 - 1;
      const env = 0.25 + 0.75 * Math.abs(Math.sin(b * 1.7 + 0.6)) * (1 - Math.abs(x) * 0.45);
      lx = x * 0.95;
      ly = (r() * 2 - 1) * env * 0.95;
      lz = gauss(r) * 0.03;
      w = 0.5 + 0.4 * (1 - Math.abs(ly));
    } else if (c === 2) {
      // vision — an iris: outer ring, inner ring, dense pupil
      const a = r() * 6.283;
      let k: number;
      if (t < 0.5) k = 1.0 + (r() - 0.5) * 0.03;
      else if (t < 0.75) k = 0.62 + (r() - 0.5) * 0.03;
      else k = 0.3 * Math.sqrt(r());
      lx = Math.cos(a) * k; ly = Math.sin(a) * k; lz = gauss(r) * 0.04;
      w = t >= 0.75 ? 1.0 : 0.55;
    } else if (c === 3) {
      // code — a 3×3×3 lattice of lines (voxel cells)
      const axis = Math.floor(r() * 3);
      const a = Math.floor(r() * 3) - 1, b = Math.floor(r() * 3) - 1;
      const s = (r() * 2 - 1) * 0.9;
      const g = 0.46;
      const v: Vec = [0, 0, 0];
      v[axis] = s;
      v[(axis + 1) % 3] = a * g;
      v[(axis + 2) % 3] = b * g;
      // slight fixed tilt so the cube reads as 3-D
      const cy = Math.cos(0.6), sy = Math.sin(0.6), cx = Math.cos(0.45), sx = Math.sin(0.45);
      const x1 = v[0] * cy + v[2] * sy, z1 = -v[0] * sy + v[2] * cy;
      lx = x1; ly = v[1] * cx - z1 * sx; lz = v[1] * sx + z1 * cx;
      w = 0.45 + (Math.abs(a) + Math.abs(b) === 0 ? 0.3 : 0);
    } else {
      // reasoning — a small graph
      if (t < 0.3) {
        const h = reasoning.hubs[Math.floor(r() * reasoning.hubs.length)];
        lx = h[0] + gauss(r) * 0.025; ly = h[1] + gauss(r) * 0.025; lz = h[2] + gauss(r) * 0.025;
        w = 1.0;
      } else {
        const e = reasoning.edges[Math.floor(r() * reasoning.edges.length)];
        const a = reasoning.hubs[e[0]], b = reasoning.hubs[e[1]];
        const k = r();
        lx = a[0] + (b[0] - a[0]) * k; ly = a[1] + (b[1] - a[1]) * k; lz = a[2] + (b[2] - a[2]) * k;
        w = 0.5;
      }
    }
    const ctr = centers[c];
    out[p * 4] = ctr[0] + lx * R;
    out[p * 4 + 1] = ctr[1] + ly * R;
    out[p * 4 + 2] = ctr[2] + lz * R;
    out[p * 4 + 3] = w;
  }
}

/** 4 — four braided streams (reasoning, search, memory, sync). */
function streams(base: Base, out: Float32Array, lay: Layout) {
  const r = mulberry32(505);
  // Always braided left → right; on a phone the band is simply narrower and tighter.
  const L = lay.W * (lay.portrait ? 1.15 : 1.08);
  const spread = lay.portrait ? lay.H * 0.034 : lay.H * 0.085;
  const amp = lay.portrait ? lay.H * 0.05 : lay.H * 0.11;
  const freq = lay.portrait ? 3.6 : 1.5;
  const { n, meta, pick } = base;
  for (let p = 0; p < n; p++) {
    const k = meta[p * 3 + 1];
    const u = meta[p * 3 + 2];
    const a = (u - 0.5) * L;
    const f = freq * (0.85 + k * 0.12);
    const phase = k * 1.3;
    const base0 = (k - 1.5) * spread;
    const bulge = (lay.portrait ? 0.012 : 0.02) + (lay.portrait ? 0.02 : 0.05) * Math.abs(Math.sin(a * 0.7 + k * 2.0));
    const cross = base0 + amp * Math.sin(a * f + phase) * (0.6 + 0.4 * Math.sin(a * 0.31 + k)) + gauss(r) * bulge;
    out[p * 4] = a;
    out[p * 4 + 1] = cross;
    out[p * 4 + 2] = 0.25 * Math.sin(a * f * 0.7 + k) + gauss(r) * 0.05;
    out[p * 4 + 3] = 0.3 + 0.6 * Math.pow(pick[p], 3);
  }
}

/** 5 — the thinking node that sits beside the conversation. */
function thinking(base: Base, out: Float32Array) {
  const r = mulberry32(606);
  const { n, dir, pick } = base;
  for (let p = 0; p < n; p++) {
    const t = pick[p];
    const dx = dir[p * 3], dy = dir[p * 3 + 1], dz = dir[p * 3 + 2];
    let x: number, y: number, z: number, w: number;
    if (t < 0.5) {
      const k = 0.98 + (r() - 0.5) * 0.02;
      x = dx * k; y = dy * k; z = dz * k; w = 0.5;
    } else if (t < 0.78) {
      const k = 0.62 + (r() - 0.5) * 0.02;
      x = dx * k; y = dy * k; z = dz * k; w = 0.35;
    } else if (t < 0.93) {
      const a = r() * 6.283, k = 1.22 + (r() - 0.5) * 0.012;
      x = Math.cos(a) * k; y = (r() - 0.5) * 0.01; z = Math.sin(a) * k; w = 0.85;
    } else {
      const k = 0.24 * Math.cbrt(r());
      x = dx * k; y = dy * k; z = dz * k; w = 1.0;
    }
    out[p * 4] = x; out[p * 4 + 1] = y; out[p * 4 + 2] = z; out[p * 4 + 3] = w;
  }
}

/** 6 — privacy: a geodesic cage around a protected nucleus. */
function cage(base: Base, out: Float32Array) {
  const r = mulberry32(707);
  const g = makeGraph(fibSphere(46, 1.55, r), 4);
  const { n, dir, pick } = base;
  for (let p = 0; p < n; p++) {
    const t = pick[p];
    let x: number, y: number, z: number, w: number;
    if (t < 0.07) {
      const h = g.hubs[nearestHub(g.hubs, dir[p * 3] * 1.55, dir[p * 3 + 1] * 1.55, dir[p * 3 + 2] * 1.55)];
      x = h[0] + gauss(r) * 0.022; y = h[1] + gauss(r) * 0.022; z = h[2] + gauss(r) * 0.022; w = 1.0;
    } else if (t < 0.66) {
      const e = g.edges[Math.floor(r() * g.edges.length)];
      const a = g.hubs[e[0]], b = g.hubs[e[1]];
      const k = r();
      x = a[0] + (b[0] - a[0]) * k; y = a[1] + (b[1] - a[1]) * k; z = a[2] + (b[2] - a[2]) * k;
      // keep filaments on the sphere so the cage reads as a shell, not a chord net
      const l = Math.hypot(x, y, z) || 1;
      x = (x / l) * 1.55; y = (y / l) * 1.55; z = (z / l) * 1.55;
      w = 0.5;
    } else if (t < 0.94) {
      const k = 0.42 * Math.pow(r(), 0.7);
      x = dir[p * 3] * k; y = dir[p * 3 + 1] * k; z = dir[p * 3 + 2] * k; w = 0.95;
    } else {
      const a = r() * 6.283;
      x = Math.cos(a) * 0.9; y = gauss(r) * 0.01; z = Math.sin(a) * 0.9; w = 0.4;
    }
    out[p * 4] = x; out[p * 4 + 1] = y; out[p * 4 + 2] = z; out[p * 4 + 3] = w;
  }
}

/* ---------------------------------------------------------------- API */

/** Shapes whose geometry depends on the viewport aspect. */
export const LAYOUT_DEPENDENT = [3, 4];

export function buildShape(k: number, base: Base, layout: Layout): Float32Array {
  const out = new Float32Array(base.n * 4);
  switch (k) {
    case 0: core(base, out); break;
    case 1: dispersal(base, out); break;
    case 2: neural(base, out); break;
    case 3: modes(base, out, layout); break;
    case 4: streams(base, out, layout); break;
    case 5: thinking(base, out); break;
    default: cage(base, out);
  }
  return out;
}
