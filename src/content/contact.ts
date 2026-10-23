import { profileLinks } from "./profile";

/** Contact page copy (Figma Desktop 843:46112 · Tablet 843:61319 · Mobile 843:61934). */
export const contact = {
  title: "Contact",
  description: "Let’s bring your idea to life through UI/UX design and development.",
};

/** Contact / Form card (Figma 842:2134). */
export const form = {
  title: "Send a message",
  body: "Tell me a little about your idea — I’ll get back to you soon.",
  name: { label: "Your name", placeholder: "Jane Doe", error: "Enter your name." },
  email: { label: "Email", placeholder: "your@email.com", error: "Enter a valid email address." },
  planning: "What are you planning?",
  choices: ["Portfolio", "Community platform", "Design system", "Something else"],
  /** Figma's default state has the first chip on. */
  defaultChoices: ["Portfolio"],
  message: { label: "Message", placeholder: "Share your goals, timeline, and anything I should know…", error: "Tell me a little about your idea." },
  privacy: "Your details are only used to reply to you.",
  send: "Send message",
  sending: "Sending…",
  sent: {
    title: "Message sent",
    body: (email: string) => `Thanks for reaching out! I’ll reply to ${email} within 1–2 working days.`,
    /** Shown when no mail service is configured and the visitor's mail app was opened instead. */
    mailAppTitle: "Almost there",
    mailAppBody: "Your email app has opened with the message ready — press send there and I’ll reply within 1–2 working days.",
    again: "Send another message",
  },
  failed: "Something went wrong sending your message. Please try again, or email me directly.",
};

/** Contact / Availability card (Figma 842:2037). */
export const availability = {
  status: "AVAILABILITY",
  title: "Open to new projects",
  body: "Let’s talk about UI/UX design, web development, or bringing both together.",
  basedIn: { label: "Based in", value: "Phnom Penh · GMT+7" },
  replies: { label: "Replies within", value: "1–2 working days" },
  email: { label: "Email", value: profileLinks.email },
};

/** Contact / FAQ item (Figma 841:2056). */
export const faq = {
  label: "COMMON QUESTIONS",
  items: [
    { q: "What kind of projects do you take on?", a: "UI/UX design, responsive websites, and design systems, including portfolios and community platforms." },
    { q: "How should I prepare before we talk?", a: "Tell me what you’re building, who it’s for, and where you need help." },
    { q: "How soon will you reply?", a: "Usually within 1–2 working days (GMT+7)." },
    { q: "Do you work with people outside Cambodia?", a: "Yes — I’m based in Phnom Penh and happy to collaborate remotely." },
  ],
};

/** Contact / Map (Figma 1132:2684). */
export const map = {
  pin: "Phnom Penh",
  eyebrow: "BASED IN",
  title: "Phnom Penh, Cambodia",
  zone: "GMT+7  ·  Indochina Time",
  open: "Open in Maps",
  href: "https://www.google.com/maps/place/Phnom+Penh,+Cambodia",
};
