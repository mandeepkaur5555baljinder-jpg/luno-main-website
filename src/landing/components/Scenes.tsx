import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { APP_URL, CAPABILITIES, MODES } from "../content";
import { SCENES, SCENE_INDEX } from "../scenes";
import { useDirector, useSceneState } from "../context";
import { ConversationDemo } from "./ConversationDemo";
import { Button, Fade, Headline } from "./ui";

/** One track of the scroll timeline: a tall section with a pinned full-height stage. */
function Scene({
  id,
  active,
  className = "",
  children,
}: {
  id: string;
  active: boolean;
  className?: string;
  children: ReactNode;
}) {
  const def = SCENES[SCENE_INDEX[id]];
  return (
    <section
      id={id}
      data-scene
      data-active={active}
      className={`lu-scene ${className}`}
      style={{ "--k": def.k } as CSSProperties}
    >
      <div className="lu-stage">
        <div className="lu-stage__inner">{children}</div>
      </div>
    </section>
  );
}

const Kicker = ({ children }: { children: ReactNode }) => (
  <Fade as="p" className="lu-kicker">{children}</Fade>
);

/* ------------------------------------------------------------------ hero */

function Hero({ active }: { active: boolean }) {
  return (
    <Scene id="top" active={active} className="lu-scene--hero">
      <div className="lu-hero__badge">
        <Fade as="p" className="lu-kicker lu-kicker--live">
          <i className="lu-live" aria-hidden="true" />
          Live now at app.lunoai.in
        </Fade>
      </div>

      <div className="lu-hero__grid">
        <Headline
          as="h1"
          className="lu-display--hero"
          baseDelay={250}
          lines={[[{ t: "A personal AI" }], [{ t: "that feels like" }, { t: "yours", fx: "dots" }]]}
        />
        <div className="lu-hero__side">
          <Fade as="p" order={5} className="lu-lede">
            Luno is a chat, voice, vision and code assistant, built end to end by one person. Open it in your
            browser today, or add it to your iPhone home screen.
          </Fade>
          <Fade order={6} className="lu-actions">
            <Button href={APP_URL} size="lg">Try Luno</Button>
            <Button href="#answer" size="lg" variant="ghost" external={false}>Explore Luno</Button>
          </Fade>
        </div>
      </div>

      <div className="lu-cue" aria-hidden="true">
        <span className="lu-cue__ring"><i /></span>
        <span>Scroll</span>
      </div>
    </Scene>
  );
}

/* ---------------------------------------------------------- 01 · answer */

function Answer({ active }: { active: boolean }) {
  return (
    <Scene id="answer" active={active}>
      <div className="lu-top">
        <Kicker>01 — Beyond answers</Kicker>
        <Headline lines={[[{ t: "More than" }], [{ t: "an answer.", fx: "outline" }]]} />
      </div>
      <div className="lu-bottom lu-bottom--right">
        <Fade as="p" order={4} className="lu-lede">
          Most assistants hand back a block of text and forget you were there. Luno keeps the thread. Ask a
          follow-up, change direction, come back to something from earlier, and it keeps up without you
          repeating yourself.
        </Fade>
      </div>
    </Scene>
  );
}

/* ------------------------------------------------------ 02 · understanding */

function Understanding({ active }: { active: boolean }) {
  return (
    <Scene id="understanding" active={active}>
      <div className="lu-top">
        <Kicker>02 — Understanding</Kicker>
        <Headline lines={[[{ t: "It follows" }], [{ t: "what you" }, { t: "mean.", fx: "glow" }]]} />
      </div>
      <div className="lu-bottom lu-bottom--left">
        <Fade as="p" order={4} className="lu-lede">
          Text, images and long documents are read together, so Luno holds the whole picture instead of
          losing context halfway through.
        </Fade>
        <Fade as="ul" order={5} className="lu-tags" aria-label="What Luno reads together">
          {["Text", "Images", "Documents", "Context"].map((t) => (
            <li key={t}>{t}</li>
          ))}
        </Fade>
      </div>
    </Scene>
  );
}

/* ------------------------------------------------------------ 03 · modes */

/** Modes = how Luno thinks. One core; the visitor scrolls it through four formations. */
function Modes({ active, mode }: { active: boolean; mode: number }) {
  const director = useDirector();
  const on = active ? mode : -1;
  const shown = MODES[Math.max(0, on)];

  const go = (i: number) => {
    if (!director) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: director.modeScrollY(i), behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <Scene id="modes" active={active} className="lu-scene--modes">
      {/* enormous outlined mode name behind the particles' foreground: scale + depth without extra GPU */}
      <div className="lu-ghost" aria-hidden="true">
        {MODES.map((m, i) => (
          <span key={m.id} data-on={on === i}>{m.name}</span>
        ))}
      </div>

      <div className="lu-top">
        <Kicker>03 — Modes</Kicker>
        <Headline lines={[[{ t: "One" }, { t: "Luno.", fx: "outline" }]]} />
        <Fade as="p" order={3} className="lu-sub">Different ways of thinking.</Fade>
      </div>

      <div className="lu-modes">
        <Fade as="p" order={4} className="lu-mode-panel" aria-live="off">
          <strong>{shown.line}</strong> {shown.body}
        </Fade>
        <Fade as="ol" order={5} className="lu-mode-list">
          {MODES.map((m, i) => (
            <li key={m.id} data-on={on === i}>
              <button type="button" aria-current={on === i ? "true" : undefined} onClick={() => go(i)}>
                <span className="lu-mode__idx">0{i + 1} · {m.feel}</span>
                <span className="lu-mode__name">{m.name}</span>
                <span className="lu-mode__desc">
                  <b>{m.line}</b>
                  {m.body}
                </span>
              </button>
            </li>
          ))}
        </Fade>
      </div>
    </Scene>
  );
}

/* --------------------------------------------------- 04 · capabilities */

/** Capabilities = what Luno can do. Six streams; hover / focus / tap lights one. */
function Capabilities({ active, stream }: { active: boolean; stream: number }) {
  const director = useDirector();
  const [pinned, setPinned] = useState<number | null>(null);
  useEffect(() => {
    setPinned(null);
    director?.setManual(1, null);
  }, [stream, director]);
  const set = (i: number | null) => {
    setPinned(i);
    director?.setManual(1, i);
  };
  const on = pinned ?? (active ? Math.max(0, stream) : -1);

  return (
    <Scene id="capabilities" active={active} className="lu-scene--caps">
      <div className="lu-top">
        <Kicker>04 — Capabilities</Kicker>
        <Headline lines={[[{ t: "What Luno" }], [{ t: "can", fx: "outline" }, { t: "do." }]]} />
      </div>
      <Fade as="ul" order={4} className="lu-streams">
        {CAPABILITIES.map((c, i) => (
          <li key={c.id} data-on={on === i}>
            <button
              type="button"
              aria-pressed={on === i}
              onPointerEnter={(e) => e.pointerType === "mouse" && set(i)}
              onPointerLeave={(e) => e.pointerType === "mouse" && set(null)}
              onFocus={() => set(i)}
              onBlur={() => set(null)}
              onClick={() => set(i)}
            >
              <span className="lu-stream__name">{c.name}</span>
              <span className="lu-stream__desc">{c.body}</span>
            </button>
          </li>
        ))}
      </Fade>
    </Scene>
  );
}

/* -------------------------------------------------------- 05 · experience */

function Experience({ active }: { active: boolean }) {
  return (
    <Scene id="experience" active={active} className="lu-scene--exp">
      <div className="lu-exp">
        <div className="lu-exp__head">
          <Kicker>05 — Experience</Kicker>
          <Headline lines={[[{ t: "See how" }], [{ t: "it feels.", fx: "glow" }]]} />
        </div>
        <Fade order={4} className="lu-exp__demo">
          <ConversationDemo active={active} />
        </Fade>
      </div>
    </Scene>
  );
}

/* ----------------------------------------------------------- 06 · privacy */

function Privacy({ active }: { active: boolean }) {
  return (
    <Scene id="privacy" active={active}>
      <div className="lu-top">
        <Kicker>06 — Safety</Kicker>
        <Headline lines={[[{ t: "Yours," }], [{ t: "and only", fx: "outline" }, { t: "yours." }]]} />
      </div>
      <div className="lu-bottom lu-bottom--left lu-trust">
        <Fade as="p" order={4} className="lu-lede">
          Your preferences and past conversations carry over between sessions, and they stay private to your
          own account.
        </Fade>
        <Fade as="p" order={5} className="lu-lede lu-lede--dim">
          Luno is built end to end by one person: no corporate wrapper, no bloat, and a direct line to whoever
          made it.
        </Fade>
      </div>
    </Scene>
  );
}

/* ------------------------------------------------------------- 07 · start */

function Start({ active }: { active: boolean }) {
  return (
    <Scene id="start" active={active} className="lu-scene--start">
      <div className="lu-hero__grid">
        <Headline lines={[[{ t: "Start thinking" }], [{ t: "with" }, { t: "Luno.", fx: "dots" }]]} className="lu-display--hero" />
        <div className="lu-hero__side">
          <Fade as="p" order={4} className="lu-lede">
            Works in any browser today. Add it to your iPhone home screen and it opens like an app.
          </Fade>
          <Fade order={5} className="lu-actions">
            <Button href={APP_URL} size="lg">Open Luno</Button>
          </Fade>
        </div>
      </div>
    </Scene>
  );
}

/* ------------------------------------------------------------------ all */

export function Scenes() {
  const { active, mode, stream } = useSceneState();
  const a = (id: string) => active === SCENE_INDEX[id];
  return (
    <>
      <Hero active={a("top")} />
      <Answer active={a("answer")} />
      <Understanding active={a("understanding")} />
      <Modes active={a("modes")} mode={mode} />
      <Capabilities active={a("capabilities")} stream={stream} />
      <Experience active={a("experience")} />
      <Privacy active={a("privacy")} />
      <Start active={a("start")} />
    </>
  );
}
