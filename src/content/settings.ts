/** Settings drawer copy (Figma Desktop 707:43772). Labels with a Figma translation come from the dictionary. */
export const settingsCopy = {
  appearanceHelp: "Choose Light, Dark, or follow your system.",
  languageHelp: "Choose English, Khmer, or Chinese.",
  voiceTitle: "Reading voice",
  voiceHelp: "Choose the voice used when you listen to books, blog posts, and projects.",
  /** Saved values (kept in the visitor's browser — never translated) and the labels shown for them */
  voices: ["Female", "Male", "Neutral"] as const,
  voiceLabels: ["Female", "Male", "Neutral"],
  localTime: "Local time",
  calendarGregorian: "Gregorian",
  /** Second line under the Gregorian date */
  weekDetail: (week: number, day: number, days: number) => `Week ${week}  ·  Day ${day} of ${days}`,
  calendarKhmer: "ខ្មែរ",
  city: "Phnom Penh  ·  GMT+7",
  cityKhmer: "ភ្នំពេញ  ·  GMT+៧",
  footerMade: "Made with care in Phnom Penh",
  footerCopyright: "© 2026 Hoeurn Dareach. All rights reserved.",
};

export const languageOptions = [
  { lang: "en", label: "English", font: "" },
  { lang: "km", label: "ភាសាខ្មែរ", font: "font-(family-name:--font-khmer)" },
  { lang: "zh", label: "中文", font: "font-(family-name:--font-sc)" },
] as const;
