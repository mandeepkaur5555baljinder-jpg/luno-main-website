/**
 * Quality tiers for the Luno particle field.
 *
 *  high   – full particle count, ambient motion, pointer interaction
 *  medium – reduced particles / DPR, no pointer interaction on touch
 *  low    – no WebGL at all: the CSS orb fallback is shown instead
 */
export type Tier = "high" | "medium" | "low";

export interface Quality {
  tier: Tier;
  particles: number;
  dprMax: number;
  /** Target frame rate while the scene is idle (nothing scrolling / moving). */
  ambientFps: number;
  pointer: boolean;
  mobile: boolean;
  reducedMotion: boolean;
}

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

export function detectQuality(): Quality {
  const nav = navigator as NavigatorHints;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const mobile = coarse || window.innerWidth < 768;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  const saveData = nav.connection?.saveData === true;

  let tier: Tier = "high";
  if (saveData || memory <= 1 || cores <= 2) tier = "low";
  else if (mobile || memory <= 4 || cores <= 4) tier = "medium";

  const particles = tier === "high" ? 44000 : mobile ? 13000 : 24000;

  return {
    tier,
    particles,
    dprMax: tier === "high" ? 1.75 : mobile ? 1.5 : 1.25,
    ambientFps: tier === "high" ? 30 : 24,
    pointer: !coarse && !reducedMotion,
    mobile,
    reducedMotion,
  };
}
