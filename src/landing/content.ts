/**
 * All landing copy lives here. Every capability below is taken from what the
 * previous Luno site already claimed (chat, voice, vision, code, step-by-step
 * reasoning, search for time-sensitive answers, memory, cross-device sync).
 * Nothing here should promise more than the app at app.lunoai.in does.
 */

export const APP_URL = "https://app.lunoai.in";
export const CONTACT_EMAIL = "tanveer@luno.ai";

export const NAV_LINKS = [
  { label: "Product", href: "#answer" },
  { label: "Modes", href: "#modes" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Safety", href: "#privacy" },
] as const;

/** The five ways into Luno (scene 04). Order matches the five particle clusters. */
export const MODES = [
  {
    id: "chat",
    name: "Chat",
    line: "Conversations that hold together.",
    body: "Ask follow-ups, change direction, come back to something from earlier. Luno keeps up without you repeating yourself.",
  },
  {
    id: "voice",
    name: "Voice",
    line: "A voice you can actually talk to.",
    body: "Full back-and-forth speech, interruptions included. Say what you mean and Luno answers out loud.",
  },
  {
    id: "vision",
    name: "Vision",
    line: "Reads what you show it.",
    body: "Whiteboards, screenshots, handwritten notes. Point a camera at it and ask what's going on.",
  },
  {
    id: "code",
    name: "Code",
    line: "Writes and explains real code.",
    body: "TypeScript, Python, Rust, Go. Ask for a function or a whole approach and get working code back.",
  },
  {
    id: "reasoning",
    name: "Reasoning",
    line: "Slows down for hard questions.",
    body: "Math, proofs and multi-step problems are worked through step by step instead of guessed at.",
  },
] as const;

/** The four streams (scene 05). */
export const STREAMS = [
  {
    id: "reason",
    name: "Reasoning",
    body: "Hard problems are worked through in steps you can follow.",
  },
  {
    id: "search",
    name: "Search",
    body: "For anything time-sensitive, Luno looks it up instead of leaning on stale training data.",
  },
  {
    id: "memory",
    name: "Memory",
    body: "Preferences and past context carry forward, so you aren't re-explaining yourself every session.",
  },
  {
    id: "sync",
    name: "Sync",
    body: "Start on your phone, finish on your laptop. The thread is still there.",
  },
] as const;

export interface DemoScript {
  id: "chat" | "reasoning" | "code";
  label: string;
  user: string;
  reply: string;
  code?: string;
}

export const DEMOS: DemoScript[] = [
  {
    id: "chat",
    label: "Chat",
    user: "Explain quantum superposition simply.",
    reply:
      "Like a coin spinning mid-air. It's both heads and tails at once, and it only “chooses” when it lands.",
  },
  {
    id: "reasoning",
    label: "Reasoning",
    user: "Is 221 prime? Show your work.",
    reply:
      "√221 ≈ 14.9, so I only need to test primes up to 13.\n2, 3, 5, 7 and 11 don't divide it.\n13 × 17 = 221.\n\nSo no: 221 is not prime.",
  },
  {
    id: "code",
    label: "Code",
    user: "A React hook that syncs a value to localStorage across tabs?",
    reply: "Here's a small typed version. The storage event keeps other tabs in step:",
    code: `export function useLocalSync<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) setValue(JSON.parse(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  return [value, setValue] as const;
}`,
  },
];

export const PLATFORMS = [
  {
    id: "web",
    name: "Web",
    status: "live" as const,
    line: "Open it in any browser, no install needed.",
  },
  {
    id: "ios",
    name: "iPhone & iPad",
    status: "live" as const,
    line: "Add it to your home screen and it opens like a native app.",
    steps: [
      "Open app.lunoai.in in Safari.",
      "Tap the Share icon, then “Add to Home Screen.”",
      "Name it Luno and tap Add.",
    ],
  },
  { id: "android", name: "Android", status: "soon" as const, line: "A native app is in the works." },
  { id: "mac", name: "macOS", status: "soon" as const, line: "A native app is in the works." },
];
