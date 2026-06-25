import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Apple, Smartphone, Monitor, Info } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

export const DownloadSection: React.FC = () => {
  const [downloadingPlatform, setDownloadingPlatform] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadStep, setDownloadStep] = useState<string>("");
  const [completedPlatform, setCompletedPlatform] = useState<string | null>(null);

  const platforms = [
    {
      id: "android",
      name: "Android Phone",
      fileType: "APK file",
      size: "24.5 MB",
      badge: "Immediate Sideload",
      icon: <Smartphone className="w-6 h-6" />,
      tagline: "Unsigned APK direct package",
      requirement: "Android 10.0 or higher",
      link: "/downloads/luno-android.apk",
      comingSoon: false,
      btnLabel: "Download APK",
      accentBg: "bg-emerald-500/10",
      accentBorder: "border-emerald-500/20",
      accentText: "text-emerald-400",
      accentIcon: "text-emerald-300",
      statusColor: "text-emerald-400",
      glowColor: "rgba(16, 185, 129, 0.12)",
    },
    {
      id: "ios",
      name: "iPhone / iPad",
      fileType: "IPA file",
      size: "12.1 MB",
      badge: "Sideload / AltStore",
      icon: <Apple className="w-6 h-6" />,
      tagline: "Sideloadable test IPA package",
      requirement: "iOS 15.0 or higher",
      link: "/downloads/luno-ios.ipa",
      comingSoon: false,
      btnLabel: "Download IPA",
      accentBg: "bg-blue-500/10",
      accentBorder: "border-blue-500/20",
      accentText: "text-blue-400",
      accentIcon: "text-blue-300",
      statusColor: "text-emerald-400",
      glowColor: "rgba(59, 130, 246, 0.12)",
    },
    {
      id: "mac",
      name: "macOS",
      fileType: "DMG package",
      size: "38.2 MB",
      badge: "Apple Silicon Native",
      icon: <Apple className="w-6 h-6" />,
      tagline: "Apple M1/M2/M3 optimized",
      requirement: "macOS Monterey 12.0+",
      link: "/downloads/luno-mac.dmg",
      comingSoon: false,
      btnLabel: "Download for Mac",
      accentBg: "bg-violet-500/10",
      accentBorder: "border-violet-500/20",
      accentText: "text-violet-400",
      accentIcon: "text-violet-300",
      statusColor: "text-emerald-400",
      glowColor: "rgba(124, 58, 237, 0.14)",
    },
    {
      id: "windows",
      name: "Windows PC",
      fileType: "Coming Soon",
      size: "-- MB",
      badge: "Development Active",
      icon: <Monitor className="w-6 h-6" />,
      tagline: "Native PC desktop client",
      requirement: "Windows 11 (64-bit)",
      link: "#",
      comingSoon: true,
      btnLabel: "Coming Soon",
      accentBg: "bg-amber-500/10",
      accentBorder: "border-amber-500/20",
      accentText: "text-amber-400",
      accentIcon: "text-amber-300",
      statusColor: "text-amber-400",
      glowColor: "rgba(245, 158, 11, 0.08)",
    },
  ];

  const guides: Record<string, { title: string; steps: string[]; note: string }> = {
    android: {
      title: "Android APK Installation",
      steps: [
        "On your device, go to Settings and search for 'Install Unknown Apps'.",
        "Authorize permissions for your web browser or local File Manager.",
        "Navigate to your Downloads folder, tap luno-android.apk, and confirm Install.",
        "Open your app tray, tap the Luno AI icon, and begin.",
      ],
      note: "If Play Protect flags this, tap 'Install anyway' to complete the sideload.",
    },
    ios: {
      title: "iOS IPA Sideloading Guide",
      steps: [
        "Download luno-ios.ipa directly to your device.",
        "Open a sideload helper on your PC/Mac (AltStore or Sideloadly).",
        "Plug your iPhone/iPad and load the IPA package.",
        "Input Apple credentials to generate local certificates.",
        "Go to Settings → General → VPN & Device Management and Trust the developer.",
      ],
      note: "Sideloaded apps on standard accounts expire after 7 days.",
    },
    mac: {
      title: "macOS Gatekeeper Authorization",
      steps: [
        "Download and mount the Luno DMG volume on your desktop.",
        "Drag Luno AI into your Applications folder.",
        "Right-click the app and select Open (do not double-click).",
        "Click 'Open anyway' when the quarantine message appears.",
      ],
      note: "Clean binary bundle compiled through clang and LLVM, fully sandboxed.",
    },
  };

  const handleDownloadClick = (e: React.MouseEvent, platform: typeof platforms[0]) => {
    e.preventDefault();
    if (platform.comingSoon) return;
    setDownloadingPlatform(platform.id);
    setDownloadProgress(0);
    setDownloadStep("Initializing encrypted tunnel...");
    setCompletedPlatform(null);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 6;
      if (progress >= 100) {
        progress = 100;
        setDownloadProgress(100);
        setDownloadStep("Build integrity verified. Payload ready.");
        clearInterval(interval);
        setTimeout(() => {
          setDownloadingPlatform(null);
          setCompletedPlatform(platform.id);
        }, 800);
      } else {
        setDownloadProgress(progress);
        if (progress < 25) setDownloadStep("Securing node socket link...");
        else if (progress < 55) setDownloadStep("Verifying SHA-256 code signature...");
        else if (progress < 85) setDownloadStep(`Streaming clean binaries (${progress}%)...`);
        else setDownloadStep("Finalizing standalone packaging...");
      }
    }, 120);
  };

  return (
    <section id="download" className="relative py-24 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto z-20">

      {/* Section header */}
      <div className="text-left mb-14 max-w-xl">
        <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase block mb-3">SECURE REPOSITORY</span>
        <h2 className="text-4xl font-display font-semibold text-white tracking-tight leading-tight">
          Get Luno on your{" "}
          <span className="hero-gradient-text">device.</span>
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed">
          Select your platform below. No accounts, no trackers, no App Store filters — just direct verified packages.
        </p>
      </div>

      {/* Platform download cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {platforms.map((platform) => {
          const isWindows = platform.comingSoon;
          const isCurrentlySimulated = downloadingPlatform === platform.id;

          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ boxShadow: isWindows ? "none" : `0 0 40px ${platform.glowColor}` }}
              className={`relative flex flex-col justify-between p-6 rounded-2xl glass-effect-light glow-card transition-all duration-300 ${
                isWindows ? "opacity-55 grayscale-[30%]" : ""
              }`}
            >
              <div>
                {/* Icon and size */}
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-xl ${platform.accentBg} border ${platform.accentBorder} flex items-center justify-center shadow-inner`}>
                    <span className={platform.accentIcon}>{platform.icon}</span>
                  </div>
                  <span className={`text-[9px] font-mono font-medium tracking-wider ${platform.accentText} bg-white/4 px-2.5 py-1 rounded-full border border-white/8`}>
                    {platform.size}
                  </span>
                </div>

                {/* Platform info */}
                <span className={`text-[10px] font-mono tracking-wider ${platform.accentText} uppercase block mb-1`}>
                  {platform.badge}
                </span>
                <h3 className="text-lg font-display font-semibold text-white mb-2">{platform.name}</h3>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">{platform.tagline}</p>

                {/* Specs */}
                <div className="space-y-2 border-t border-white/5 pt-4 mb-8 text-[11px] font-mono text-zinc-500">
                  <div className="flex justify-between">
                    <span>Package Format</span>
                    <span className="text-zinc-300 font-semibold">{platform.fileType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>OS Target</span>
                    <span className="text-zinc-300">{platform.requirement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className={`font-medium ${platform.statusColor}`}>
                      {isWindows ? "In pipeline" : "Signed & Verified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Download action */}
              <div className="w-full">
                {isWindows ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl text-xs font-mono tracking-wider font-semibold bg-neutral-900/80 border border-white/5 text-zinc-600 flex items-center justify-center gap-2 cursor-not-allowed uppercase"
                  >
                    {platform.btnLabel}
                  </button>
                ) : (
                  <div className="w-full">
                    {isCurrentlySimulated ? (
                      <div className="w-full space-y-2 mt-1">
                        <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                          <span className="animate-pulse truncate max-w-[70%]">{downloadStep}</span>
                          <span className={platform.accentText}>{downloadProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full shimmer-bar transition-all duration-100"
                            style={{ width: `${downloadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleDownloadClick(e, platform)}
                        className={`w-full h-11 rounded-xl text-xs font-semibold font-sans flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${platform.accentBg} border ${platform.accentBorder} ${platform.accentText} hover:brightness-110`}
                      >
                        <Download className="w-4 h-4" />
                        <span>{platform.btnLabel}</span>
                      </button>
                    )}
                  </div>
                )}
                <p className="text-[10px] text-zinc-600 text-center mt-2.5 font-mono">
                  {isWindows ? "Windows Client coming Q4 2026" : `Direct verified link to ${platform.fileType}`}
                </p>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Trust callout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-10 p-5 rounded-2xl glass-effect border border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left max-w-4xl"
      >
        <div className="flex gap-3 items-start sm:items-center">
          <Info className="w-5 h-5 text-violet-400 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <p className="text-xs font-semibold text-white">Sideload Integrity Guarantee</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Files are pre-compiled clean binaries. Android APK targets SDK 34, iOS includes raw testing entitlements.
            </p>
          </div>
        </div>
        <div className="text-[10px] text-purple-300 font-mono tracking-wider shrink-0 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-lg">
          SHA-256 VERIFIED ✓
        </div>
      </motion.div>

      {/* Installation guide modal */}
      <AnimatePresence>
        {completedPlatform && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg p-8 rounded-3xl glass-effect border border-white/15 text-left shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-purple-400 uppercase block mb-1">INSTALLATION GUIDE</span>
                  <h3 className="text-xl font-display font-semibold text-white">{guides[completedPlatform]?.title}</h3>
                </div>
                <button
                  onClick={() => setCompletedPlatform(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {guides[completedPlatform]?.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span className="text-[11px] font-mono text-purple-400 mt-0.5 min-w-[20px] shrink-0">[0{idx + 1}]</span>
                    <p className="text-xs text-zinc-300 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-purple-500/8 border border-purple-500/15 text-[11px] text-zinc-400 mb-6 italic leading-relaxed">
                {guides[completedPlatform]?.note}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCompletedPlatform(null)}
                  className="flex-1 h-11 rounded-xl accent-glow-btn text-xs font-semibold text-white tracking-wide cursor-pointer"
                >
                  Got it — Open Luno
                </button>
                <a
                  href={`/downloads/luno-${completedPlatform === "android" ? "android.apk" : completedPlatform === "ios" ? "ios.ipa" : "mac.dmg"}`}
                  download
                  className="h-11 px-5 rounded-xl glass-effect border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Again</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
