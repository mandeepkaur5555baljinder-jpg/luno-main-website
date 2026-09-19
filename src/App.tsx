import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Hero } from "./components/Hero";
import { StorySection } from "./components/StorySection";
import { Features } from "./components/Features";
import { AppPreview } from "./components/AppPreview";
import { DownloadSection } from "./components/DownloadSection";
import { Footer } from "./components/Footer";
import { MoonBackground } from "./components/MoonBackground";

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const { scrollYProgress } = useScroll();
  const progressScaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.2 });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const loader = document.getElementById("initial-loader");
      if (loader) {
        loader.style.opacity = "0";
        setTimeout(() => {
          loader.style.display = "none";
          document.body.style.overflow = "auto";
        }, 500);
      } else {
        document.body.style.overflow = "auto";
      }
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  const handleScrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden text-cream font-sans selection:bg-amber-400/40">

      <motion.div
        className="scroll-progress-bar fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none"
        style={{ scaleX: progressScaleX }}
        aria-hidden="true"
      />

      {!reduceMotion && <MoonBackground scrollProgress={scrollProgress} />}
      <div className="page-veil" aria-hidden="true" />

      <div className="relative z-10">
        <Hero
          onScrollToDownload={() => handleScrollToSection("download")}
          onScrollToFeatures={() => handleScrollToSection("features")}
        />
        <StorySection />
        <Features />
        <AppPreview />
        <DownloadSection />
        <Footer onScrollToDownload={() => handleScrollToSection("download")} />
      </div>

    </div>
  );
}
