import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/* ------------------------------------------------------------------ Arrow */

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={`lu-arrow ${className}`} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 11.5l9-9M4.5 2.5h7v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}

/* --------------------------------------------------------------- Headline */

export type Fx = "outline" | "dots" | "glow";
export interface Seg {
  t: string;
  fx?: Fx;
}

/**
 * Display type that reveals word by word (opacity + 20px rise + 8px blur → clear).
 * Real text in real heading tags; the spans are presentational only.
 * `fx` words additionally start as outline / particle-dots and resolve to solid
 * once their scene is active.
 */
export function Headline({
  as: Tag = "h2",
  lines,
  className = "",
  baseDelay = 0,
  id,
}: {
  as?: "h1" | "h2" | "h3";
  lines: Seg[][];
  className?: string;
  baseDelay?: number;
  id?: string;
}) {
  let n = 0;
  return (
    <Tag className={`lu-display ${className}`} id={id}>
      {lines.map((line, li) => (
        <span className="lu-line" key={li}>
          {line.flatMap((seg, si) =>
            seg.t.split(" ").filter(Boolean).map((word, wi, arr) => {
              const idx = n++;
              const last = wi === arr.length - 1 && si === line.length - 1;
              return (
                <span key={`${si}-${wi}`}>
                  <span
                    className={`lu-w${seg.fx ? ` lu-w--${seg.fx}` : ""}`}
                    style={{ "--i": idx, "--d": `${baseDelay}ms` } as CSSProperties}
                  >
                    {word}
                  </span>
                  {last ? null : " "}
                </span>
              );
            }),
          )}
          {li < lines.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}

/* ------------------------------------------------------------------ Fade */

/** Small copy that fades / rises in after the headline. `order` staggers siblings. */
export function Fade({
  as: Tag = "div",
  order = 0,
  className = "",
  children,
  ...rest
}: {
  as?: "div" | "p" | "ul" | "ol" | "span";
  order?: number;
  className?: string;
  children: ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const Comp = Tag as React.ElementType;
  return (
    <Comp className={`lu-fade ${className}`} style={{ "--o": order } as CSSProperties} {...rest}>
      {children}
    </Comp>
  );
}

/* ------------------------------------------------------------------ Button */

/**
 * Link styled as a button with a magnetic hover (fine pointers only), a cursor-following
 * highlight, an arrow that slides, and a small press response.
 */
export function Button({
  href,
  children,
  variant = "solid",
  size = "md",
  external = true,
  className = "",
  onClick,
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "ghost";
  size?: "md" | "lg";
  external?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let px = 0, py = 0;
    const flush = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const dx = px - (r.left + r.width / 2);
      const dy = py - (r.top + r.height / 2);
      el.style.setProperty("--tx", `${(dx * 0.16).toFixed(2)}px`);
      el.style.setProperty("--ty", `${(dy * 0.28).toFixed(2)}px`);
      el.style.setProperty("--mx", `${(((px - r.left) / r.width) * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(((py - r.top) / r.height) * 100).toFixed(1)}%`);
    };
    const move = (e: PointerEvent) => {
      px = e.clientX; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const leave = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      el.style.setProperty("--tx", "0px");
      el.style.setProperty("--ty", "0px");
    };
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      className={`lu-btn lu-btn--${variant} lu-btn--${size} ${className}`}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span className="lu-btn__label">{children}</span>
      <Arrow />
    </a>
  );
}
