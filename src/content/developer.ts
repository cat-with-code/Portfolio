/**
 * Developer page copy — taken from the Desktop Developer screen (Figma 694:23284).
 * English only for now: the Figma file has no Khmer version of page content.
 */
export type FeaturedProject = {
  key: "student-club" | "portfolio-design-system" | "personal-website" | "game-hub" | "focus-studio";
  eyebrow: string;
  status: string;
  name: string;
  pitch: string;
  description?: string;
  tags: string[];
  cta: string;
  /** Path after the locale */
  href: string;
  footer: string;
};

export const developer = {
  heading: {
    title: "Developer",
    description: "UI/UX design and development, from idea to interaction.",
    action: "About my approach",
    actionShort: "My approach",
  },
  intro: {
    eyebrow: "DESIGN × DEVELOPMENT",
    title: ["Hi, I’m Dareach.", "UI/UX designer & developer."],
    body: ["I design clear interfaces and build responsive web experiences.", "Explore my projects, process, and experiments."],
    badge: "Design. Prototype. Build.",
  },
  skills: [
    { key: "interface", title: "UI/UX design", description: "I shape clear user flows, readable layouts, and interfaces that feel easy to use." },
    { key: "development", title: "Web development", description: "I bring designs to the web with responsive layouts, reusable components, and purposeful interactions." },
    { key: "systems", title: "Design systems", description: "I connect color, type, spacing, and components to keep design and code consistent." },
    { key: "prototyping", title: "Prototyping", description: "I prototype flows, states, and feedback to explore an experience before it is built." },
  ],
  featured: [
    {
      key: "student-club",
      eyebrow: "FEATURED PROJECT  /  01",
      status: "CASE STUDY",
      name: "Student Club",
      pitch: "Helping students connect and learn.",
      description: "My UI/UX concept for helping students find clubs, join study groups, and discover opportunities.",
      tags: ["UI/UX", "Community", "Education"],
      cta: "VIEW PROJECT  ↗",
      href: "/projects/student-club",
      footer: "DESIGN  ·  DEVELOPMENT  ·  PRODUCT THINKING",
    },
    {
      key: "portfolio-design-system",
      eyebrow: "FEATURED PROJECT  /  02",
      status: "DESIGN SYSTEM",
      name: "Portfolio Design System",
      pitch: "The tokens, components, and responsive patterns behind this portfolio.",
      tags: ["Color", "Type", "Spacing"],
      cta: "EXPLORE  ↗",
      href: "/projects/portfolio-design-system",
      footer: "COLOR  ·  TYPE  ·  SPACING  ·  MOTION",
    },
    {
      key: "personal-website",
      eyebrow: "PROJECT  /  03",
      status: "IN PROGRESS",
      name: "Personal Website",
      pitch: "My work, my process, and what comes next.",
      description: "My design work, writing, and experiments in one place, shaped around how I think and build.",
      tags: ["Projects", "Writing", "Experiments"],
      cta: "EXPLORE PORTFOLIO  ↗",
      href: "/projects/personal-website",
      footer: "PERSONAL WEBSITE  ·  IN PROGRESS",
    },
    {
      key: "game-hub",
      eyebrow: "PROJECT  /  04",
      status: "16 GAMES",
      name: "Game Hub",
      pitch: "Playful interfaces and coding experiments for a short break.",
      tags: ["Chess", "Puzzles", "Arcade"],
      cta: "PLAY GAMES  ↗",
      href: "/games",
      footer: "THE PLAYGROUND  ·  16 GAMES",
    },
    {
      key: "focus-studio",
      eyebrow: "PROJECT  /  05",
      status: "SAMPLE CONCEPT",
      name: "Focus Studio",
      pitch: "Focus timers and ambient sound, designed for calmer study.",
      tags: ["Timer", "Music", "Books"],
      cta: "OPEN STUDY  ↗",
      href: "/study",
      footer: "STUDY  ·  SAMPLE CONCEPT",
    },
  ] satisfies FeaturedProject[],
  exploreWork: "EXPLORE THE WORK  ↗",
  tryIt: [
    {
      key: "focus",
      eyebrow: "FOCUS TIME",
      title: "Try Focus Studio",
      description: "Focus timers and ambient sound, designed for calmer study.",
      action: "Start focusing",
      href: "/study",
    },
    {
      key: "games",
      eyebrow: "TAKE A BREAK",
      title: "Play in the Game Hub",
      description: "Playful interfaces and coding experiments for a short break.",
      action: "Play games",
      href: "/games",
    },
  ],
  tryItChip: "TRY IT",
  aiLab: {
    eyebrow: "EXPERIMENT / CONVERSATIONAL UI",
    title: "Exploring AI through interface design.",
    chip: "AI UI PROTOTYPE",
    assistant: { name: "Sdabby", tagline: "Your business chat assistant", label: "SDABBY", tryLabel: "Try Sdabby" },
    greeting: "Hi! I can answer customer questions, share pricing, and help book appointments.",
    conversation: {
      question: "What are your opening hours this weekend?",
      reply: "We’re open Saturday 9:00–18:00 and Sunday 10:00–16:00. Want me to book a time for you?",
    },
    chips: [
      { label: "Check pricing", question: "How much is the starter plan?", reply: "The Starter plan is $49 a month for up to 3 users. Want me to compare it with Pro?" },
      { label: "Book an appointment", question: "Can I book an appointment?", reply: "Sure! Tomorrow at 10:00 or 14:30 is free. Which time works for you?" },
      { label: "Track my order", question: "Where is my order?", reply: "Order #1024 has shipped and should arrive on Friday. I’ll email you tracking updates." },
    ],
    composerPlaceholder: "Message Sdabby…",
    prompts: {
      eyebrow: "ASK SDABBY  /  01",
      heading: "Not sure what to ask?",
      intro: "Tap a starter and Sdabby will reply in the chat.",
      starters: [
        { icon: "zoom", category: "Customer support", label: "Answer a customer question.", question: "A customer asked about refunds. How should I reply?", reply: "Thank them, confirm the 14-day refund window, and offer to start the refund for them." },
        { icon: "sparkles", category: "Sales", label: "Recommend the right plan.", question: "Which plan should I recommend?", reply: "For a small team, Starter fits best. If they need more users and reports, suggest Pro." },
        { icon: "pencil", category: "Bookings", label: "Schedule an appointment.", question: "Can you schedule an appointment for me?", reply: "Happy to! Tomorrow at 10:00 or 14:30 is open. Shall I confirm one?" },
      ],
    },
    workflow: {
      eyebrow: "HUMAN × AI  /  02",
      heading: "You lead. AI helps.",
      intro: "An idea accelerator, not a replacement for judgment.",
      steps: [
        { title: "Ask", text: "Start with your own question or rough idea." },
        { title: "Explore", text: "Use AI to widen the options and spot the gaps." },
        { title: "Refine", text: "You choose, edit, and decide what ships." },
      ],
      footnote: "YOUR IDEAS REMAIN THE STARTING POINT  ↗",
    },
  },
  approach: {
    title: "Behind the work",
    headline: "From user needs to working interfaces.",
    intro: "How I connect user needs, interface design, and development.",
    skills: [
      { icon: "monitor", title: "UI/UX design", text: "I shape clear user flows, readable layouts, and interfaces that feel easy to use." },
      { icon: "code", title: "Web development", text: "I bring designs to the web with responsive layouts, reusable components, and purposeful interactions." },
      { icon: "grid", title: "Design systems", text: "I connect color, type, spacing, and components to keep design and code consistent." },
      { icon: "play", title: "Prototyping", text: "I prototype flows, states, and feedback to explore an experience before it is built." },
    ],
    processTitle: "From idea to interaction",
    steps: [
      { title: "Understand", text: "Understand who it is for and what they need to do." },
      { title: "Explore", text: "Explore flows and layouts before refining the visual details." },
      { title: "Build and refine", text: "Build, check different screen sizes, and refine the interactions." },
    ],
  },
} as const;

/** Sdabby's public link. The Figma "Try Sdabby" button has no URL yet — set it here when ready. */
export const sdabbyUrl: string | null = null;
