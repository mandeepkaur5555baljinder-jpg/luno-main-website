import { useState } from "react";
import { APP_URL, CONTACT_EMAIL, PLATFORMS } from "../content";
import { Button } from "./ui";
import { LunoMark } from "./Nav";

/** Everything after the last scene: opaque, so the canvas can stop rendering behind it. */
export function Below() {
  const [open, setOpen] = useState<string | null>(null);
  const year = new Date().getFullYear();

  return (
    <div className="lu-below" data-canvas-end>
      <section id="get" className="lu-get" aria-labelledby="get-h">
        <div className="lu-wrap">
          <div className="lu-get__head">
            <p className="lu-kicker">Get Luno</p>
            <h2 id="get-h" className="lu-h2">On your device.</h2>
          </div>

          <ul className="lu-platforms">
            {PLATFORMS.map((p) => {
              const steps = "steps" in p ? p.steps : undefined;
              const isOpen = open === p.id;
              return (
                <li key={p.id} className="lu-platform" data-status={p.status}>
                  <div className="lu-platform__main">
                    <h3>{p.name}</h3>
                    <span className="lu-status">{p.status === "live" ? "Available now" : "Coming soon"}</span>
                    <p>{p.line}</p>
                  </div>
                  <div className="lu-platform__action">
                    {p.id === "web" && <Button href={APP_URL} variant="ghost">Open Luno</Button>}
                    {steps && (
                      <button
                        type="button"
                        className="lu-textbtn"
                        aria-expanded={isOpen}
                        aria-controls={`steps-${p.id}`}
                        onClick={() => setOpen(isOpen ? null : p.id)}
                      >
                        {isOpen ? "Hide steps" : "How to add it"}
                      </button>
                    )}
                  </div>
                  {steps && (
                    <ol id={`steps-${p.id}`} className="lu-steps" hidden={!isOpen}>
                      {steps.map((s, i) => (
                        <li key={i}><span>{i + 1}</span>{s}</li>
                      ))}
                    </ol>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <footer className="lu-footer">
        <div className="lu-wrap lu-footer__grid">
          <div>
            <a href="#top" className="lu-nav__brand" aria-label="Luno, back to top">
              <LunoMark />
              <span>Luno</span>
            </a>
            <p className="lu-footer__blurb">
              A personal AI assistant for chat, voice, vision and code, designed and built by one person, not a
              product team.
            </p>
            <p className="lu-footer__made">Made by <b>Tanveer</b></p>
          </div>
          <div>
            <h3 className="lu-footer__h">Get Luno</h3>
            <a className="lu-link" href={APP_URL} target="_blank" rel="noopener noreferrer">Open the web app</a>
            <a className="lu-link" href="#get">All platforms</a>
          </div>
          <div>
            <h3 className="lu-footer__h">Questions</h3>
            <p className="lu-footer__blurb">Bug reports, feature ideas, or anything else. Reach out directly.</p>
            <a className="lu-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
        </div>
        <div className="lu-wrap lu-footer__legal">
          <span>© {year} Luno</span>
          <span>Built solo, one feature at a time.</span>
        </div>
      </footer>
    </div>
  );
}
