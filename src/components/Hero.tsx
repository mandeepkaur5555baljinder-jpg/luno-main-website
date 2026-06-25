import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowDown, Cpu, ChevronRight, Apple, Play, Monitor, Zap, Brain, Code2, Sparkles } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

interface HeroProps {
  onScrollToDownload: () => void;
  onScrollToFeatures: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToDownload, onScrollToFeatures }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-between items-start pb-12 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto z-20">

      {/* STICKY NAV */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`sticky top-0 z-50 w-full flex justify-between items-center py-4 px-6 sm:px-12 md:px-20 -mx-6 sm:-mx-12 md:-mx-20 transition-all duration-500 ${
          isScrolled ? "nav-scrolled" : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src="/favicon.svg" alt="Luno AI Logo" className="w-9 h-9 rounded-xl shadow-md border border-white/10" />
            <div className="absolute inset-0 rounded-xl bg-purple-500/20 blur-sm -z-10" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-white block">Luno AI</span>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase block -mt-1">By Tanveer</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <button onClick={onScrollToFeatures} className="hover:text-white transition-colors duration-200 cursor-pointer">Features</button>
          <a href="#preview" className="hover:text-white transition-colors duration-200 cursor-pointer">Interface</a>
          <button onClick={onScrollToDownload} className="hover:text-white transition-colors duration-200 cursor-pointer">Download</button>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase text-purple-300 bg-purple-500/10 rounded-full border border-purple-500/20">
            v1.2.0 Stable
          </span>
          <button
            onClick={onScrollToDownload}
            className="accent-glow-btn rounded-full px-5 h-9 text-xs font-semibold text-white tracking-wide cursor-pointer"
          >
            Download Luno
          </button>
        </div>
      </motion.header>

      {/* HERO CONTENT AREA */}
      <div className="w-full flex flex-col lg:flex-row items-start lg:items-center gap-16 pt-16 md:pt-24 lg:pt-28">

        {/* LEFT — Text Column */}
        <div className="flex-1 max-w-2xl text-left">

          {/* Accent badge */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/25 bg-purple-500/10 text-[12px] font-medium text-purple-300 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Your personal AI companion</span>
            <ChevronRight className="w-3 h-3 text-purple-400/60" />
          </motion.div>

          {/* Big headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl font-display font-light tracking-tight leading-[1.06] mb-6"
          >
            <span className="text-white">Luno AI</span>
            <span className="block mt-2 font-semibold hero-gradient-text">
              Your personal AI,<br />everywhere.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed mb-8 max-w-lg"
          >
            A premium, lightweight companion for real-time chat, visual intelligence, voice, and instant programming support — running natively on every device.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4 mb-10"
          >
            <button
              onClick={onScrollToDownload}
              className="accent-glow-btn rounded-full px-8 h-12 text-sm font-semibold text-white tracking-wide cursor-pointer inline-flex items-center gap-2"
            >
              <span>Download Luno</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <LiquidButton
              onClick={onScrollToFeatures}
              size="lg"
              className="font-sans px-6 h-12 text-sm tracking-wide font-semibold rounded-full"
            >
              See features
            </LiquidButton>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.55 }}
            className="flex flex-wrap items-center gap-4"
          >
            {[
              { label: "128K context window", icon: <Brain className="w-3.5 h-3.5" /> },
              { label: "<180ms latency", icon: <Zap className="w-3.5 h-3.5" /> },
              { label: "30+ languages", icon: <Code2 className="w-3.5 h-3.5" /> },
            ].map((stat) => (
              <div key={stat.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/4 border border-white/6 text-[11px] text-zinc-400 font-mono tracking-wide">
                <span className="text-purple-400">{stat.icon}</span>
                {stat.label}
              </div>
            ))}
          </motion.div>

          {/* Platform indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.7 }}
            className="flex items-center gap-5 mt-8 text-xs text-zinc-600 font-mono tracking-wider"
          >
            <div className="flex items-center gap-1.5"><Play className="w-3.5 h-3.5 fill-current" /><span>Android</span></div>
            <div className="flex items-center gap-1.5"><Apple className="w-3.5 h-3.5 fill-current" /><span>iOS</span></div>
            <div className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5" /><span>macOS</span></div>
          </motion.div>
        </div>

        {/* RIGHT — Floating Chat Mockup (desktop only) */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block relative flex-shrink-0 w-80 cursor-pointer group"
        >
          <a
            href="https://app.lunoai.in"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {/* Ambient glow behind the card */}
            <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-3xl scale-110 group-hover:bg-purple-600/35 group-hover:scale-120 transition-all duration-500" />

            {/* Phone/card frame */}
            <div className="relative glass-effect rounded-3xl border border-white/10 overflow-hidden shadow-2xl float-gentle group-hover:border-purple-500/40 group-hover:shadow-[0_0_50px_rgba(168,85,247,0.3)] transition-all duration-500">
              {/* Chat header */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/6 bg-white/2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-purple-700 flex items-center justify-center shadow-lg pulse-glow flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white fill-white" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white">Luno AI</span>
                  <span className="text-[10px] text-emerald-400 block font-mono">● Online</span>
                </div>
                <div className="ml-auto text-[10px] font-mono text-zinc-500 group-hover:text-purple-300 transition-colors duration-300 flex items-center gap-1">
                  <span>Open App</span>
                  <span className="text-[8px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                </div>
              </div>

              {/* Chat messages */}
              <div className="p-4 space-y-3">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-purple-600/40 border border-purple-500/20 rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[80%]">
                    <p className="text-xs text-white leading-relaxed">Explain quantum superposition simply</p>
                  </div>
                </div>

                {/* AI response */}
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-white fill-white" />
                  </div>
                  <div className="glass-effect-light rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
                    <p className="text-xs text-zinc-200 leading-relaxed">
                      Imagine a coin spinning in the air — it's both heads <em>and</em> tails at once. Only when it lands does it "choose" one state. That's superposition.
                    </p>
                  </div>
                </div>

                {/* Typing indicator */}
                <div className="flex gap-2 items-center opacity-60">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex-shrink-0" />
                  <div className="glass-effect-light rounded-full px-3 py-2 flex gap-1.5">
                    {[0, 0.2, 0.4].map((d) => (
                      <motion.div
                        key={d}
                        className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="mx-4 mb-4 mt-1 flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 group-hover:bg-white/10 group-hover:border-purple-500/30 transition-all duration-500">
                <span className="text-[11px] text-zinc-500 flex-1 font-sans">Ask Luno anything...</span>
                <div className="w-6 h-6 rounded-lg bg-purple-600/80 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500 transition-all duration-500">
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0], y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
        className="w-full flex justify-center items-center gap-2 text-xs text-zinc-600 font-mono uppercase tracking-widest pointer-events-none mt-8"
      >
        <ArrowDown className="w-3.5 h-3.5 text-purple-500/60" />
        <span>Scroll to explore</span>
      </motion.div>

    </section>
  );
};
