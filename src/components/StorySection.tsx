import React from "react";
import { Brain, Mic, Eye, BookOpen, Globe } from "lucide-react";

const CAPABILITIES = [
  {
    icon: <Brain className="w-5 h-5" />,
    title: "Understands anything you bring it",
    body: "Text, images, and long documents read together — Luno keeps the thread instead of losing context halfway through.",
  },
  {
    icon: <Mic className="w-5 h-5" />,
    title: "Talks like a conversation, not a script",
    body: "Speak to it directly and get a real spoken reply back — no rigid menus, no waiting for a wake word.",
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: "Sees what you're looking at",
    body: "Point a camera at a whiteboard, a diagram, or a page of code and ask it what's going on.",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Remembers how you work",
    body: "Preferences and past context carry forward, so you're not re-explaining yourself every session.",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Follows you across devices",
    body: "Start on your phone, finish on your laptop. One assistant, wherever you open it.",
  },
];

export const StorySection: React.FC = () => {
  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

        <div className="lg:col-span-4">
          <h2 className="font-display font-bold text-4xl sm:text-5xl leading-[1.05] text-cream">
            Built for how you actually think.
          </h2>
          <p className="mt-5 text-cream/55 leading-relaxed max-w-sm">
            Five things Luno is genuinely good at — not a features checklist,
            just what it does every day.
          </p>
        </div>

        <div className="lg:col-span-8">
          {CAPABILITIES.map((c, i) => (
            <div
              key={c.title}
              className={`flex items-start gap-5 sm:gap-8 py-7 ${i !== 0 ? "border-t border-white/10" : ""}`}
            >
              <div className="w-10 h-10 rounded-full glass-lite flex items-center justify-center shrink-0 text-amber-300">
                {c.icon}
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl sm:text-2xl text-cream leading-snug">
                  {c.title}
                </h3>
                <p className="mt-2 text-cream/55 leading-relaxed max-w-xl">
                  {c.body}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
