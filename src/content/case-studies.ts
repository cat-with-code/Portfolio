import type { ProjectCard } from "./projects";

/** Projects / Case study copy (Figma component set 1108:92445 · screens 1108:92447 · 1108:93108 · 1108:93779). */
export type CaseStudy = {
  key: ProjectCard["key"];
  issue: string;
  eyebrow: string;
  title: string;
  status: { label: string; tone: "success" | "brand" };
  summary: string;
  credits: { label: string; value: string }[];
  overview: { title: string; lead: string };
  challenge: { title: string; body: string; goal: string };
  work: { title: string; items: { title: string; body: string }[] };
  outcome: { title: string; statement: string };
};

export const caseStudyCopy = {
  back: "←   ALL PROJECTS",
  sections: ["01  /  OVERVIEW", "02  /  THE CHALLENGE", "03  /  WHAT I DID", "04  /  OUTCOME"],
  goal: "THE GOAL",
  next: "NEXT PROJECT",
  reader: { idleMeta: "Audio summary", playing: "Listening to summary", play: "Listen to this case study", pause: "Pause" },
};

export const caseStudies: CaseStudy[] = [
  {
    key: "student-club",
    issue: "CASE STUDY  ·  01 / 03",
    eyebrow: "COMMUNITY  ·  01",
    title: "Student Club",
    status: { label: "★  FEATURED", tone: "success" },
    summary: "My UI/UX concept for helping students find clubs, study groups, and learning opportunities.",
    credits: [
      { label: "ROLE", value: "Product designer & front-end developer" },
      { label: "PLATFORM", value: "Responsive web" },
      { label: "TOOLS", value: "Figma, TypeScript" },
      { label: "STATUS", value: "Working product" },
    ],
    overview: {
      title: "What it is",
      lead: "Student Club brings clubs, study groups, sessions, and questions together in one place, so students can find people to learn with and keep track of their progress.",
    },
    challenge: {
      title: "Why it matters",
      body: "Student resources are scattered across chat groups, social pages, and spreadsheets. It is hard to discover active groups or know when people are meeting.",
      goal: "“Design a calm, mobile-first space where students can join groups, follow sessions, ask questions, and stay focused.”",
    },
    work: {
      title: "From idea to product",
      items: [
        { title: "Mapped the core journeys", body: "Joining a group, attending a session, and asking a question." },
        { title: "Designed the full Figma file", body: "Then built more than 100 responsive pages from it." },
        { title: "Added a focus timer", body: "With a history log and goals that update as you study." },
        { title: "Light, dark, and system themes", body: "Set once in Settings → Appearance." },
      ],
    },
    outcome: {
      title: "Where it landed",
      statement: "A working product covering groups, sessions, questions, subjects, community, and settings — checked at phone, tablet, and desktop widths.",
    },
  },
  {
    key: "portfolio-design-system",
    issue: "CASE STUDY  ·  02 / 03",
    eyebrow: "DESIGN SYSTEM  ·  02",
    title: "Portfolio Design System",
    status: { label: "★  FEATURED", tone: "success" },
    summary: "The tokens, components, and responsive patterns behind this portfolio.",
    credits: [
      { label: "ROLE", value: "Designer" },
      { label: "SCOPE", value: "Tokens, components, patterns" },
      { label: "TOOLS", value: "Figma variables & components" },
      { label: "STATUS", value: "Working product" },
    ],
    overview: {
      title: "What it is",
      lead: "The foundation behind this portfolio: semantic color, type, spacing, and motion tokens, plus the components every page is built from.",
    },
    challenge: {
      title: "Why it matters",
      body: "As pages grew, one-off colors and spacing crept in. Keeping light and dark themes, three screen sizes, and several languages consistent by hand was not sustainable.",
      goal: "“One source of truth, so every page shares the same look in light and dark, on desktop, tablet, and mobile.”",
    },
    work: {
      title: "Building the foundations",
      items: [
        { title: "Semantic color tokens", body: "Light and dark modes that every surface, text, and border uses." },
        { title: "Responsive variables", body: "One set of values that switches layouts for desktop, tablet, and mobile." },
        { title: "Type and language", body: "Shared text styles and an interface language set for English, Khmer, and Chinese." },
        { title: "Reusable components", body: "Cards, chips, buttons, and drawers with clear states — including disabled." },
      ],
    },
    outcome: {
      title: "Where it landed",
      statement: "Every page now draws from the same tokens, so a theme or layout change updates the whole portfolio at once.",
    },
  },
  {
    key: "personal-website",
    issue: "CASE STUDY  ·  03 / 03",
    eyebrow: "PERSONAL WEBSITE  ·  03",
    title: "Personal Website",
    status: { label: "●  IN PROGRESS", tone: "brand" },
    summary: "My design work, writing, and experiments in one place, shaped around how I think and build.",
    credits: [
      { label: "ROLE", value: "Designer & developer" },
      { label: "PLATFORM", value: "Responsive website" },
      { label: "TOOLS", value: "Figma" },
      { label: "STATUS", value: "In progress" },
    ],
    overview: {
      title: "What it is",
      lead: "A single home for my projects, writing, study tools, and small experiments — designed to feel personal rather than like a résumé.",
    },
    challenge: {
      title: "Why it matters",
      body: "My work was spread across files, social posts, and notes, with no single place that showed how I think and what I am learning.",
      goal: "“A calm, easy-to-browse site where visitors can see selected work, read my notebook, and try small tools I have built.”",
    },
    work: {
      title: "Shaping the experience",
      items: [
        { title: "Planned the structure", body: "Developer, Projects, Blog, Study, Games, and Contact." },
        { title: "Designed the navigation", body: "A collapsible sidebar and drawers keep content one click away." },
        { title: "Built interactive pieces", body: "Focus Studio, Game Hub, and a blog topic filter." },
        { title: "Prototyped every page", body: "For desktop, tablet, and mobile, in light and dark mode." },
      ],
    },
    outcome: {
      title: "Where it landed",
      statement: "The full prototype is in place. Next: building it in code and adding more case studies.",
    },
  },
];
