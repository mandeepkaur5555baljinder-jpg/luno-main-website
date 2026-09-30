import { useEffect, useRef, useState } from "react";
import { Nav } from "./components/Nav";
import { Scenes } from "./components/Scenes";
import { SceneRail } from "./components/SceneRail";
import { Below } from "./components/Below";
import { DirectorContext, useSceneState } from "./context";
import type { Director } from "./engine/director";
import { detectQuality } from "./engine/quality";
import "./landing.css";

/** Mirrors the active scene onto the root so the CSS-only fallback can react to it. */
function SceneAttr({ rootRef }: { rootRef: React.RefObject<HTMLDivElement | null> }) {
  const { active } = useSceneState();
  useEffect(() => {
    if (rootRef.current) rootRef.current.dataset.scene = String(active);
  }, [active, rootRef]);
  return null;
}

/**
 * Composition root for the public landing page.
 *
 * Layers (back → front): CSS atmosphere · WebGL canvas · grain · scenes / nav.
 * The canvas + engine are lazy-loaded after first paint; until then (or if WebGL is
 * unavailable) the CSS orb fallback carries the hero and every scene still works.
 */
export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [director, setDirector] = useState<Director | null>(null);
  const [mode, setMode] = useState<"loading" | "webgl" | "css">("loading");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let disposed = false;
    let dir: Director | null = null;
    const q = detectQuality();

    // Never let the boot layer outstay its welcome, whatever happens to the engine.
    const failsafe = window.setTimeout(() => {
      document.documentElement.dataset.ready = "true";
    }, 2200);

    const load = async () => {
      try {
        const { bootEngine } = await import("./engine/boot");
        if (disposed) return;
        const res = bootEngine(root, canvasRef.current, q);
        dir = res.director;
        setDirector(res.director);
        setMode(res.hasField ? "webgl" : "css");
      } catch (err) {
        console.warn("[luno] engine failed to load:", err);
        setMode("css");
      } finally {
        window.clearTimeout(failsafe);
        // next frame so the first painted frame is already the gathered hero
        requestAnimationFrame(() => {
          document.documentElement.dataset.ready = "true";
        });
      }
    };
    // Let the HTML hero paint first.
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (h: number) => void;
    };
    const handle = w.requestIdleCallback ? w.requestIdleCallback(load, { timeout: 400 }) : window.setTimeout(load, 60);

    return () => {
      disposed = true;
      window.clearTimeout(failsafe);
      if (w.requestIdleCallback) w.cancelIdleCallback?.(handle);
      else window.clearTimeout(handle);
      dir?.dispose();
      setDirector(null);
    };
  }, []);

  return (
    <DirectorContext.Provider value={director}>
      <div ref={rootRef} className="lu-root" data-mode={mode}>
        <a href="#main" className="lu-skip">Skip to content</a>

        {/* Measured by the director: small and large viewport heights (stable on mobile browsers). */}
        <div className="lu-probe lu-probe--svh" data-probe-svh aria-hidden="true" />
        <div className="lu-probe lu-probe--lvh" data-probe-lvh aria-hidden="true" />

        <div className="lu-atmos" aria-hidden="true">
          <div className="lu-atmos__orb" />
        </div>
        <canvas ref={canvasRef} className="lu-canvas" aria-hidden="true" />
        <div className="lu-grain" aria-hidden="true" />

        <SceneAttr rootRef={rootRef} />
        <Nav />
        <SceneRail />

        <main id="main">
          <Scenes />
          <Below />
        </main>
      </div>
    </DirectorContext.Provider>
  );
}
