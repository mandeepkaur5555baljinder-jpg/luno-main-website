import React, { useState } from "react";
import {
  Sparkles,
  Terminal,
  MessageSquare,
  Send,
  Copy,
  Check,
} from "lucide-react";

interface ChatMessage {
  sender: "user" | "luno";
  text: string;
  code?: string;
}

type TabId = "home" | "reasoning" | "code";

const DEMOS: Record<Exclude<TabId, "home">, { label: string; messages: ChatMessage[] }> = {
  reasoning: {
    label: "Reasoning",
    messages: [
      {
        sender: "user",
        text: "Can you explain quantum superposition with a coin analogy?",
      },
      {
        sender: "luno",
        text: "Think of a spinning coin on a table:\n\n1. Flat and resting, it's clearly Heads or Tails.\n2. Spinning, it's neither yet — both outcomes exist at once, as probabilities.\n3. The moment you slap your hand down and look, it settles into one definite result.\n\nThat collapse from “both” to “one” is what happens when a quantum system gets measured.",
      },
    ],
  },
  code: {
    label: "Code",
    messages: [
      {
        sender: "user",
        text: "Write a React hook that syncs a value to localStorage across tabs.",
      },
      {
        sender: "luno",
        text: "Here's a small, typed version with cross-tab sync built in:",
        code: `import { useState, useEffect, useCallback } from "react";

export function useLocalSync<T>(key: string, initialValue: T) {
  const read = useCallback((): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [value, setValue] = useState<T>(read);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
      },
    ],
  },
};

const SUGGESTIONS = [
  "Explain quantum computing",
  "Write an API client in Rust",
  "Draft an executive summary",
  "Design a database schema",
  "Refactor this CSS with Tailwind",
  "Summarize a research paper",
];

export const AppPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [typed, setTyped] = useState("");
  const [customMessages, setCustomMessages] = useState<ChatMessage[] | null>(null);
  const [copied, setCopied] = useState(false);

  const activeDemo = activeTab !== "home" ? DEMOS[activeTab] : null;
  const messages = activeTab === "home" ? customMessages : activeDemo?.messages ?? null;

  const handleTab = (tab: TabId) => {
    setActiveTab(tab);
    if (tab !== "home") setCustomMessages(null);
  };

  const handleChip = (text: string) => setTyped(text);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const q = typed.trim();
    if (!q) return;
    setTyped("");
    setActiveTab("home");
    setCustomMessages([
      { sender: "user", text: q },
      { sender: "luno", text: `Good question — open the full app to get a real answer to "${q}".` },
    ]);
  };

  return (
    <section id="preview" className="relative py-24 sm:py-32 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">

        <div className="max-w-xl mb-12">
          <h2 className="font-display font-bold text-4xl sm:text-5xl leading-[1.05] text-cream">
            This is the real thing.
          </h2>
          <p className="mt-5 text-cream/55 leading-relaxed">
            Not a screenshot — switch modes below or type your own question.
          </p>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 mb-6">
          {([
            { id: "home" as TabId, icon: <MessageSquare className="w-4 h-4" />, label: "Chat" },
            { id: "reasoning" as TabId, icon: <Sparkles className="w-4 h-4" />, label: "Reasoning" },
            { id: "code" as TabId, icon: <Terminal className="w-4 h-4" />, label: "Code" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-to-br from-amber-300 to-amber-500 text-[#241605]"
                  : "glass-lite text-cream/65 hover:text-cream"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* DEVICE FRAME */}
        <div className="glass rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: "440px" }}>

          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <span className="text-sm font-semibold text-cream/80">Luno</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
            {!messages ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 space-y-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#241605]" />
                </div>
                <h3 className="font-display font-semibold text-xl sm:text-2xl text-cream max-w-sm">
                  What do you want help with?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleChip(s)}
                      className="text-left px-4 py-2.5 rounded-xl glass-lite text-sm text-cream/70 hover:text-cream transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed max-w-[85%] whitespace-pre-line ${
                    m.sender === "user"
                      ? "bg-gradient-to-br from-violet-500/70 to-violet-700/70 text-white"
                      : "glass-lite text-cream/90"
                  }`}>
                    {m.text}
                    {m.code && (
                      <div className="mt-3 rounded-lg bg-black/40 border border-white/10 overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
                          <span className="text-xs font-mono text-cream/45">TypeScript</span>
                          <button
                            onClick={() => handleCopy(m.code!)}
                            className="flex items-center gap-1 text-xs text-cream/55 hover:text-cream cursor-pointer"
                          >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <pre className="p-3.5 text-xs font-mono text-amber-200/90 overflow-x-auto"><code>{m.code}</code></pre>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Ask Luno anything"
              className="flex-1 text-sm glass-lite rounded-xl px-4 py-2.5 text-cream placeholder-cream/40 focus:outline-none focus:border-amber-400/50 border border-transparent transition-colors"
            />
            <button type="submit" disabled={!typed.trim()} className="btn btn-solid w-11 h-11 !px-0 shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </section>
  );
};
