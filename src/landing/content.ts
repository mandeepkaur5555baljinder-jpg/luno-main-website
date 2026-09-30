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

/**
 * MODES = how Luno thinks. Four manifestations of one core (scene 03, in this order).
 * Provider / model names never appear on the site: these are Luno modes.
 */
export const MODES = [
  {
    id: "auto",
    name: "Auto",
    line: "Adapts to the question.",
    body: "Luno reads the request and decides how much thinking it needs, so you never have to choose. Just ask.",
    feel: "Adaptive · routing",
  },
  {
    id: "pro",
    name: "Pro",
    line: "Advanced general intelligence.",
    body: "More capable and more thorough, for the demanding everyday work: writing, analysis, planning.",
    feel: "Dense · structured",
  },
  {
    id: "deep",
    name: "Deep",
    line: "Depth, in layers.",
    body: "Explores a problem from several angles before it answers. For hard reasoning and open-ended exploration.",
    feel: "Layered · exploratory",
  },
  {
    id: "code",
    name: "Code",
    line: "Built for engineering.",
    body: "Precise, structured help writing, reading and reasoning about code.",
    feel: "Precise · computational",
  },
] as const;

/**
 * CAPABILITIES = what Luno can do (scene 04). Each one is something the previous site already
 * claimed for the product; add nothing here that the app does not do.
 */
export const CAPABILITIES = [
  { id: "reasoning", name: "Reasoning", body: "Hard problems are worked through in steps you can follow." },
  { id: "search", name: "Search", body: "For anything time-sensitive, Luno looks it up instead of leaning on stale training data." },
  { id: "memory", name: "Memory", body: "Preferences and past context carry forward, private to your own account." },
  { id: "sync", name: "Sync", body: "Start on your phone, finish on your laptop. The thread is still there." },
  { id: "vision", name: "Vision", body: "Photos, screenshots and handwritten notes, read and turned into text you can use." },
  { id: "voice", name: "Voice", body: "Full back-and-forth speech, interruptions included." },
] as const;

export interface DemoScript {
  id: "chat" | "reasoning" | "code";
  /** the Luno mode this sample is shown in */
  mode: "Auto" | "Deep" | "Code";
  label: string;
  user: string;
  reply: string;
  code?: string;
}

export const DEMOS: DemoScript[] = [
  {
    id: "chat",
    mode: "Auto",
    label: "Auto",
    user: "Explain quantum superposition simply.",
    reply:
      "Like a coin spinning mid-air. It's both heads and tails at once, and it only “chooses” when it lands.",
  },
  {
    id: "reasoning",
    mode: "Deep",
    label: "Deep",
    user: "Is 221 prime? Show your work.",
    reply:
      "√221 ≈ 14.9, so I only need to test primes up to 13.\n2, 3, 5, 7 and 11 don't divide it.\n13 × 17 = 221.\n\nSo no: 221 is not prime.",
  },
  {
    id: "code",
    mode: "Code",
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
