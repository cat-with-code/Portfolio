/** Developer profile drawer copy (Figma 1143:108023 · 837:61011 · 837:46052). */
export const profile = {
  eyebrow: "DEVELOPER PROFILE",
  name: "Hoeurn Dareach",
  role: "DESIGN × DEVELOPMENT",
  availability: "Open to new projects",
  location: "Phnom Penh · GMT+7",
  aboutLabel: "ABOUT",
  about:
    "I’m Dareach, a UI/UX designer and developer. I design clear interfaces, build responsive websites, and explore ideas through hands-on projects.",
  skillsLabel: "WHAT I DO",
  skills: ["UI/UX design", "Development", "Design systems", "Prototyping"],
  contactLabel: "CONTACT",
  socialLabel: "SOCIAL",
  contactMe: "Contact me",
  myApproach: "My approach",
};

/**
 * Real links. The Figma file names the platforms but has no addresses or handles — fill these in;
 * a row or button without a link is shown but not clickable.
 */
export const profileLinks: {
  email: string | null;
  telegram: string | null;
  github: string | null;
  instagram: string | null;
  facebook: string | null;
  x: string | null;
} = {
  email: "catwithcode.dev@gmail.com",
  telegram: "https://t.me/mrr_reach",
  github: "https://github.com/cat-with-code",
  instagram: null,
  facebook: null,
  x: null,
};

export const contactRows = [
  { key: "email", title: "Email", detail: "Send me a message" },
  { key: "telegram", title: "Telegram", detail: "Chat directly" },
] as const;

export const socials = [
  { key: "github", label: "GitHub" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X" },
] as const;
