import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { MessageSquare, Code, Mic, ShieldCheck, Minimize2 } from "lucide-react";

interface StorySectionProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
}

interface StepItem {
  id: number;
  icon: React.ReactNode;
  label: string;
  title: string;
  desc: string;
  badge: string;
  stats: { label: string; val: string }[];
  accentColor: string;
}

export const StorySection: React.FC<StorySectionProps> = ({ activeStep, setActiveStep }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const steps: StepItem[] = [
    {
      id: 1,
      icon: <MessageSquare className="w-4 h-4" />,
      label: "STEP 1 // CHAT",
      title: "Ask anything, understand instantly.",
      desc: "Luno processes natural language query streams with incredible semantic depth. From drafting quick emails to exploring quantum physics, your companion answers are grounded and precise.",
      badge: "Fast Reasoning Mode",
      stats: [
        { label: "Response latency", val: "<180ms" },
        { label: "Token memory", val: "128k context" }
      ],
      accentColor: "violet",
    },
    {
      id: 2,
      icon: <Code className="w-4 h-4" />,
      label: "STEP 2 // CODE",
      title: "Build full stack in seconds.",
      desc: "An AI engineered for code architecture. Describe what you want to create and watch Luno output perfectly structured TypeScript, Tailwind classes, and server endpoints without boilerplate clutter.",
      badge: "Polyglot Synthesizer",
      stats: [
        { label: "Supported languages", val: "30+" },
        { label: "Refactor accuracy", val: "99.2%" }
      ],
      accentColor: "cyan",
    },
    {
      id: 3,
      icon: <Mic className="w-4 h-4" />,
      label: "STEP 3 // VOICE",
      title: "Talk with voice. Fluid, real-time.",
      desc: "Tap into true conversational audio. Luno handles raw sonic waveforms to respond with emotional nuance and custom speeds, making verbal assistance feel fully native.",
      badge: "Sub-Second Latency Audio",
      stats: [
        { label: "Voice synthesis", val: "6 HD models" },
        { label: "Duplex streaming", val: "Enabled" }
      ],
      accentColor: "rose",
    },
    {
      id: 4,
      icon: <Minimize2 className="w-4 h-4" />,
      label: "STEP 4 // EVERYWHERE",
      title: "Use Luno anywhere. Fully sideloadable.",
      desc: "Run Luno as a quiet floating widget on Mac, a sidebar, or an offline-first mobile app. No heavy browsers required — just clean, light native sandboxed interfaces.",
      badge: "Sideload Ready",
      stats: [
        { label: "Mac binary size", val: "18.2 MB" },
        { label: "iOS IPA package", val: "12 MB only" }
      ],
      accentColor: "emerald",
    }
  ];

  const accentMap: Record<string, { pill: string; title: string; stat: string; node: string; badge: string }> = {
    violet: {
      pill: "bg-violet-500/15 border-violet-500/30 text-violet-300",
      title: "from-white via-violet-200 to-violet-400",
      stat: "text-violet-300",
      node: "bg-violet-500",
      badge: "text-violet-400",
    },
    cyan: {
      pill: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
      title: "from-white via-cyan-200 to-cyan-400",
      stat: "text-cyan-300",
      node: "bg-cyan-500",
      badge: "text-cyan-400",
    },
    rose: {
      pill: "bg-rose-500/15 border-rose-500/30 text-rose-300",
      title: "from-white via-rose-200 to-rose-400",
      stat: "text-rose-300",
      node: "bg-rose-500",
      badge: "text-rose-400",
    },
    emerald: {
      pill: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
      title: "from-white via-emerald-200 to-emerald-400",
      stat: "text-emerald-300",
      node: "bg-emerald-500",
      badge: "text-emerald-400",
    },
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const childElements = containerRef.current.children;
      const viewportHeight = window.innerHeight;

      let candidateStep = 0;
      let minDistance = Infinity;

      for (let i = 0; i < childElements.length; i++) {
        const el = childElements[i] as HTMLElement;
        const rect = el.getBoundingClientRect();
        const elementMid = rect.top + rect.height / 2;
        const screenMid = viewportHeight / 2;
        const distance = Math.abs(elementMid - screenMid);

        if (distance < minDistance && rect.top < viewportHeight * 0.7 && rect.bottom > viewportHeight * 0.3) {
          minDistance = distance;
          const stepIdStr = el.getAttribute("data-step-id");
          if (stepIdStr) candidateStep = parseInt(stepIdStr, 10);
        }
      }

      if (window.scrollY < 200) candidateStep = 0;
      if (candidateStep !== activeStep) setActiveStep(candidateStep);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeStep, setActiveStep]);

  return (
    <div className="relative w-full z-20">

      {/* Glowing vertical timeline line */}
      <div className="absolute left-5 md:left-[4.75rem] top-32 bottom-32 w-px timeline-line pointer-events-none hidden sm:block" />

      <div ref={containerRef} className="flex flex-col w-full">
        {steps.map((step) => {
          const isSelected = activeStep === step.id;
          const colors = accentMap[step.accentColor];

          return (
            <div
              key={step.id}
              data-step-id={step.id}
              className="min-h-screen flex items-center justify-start px-6 sm:px-12 md:px-20 max-w-7xl mx-auto w-full py-16"
            >
              {/* Timeline node */}
              <div className="hidden sm:flex absolute left-3 md:left-[4.25rem] w-5 h-5 rounded-full items-center justify-center transition-all duration-500 flex-shrink-0">
                <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  isSelected ? `${colors.node} timeline-node-active` : "timeline-node-inactive"
                }`} />
              </div>

              <div className="w-full md:w-1/2 flex flex-col items-start text-left pl-0 sm:pl-12">

                {/* Step pill */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border mb-5 font-mono text-[10px] tracking-widest uppercase transition-all duration-500 ${
                    isSelected ? colors.pill : "bg-white/4 border-white/8 text-zinc-600"
                  }`}
                >
                  {step.icon}
                  <span>{step.label}</span>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight transition-all duration-500 ${
                    isSelected
                      ? `bg-gradient-to-r ${colors.title} bg-clip-text text-transparent`
                      : "text-zinc-600"
                  }`}
                >
                  {step.title}
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`text-sm sm:text-base leading-relaxed mt-6 transition-all duration-500 max-w-md ${
                    isSelected ? "text-zinc-300" : "text-zinc-700"
                  }`}
                >
                  {step.desc}
                </motion.p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 mt-8 w-full max-w-sm">
                  {step.stats.map((stat, sIdx) => (
                    <motion.div
                      key={sIdx}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.25 + sIdx * 0.1 }}
                      className="flex flex-col border-t border-white/5 pt-3"
                    >
                      <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-600">{stat.label}</span>
                      <span className={`text-lg font-semibold mt-1 transition-all duration-500 font-display ${
                        isSelected ? colors.stat : "text-zinc-700"
                      }`}>
                        {stat.val}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="mt-8 flex items-center gap-2 font-mono text-xs"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 transition-colors duration-500 ${isSelected ? colors.badge : "text-zinc-700"}`} />
                  <span className={`transition-colors duration-500 ${isSelected ? colors.badge : "text-zinc-700"}`}>{step.badge}</span>
                </motion.div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
