import React from "react";
import { Shield, EyeOff, Zap, Heart, Mail } from "lucide-react";

interface FooterProps {
  onScrollToDownload: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToDownload }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full border-t border-white/6 bg-gradient-to-b from-transparent to-black/60 backdrop-blur-sm z-20 pt-20 pb-12 mt-16">

      {/* TRUST BANNER */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 px-8 rounded-3xl glass-effect border border-white/8 relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Card 1 — Privacy */}
          <div className="flex flex-col items-start text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-sm font-semibold text-white tracking-tight uppercase font-display">Private by design</h4>
            <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
              Luno implements fully sandboxed local sessions. Your search data and queries are strictly ephemeral and self-contained.
            </p>
          </div>

          {/* Card 2 — No tracking */}
          <div className="flex flex-col items-start text-left">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
              <EyeOff className="w-5 h-5 text-violet-400" />
            </div>
            <h4 className="text-sm font-semibold text-white tracking-tight uppercase font-display">Your conversations stay yours</h4>
            <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
              No tracking, telemetry, or diagnostic harvesting. Your context logs are never sold or used for training models.
            </p>
          </div>

          {/* Card 3 — Performance */}
          <div className="flex flex-col items-start text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-sm font-semibold text-white tracking-tight uppercase font-display">Built for fast everyday use</h4>
            <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
              No bloated web dependencies or long load times. Luno runs as an offline-friendly native client for seamless assist cycles.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER COLUMNS */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-20 grid grid-cols-1 md:grid-cols-12 gap-12 text-left">

        {/* Brand column */}
        <div className="md:col-span-5 flex flex-col items-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="/favicon.svg" alt="Luno AI Logo" className="w-8 h-8 rounded-lg shadow-md border border-white/10" />
              <div className="absolute inset-0 rounded-lg bg-purple-500/20 blur-sm -z-10" />
            </div>
            <span className="text-base font-display font-bold text-white">Luno AI</span>
          </div>
          <p className="text-xs text-zinc-500 mt-4 leading-relaxed max-w-sm">
            A premium, cinematic personal assistant app engineered to bring fast reasoning, audio duplexing, and visual OCR capabilities safely to client devices.
          </p>
          <div className="flex items-center gap-2 mt-6 text-zinc-400 text-xs">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>Made with care by <span className="text-white font-medium">Tanveer</span></span>
          </div>
        </div>

        {/* Downloads column */}
        <div className="md:col-span-3 flex flex-col items-start">
          <h5 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-4">Available Binaries</h5>
          <div className="space-y-3 text-[12px] font-sans">
            {[
              { href: "/downloads/luno-android.apk", label: "Android Package (APK)" },
              { href: "/downloads/luno-ios.ipa", label: "iOS IPA Package" },
              { href: "/downloads/luno-mac.dmg", label: "Mac Apple Silicon (DMG)" },
            ].map(({ href, label }) => (
              <a key={href} href={href} className="text-zinc-400 hover:text-purple-300 transition-colors duration-200 block">
                {label}
              </a>
            ))}
            <button
              onClick={onScrollToDownload}
              className="text-zinc-600 cursor-pointer hover:text-purple-300 text-left transition-colors duration-200 block"
            >
              Windows Desktop (Coming Soon)
            </button>
          </div>
        </div>

        {/* Contact column */}
        <div className="md:col-span-4 flex flex-col items-start">
          <h5 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-4">Contact & Support</h5>
          <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
            Have questions about installation, local vector database compiling, or sideload authorizations? Reach out safely.
          </p>
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <Mail className="w-4 h-4 text-violet-400" />
            <span className="font-mono">tanveer@luno.ai</span>
          </div>
        </div>

      </div>

      {/* Subfooter */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-20 mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-zinc-600">
        <span>© {currentYear} Luno AI. All rights reserved.</span>
        <div className="flex gap-4">
          <span className="hover:text-zinc-400 transition-colors cursor-pointer">Privacy Charter</span>
          <span>·</span>
          <span className="hover:text-zinc-400 transition-colors cursor-pointer">EULA Terms</span>
        </div>
      </div>

    </footer>
  );
};
