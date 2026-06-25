import { useState, useEffect } from "react";
import { Hero } from "./components/Hero";
import { StorySection } from "./components/StorySection";
import { Features } from "./components/Features";
import { AppPreview } from "./components/AppPreview";
import { DownloadSection } from "./components/DownloadSection";
import { Footer } from "./components/Footer";
import { ParticlesBackground } from "./components/ui/ParticlesBackground";

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  // Handle the initial global loading skeleton
  useEffect(() => {
    // Wait for React to paint the DOM, then fade out the skeleton loader
    const timer = setTimeout(() => {
      const loader = document.getElementById('initial-loader');
      if (loader) {
        loader.style.opacity = '0'; // Start fade out
        setTimeout(() => {
          loader.style.display = 'none'; // Remove from layout
          document.body.style.overflow = 'auto'; // Unlock scrolling
        }, 800); // Matches the CSS transition time
      } else {
        document.body.style.overflow = 'auto';
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Monitor raw vertical scroll progress percentage across the viewport
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(window.scrollY / docHeight);
      }

      // If we scroll past the story section content entirely down to the features/downloads,
      // lock the 3D model into step 4 (its settle state as download companion)
      const storyEl = document.getElementById("story-anchor");
      if (storyEl) {
        const storyRect = storyEl.getBoundingClientRect();
        // If the story container's bottom has scrolled past the screen midpoint, lock step to 4
        if (storyRect.bottom < (window.innerHeight * 0.55)) {
          setActiveStep(4);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen grid-bg overflow-x-hidden text-white font-sans selection:bg-purple-500/20 selection:text-white">

      {/* AURORA ORBS — animated ambient background glow */}
      <div className="aurora-orb-1" aria-hidden="true" />
      <div className="aurora-orb-2" aria-hidden="true" />

      {/* DYNAMIC SCROLL PARTICLES BACKGROUND */}
      <ParticlesBackground />


      {/* FOREGROUND LAYOUT LAYERS */}
      <div className="relative z-20">

        {/* HERO HEADER */}
        <Hero
          onScrollToDownload={() => handleScrollToSection("download")}
          onScrollToFeatures={() => handleScrollToSection("features")}
        />

        {/* CONTAINER HOLDING THE INTERSECTION OBSERVERS FOR STORY STEPS */}
        <div id="story-anchor">
          <StorySection activeStep={activeStep} setActiveStep={setActiveStep} />
        </div>

        {/* BENTO FUNCTIONAL FEATURES */}
        <Features />


        {/* USER UTILITY AND APP SCREEN SIMULATION */}
        <AppPreview />

        {/* SECURE APK/IPA LOGISTICS DOWNLOAD CARDS */}
        <DownloadSection />

        {/* HIGH-TRUST BADGES & COPYRIGHT CREDITS FOOTER */}
        <Footer onScrollToDownload={() => handleScrollToSection("download")} />

      </div>

    </div>
  );
}
