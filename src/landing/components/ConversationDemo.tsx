import { useCallback, useEffect, useRef, useState } from "react";
import { APP_URL, DEMOS, type DemoScript } from "../content";
import { useDirector } from "../context";
import { Button } from "./ui";

type Phase = "idle" | "typing" | "thinking" | "streaming" | "done";

/** How strongly the particle node beside the conversation reacts in each phase. */
const PULSE: Record<Phase, number> = { idle: 0, typing: 0.3, thinking: 1, streaming: 0.16, done: 0 };
const STATUS: Record<Phase, string> = { idle: "Ready", typing: "Listening", thinking: "Thinking", streaming: "Writing", done: "Ready" };

interface Props {
  /** true while the experience scene is the active scene */
  active: boolean;
}

/**
 * A short scripted exchange (about three seconds): the prompt is typed, the node beside it
 * gathers itself, Luno "thinks", and the answer streams in. It is shown in one of Luno's modes.
 * Nothing here calls an API, and it only shows what the product actually does.
 */
export function ConversationDemo({ active }: Props) {
  const director = useDirector();
  const [scriptId, setScriptId] = useState<DemoScript["id"]>("chat");
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState(0);
  const [streamed, setStreamed] = useState(0);
  const timers = useRef<number[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const script = DEMOS.find((d) => d.id === scriptId)!;
  const fullReply = script.reply + (script.code ? "\n\n" + script.code : "");

  const clear = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const enter = useCallback(
    (p: Phase) => {
      setPhase(p);
      director?.setPulse(PULSE[p]);
    },
    [director],
  );

  const play = useCallback(() => {
    clear();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setTyped(script.user.length);
      setStreamed(fullReply.length);
      enter("done");
      return;
    }
    setTyped(0);
    setStreamed(0);
    enter("typing");
    const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

    let t = 260;
    for (let i = 1; i <= script.user.length; i++) {
      t += 15 + (i % 6 === 0 ? 24 : 0);
      later(t, () => setTyped(i));
    }
    t += 260;
    later(t, () => enter("thinking"));
    t += 900;
    later(t, () => enter("streaming"));
    const step = script.code ? 6 : 3;
    for (let i = step; i < fullReply.length + step; i += step) {
      t += script.code ? 9 : 18;
      const n = Math.min(i, fullReply.length);
      later(t, () => setStreamed(n));
    }
    later(t + 80, () => enter("done"));
  }, [clear, enter, fullReply.length, script.code, script.user.length]);

  // (Re)start when the scene becomes active or the sample changes; stop and rest when it leaves.
  useEffect(() => {
    if (active) play();
    else {
      clear();
      director?.setPulse(0);
      setPhase("idle");
      setTyped(0);
      setStreamed(0);
    }
    return () => {
      clear();
      director?.setPulse(0);
    };
  }, [active, scriptId, play, clear, director]);

  // keep the newest text in view without moving the page
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [typed, streamed, phase]);

  const showReply = phase === "streaming" || phase === "done";
  const shown = fullReply.slice(0, streamed);
  const replyText = script.code ? shown.slice(0, script.reply.length) : shown;
  const codeText = script.code ? shown.slice(script.reply.length).replace(/^\n\n/, "") : "";

  return (
    <div className="lu-chat" data-phase={phase}>
      <div className="lu-chat__tabs" role="tablist" aria-label="Sample conversation, by mode">
        {DEMOS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={d.id === scriptId}
            className="lu-tab"
            onClick={() => (d.id === scriptId ? play() : setScriptId(d.id))}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="lu-chat__stage">
        <span className="lu-trace" aria-hidden="true"><i /></span>

        <p className="lu-chat__status" aria-hidden="true">
          <b>Luno</b> · {script.mode} <span>{STATUS[phase]}</span>
        </p>

        {/* Visual, animated copy. The complete text is in the sr-only block below. */}
        <div className="lu-chat__body" ref={bodyRef} aria-hidden="true">
          <p className="lu-who">You</p>
          <p className="lu-prompt">
            {script.user.slice(0, typed)}
            {phase === "typing" && <i className="lu-caret" />}
          </p>

          {phase === "thinking" && (
            <div className="lu-think">
              <span className="lu-think__orb"><i /><i /></span>
              Thinking
            </div>
          )}

          {showReply && (
            <>
              <p className="lu-who lu-who--luno">Luno</p>
              <div className="lu-answer">
                {replyText.split("\n").map((ln, i) => (
                  <span key={i} className="lu-answer__ln">{ln || " "}</span>
                ))}
                {script.code && codeText && <pre className="lu-code"><code>{codeText}</code></pre>}
              </div>
            </>
          )}
        </div>

        <div className="sr-only">
          <p>You: {script.user}</p>
          <p>Luno ({script.mode} mode): {script.reply}</p>
          {script.code && <pre>{script.code}</pre>}
        </div>
      </div>

      <div className="lu-chat__foot">
        <span>Sample · {script.mode} mode</span>
        <Button href={APP_URL} variant="ghost">Continue in Luno</Button>
      </div>
    </div>
  );
}
