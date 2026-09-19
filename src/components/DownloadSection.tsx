import React, { useState } from "react";
import { Smartphone, Apple, Monitor, ExternalLink, ChevronDown } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: "live" | "soon";
  tagline: string;
  steps?: string[];
}

const PLATFORMS: Platform[] = [
  {
    id: "web",
    name: "Web",
    icon: <Monitor className="w-6 h-6" />,
    status: "live",
    tagline: "Open it in any browser, no install needed.",
  },
  {
    id: "ios",
    name: "iPhone & iPad",
    icon: <Apple className="w-6 h-6" />,
    status: "live",
    tagline: "Add it to your home screen and it opens like a native app.",
    steps: [
      "Open app.lunoai.in in Safari.",
      "Tap the Share icon, then “Add to Home Screen.”",
      "Name it Luno and tap Add.",
    ],
  },
  {
    id: "android",
    name: "Android",
    icon: <Smartphone className="w-6 h-6" />,
    status: "soon",
    tagline: "A native app is in the works.",
  },
  {
    id: "mac",
    name: "macOS",
    icon: <Apple className="w-6 h-6" />,
    status: "soon",
    tagline: "A native app is in the works.",
  },
];

export const DownloadSection: React.FC = () => {
  const [openSteps, setOpenSteps] = useState<string | null>(null);

  return (
    <section id="download" className="relative py-24 sm:py-32 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">

        <div className="max-w-xl mb-14">
          <h2 className="font-display font-bold text-4xl sm:text-5xl leading-[1.05] text-cream">
            Get Luno on your device.
          </h2>
          <p className="mt-5 text-cream/55 leading-relaxed">
            One assistant, wherever you need it. Here's what's ready today and
            what's still on the way.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLATFORMS.map((p) => {
            const isOpen = openSteps === p.id;
            return (
              <div key={p.id} className="card-glow rounded-2xl p-6 flex flex-col">
                <div className="w-12 h-12 rounded-full glass-lite flex items-center justify-center mb-5 text-cream">
                  {p.icon}
                </div>
                <h3 className="font-display font-semibold text-lg text-cream mb-1.5">{p.name}</h3>
                <span className={`chip text-xs mb-4 px-2.5 py-1 ${p.status === "live" ? "chip--live" : "opacity-60"}`}>
                  {p.status === "live" ? "Available now" : "Coming soon"}
                </span>
                <p className="text-sm text-cream/55 leading-relaxed mb-5 flex-1">{p.tagline}</p>

                {p.id === "web" && (
                  <a href="https://app.lunoai.in" target="_blank" rel="noopener noreferrer" className="btn btn-solid h-11 text-sm w-full">
                    Open Luno <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {p.steps && (
                  <div>
                    <button
                      onClick={() => setOpenSteps(isOpen ? null : p.id)}
                      className="btn btn-outline h-11 text-sm w-full"
                    >
                      {isOpen ? "Hide steps" : "How to add it"}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <ol className="mt-4 space-y-2.5 text-sm text-cream/65">
                        {p.steps.map((s, i) => (
                          <li key={i} className="flex gap-2.5">
                            <span className="font-display font-semibold text-amber-300 shrink-0">{i + 1}.</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}

                {p.status === "soon" && !p.steps && (
                  <button disabled className="btn btn-outline h-11 text-sm w-full">
                    Coming soon
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
