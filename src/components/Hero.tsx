import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Send, Sparkles } from "lucide-react";

interface HeroProps {
  onScrollToDownload: () => void;
  onScrollToFeatures: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToDownload, onScrollToFeatures }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ sender: "user" | "luno"; text: string }[]>([
    { sender: "user", text: "Explain quantum superposition simply." },
    { sender: "luno", text: "Like a coin spinning mid-air — it's both heads and tails at once. It only “chooses” when it lands." },
  ]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || typing) return;
    const q = prompt.trim();
    setPrompt("");
    setMessages((prev) => [...prev, { sender: "user", text: q }]);
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "luno", text: `Here's a quick take on "${q}" — open the full app for the real answer.` }]);
      setTyping(false);
    }, 700);
  };

  return (
    <section className="relative min-h-screen flex flex-col">

      {/* NAV */}
      <header className={`sticky top-0 z-50 nav-bar transition-all ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-16">
          <a href="#" className="flex items-center gap-2.5">
            <span className="w-3 h-3 moon-mark" aria-hidden="true" />
            <span className="font-display text-lg font-bold tracking-tight text-cream">Luno</span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-cream/65">
            <button onClick={onScrollToFeatures} className="hover:text-cream transition-colors cursor-pointer">Features</button>
            <a href="#preview" className="hover:text-cream transition-colors">Try it</a>
            <button onClick={onScrollToDownload} className="hover:text-cream transition-colors cursor-pointer">Get Luno</button>
          </nav>

          <a href="https://app.lunoai.in" target="_blank" rel="noopener noreferrer" className="btn btn-solid h-10 px-5 text-sm">
            Open Luno
          </a>
        </div>
      </header>

      {/* HERO BODY */}
      <div className="flex-1 flex items-center max-w-7xl mx-auto w-full px-5 sm:px-8 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center w-full">

          {/* LEFT — copy */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <div className="chip chip--live px-3.5 py-1.5 text-xs mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-dot" />
              Live now at app.lunoai.in
            </div>

            <h1 className="font-display font-bold text-[2.75rem] leading-[1.05] sm:text-6xl sm:leading-[1.03] lg:text-7xl lg:leading-[1] max-w-3xl">
              <span className="text-moon-gradient">A personal AI that actually feels like yours.</span>
            </h1>

            <p className="mt-7 text-lg text-cream/65 leading-relaxed max-w-lg">
              Luno is a chat, voice, and code assistant one person built end to end.
              No corporate wrapper, no bloat — just a fast assistant you can open
              from your phone or your laptop and start using immediately.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href="https://app.lunoai.in" target="_blank" rel="noopener noreferrer" className="btn btn-solid h-12 px-7 text-sm">
                Open Luno
              </a>
              <button onClick={onScrollToFeatures} className="btn btn-outline h-12 px-6 text-sm">
                See what it does
              </button>
            </div>

            <p className="mt-10 text-sm text-cream/45 max-w-md">
              Works in any browser today. Add it to your iPhone home screen like an
              app — Android and Mac apps are on the way.
            </p>
          </motion.div>

          {/* RIGHT — live micro-demo */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#241605]" />
                  </div>
                  <span className="text-sm font-semibold text-cream">Luno — live preview</span>
                </div>
              </div>

              <div className="space-y-3 min-h-[150px] max-h-[220px] overflow-y-auto pr-0.5">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%] ${
                      m.sender === "user"
                        ? "bg-gradient-to-br from-violet-500/70 to-violet-700/70 text-white"
                        : "glass-lite text-cream/90"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex items-center gap-1.5 pl-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cream/50 dot-1" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cream/50 dot-2" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cream/50 dot-3" />
                  </div>
                )}
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-2 mt-4">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask Luno anything"
                  className="flex-1 text-sm glass-lite rounded-xl px-3.5 py-2.5 text-cream placeholder-cream/40 focus:outline-none focus:border-amber-400/50 border border-transparent transition-colors"
                />
                <button
                  type="submit"
                  disabled={typing || !prompt.trim()}
                  className="btn btn-solid w-11 h-11 !px-0 shrink-0"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
