import { Director } from "./director";
import { LunoField } from "./LunoField";
import type { Quality } from "./quality";

/**
 * Lazy entry point: the whole engine (GL field, shapes, shaders, director)
 * lives behind one dynamic import so it never blocks first paint.
 * If WebGL2 is unavailable the director still runs, driving only the DOM scenes.
 */
export function bootEngine(root: HTMLElement, canvas: HTMLCanvasElement | null, q: Quality) {
  let field: LunoField | null = null;
  if (q.tier !== "low" && canvas) {
    try {
      field = new LunoField(canvas, q.particles);
    } catch (err) {
      console.warn("[luno] WebGL field unavailable, using static fallback:", err);
    }
  }
  const director = new Director(root, field, q);
  director.start();
  return { director, hasField: field !== null };
}
