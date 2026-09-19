import React from "react";
import { Mail, ExternalLink } from "lucide-react";

interface FooterProps {
  onScrollToDownload: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToDownload }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative pt-20 pb-10 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">

          {/* Brand */}
          <div className="md:col-span-5">
            <a href="#" className="flex items-center gap-2.5">
              <span className="w-3 h-3 moon-mark" aria-hidden="true" />
              <span className="font-display text-lg font-bold text-cream">Luno</span>
            </a>
            <p className="mt-5 text-sm text-cream/50 leading-relaxed max-w-sm">
              A personal AI assistant for chat, voice, vision, and code — designed
              and built by one person, not a product team.
            </p>
            <p className="mt-6 text-sm text-cream/50">
              Made by <span className="text-cream font-medium">Tanveer</span>
            </p>
          </div>

          {/* Get Luno */}
          <div className="md:col-span-3">
            <h5 className="text-sm font-semibold text-cream mb-4">Get Luno</h5>
            <div className="space-y-3 text-sm">
              <a href="https://app.lunoai.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-cream/60 hover:text-cream transition-colors">
                Open the web app <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button onClick={onScrollToDownload} className="block text-left text-cream/60 hover:text-cream transition-colors cursor-pointer">
                All platforms
              </button>
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h5 className="text-sm font-semibold text-cream mb-4">Questions</h5>
            <p className="text-sm text-cream/50 mb-4 leading-relaxed max-w-xs">
              Bug reports, feature ideas, or anything else — reach out directly.
            </p>
            <a href="mailto:tanveer@luno.ai" className="flex items-center gap-2.5 text-sm text-cream hover:text-amber-300 transition-colors">
              <Mail className="w-4 h-4" />
              tanveer@luno.ai
            </a>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-cream/40">
          <span>© {currentYear} Luno</span>
          <span>Built solo, one feature at a time.</span>
        </div>

      </div>
    </footer>
  );
};
