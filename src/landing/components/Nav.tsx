import { useCallback, useEffect, useRef, useState } from "react";
import { APP_URL, NAV_LINKS } from "../content";
import { SCENE_INDEX } from "../scenes";
import { useSceneState } from "../context";
import { Button } from "./ui";

/** Sparkle + orb, the mark from the app icon, drawn in SVG so it stays crisp at 20px. */
export function LunoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="lu-mark">
      <defs>
        <radialGradient id="lm-g" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#eafffb" />
          <stop offset="0.45" stopColor="#4df0e0" />
          <stop offset="1" stopColor="#1a6fd8" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="10" fill="url(#lm-g)" />
      <circle cx="16" cy="16" r="14.2" fill="none" stroke="#4df0e0" strokeOpacity="0.45" strokeWidth="1" />
      <path d="M26.5 2.5l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#eafffb" />
    </svg>
  );
}

export function Nav() {
  const { active } = useSceneState();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  // Escape closes the menu; body scroll is not locked (native scrolling only), the menu simply sits above it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>("a,button");
        const all = [toggleRef.current!, ...Array.from(items)];
        const first = all[0], last = all[all.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false); };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  const activeHref = (href: string) => SCENE_INDEX[href.slice(1)] === active;

  return (
    <header className="lu-nav" data-scrolled={scrolled || open} data-open={open}>
      <div className="lu-nav__bar">
        <a href="#top" className="lu-nav__brand" aria-label="Luno, back to top" onClick={() => setOpen(false)}>
          <LunoMark />
          <span>Luno</span>
        </a>

        <nav className="lu-nav__links" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="lu-link" aria-current={activeHref(l.href) ? "true" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="lu-nav__cta">
          <Button href={APP_URL} size="md">Open Luno</Button>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="lu-nav__toggle"
          aria-expanded={open}
          aria-controls="lu-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div id="lu-menu" ref={panelRef} className="lu-menu" hidden={!open}>
        <nav aria-label="Mobile">
          {NAV_LINKS.map((l, i) => (
            <a key={l.href} href={l.href} style={{ "--i": i } as React.CSSProperties} onClick={() => setOpen(false)}>
              <span className="lu-menu__idx">0{i + 1}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <Button href={APP_URL} size="lg" className="lu-menu__cta">Open Luno</Button>
      </div>
    </header>
  );
}
