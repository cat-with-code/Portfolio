/**
 * Study — Focus Studio copy (Figma Desktop 694:14994 · Tablet 696:33340 · Mobile 696:40002).
 * The timer, plan, intention and music all work for real; track names are the generated
 * soundscapes' names (src/lib/focus-audio.ts), not recordings.
 */

export const welcome = {
  eyebrow: "✦  MY FOCUS SPACE / STUDY & PRACTICE",
  title: "A space to learn and build.",
  body: "A focus space I designed for reading, practice, and steady progress.",
  favorites: "Favorite books",
};

export type Technique = "pomodoro" | "deep" | "flow";
export type Stage = "ready" | "running" | "soon" | "break";

export const techniques: Record<Technique, { name: string; detail: string; ratio: string; focus: number; rest: number }> = {
  pomodoro: { name: "Pomodoro", detail: "25 min focus  ·  5 min break", ratio: "25 / 5", focus: 25, rest: 5 },
  deep: { name: "Deep Focus", detail: "50 min focus  ·  10 min break", ratio: "50 / 10", focus: 50, rest: 10 },
  flow: { name: "Flowtime", detail: "Study freely, break when needed", ratio: "Flexible", focus: 0, rest: 0 },
};

/** Study / Focus clock (316:6513) — copy per technique and stage. */
export const clockCopy = {
  eyebrow: "✦  YOUR FOCUS LAB",
  rounds: 4,
  status: {
    ready: { pomodoro: "ROUND {r}  /  04", deep: "ONE DEEP SESSION", flow: "FLEXIBLE SESSION" },
    running: { pomodoro: "●  IN SESSION", deep: "●  IN SESSION", flow: "●  IN FLOW" },
    soon: "BREAK SOON",
    break: "NICE WORK",
  },
  caption: {
    ready: { pomodoro: ["FOCUS TIME", "Ready when you are"], deep: ["DEEP WORK", "Protect your attention"], flow: ["FLOW MODE", "Find your own flow"] },
    running: { pomodoro: ["FOCUS ACTIVE", "Stay with one thing"], deep: ["FOCUS ACTIVE", "Stay with one thing"], flow: ["FLOWING", "Stop when focus fades"] },
    soon: ["ALMOST THERE", "Finish your thought"],
    break: { pomodoro: ["BREAK TIME", "Breathe, stretch, reset"], deep: ["BREAK TIME", "Breathe, stretch, reset"], flow: ["BREAK TIME", "Rest about a fifth of your focus"] },
  },
  heading: { focus: ["Choose your rhythm", "Stay consistent, not perfect."], break: ["A mindful little break", "A short pause helps you learn better."] },
  breakIdeas: [
    { name: "Rest your eyes", detail: "Look away from your screen", ratio: "20 sec" },
    { name: "Move a little", detail: "Stretch and loosen your shoulders", ratio: "2 min" },
    { name: "Recharge", detail: "Take a sip of water and breathe", ratio: "Anytime" },
  ],
  tip: {
    ready: { pomodoro: "STUDY TIP  ·  After each round, practice active recall", deep: "50 MIN FOCUS  ·  10 MIN BREAK  ·  ONE TASK ONLY", flow: "NO SET LENGTH  ·  TAKE A BREAK WHEN YOU NEED ONE" },
    running: { pomodoro: "FOCUS MODE  ·  We’ll let you know when a break is near", deep: "FOCUS MODE  ·  We’ll let you know when a break is near", flow: "FLOW MODE  ·  Take a break whenever your focus fades" },
    soon: "1 MIN LEFT  ·  Get ready for your well-earned break",
    break: "FOCUS COMPLETE  ·  Relax your eyes and move a little",
  },
  actions: {
    start: { pomodoro: "Start focus  ·  25 min", deep: "Start focus  ·  50 min", flow: "Start flow session" },
    pause: "Take a break",
    breakNow: "Start break now",
    keep: "Keep focusing",
    next: "Start next round",
    end: "End session",
  },
};

export type Vibe = "lofi" | "neo" | "ambient" | "rain" | "piano";
export const vibes: { key: Vibe; label: string; title: string }[] = [
  { key: "lofi", label: "Lofi", title: "Lofi melodies" },
  { key: "neo", label: "Neo", title: "Neo melodies" },
  { key: "ambient", label: "Ambient", title: "Ambient melodies" },
  { key: "rain", label: "Rain", title: "Rain melodies" },
  { key: "piano", label: "Piano", title: "Piano melodies" },
];

/** Eight soundscapes per vibe (names + lengths from Audio / Track library 523:11967). */
export const tracks: Record<Vibe, [string, string][]> = {
  lofi: [["Window-seat sketches", "3:42"], ["Coffee & margins", "4:12"], ["Late library lights", "3:18"], ["Sunday notebook", "4:06"], ["Soft-focus city", "2:58"], ["Quiet little loops", "3:36"], ["Pencil on paper", "4:24"], ["Last train home", "3:54"]],
  neo: [["Afterglow notes", "4:18"], ["Velvet afternoon", "3:52"], ["Golden-hour keys", "4:06"], ["Pocket of sunshine", "3:28"], ["Midnight postcards", "4:32"], ["Slow-motion soul", "3:44"], ["Warm vinyl", "4:10"], ["Blue-room session", "3:56"]],
  ambient: [["Slow horizons", "6:00"], ["Floating rooms", "7:20"], ["A softer sky", "5:40"], ["Between the clouds", "8:10"], ["Still water", "6:30"], ["Weightless morning", "7:00"], ["Long exhale", "5:50"], ["Open space", "8:00"]],
  rain: [["Rain on the window", "10:00"], ["Cabin rainfall", "12:00"], ["City after rain", "8:00"], ["Gentle roof drops", "10:30"], ["Forest shower", "15:00"], ["Distant thunder", "11:00"], ["Quiet monsoon", "14:00"], ["Rain at dawn", "9:30"]],
  piano: [["Letters at dawn", "3:56"], ["A quiet room", "4:20"], ["Paper lanterns", "3:40"], ["First light", "4:08"], ["Small beginnings", "3:12"], ["Pages turning", "4:36"], ["Evening reflections", "3:48"], ["Home again", "4:02"]],
};

export const audioCopy = {
  nowPlaying: "NOW PLAYING",
  soundStyle: "SOUND STYLE",
  custom: "Custom",
  collection: "focus collection",
  library: { title: "Your focus library", body: "Choose a vibe. Find your next soundtrack.", select: "Select", playing: "Playing" },
  picker: { eyebrow: "SOUND STYLE", caption: "8 tracks · pick one to start", hint: "Press and hold a style to pick a track" },
  sleep: { title: "Stop music after", custom: "Custom timer", options: [0, 15, 25, 50, 90], off: "Off", minutes: "minutes", set: "Set timer" },
  customLists: {
    count: "Custom · Your playlists",
    emptyTitle: "No playlists yet",
    emptyHint: "Create a playlist, name it, and add songs from links.",
    newPlaylist: "New playlist",
    nameLabel: "Playlist name",
    namePlaceholder: "Give it a name, like “Late-night focus”",
    cancel: "Cancel",
    create: "Create playlist",
    back: "All playlists",
    noSongs: "No songs yet",
    linkPlaceholder: "Paste a YouTube or SoundCloud link",
    add: "Add",
    linkHint: "Works with YouTube, SoundCloud and Spotify links.",
    songsEmptyHint: "Paste a link above to add your first song.",
    open: "Open",
  },
};

export const daytimeCopy = {
  eyebrow: "◉  YOUR LOCAL TIME",
  location: "PHNOM PENH  ·  GMT+7",
  weather: "WEATHER NOW",
  live: "LIVE  ·  OPEN-METEO",
  offline: "WEATHER UNAVAILABLE",
  greetings: { morning: "Good morning ☀", afternoon: "Good afternoon ☀", evening: "Good evening ☾", night: "Good night ☾" },
  rhythm: {
    eyebrow: "YOUR DAY AT A GLANCE",
    parts: [
      { key: "morning", label: "Morning", range: "06:00–12:00", headline: "A fresh start to focus.", note: "The day is yours to shape." },
      { key: "afternoon", label: "Afternoon", range: "12:00–18:00", headline: "Keep a steady pace.", note: "A short walk can reset your focus." },
      { key: "evening", label: "Evening", range: "18:00–24:00", headline: "Wind down with intention.", note: "Review what you learned today." },
    ],
    night: { range: "00:00–06:00", headline: "Rest is part of the work.", note: "Sleep helps you remember what you studied." },
    support: "Build steady moments across your day.",
  },
  window: {
    eyebrow: "A GENTLE NEXT STEP",
    title: "Up next",
    suffix: "SUGGESTED",
    pomodoro: "25 MIN POMODORO",
    tip: "Then take a 5-min break.",
    steps: [
      { title: "Focus", meta: "25 min · now" },
      { title: "Short break", meta: "5 min" },
      { title: "Next focus", meta: "25 min" },
    ],
    stats: [
      { label: "SESSIONS", value: "4" },
      { label: "FOCUS", value: "1h 40m" },
      { label: "BREAKS", value: "3" },
    ],
  },
};

export const intentionCopy = {
  chip: "MOMENT OF CLARITY",
  title: "What are you learning?",
  helper: "One clear target is all you need.",
  focusLabel: "CURRENT FOCUS",
  planLabel: "YOUR PLAN",
  planPlaceholder: "Write your plan: what you will learn, for how long, and what done looks like.",
  quickStart: "QUICK START",
  quick: ["Design systems", "React & Next.js", "UX writing"],
  defaultFocus: "Design systems",
  cancel: "Cancel",
  save: "Save plan",
  edit: "Edit your focus",
  footnote: "Your best work begins with one small step.",
};

export const planCopy = {
  title: "Today’s study plan",
  subtitle: "Three small steps. One meaningful session.",
  done: (n: number, total: number) => `${n} / ${total} DONE`,
  add: "Add task",
  placeholder: "Choose one thing to work on",
  remove: "Remove task",
  defaults: ["Read a chapter or revisit your notes", "Practice one challenging idea", "Capture three things you learned"],
};

export const goalCopy = { eyebrow: "FOCUS TARGET", footer: "One session to get into flow." };
export const reminderCopy = { eyebrow: "A GENTLE REMINDER", title: "Progress is a practice.", body: "Breathe. Stretch. Come back curious.", tag: "✦  You’ve got this." };

/** ⚠️ SAMPLE CONTENT — reading progress shown on "Recently read" (replace with real progress before launch). */
export const recentlyRead = {
  title: "Recently read",
  description: "Pick up where you left off, or rediscover an idea worth keeping.",
  library: "View book library  ↗",
  libraryMobile: "View book library",
  inProgress: "●  IN PROGRESS",
  progress: "Reading progress",
  books: [
    { key: "atomic-habits", topic: "Personal growth", progress: 68 },
    { key: "deep-work", topic: "Focus & productivity", progress: 42 },
    { key: "make-it-stick", topic: "Learning", progress: 42 },
  ],
};
