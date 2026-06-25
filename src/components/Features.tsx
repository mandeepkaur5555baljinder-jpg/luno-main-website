import React from "react";
import { motion } from "motion/react";
import {
  MessageSquareDiff,
  Brain,
  Terminal,
  Activity,
  Eye,
  Database,
  Search,
  Cloud,
} from "lucide-react";

interface FeatureCard {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  iconGlow: string;
  title: string;
  desc: string;
  specText: string;
  category: string;
  size?: "large" | "normal";
  accent?: string;
}

export const Features: React.FC = () => {
  const featureList: FeatureCard[] = [
    {
      id: "smart-chat",
      icon: <MessageSquareDiff className="w-6 h-6" />,
      iconBg: "bg-violet-500/15",
      iconGlow: "shadow-violet-500/20",
      title: "Smart Chat",
      desc: "Instant conversational cycles backed by native reasoning logic. Understands nuances, local slang, context shifts, and long text summaries effortlessly. Every answer is grounded and precise.",
      specText: "Luno-Core-V2 Engine",
      category: "CONVERSATION",
      size: "large",
      accent: "from-violet-500/10 via-transparent to-transparent",
    },
    {
      id: "deep-thinking",
      icon: <Brain className="w-6 h-6" />,
      iconBg: "bg-purple-500/15",
      iconGlow: "shadow-purple-500/20",
      title: "Deep Thinking Mode",
      desc: "Step-by-step mathematical reasoning chains. Perfect for complex scientific formulas or multi-step logical problems.",
      specText: "Multi-path Chain-Of-Thought",
      category: "REASONING",
    },
    {
      id: "coding-help",
      icon: <Terminal className="w-6 h-6" />,
      iconBg: "bg-cyan-500/15",
      iconGlow: "shadow-cyan-500/20",
      title: "Coding Help",
      desc: "Write, analyze, and debug scripts directly in your window. Tuned for TypeScript, Python, Rust, and CSS frameworks.",
      specText: "Static AST Synthesizer",
      category: "DEVELOPER TOOL",
    },
    {
      id: "voice-assistant",
      icon: <Activity className="w-6 h-6" />,
      iconBg: "bg-rose-500/15",
      iconGlow: "shadow-rose-500/20",
      title: "Voice Assistant",
      desc: "True conversational audio with humanized pitches and advanced speed modifiers. Low-latency HD streaming for fluid voice feedback.",
      specText: "Low-latency HD streaming",
      category: "AUDIOCORE",
      size: "large",
      accent: "from-rose-500/8 via-transparent to-transparent",
    },
    {
      id: "image-intel",
      icon: <Eye className="w-6 h-6" />,
      iconBg: "bg-amber-500/15",
      iconGlow: "shadow-amber-500/20",
      title: "Image Understanding",
      desc: "Upload diagrams, layouts, flowcharts, or handwritten notes. Luno extracts structures and converts them to code.",
      specText: "Vision OCR Transformer",
      category: "VISION",
    },
    {
      id: "personal-memory",
      icon: <Database className="w-6 h-6" />,
      iconBg: "bg-emerald-500/15",
      iconGlow: "shadow-emerald-500/20",
      title: "Personal Memory",
      desc: "Secure local vector memory storage that contextually learns your preferences, project goals, and guidelines over time.",
      specText: "Sandboxed Local Vector DB",
      category: "CONTEXT RECALL",
    },
    {
      id: "fast-search",
      icon: <Search className="w-6 h-6" />,
      iconBg: "bg-blue-500/15",
      iconGlow: "shadow-blue-500/20",
      title: "Fast Search",
      desc: "Instant search fallback queries active MDN docs, API guidelines, and live global event indices.",
      specText: "Real-time Grounding Vector",
      category: "SEARCH",
    },
    {
      id: "cross-device",
      icon: <Cloud className="w-6 h-6" />,
      iconBg: "bg-violet-400/15",
      iconGlow: "shadow-violet-400/20",
      title: "Cross-Device Sync",
      desc: "Run Luno across multiple machines. Copy terminal commands, context, or notes from desktop to mobile instantly.",
      specText: "P2P Sandboxed Channel",
      category: "SYNC",
    },
  ];

  return (
    <section id="features" className="relative py-24 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto z-20">

      {/* Section header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-4">
        <div className="text-left">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] font-mono tracking-widest text-purple-400 uppercase block mb-3"
          >
            TECHNICAL MATURITY
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-display font-semibold text-white tracking-tight leading-tight"
          >
            Engineered for{" "}
            <span className="accent-gradient-text">pure utility.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-sm sm:text-base text-zinc-400 mt-4 max-w-lg leading-relaxed"
          >
            Unlike standard wrappers, Luno integrates advanced low-level compilers, native OCR parsers, and custom audio pipelines directly on your device.
          </motion.p>
        </div>
        <div className="text-[11px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 py-2 px-4 rounded-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>8 Core engines active</span>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featureList.map((feat, idx) => {
          const isLarge = feat.size === "large";
          return (
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: idx * 0.04 }}
              className={`relative p-6 rounded-2xl glass-effect-light glow-card flex flex-col justify-between items-start text-left group cursor-default bento-dot-grid overflow-hidden ${
                isLarge ? "sm:col-span-2 lg:col-span-2" : ""
              }`}
            >
              {/* Accent gradient overlay for large cards */}
              {feat.accent && (
                <div className={`absolute inset-0 bg-gradient-to-br ${feat.accent} pointer-events-none rounded-2xl`} />
              )}

              <div className="relative w-full z-10">
                {/* Category & icon row */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
                    {feat.category}
                  </span>
                  <div className={`w-10 h-10 rounded-xl ${feat.iconBg} flex items-center justify-center border border-white/5 transition-transform group-hover:scale-110 duration-300 shadow-lg ${feat.iconGlow}`}>
                    <span className="text-white/80">{feat.icon}</span>
                  </div>
                </div>

                <h3 className="text-base font-display font-semibold text-white mb-2">
                  {feat.title}
                </h3>

                <p className={`text-xs text-zinc-400 leading-relaxed font-sans ${isLarge ? "max-w-sm" : ""}`}>
                  {feat.desc}
                </p>
              </div>

              {/* Footer spec */}
              <div className="relative z-10 w-full pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors duration-300">
                <span>Core Module</span>
                <span>{feat.specText}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

    </section>
  );
};
