import { SCENES } from "../scenes";
import { useSceneState } from "../context";

/** Thin vertical progress ticks (desktop, pointer only; the main nav is the keyboard path). */
export function SceneRail() {
  const { active, covered } = useSceneState();
  return (
    <nav className="lu-rail" aria-label="Sections" data-hidden={covered}>
      {SCENES.map((s, i) => (
        <a key={s.id} href={`#${s.id}`} aria-label={s.label} tabIndex={-1} aria-current={active === i ? "true" : undefined} data-on={active === i}>
          <span />
        </a>
      ))}
    </nav>
  );
}
