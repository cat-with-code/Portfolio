/** Small phrases with numbers, shared by several pages (reading time, durations). Translated in i18n/content. */
export const units = {
  /** Blog meta lines in capitals: "8 MIN READ" */
  minRead: (n: number) => `${n} MIN READ`,
  /** Same in sentence case: "8 min read" */
  minReadShort: (n: number) => `${n} min read`,
  minutes: (n: number) => `${n} min`,
  flexible: "Flexible",
  /** Counters in drawers: "03 POSTS", "06 PROJECTS" */
  posts: (n: number) => `${String(n).padStart(2, "0")} POSTS`,
  projects: (n: number) => `${String(n).padStart(2, "0")} PROJECTS`,
};
