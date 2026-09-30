import { useCallback, useEffect, useRef, useState } from "react";
import { APP_URL, DEMOS, type DemoScript } from "../content";
import { useDirector } from "../context";
import { Button } from "./ui";
import { LunoMark } from "./Nav";

type Phase = "idle" | "typing" | "thinking" | "streaming" | "done";

interface Props {
  /** true while the experience scene is the active scene */
  active: boolean;
}

/**
 * A short scripted conversation: the prompt is typed, Luno "thinks" (the particle node
 * beside it ripples), then the reply streams in. It plays when the scene becomes active
 * and can be replayed with any of the three sample prompts. Nothing here calls an API.
 */
export function ConversationDemo({ active }: Props) {
  const director = useDirector();
  const [scriptId, setScriptId] = useState<DemoScript["id"]>("chat");
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState(0);
  const [streamed, setStreamed] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const reduced = useRef(false);
  const script = DEMOS.find((d) => d.id === scriptId)!;
  const fullReply = script.reply + (script.code ? "\n\n" + script.code : "");

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const clear = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const play = useCallback(() => {
    clear();
    director?.setThinking(false);
    if (reduced.current) {
      setTyped(script.user.length);
      setStreamed(fullReply.length);
      setPhase("done");
      return;
    }
    setTyped(0);
    setStreamed(0);
    setPhase("typing");
    const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

    let t = 350;
    const userLen = script.user.length;
    for (let i = 1; i <= userLen; i++) {
      t += 22 + (i % 5 === 0 ? 28 : 0);
      later(t, () => setTyped(i));
    }
    t += 380;
    later(t, () => {
      setPhase("thinking");
      director?.setThinking(true);
    });
    t += 1250;
    later(t, () => {
      director?.setThinking(false);
      setPhase("streaming");
    });
    const step = script.code ? 5 : 2;
    for (let i = step; i < fullReply.length + step; i += step) {
      t += script.code ? 12 : 22;
      const n = Math.min(i, fullReply.length);
      later(t, () => setStreamed(n));
    }
    later(t + 60, () => setPhase("done"));
  }, [clear, director, fullReply.length, script.code, script.user.length]);

  // (Re)start whenever the scene becomes active or the sample prompt changes; stop when it leaves.
  useEffect(() => {
    if (active) play();
    else {
      clear();
      director?.setThinking(false);
      setPhase("idle");
      setTyped(0);
      setStreamed(0);
    }
    return () => {
      clear();
      director?.setThinking(false);
    };
  }, [active, scriptId, play, clear, director]);

  // keep the newest text in view without moving the page
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [typed, streamed, phase]);

  const showReply = phase === "streaming" || phase === "done";
  const reply = fullReply.slice(0, streamed);
  const replyText = script.code ? reply.slice(0, script.reply.length) : reply;
  const codeText = script.code ? reply.slice(script.reply.length).replace(/^\n\n/, "") : "";

  return (
    <div className="lu-chat" data-phase={phase}>
      <div className="lu-chat__tabs" role="tablist" aria-label="Sample conversations">
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

      <div className="lu-chat__frame">
        <div className="lu-chat__head">
          <LunoMark size={16} />
          <span>Luno</span>
          <span className="lu-chat__status" aria-hidden="true">
            {phase === "thinking" ? "thinking" : phase === "streaming" ? "writing" : "ready"}
          </span>
        </div>

        {/* Visual, animated copy. The full text is in the sr-only block below. */}
        <div className="lu-chat__body" ref={scrollRef} aria-hidden="true">
          {typed > 0 && (
            <p className="lu-msg lu-msg--user">
              {script.user.slice(0, typed)}
              {phase === "typing" && <i className="lu-caret" />}
            </p>
          )}
          {phase === "thinking" && (
            <p className="lu-msg lu-msg--luno lu-msg--thinking">
              <span className="lu-dots"><i /><i /><i /></span>
            </p>
          )}
          {showReply && (
            <div className="lu-msg lu-msg--luno">
              {replyText.split("\n").map((ln, i) => (
                <span key={i} className="lu-msg__ln">{ln || " "}</span>
              ))}
              {script.code && codeText && (
                <pre className="lu-code"><code>{codeText}</code></pre>
              )}
            </div>
          )}
        </div>

        <div className="sr-only">
          <p>You: {script.user}</p>
          <p>Luno: {script.reply}</p>
          {script.code && <pre>{script.code}</pre>}
        </div>

        <div className="lu-chat__foot">
          <span>Sample conversation</span>
          <Button href={APP_URL} variant="ghost" size="md">Continue in Luno</Button>
        </div>
      </div>
    </div>
  );
}
