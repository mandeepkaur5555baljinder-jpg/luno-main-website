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

/**
 * Shape indices (also the aS0..aS9 vertex attributes):
 *  0 core · 1 dispersal · 2 neural · 3 auto · 4 pro · 5 deep · 6 code · 7 streams · 8 thinking · 9 protected
 */
export const SHAPE_COUNT = 10;

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
  /** x: (unused) 0..4, y: stream ribbon 0..5, z: position along stream 0..1 */
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
    meta[p * 3 + 1] = Math.min(5, Math.floor((rank / n) * 6));
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


/* ---- shared: the core's cell lattice, reusable so every mode is visibly made of the SAME material */

function latticePoint(
  dx: number, dy: number, dz: number, rows: number, radius: number, r: () => number,
  o: { edge: number; absent: number; inset: number; relief?: boolean },
): [number, number, number, number] {
  const dTheta = Math.PI / rows;
  const theta = Math.acos(Math.max(-1, Math.min(1, dy)));
  const phi = Math.atan2(dz, dx);
  const row = Math.min(rows - 1, Math.floor(theta / dTheta));
  const cols = Math.max(3, Math.round(2 * rows * Math.sin((row + 0.5) * dTheta)));
  const col = Math.min(cols - 1, Math.floor(((phi + Math.PI) / (2 * Math.PI)) * cols));
  const h = hash2(row + rows * 7, col);
  let u = ((phi + Math.PI) / (2 * Math.PI)) * cols - col;
  let v = theta / dTheta - row;
  u = o.inset + u * (1 - 2 * o.inset);
  v = o.inset + v * (1 - 2 * o.inset);
  let rad = radius;
  let w = 0.5;
  if (h > 1 - o.absent) { rad = radius * (1.12 + hash2(col, row + 5) * 0.4); w = 0.7; }
  else if (o.relief) { const ex = hash2(row + 31, col + 11); rad = radius * (1 + (ex > 0.8 ? 0.06 : ex > 0.55 ? 0.03 : 0)); }
  if (r() < o.edge) {
    if (r() < 0.5) u = u < 0.5 ? o.inset : 1 - o.inset; else v = v < 0.5 ? o.inset : 1 - o.inset;
    w += 0.3;
  }
  const [x, y, z] = sph((row + v) * dTheta, ((col + u) / cols) * 2 * Math.PI - Math.PI, rad);
  return [x, y, z, w];
}

/** 3 — AUTO: the core reorganising itself; a fluid shell that routes outward along adaptive paths. */
function autoShape(base: Base, out: Float32Array, lay: Layout) {
  const r = mulberry32(808);
  const { n, dir, pick } = base;
  const routes = 5;
  const S: Vec[] = [], C: Vec[] = [], E: Vec[] = [];
  for (let k = 0; k < routes; k++) {
    // three routes leave to the right, two to the left: adaptive, unequal, balanced
    const ang = [-0.5, 0.08, 0.62, Math.PI - 0.32, Math.PI + 0.5][k];
    let end: Vec = [Math.cos(ang) * 2.35, Math.sin(ang) * 1.45, (k % 2 ? 0.3 : -0.3)];
    // on a phone the routes fan up and down instead of left and right
    if (lay.portrait) end = ([[1.0, 1.65, 0.3], [-1.05, 0.95, -0.3], [1.1, -0.15, 0.3], [-0.9, -1.0, -0.3], [0.55, -1.85, 0.3]] as Vec[])[k];
    const l = Math.hypot(end[0], end[1], end[2]);
    const start: Vec = [(end[0] / l) * 1.02, (end[1] / l) * 1.02, (end[2] / l) * 1.02];
    const side = k % 2 ? 1 : -1;
    C.push(lay.portrait ? [start[0] * 1.5 + side * 0.75, start[1] * 1.5, start[2] * 1.5] : [start[0] * 1.7, start[1] * 1.7 + side * 0.9, start[2] * 1.7]);
    S.push(start); E.push(end);
  }
  for (let p = 0; p < n; p++) {
    const t = pick[p];
    const dx = dir[p * 3], dy = dir[p * 3 + 1], dz = dir[p * 3 + 2];
    let x: number, y: number, z: number, w: number;
    if (t < 0.5) {
      // fluid shell: the lattice loses its rigid cells and flows
      const k = 1.0 + 0.06 * Math.sin(3.1 * dy + 1.7 * dx) + 0.045 * Math.sin(2.6 * dz - 1.2 * dy);
      x = dx * k; y = dy * k; z = dz * k;
      w = 0.28 + 0.5 * (0.5 + 0.5 * Math.sin(dy * 9 + dx * 4));
    } else if (t < 0.62) {
      const k = 0.04 + 0.3 * Math.pow(r(), 1.6);
      x = dx * k; y = dy * k; z = dz * k; w = 0.85;
    } else if (t < 0.94) {
      const kk = Math.floor(r() * routes);
      const u = Math.pow(r(), 0.85), m = 1 - u;
      x = m * m * S[kk][0] + 2 * m * u * C[kk][0] + u * u * E[kk][0] + gauss(r) * 0.012;
      y = m * m * S[kk][1] + 2 * m * u * C[kk][1] + u * u * E[kk][1] + gauss(r) * 0.012;
      z = m * m * S[kk][2] + 2 * m * u * C[kk][2] + u * u * E[kk][2] + gauss(r) * 0.012;
      w = 0.3 + 0.55 * u;
    } else {
      const kk = Math.floor(r() * routes);
      x = E[kk][0] + gauss(r) * 0.05; y = E[kk][1] + gauss(r) * 0.05; z = E[kk][2] + gauss(r) * 0.05; w = 1.0;
    }
    out[p * 4] = x; out[p * 4 + 1] = y; out[p * 4 + 2] = z; out[p * 4 + 3] = w;
  }
}

/** 4 — PRO: the same lattice, denser, brighter and fully regular, doubled inward, ringed. */
function proShape(base: Base, out: Float32Array) {
  const r = mulberry32(909);
  const { n, dir, pick } = base;
  for (let p = 0; p < n; p++) {
    const t = pick[p];
    const dx = dir[p * 3], dy = dir[p * 3 + 1], dz = dir[p * 3 + 2];
    let x = 0, y = 0, z = 0, w = 0.8;
    if (t < 0.44) {
      const q = latticePoint(dx, dy, dz, 18, 1.14, r, { edge: 0.8, absent: 0, inset: 0.05 });
      [x, y, z] = q; w = q[3] + 0.2;
    } else if (t < 0.7) {
      const q = latticePoint(dx, dy, dz, 9, 0.66, r, { edge: 0.72, absent: 0, inset: 0.06 });
      [x, y, z] = q; w = q[3] + 0.1;
    } else if (t < 0.82) {
      const k = 0.03 + 0.34 * Math.pow(r(), 1.3);
      x = dx * k; y = dy * k; z = dz * k; w = 1.0;
    } else if (t < 0.94) {
      const a = r() * 6.283, rad = (r() < 0.5 ? 1.42 : 1.58) + (r() - 0.5) * 0.008;
      const rx = Math.cos(a) * rad, rz = Math.sin(a) * rad;
      const tilt = r() < 0.5 ? 0.42 : -0.3;
      x = rx; y = -rz * Math.sin(tilt); z = rz * Math.cos(tilt); w = 0.95;
    } else {
      x = (r() - 0.5) * 0.006; y = (r() * 2 - 1) * 1.6; z = 0; w = 0.85; // axis
    }
    out[p * 4] = x; out[p * 4 + 1] = y; out[p * 4 + 2] = z; out[p * 4 + 3] = w;
  }
}

/** 5 — DEEP: the sphere unstacks into layered rings receding in depth. */
function deepShape(base: Base, out: Float32Array) {
  const r = mulberry32(1010);
  const K = 7;
  const { n, dir, pick } = base;
  for (let p = 0; p < n; p++) {
    const t = pick[p];
    const dx = dir[p * 3], dy = dir[p * 3 + 1], dz = dir[p * 3 + 2];
    const k = Math.min(K - 1, Math.floor((dy * 0.5 + 0.5) * K)); // latitude band → layer
    const a = Math.atan2(dz, dx);
    const rad = 0.5 + 0.3 * k;
    const zk = 1.0 - 0.66 * k;
    const wk = 0.98 - 0.1 * k;
    let x: number, y: number, z: number, w: number;
    if (t < 0.6) {
      x = Math.cos(a) * rad + gauss(r) * 0.007; y = Math.sin(a) * rad + gauss(r) * 0.007; z = zk + gauss(r) * 0.01; w = wk;
    } else if (t < 0.88) {
      const rr = rad * Math.sqrt(r()), aa = r() * 6.283;
      x = Math.cos(aa) * rr; y = Math.sin(aa) * rr; z = zk + gauss(r) * 0.03; w = wk * 0.45;
    } else if (t < 0.95) {
      x = gauss(r) * 0.01; y = gauss(r) * 0.01; z = 1.0 - r() * 3.96; w = 0.75;
    } else {
      const kk = 0.02 + 0.2 * Math.pow(r(), 1.4);
      x = dx * kk; y = dy * kk; z = 1.0 + dz * kk; w = 1.0;
    }
    out[p * 4] = x; out[p * 4 + 1] = y; out[p * 4 + 2] = z; out[p * 4 + 3] = w;
  }
}

/** 6 — CODE: the cells flatten into a precise grid; lines of syntax, orthogonal paths, a cursor. */
function codeShape(base: Base, out: Float32Array, lay: Layout) {
  const r = mulberry32(1111);
  const { n, pick } = base;
  // Landscape: a wide editor panel. Portrait: a tall one, so it can fill a phone.
  const Wp = lay.portrait ? 2.1 : 3.2, Hp = lay.portrait ? 2.6 : 2.1;
  const COLS = lay.portrait ? 11 : 16, ROWS = lay.portrait ? 13 : 10;
  const sx = Wp / 3.2, sy = Hp / 2.1;
  const rowH = Hp / ROWS;
  // orthogonal "circuit" paths, as polylines
  const paths0: Vec[][] = [
    [[-1.6, -0.72, 0], [-0.9, -0.72, 0], [-0.9, -0.2, 0], [0.3, -0.2, 0], [0.3, 0.5, 0], [1.6, 0.5, 0]],
    [[-1.6, 0.6, 0], [-1.15, 0.6, 0], [-1.15, 0.95, 0], [0.7, 0.95, 0]],
    [[1.6, -0.4, 0], [0.95, -0.4, 0], [0.95, -0.9, 0], [0.1, -0.9, 0]],
  ];
  const paths: Vec[][] = paths0.map((pl) => pl.map((q): Vec => [q[0] * sx, q[1] * sy, 0]));
  const lens = paths.map((pl) => pl.slice(1).map((q, i) => Math.hypot(q[0] - pl[i][0], q[1] - pl[i][1])));
  // chevrons for "< />"
  const glyph0: [Vec, Vec][] = [
    [[-0.5, 1.28, 0], [-0.68, 1.16, 0]], [[-0.68, 1.16, 0], [-0.5, 1.04, 0]],
    [[-0.32, 1.02, 0], [-0.16, 1.3, 0]],
    [[0.02, 1.28, 0], [0.2, 1.16, 0]], [[0.2, 1.16, 0], [0.02, 1.04, 0]],
  ];
  const glyph: [Vec, Vec][] = glyph0.map(([a, b]) => [[a[0] * sx, a[1] * sy, 0], [b[0] * sx, b[1] * sy, 0]]);
  for (let p = 0; p < n; p++) {
    const t = pick[p];
    let x = 0, y = 0, z = 0, w = 0.5;
    if (t < 0.3) {
      // cell edges of the grid
      if (r() < 0.5) { const c = Math.floor(r() * (COLS + 1)); x = (c / COLS - 0.5) * Wp; y = (r() - 0.5) * Hp; }
      else { const rw = Math.floor(r() * (ROWS + 1)); y = (rw / ROWS - 0.5) * Hp; x = (r() - 0.5) * Wp; }
      w = 0.22;
    } else if (t < 0.4) {
      // intersections: the lattice's vertices
      x = (Math.floor(r() * (COLS + 1)) / COLS - 0.5) * Wp; y = (Math.floor(r() * (ROWS + 1)) / ROWS - 0.5) * Hp; w = 0.75;
    } else if (t < 0.78) {
      // lines of syntax: indented runs of tokens
      const li = Math.floor(r() * (ROWS - 1));
      const indent = Math.floor(hash2(li, 3) * 4) * 0.3 * sx;
      const len = (0.6 + hash2(li, 9) * 1.9) * sx;
      let u = r(), tries = 0;
      while (tries++ < 6 && (u * 7) % 1 > 0.78) u = r(); // gaps between tokens
      x = -Wp / 2 + 0.22 * sx + indent + u * len;
      y = Hp / 2 - (li + 0.5) * rowH - 0.02 + gauss(r) * 0.004;
      w = 0.7 + 0.25 * hash2(li, Math.floor(u * 7));
    } else if (t < 0.9) {
      const pi = Math.floor(r() * paths.length);
      const total = lens[pi].reduce((a, b) => a + b, 0);
      let d = r() * total, seg = 0;
      while (seg < lens[pi].length - 1 && d > lens[pi][seg]) { d -= lens[pi][seg]; seg++; }
      const A = paths[pi][seg], B = paths[pi][seg + 1], f = d / lens[pi][seg];
      x = A[0] + (B[0] - A[0]) * f; y = A[1] + (B[1] - A[1]) * f + gauss(r) * 0.003; w = 0.9;
    } else if (t < 0.95) {
      const g = glyph[Math.floor(r() * glyph.length)], f = r();
      x = g[0][0] + (g[1][0] - g[0][0]) * f; y = g[0][1] + (g[1][1] - g[0][1]) * f; w = 1.0;
    } else {
      // the cursor block: the core's nucleus, made square
      x = (0.9 + (r() - 0.5) * 0.09) * sx; y = (-0.56 + (r() - 0.5) * 0.2) * sy; w = 1.0;
    }
    out[p * 4] = x; out[p * 4 + 1] = y; out[p * 4 + 2] = z + gauss(r) * 0.004; out[p * 4 + 3] = w;
  }
}

/** 7 — six braided streams: reasoning, search, memory, sync, vision, voice. */
function streams(base: Base, out: Float32Array, lay: Layout) {
  const r = mulberry32(505);
  const L = lay.W * (lay.portrait ? 1.15 : 1.08);
  const spread = lay.portrait ? lay.H * 0.04 : lay.H * 0.066;
  const amp = lay.portrait ? lay.H * 0.07 : lay.H * 0.1;
  const freq = lay.portrait ? 3.6 : 1.5;
  const { n, meta, pick } = base;
  for (let p = 0; p < n; p++) {
    const k = meta[p * 3 + 1];
    const u = meta[p * 3 + 2];
    const a = (u - 0.5) * L;
    const f = freq * (0.85 + k * 0.09);
    const phase = k * 1.1;
    const base0 = (k - 2.5) * spread;
    const bulge = (lay.portrait ? 0.011 : 0.018) + (lay.portrait ? 0.018 : 0.045) * Math.abs(Math.sin(a * 0.7 + k * 2.0));
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

/** 9 — protected: a luminous nucleus held inside open, gated boundary rings. Boundaries and control, not a cage. */
function protectedCore(base: Base, out: Float32Array) {
  const r = mulberry32(707);
  const { n, dir, pick } = base;
  const rings = [
    { rad: 1.28, tx: 0.0, tz: 0.0, gap: 0.6 },
    { rad: 1.46, tx: 1.05, tz: 0.5, gap: 2.4 },
    { rad: 1.64, tx: -0.9, tz: -0.7, gap: 4.3 },
  ];
  const half = 0.34;
  for (let p = 0; p < n; p++) {
    const t = pick[p];
    let x: number, y: number, z: number, w: number;
    if (t < 0.3) {
      const k = 0.05 + 0.36 * Math.pow(r(), 1.3);
      x = dir[p * 3] * k; y = dir[p * 3 + 1] * k; z = dir[p * 3 + 2] * k; w = 0.95;
    } else if (t < 0.8) {
      const ri = rings[Math.floor(r() * 3)];
      let a: number;
      if (r() < 0.07) a = ri.gap + (r() < 0.5 ? -half : half) + gauss(r) * 0.015; // bright "gate" posts at the openings
      else { do { a = r() * 6.283; } while (Math.abs(((a - ri.gap + 9.42478) % 6.28319) - 3.14159) < half); }
      let px = Math.cos(a) * ri.rad, py = 0, pz = Math.sin(a) * ri.rad;
      const y1 = py * Math.cos(ri.tx) - pz * Math.sin(ri.tx), z1 = py * Math.sin(ri.tx) + pz * Math.cos(ri.tx);
      py = y1; pz = z1;
      x = px * Math.cos(ri.tz) - py * Math.sin(ri.tz); y = px * Math.sin(ri.tz) + py * Math.cos(ri.tz); z = pz;
      x += gauss(r) * 0.004; y += gauss(r) * 0.004;
      w = 0.7;
    } else if (t < 0.92) {
      const k = 0.78 + (r() - 0.5) * 0.02; // faint inner membrane
      x = dir[p * 3] * k; y = dir[p * 3 + 1] * k; z = dir[p * 3 + 2] * k; w = 0.25;
    } else {
      const k = 1.85 + gauss(r) * 0.1;
      x = dir[p * 3] * k; y = dir[p * 3 + 1] * k; z = dir[p * 3 + 2] * k; w = 0.14;
    }
    out[p * 4] = x; out[p * 4 + 1] = y; out[p * 4 + 2] = z; out[p * 4 + 3] = w;
  }
}

/* ---------------------------------------------------------------- API */

/** Shapes whose geometry depends on the viewport aspect. */
export const LAYOUT_DEPENDENT = [3, 6, 7];

export function buildShape(k: number, base: Base, layout: Layout): Float32Array {
  const out = new Float32Array(base.n * 4);
  switch (k) {
    case 0: core(base, out); break;
    case 1: dispersal(base, out); break;
    case 2: neural(base, out); break;
    case 3: autoShape(base, out, layout); break;
    case 4: proShape(base, out); break;
    case 5: deepShape(base, out); break;
    case 6: codeShape(base, out, layout); break;
    case 7: streams(base, out, layout); break;
    case 8: thinking(base, out); break;
    default: protectedCore(base, out);
  }
  return out;
}
