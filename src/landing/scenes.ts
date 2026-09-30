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
  { id: "top", label: "Luno", shape: 0, k: 1.5 },
  { id: "answer", label: "Product", shape: 1, k: 1.8 },
  { id: "understanding", label: "Understanding", shape: 2, k: 1.9 },
  { id: "modes", label: "Modes", shape: 3, k: 4.6 },
  { id: "capabilities", label: "Capabilities", shape: 7, k: 2.6 },
  { id: "experience", label: "Experience", shape: 8, k: 2.3 },
  { id: "privacy", label: "Safety", shape: 9, k: 1.7 },
  { id: "start", label: "Start", shape: 0, k: 1.4 },
];

/**
 * The particle timeline is a list of STOPS. Most scenes own one stop; the modes scene owns four
 * (Auto, Pro, Deep, Code), which the visitor scrolls through inside one pinned track.
 * The scroll coordinate `s` is a fractional index into this list; the morph between
 * consecutive stops is what you see.
 */
export interface Stop {
  scene: number;
  shape: number;
}
export const STOPS: Stop[] = [
  { scene: 0, shape: 0 }, // core
  { scene: 1, shape: 1 }, // dispersal
  { scene: 2, shape: 2 }, // neural field
  { scene: 3, shape: 3 }, // AUTO
  { scene: 3, shape: 4 }, // PRO
  { scene: 3, shape: 5 }, // DEEP
  { scene: 3, shape: 6 }, // CODE
  { scene: 4, shape: 7 }, // streams
  { scene: 5, shape: 8 }, // conversation node
  { scene: 6, shape: 9 }, // protected nucleus
  { scene: 7, shape: 0 }, // core again
];
export const FIRST_STOP = SCENES.map((_, i) => STOPS.findIndex((s) => s.scene === i));
export const STOP_COUNT = SCENES.map((_, i) => STOPS.filter((s) => s.scene === i).length);

/** Empty scroll between scenes (in small-viewport heights): the object morphs alone, text-free. */
export const SCENE_GAP = 0.34;

export const SCENE_INDEX = Object.fromEntries(SCENES.map((s, i) => [s.id, i])) as Record<string, number>;

/**
 * How the field sits at each stop.
 * ox / oy: fraction of the visible width / height (oy positive = up).
 * sc: model scale. wide: authored to the viewport, never shrunk to fit.
 * flat: a face-on layout that must not be spun or scroll-rotated (grid, rings, streams).
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
  flat: boolean;
}

const L = (l: Partial<Look>): Look => ({
  ox: 0, oy: 0, sc: 1, rx: 0.15, ry: 0.25, spin: 0.05, dim: 1, size: 1, mood: 0.2,
  glowX: 0, glowY: 0.1, glowI: 1, wide: false, flat: false, ...l,
});

/** wide / landscape — one entry per STOP */
export const LOOKS_DESKTOP: Look[] = [
  L({ oy: 0.14, sc: 0.92, spin: 0.06, mood: 0.15, glowY: 0.25, glowI: 1.0 }), // core
  L({ oy: 0.0, sc: 1.28, rx: 0.1, ry: 0.0, spin: 0.035, dim: 0.62, size: 0.85, mood: 0.35, glowI: 0.45 }), // dispersal
  L({ ox: 0.2, oy: 0.02, sc: 1.05, rx: 0.2, ry: 0.5, spin: 0.045, dim: 0.95, mood: 0.45, glowX: 0.3, glowI: 0.8 }), // neural
  L({ ox: 0.04, oy: 0.05, sc: 0.98, rx: 0.08, ry: 0.12, spin: 0, mood: 0.2, flat: true, glowY: 0.15, glowI: 0.8 }), // auto
  L({ ox: 0.04, oy: 0.05, sc: 1.02, rx: 0.2, ry: 0.3, spin: 0.045, size: 1.12, mood: 0.1, glowY: 0.15, glowI: 1.05 }), // pro
  L({ ox: 0.08, oy: 0.0, sc: 0.7, rx: 0.2, ry: -0.5, spin: 0, mood: 0.4, flat: true, glowY: 0.1, glowI: 0.75 }), // deep
  L({ ox: 0.08, oy: 0.06, sc: 0.95, rx: -0.12, ry: 0.42, spin: 0, mood: 0.55, flat: true, glowY: 0.1, glowI: 0.7 }), // code
  L({ oy: -0.07, wide: true, flat: true, sc: 1, rx: 0, ry: 0, spin: 0, dim: 0.95, size: 0.95, mood: 0.75, glowI: 0.65 }), // streams
  L({ ox: 0.27, oy: 0.03, sc: 0.85, rx: 0.2, ry: 0.4, spin: 0.08, dim: 0.9, mood: 0.35, glowX: 0.5, glowI: 0.9 }), // conversation
  L({ ox: 0.22, oy: 0.02, sc: 1.0, rx: 0.3, ry: 0.2, spin: 0.03, dim: 0.9, mood: 0.5, glowX: 0.4, glowI: 0.7 }), // protected
  L({ oy: 0.1, sc: 1.18, spin: 0.06, mood: 0.1, glowY: 0.2, glowI: 1.15 }), // core (final)
];

/** portrait / phones — one entry per STOP */
export const LOOKS_MOBILE: Look[] = [
  L({ oy: 0.155, sc: 1.0, spin: 0.05, mood: 0.15, glowY: 0.35, glowI: 1.0 }),
  L({ oy: 0.14, sc: 1.05, rx: 0.1, ry: 0.0, spin: 0.03, dim: 0.62, size: 0.85, mood: 0.35, glowY: 0.3, glowI: 0.45 }),
  L({ oy: 0.0, sc: 0.85, rx: 0.2, ry: 0.5, spin: 0.04, dim: 0.9, mood: 0.45, glowY: 0.1, glowI: 0.8 }),
  L({ oy: 0.02, sc: 0.95, rx: 0.08, ry: 0.12, spin: 0, mood: 0.2, flat: true, glowY: 0.12, glowI: 0.8 }),
  L({ oy: 0.03, sc: 1.0, rx: 0.2, ry: 0.3, spin: 0.045, size: 1.12, mood: 0.1, glowY: 0.12, glowI: 1.05 }),
  L({ oy: 0.03, sc: 0.74, rx: 0.2, ry: -0.5, spin: 0, mood: 0.4, flat: true, glowY: 0.12, glowI: 0.75 }),
  L({ oy: 0.0, sc: 1.4, rx: -0.1, ry: 0.32, spin: 0, mood: 0.55, flat: true, glowY: 0.1, glowI: 0.7 }),
  L({ oy: 0.09, wide: true, flat: true, sc: 1, rx: 0, ry: 0, spin: 0, dim: 0.9, size: 0.95, mood: 0.75, glowY: 0.1, glowI: 0.65 }),
  L({ ox: 0.29, oy: 0.25, sc: 0.62, rx: 0.2, ry: 0.4, spin: 0.08, dim: 0.75, mood: 0.35, glowY: 0.5, glowI: 0.8 }),
  L({ oy: 0.05, sc: 0.95, rx: 0.3, ry: 0.2, spin: 0.03, dim: 0.85, mood: 0.5, glowY: 0.2, glowI: 0.7 }),
  L({ oy: 0.17, sc: 1.05, spin: 0.05, mood: 0.1, glowY: 0.35, glowI: 1.1 }),
];
