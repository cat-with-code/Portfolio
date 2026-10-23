/** "All projects" directory (Figma Projects / Directory drawer, Developer — Projects directory 1117:100133). */
export const directory = {
  eyebrow: "SELECTED WORK  /  FULL DIRECTORY",
  title: "All projects",
  summary: "My UI/UX and development projects, from design systems to interactive tools.",
  scrollLabel: "SCROLL TO EXPLORE",
};

export type DirectoryProject = {
  key: string;
  eyebrow: string;
  name: string;
  category: string;
  description: string;
  disciplines: string;
  cover: string;
  /** Path after the locale; null = not linked (no page for it yet) */
  href: string | null;
};

export const directoryProjects: DirectoryProject[] = [
  {
    key: "student-club",
    eyebrow: "01 / FEATURED",
    name: "Student Club",
    category: "Community platform",
    description: "A UI/UX concept for connecting students with groups and opportunities.",
    disciplines: "UI/UX  ·  EDUCATION",
    cover: "/images/projects/student-club.png",
    href: "/projects/student-club",
  },
  {
    key: "portfolio-design-system",
    eyebrow: "02 / FEATURED",
    name: "Portfolio Design System",
    category: "Design system",
    description: "My reusable tokens and components for consistent, responsive interfaces.",
    disciplines: "COMPONENTS  ·  TOKENS",
    cover: "/images/projects/portfolio-design-system.png",
    href: "/projects/portfolio-design-system",
  },
  {
    key: "personal-website",
    eyebrow: "03 / IN PROGRESS",
    name: "Personal Website",
    category: "Portfolio website",
    description: "My design and development work, writing, and ongoing explorations.",
    disciplines: "WEB  ·  PORTFOLIO",
    cover: "/images/projects/personal-website.png",
    href: "/projects/personal-website",
  },
  {
    key: "sdab-studio",
    eyebrow: "04 / CONCEPT",
    name: "Sdab Studio",
    category: "Creative studio",
    description: "Graphic and UI/UX design services for local businesses.",
    disciplines: "BRAND  ·  UI/UX",
    cover: "/images/projects/sdab-studio.png",
    href: null,
  },
  {
    key: "focus-studio",
    eyebrow: "05 / TRY IT HERE",
    name: "Focus Studio",
    category: "Study experience",
    description: "Focus timers and ambient sound, designed for calmer study.",
    disciplines: "PRODUCT  ·  FOCUS",
    cover: "/images/projects/focus-studio.png",
    href: "/study",
  },
  {
    key: "game-hub",
    eyebrow: "06 / TRY IT HERE",
    name: "Game Hub",
    category: "Interactive playground",
    description: "My playground for interface design, game logic, and interaction.",
    disciplines: "UX  ·  INTERACTION",
    cover: "/images/projects/game-hub.png",
    href: "/games",
  },
];

/** Projects page copy (Figma Desktop 694:22512 · Tablet 696:37956 · Mobile 696:44618). */
export const projectsPage = {
  heading: {
    title: "Projects",
    description: "Selected UI/UX and development work, with the thinking behind it.",
    action: "Explore all projects",
  },
  intro: {
    eyebrow: "SELECTED WORK   /   DESIGN + DEVELOPMENT",
    title: "Design thinking, put to work.",
    body: "UI/UX design, responsive websites, and the systems behind them.",
  },
  closing: "THREE SELECTED PROJECTS   /   OPEN THE DIRECTORY TO EXPLORE MORE  ↗",
  cta: "Explore project",
  tryIt: {
    eyebrow: "TRY IT YOURSELF",
    note: "Not case studies — small tools from this portfolio you can use right now.",
  },
  approach: {
    eyebrow: "01  /  DESIGN APPROACH",
    title: "From user needs to the final detail.",
    body: "I connect user needs, clear design decisions, and practical development.",
    steps: [
      { key: "discover", number: "01", title: "Discover", body: "Understand the people, context, and problem." },
      { key: "define", number: "02", title: "Define", body: "Define the key tasks, priorities, and constraints." },
      { key: "design", number: "03", title: "Design", body: "Shape user flows, prototype ideas, and design interfaces." },
      { key: "refine", number: "04", title: "Refine", body: "Review the experience and refine it with feedback." },
    ],
  },
  explorations: {
    eyebrow: "02  /  CURRENT EXPLORATIONS",
    title: "Where I explore design and code.",
    body: "I explore how layout, motion, and code can make everyday interactions clearer and more useful.",
    focus: ["Product design", "Interaction", "Creative coding"],
    workbench: {
      label: "ON THE WORKBENCH",
      title: "Always learning. Always building.",
      body: "I’m exploring responsive layouts, accessible interactions, and motion across my personal projects.",
      topics: [
        { key: "responsive", title: "Responsive design", body: "Layouts that adapt gracefully from phone to desktop." },
        { key: "themes", title: "Light & dark themes", body: "Token-driven themes that switch without losing contrast." },
        { key: "accessible", title: "Accessible interactions", body: "Clear focus states, readable contrast, and comfortable touch targets." },
      ],
    },
  },
} as const;

export type ProjectCard = {
  key: "student-club" | "portfolio-design-system" | "personal-website";
  meta: string;
  status: string;
  name: string;
  description: string;
  tags: string[];
};

/** Projects / Project card instances (856:47641 · 856:47682 · 856:47728). Each opens its project page. */
export const projectCards: ProjectCard[] = [
  {
    key: "student-club",
    meta: "01 · COMMUNITY",
    status: "Featured",
    name: "Student Club",
    description: "My UI/UX concept for helping students find clubs, study groups, and learning opportunities.",
    tags: ["UI/UX", "Community", "Education"],
  },
  {
    key: "portfolio-design-system",
    meta: "02 · DESIGN SYSTEM",
    status: "Featured",
    name: "Portfolio Design System",
    description: "The tokens, components, and responsive patterns behind this portfolio.",
    tags: ["Color", "Type", "Spacing", "Motion"],
  },
  {
    key: "personal-website",
    meta: "03 · PERSONAL WEBSITE",
    status: "In progress",
    name: "Personal Website",
    description: "My design work, writing, and experiments in one place, shaped around how I think and build.",
    tags: ["Portfolio", "Writing"],
  },
];
