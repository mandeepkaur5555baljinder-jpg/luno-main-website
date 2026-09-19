import React from "react";
import {
  MessageSquareDiff,
  Brain,
  Terminal,
  Mic,
  Eye,
  Database,
  Search,
  RefreshCw,
} from "lucide-react";

interface FeatureCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  large?: boolean;
}

const FEATURES: FeatureCard[] = [
  {
    id: "chat",
    icon: <MessageSquareDiff className="w-5 h-5" />,
    title: "Conversations that hold together",
    desc: "Ask follow-up questions, change direction, come back to something from earlier — Luno keeps up without you repeating yourself.",
    large: true,
  },
  {
    id: "voice",
    icon: <Mic className="w-5 h-5" />,
    title: "A voice you can actually talk to",
    desc: "Full back-and-forth speech, interruptions included. Say what you mean and Luno responds out loud.",
    large: true,
  },
  {
    id: "reasoning",
    icon: <Brain className="w-5 h-5" />,
    title: "Slows down for hard questions",
    desc: "Math, proofs, and multi-step problems get worked through step by step instead of guessed at.",
  },
  {
    id: "code",
    icon: <Terminal className="w-5 h-5" />,
    title: "Writes and explains real code",
    desc: "TypeScript, Python, Rust, Go — ask for a function or a whole approach and get working code back.",
  },
  {
    id: "vision",
    icon: <Eye className="w-5 h-5" />,
    title: "Reads what you show it",
    desc: "Photos of whiteboards, screenshots, handwritten notes — Luno turns them into text you can use.",
  },
  {
    id: "memory",
    icon: <Database className="w-5 h-5" />,
    title: "Remembers your context",
    desc: "Your preferences and past conversations carry over, kept private to your own account.",
  },
  {
    id: "search",
    icon: <Search className="w-5 h-5" />,
    title: "Checks its answers when it matters",
    desc: "For anything time-sensitive, Luno looks it up rather than relying on stale training data.",
  },
  {
    id: "sync",
    icon: <RefreshCw className="w-5 h-5" />,
    title: "Picks up where you left off",
    desc: "Switch from your phone to your laptop mid-conversation and the thread is still there.",
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="relative py-24 sm:py-32 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="max-w-2xl mb-14 sm:mb-20">
          <h2 className="font-display font-bold text-4xl sm:text-5xl leading-[1.05] text-cream">
            Everything in one assistant.
          </h2>
          <p className="mt-5 text-cream/55 leading-relaxed">
            No separate apps for chat, voice, and code. It's one assistant that
            happens to be good at all three.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.id}
              className={`card-glow rounded-2xl p-6 flex flex-col ${f.large ? "sm:col-span-2" : ""}`}
            >
              <div className="w-11 h-11 rounded-full glass-lite flex items-center justify-center mb-6 text-amber-300 shrink-0">
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-lg text-cream leading-snug mb-2.5">
                {f.title}
              </h3>
              <p className={`text-sm text-cream/55 leading-relaxed ${f.large ? "max-w-md" : ""}`}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
