/**
 * The scroll timeline. One entry per <section data-scene>. The order here is
 * the order on the page; `shape` is the particle-field shape shown when that
 * scene is at rest (see engine/shapes.ts).
 */
export interface SceneDef {
  id: string;
  label: string;
  shape: number;
  /** height of the scene's scroll track, in small-viewport heights */
  k: number;
}

export const SCENES: SceneDef[] = [
  { id: "top", label: "Luno", shape: 0, k: 1.6 },
  { id: "answer", label: "Product", shape: 1, k: 2.0 },
  { id: "understanding", label: "Understanding", shape: 2, k: 2.2 },
  { id: "modes", label: "Modes", shape: 3, k: 4.0 },
  { id: "capabilities", label: "Capabilities", shape: 4, k: 2.8 },
  { id: "experience", label: "Experience", shape: 5, k: 2.4 },
  { id: "privacy", label: "Safety", shape: 6, k: 1.8 },
  { id: "start", label: "Start", shape: 0, k: 1.5 },
];

export const SCENE_INDEX = Object.fromEntries(SCENES.map((s, i) => [s.id, i])) as Record<string, number>;

/**
 * How the field sits in each scene.
 * ox / oy: fraction of the visible width / height (oy positive = up).
 * sc: model scale. wide: shape is authored to the viewport and must not be shrunk to fit.
 */
export interface Look {
  ox: number;
  oy: number;
  sc: number;
  rx: number;
  ry: number;
  spin: number;
  dim: number;
  size: number;
  mood: number;
  glowX: number;
  glowY: number;
  glowI: number;
  wide: boolean;
}

const L = (l: Partial<Look>): Look => ({
  ox: 0, oy: 0, sc: 1, rx: 0.15, ry: 0.25, spin: 0.05, dim: 1, size: 1, mood: 0.2,
  glowX: 0, glowY: 0.1, glowI: 1, wide: false, ...l,
});

/** wide / landscape */
export const LOOKS_DESKTOP: Look[] = [
  L({ oy: 0.17, sc: 0.98, spin: 0.06, mood: 0.15, glowY: 0.25, glowI: 1.0 }),
  L({ oy: 0.0, sc: 1.28, rx: 0.1, ry: 0.0, spin: 0.035, dim: 0.62, size: 0.85, mood: 0.35, glowI: 0.45 }),
  L({ ox: 0.2, oy: 0.02, sc: 1.05, rx: 0.2, ry: 0.5, spin: 0.045, dim: 0.95, mood: 0.45, glowX: 0.3, glowI: 0.8 }),
  L({ oy: 0.0, wide: true, sc: 1, rx: 0, ry: 0, spin: 0, mood: 0.3, glowY: 0.1, glowI: 0.7 }),
  L({ oy: -0.07, wide: true, sc: 1, rx: 0, ry: 0, spin: 0, dim: 0.95, size: 0.95, mood: 0.75, glowI: 0.65 }),
  L({ ox: 0.27, oy: 0.03, sc: 0.85, rx: 0.2, ry: 0.4, spin: 0.08, dim: 0.9, mood: 0.35, glowX: 0.5, glowI: 0.9 }),
  L({ ox: 0.22, oy: 0.02, sc: 1.0, rx: 0.15, ry: 0.2, spin: 0.05, dim: 0.9, mood: 0.5, glowX: 0.4, glowI: 0.7 }),
  L({ oy: 0.1, sc: 1.18, spin: 0.06, mood: 0.1, glowY: 0.2, glowI: 1.15 }),
];

/** portrait / phones */
export const LOOKS_MOBILE: Look[] = [
  L({ oy: 0.19, sc: 1.0, spin: 0.05, mood: 0.15, glowY: 0.4, glowI: 1.0 }),
  L({ oy: 0.14, sc: 1.05, rx: 0.1, ry: 0.0, spin: 0.03, dim: 0.62, size: 0.85, mood: 0.35, glowY: 0.3, glowI: 0.45 }),
  L({ oy: 0.0, sc: 0.85, rx: 0.2, ry: 0.5, spin: 0.04, dim: 0.9, mood: 0.45, glowY: 0.1, glowI: 0.8 }),
  L({ oy: -0.005, wide: true, sc: 1, rx: 0, ry: 0, spin: 0, mood: 0.3, glowY: 0.1, glowI: 0.7 }),
  L({ oy: 0.02, wide: true, sc: 1, rx: 0, ry: 0, spin: 0, dim: 0.9, size: 0.95, mood: 0.75, glowY: 0.1, glowI: 0.65 }),
  L({ ox: 0.29, oy: 0.25, sc: 0.62, rx: 0.2, ry: 0.4, spin: 0.08, dim: 0.75, mood: 0.35, glowY: 0.5, glowI: 0.8 }),
  L({ oy: 0.05, sc: 0.95, rx: 0.15, ry: 0.2, spin: 0.05, dim: 0.85, mood: 0.5, glowY: 0.2, glowI: 0.7 }),
  L({ oy: 0.17, sc: 1.05, spin: 0.05, mood: 0.1, glowY: 0.35, glowI: 1.1 }),
];
