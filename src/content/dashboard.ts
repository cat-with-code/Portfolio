/**
 * Dashboard (Portfolio manager) copy — Figma "Dashboard" page (1346:2153). English only.
 * Counts and lists are worked out from the site's content in lib/dashboard.ts.
 */
export type DashboardNavKey = "overview" | "projects" | "writing" | "study" | "games" | "media" | "inbox";

export const dashboardNav: { key: DashboardNavKey; label: string; path: string }[] = [
  { key: "overview", label: "Overview", path: "" },
  { key: "projects", label: "Projects", path: "/projects" },
  { key: "writing", label: "Writing", path: "/writing" },
  { key: "study", label: "Study library", path: "/study" },
  { key: "games", label: "Games", path: "/games" },
  { key: "media", label: "Media", path: "/media" },
  { key: "inbox", label: "Inbox", path: "/inbox" },
];

export const dashboardShell = {
  manager: "PORTFOLIO MANAGER",
  /** Read aloud next to the red dot on Inbox */
  unread: (n: number) => `${n} unread ${n === 1 ? "message" : "messages"}`,
  search: "Search your dashboard",
  owner: "Hoeurn Dareach",
  viewPortfolio: "View portfolio",
  settings: "Settings",
  menu: "Menu",
  a11y: {
    nav: "Dashboard",
    home: "Dashboard overview",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    toggleSidebar: "Collapse or expand the sidebar",
    theme: "Change theme",
    search: "Search your dashboard",
    profile: "Profile",
  },
};

export const overviewCopy = {
  title: "Overview",
  description: "Your portfolio, behind the scenes.",
  welcome: {
    eyebrow: "PORTFOLIO MANAGER",
    badge: "Design. Build. Explore.",
    title: ["Good to see you, Dareach.", "Let’s get your work ready."],
    body: (drafts: number) =>
      drafts
        ? [`${drafts} ${drafts === 1 ? "draft is" : "drafts are"} waiting for you.`, "Review a project, add your assets, then publish when it feels right."]
        : ["Everything is published.", "Add a new project or story whenever you’re ready."],
  },
  drafts: { eyebrow: (n: number) => `CONTINUE · ${n} DRAFTS`, title: "Pick up a draft", body: "A little progress goes a long way.", empty: "No drafts right now — new projects and stories start here.", all: "View all drafts", edit: "Edit" },
  inbox: { title: "Inbox", empty: "No new messages. New portfolio inquiries will appear here.", unread: (n: number) => `${n} new ${n === 1 ? "message" : "messages"} waiting for a reply.`, open: "Open inbox" },
  checklist: { title: "Before you publish", steps: ["Review your project story", "Add cover images", "Preview, then publish"] },
  media: { eyebrow: "MEDIA", title: "Recent media", open: "Open media" },
  games: { eyebrow: "GAMES", title: "Games to link", progress: (linked: number, total: number) => `${linked} of ${total} have a play link.`, add: "Add links" },
  actions: { eyebrow: "SHORTCUTS", title: "Quick actions", newProject: "New project", newStory: "New story", upload: "Media library" },
};

export const projectsCopy = { title: "Projects", description: "Tell the story behind your UI/UX design and development work.", add: "New project", noun: ["project", "projects"] as [string, string] };
export const writingCopy = { title: "Writing", description: "Stories, notes and reflections for your blog.", add: "New story", noun: ["story", "stories"] as [string, string] };

export const studyCopy = {
  title: "Study library",
  description: "Music and books for your focus room.",
  addTrack: "Add track",
  addBook: "Add book",
  filters: { all: "All", music: "Music", books: "Books" },
  music: { eyebrow: "MUSIC", title: "Focus music", summary: (tracks: number, vibes: number) => `${tracks} tracks · ${vibes} vibes + your own links`, custom: "Custom", customNote: "Visitors add their own YouTube links on the Study page; they stay in their browser." },
  books: { eyebrow: "BOOKS", title: "Book library", summary: (n: number) => `${n} books · each with a brief` },
};

export const gamesCopy = {
  title: "Games",
  description: "Add a play link to each game so visitors can try it.",
  filters: { all: "All", mobile: "Mobile ready" },
  devices: { all: "All devices", large: "Desktop & tablet" },
  noLink: "NO LINK",
  linked: "LINKED",
  addLink: "Add link",
  noun: ["game", "games"] as [string, string],
  /** Games that play well on phones (Figma Dashboard / Games 1363:2892); the rest are marked Desktop & tablet. */
  mobileReady: ["chess", "tic-tac-toe", "tetris"] as string[],
};

export const mediaCopy = {
  title: "Media",
  description: "Images used across your portfolio.",
  all: "All",
  groups: {
    projects: { filter: "Projects", eyebrow: "PROJECTS", title: "Project covers", note: "shown on project cards", caption: "Cover" },
    games: { filter: "Games", eyebrow: "GAMES", title: "Game images", note: "shown on game cards", caption: "Game card" },
    books: { filter: "Books", eyebrow: "BOOKS", title: "Book covers", note: "shown in the book library", caption: "Cover" },
  },
};

export const inboxCopy = {
  title: "Inbox",
  description: "Messages from your contact page.",
  filters: { all: "All", unread: "Unread", archived: "Archived" },
  empty: { title: "No messages yet", body: "When someone writes through your contact page, their message lands here.", settings: "Notification settings", back: "Back to overview" },
  none: { all: "Inbox zero", unread: "All caught up", archived: "Nothing archived" },
  unread: "Unread",
  reply: "Reply by email",
  replySubject: "Re: your message on my portfolio",
  markRead: "Mark as read",
  markUnread: "Mark as unread",
  archive: "Archive",
  unarchive: "Move to inbox",
  delete: "Delete",
  deleteName: (name: string) => `message from ${name}`,
};

export const settingsCopy = {
  title: "Settings",
  description: "Your profile and how your portfolio behaves.",
  save: "Save changes",
  profile: {
    title: "Profile",
    name: { label: "Name", hint: "Shown on your portfolio and posts." },
    email: { label: "Email", placeholder: "your@email.com", hint: "Where new messages are sent." },
    language: { label: "Language", hint: "You can switch to Khmer any time.", options: ["English", "ខ្មែរ (Khmer)", "中文 (Chinese)"] },
  },
  preferences: {
    title: "Preferences",
    items: [
      { key: "email-messages", title: "Email me about new messages", body: "Get a short email when someone writes through your contact page.", on: true },
      { key: "reading-time", title: "Show reading time", body: "Show “5 min read” on every story.", on: true },
      { key: "indexing", title: "Let search engines find my portfolio", body: "Turn off to hide the whole site from Google and other search engines.", on: true },
    ],
  },
};

export const storyEditorCopy = {
  back: "Back to writing",
  newTitle: "New story",
  status: "Draft · Only you can see this story.",
  statusPublished: "Published · Visible on your blog.",
  save: "Save draft",
  saving: "Saving…",
  saveChanges: "Save changes",
  publish: "Publish",
  unpublish: "Unpublish",
  savedOk: "Saved.",
  publishedOk: "Published — it’s live on your blog.",
  unpublishedOk: "Unpublished — it’s hidden from your blog.",
  saved: "Saving will work once the dashboard is connected to its backend. Your changes stay on this page until then.",
  modes: { edit: "Edit content", preview: "Preview post" },
  headline: {
    eyebrow: "HEADLINE", title: "Title and topic", where: "Top of the article",
    storyTitle: "Story title", topic: "Topic", reading: "Reading time", readingHint: "Worked out from the length.",
    excerpt: "Excerpt", excerptHint: "Shown on the blog cards and in the archive.",
    dek: "One-line summary", dekHint: "Shown under the title and in Browse posts.",
  },
  art: { eyebrow: "FEATURE ART", title: "Cover image", where: "Under the title", placeholder: "Placeholder art until you upload a cover" },
  intro: { eyebrow: "INTRODUCTION", title: "Opening paragraph", where: "First paragraph", label: "Introduction", hint: "Hook the reader in two or three sentences." },
  section: { eyebrow: "SECTION", title: "Section heading and body", where: "Main text", heading: "Section heading", body: "Body", hint: "Use a blank line between paragraphs." },
  quote: { eyebrow: "PULL QUOTE", title: "Editorial quote", where: "Highlighted in the article", label: "Quote label", labelHint: "Small label above the quote.", quote: "Quote", hint: "Keep it to one sentence." },
  list: { eyebrow: "LIST", title: "Numbered points", where: "End of the article", heading: "List heading", add: "Add point" },
  previewEmpty: "Nothing to preview yet — the post shows its excerpt until the article is written.",
};

export const projectEditorCopy = {
  back: "Back to projects",
  status: "Draft · Only you can see this project.",
  statusPublished: "Published · Visible in your portfolio.",
  saving: "Saving…",
  review: "Review & publish",
  save: "Save draft",
  publish: "Publish",
  saved: storyEditorCopy.saved,
  modes: { edit: "Edit content", preview: "Preview page" },
  card: { eyebrow: "DIRECTORY CARD", title: "Project card", where: "All projects", name: "Project name", category: "Category", description: "Description", disciplines: "Disciplines", disciplinesHint: "Shown in capitals, e.g. UI/UX  ·  EDUCATION.", noCase: (href: string | null) => (href ? `This project has no case study page — its card links to ${href}.` : "This project has no page yet — only its card shows.") },
  masthead: { eyebrow: "MASTHEAD", title: "Title and summary", where: "Top of the page", label: "Eyebrow", name: "Project name", statusLabel: "Status label", summary: "Summary" },
  credits: { eyebrow: "CREDITS", title: "Project details", where: "Under the title" },
  cover: { eyebrow: "COVER", title: "Cover image", where: "Cards and case study" },
  overview: { eyebrow: "01  /  OVERVIEW", title: "What it is", where: "Section 01", sectionTitle: "Section title", lead: "Lead paragraph" },
  challenge: { eyebrow: "02  /  THE CHALLENGE", title: "Why it matters", where: "Section 02", body: "Body", goal: "The goal" },
  work: { eyebrow: "03  /  WHAT I DID", title: "Steps", where: "Section 03", item: "Step", itemBody: "Detail", add: "Add step" },
  outcome: { eyebrow: "04  /  OUTCOME", title: "Where it landed", where: "Section 04", statement: "Statement" },
  next: { eyebrow: "NEXT PROJECT", title: "Next project", where: "End of the page", label: "Next project", hint: "Shown at the bottom of this case study." },
};

export const trackEditorCopy = {
  back: "Back to study library",
  newTitle: "New track",
  status: "Shown in the Study music player and library.",
  save: "Save track",
  saving: "Saving…",
  saved: storyEditorCopy.saved,
  details: { eyebrow: "DETAILS", title: "Track details", where: "Player and library", title2: "Title", vibe: "Sound style", length: "Length", lengthHint: "m:ss — filled in from the audio file when you upload one." },
  audio: {
    eyebrow: "AUDIO", title: "Audio file", where: "What plays",
    generated: "Generated soundscape",
    generatedNote: (vibe: string) => `No file yet — the player makes a ${vibe.toLowerCase()} soundscape for this track.`,
    fileNote: (length: string) => `MP3 or WAV · ${length}`,
    upload: "Upload audio", replace: "Replace", remove: "Remove",
  },
  cover: { eyebrow: "COVER", title: "Cover image", where: "Music player" },
};

export const bookEditorCopy = {
  back: "Back to study library",
  newTitle: "New book",
  status: "Shown in the book library and its brief.",
  save: "Save book",
  saving: "Saving…",
  saved: storyEditorCopy.saved,
  cover: { eyebrow: "COVER", title: "Book cover", where: "Library and brief", tint: "Panel colour" },
  details: { eyebrow: "DETAILS", title: "Book details", where: "Library row", title2: "Title", author: "Author", topic: "Topic", teaser: "Teaser" },
  idea: { eyebrow: "BIG IDEA", title: "The big idea", where: "Top of the brief", label: "Big idea" },
  ideas: { eyebrow: "THREE IDEAS", title: "Ideas to remember", where: "Middle of the brief", label: "Idea" },
  sentence: { eyebrow: "IN ONE SENTENCE", title: "One sentence", where: "Quote in the brief", label: "Sentence" },
  reflection: { eyebrow: "REFLECTION", title: "A question to keep", where: "End of the brief", label: "Question" },
  tints: [
    { value: "bg-accent-green-subtle", label: "Green" },
    { value: "bg-accent-blue-subtle", label: "Blue" },
    { value: "bg-accent-red-subtle", label: "Red" },
    { value: "bg-accent-violet-subtle", label: "Violet" },
    { value: "bg-status-warning-subtle", label: "Sand" },
  ],
};

export const publishCopy = {
  back: "Back to editing",
  title: "Ready to publish?",
  description: "Check everything once more. You can unpublish any time.",
  publish: "Publish now",
  publishing: "Publishing…",
  checklist: { title: "Checklist", items: ["Project story reviewed", "Cover image added", "Preview checked"] },
  preview: "HOW VISITORS WILL SEE IT",
  noCase: "This project only appears as a card in All projects.",
  done: {
    title: (name: string) => `${name} is live`,
    body: "Your project is now public on your portfolio. You can edit or unpublish it any time.",
    overview: "Go to overview",
    projects: "Back to projects",
  },
};

export const signInCopy = {
  title: "Welcome back",
  body: "Sign in to manage your portfolio.",
  email: "Email",
  password: "Password",
  submit: "Sign in",
  pending: "Signing in…",
  /** Shown after the session limits signed you out (see lib/supabase/session-policy) */
  ended: {
    idle: "You were signed out after a while without activity. Sign in again to continue.",
    max: "Your session reached its time limit. Sign in again to continue.",
  },
};

export const verifyCopy = {
  title: "One more step",
  body: "Enter the code from your authenticator app to open your dashboard.",
  code: "6-digit code",
  codeSubmit: "Verify",
  codePending: "Checking…",
  signOut: "Sign out",
};

export const securityCopy = {
  title: "Sign-in security",
  off: "Only your password protects the dashboard right now. Add an authenticator app so signing in also needs a code from your phone.",
  on: "Signing in needs your password and a 6-digit code from your authenticator app.",
  app: {
    title: "Authenticator app",
    body: "Google Authenticator, Microsoft Authenticator, 1Password, Authy…",
    setUp: "Set up",
    scan: "Scan this with your authenticator app, then enter the 6-digit code it shows.",
    manual: "Can’t scan? Enter this key:",
    code: "6-digit code",
    confirm: "Turn on",
    cancel: "Cancel",
    on: "On",
    since: (when: string) => `Added ${when}`,
  },
  remove: "Turn off",
  confirmOff: { title: "Turn off the authenticator app?", body: "Signing in will only need your password. You can set it up again any time." },
};

export const dialogsCopy = {
  uploading: "Uploading…",
  profile: { role: "Owner · Portfolio Manager", settings: "Profile & settings", signOut: "Sign out", open: "Open profile menu" },
  search: { placeholder: "Search your dashboard", pages: "PAGES", drafts: "DRAFTS", empty: "Nothing matches that.", hint: "Press Esc to close · ⌘K opens search anywhere" },
  gameLink: { title: (game: string) => `Add a play link for ${game}`, description: "Paste the link where people can play this game.", label: "Play link", hint: "You can change it later.", save: "Save link" },
  uploadAudio: { eyebrow: "MUSIC", title: "Upload audio", description: "Add an MP3 or WAV file for this focus track. It’s used once you save.", drop: "Drop an audio file here", hint: "MP3 or WAV · up to 20 MB", upload: "Upload" },
  addStudy: { eyebrow: "STUDY LIBRARY", title: "Add to your library", description: "Add a focus track or a book you are reading.", track: "Track", book: "Book", name: "Title", vibe: "Sound style", author: "Author", add: "Continue" },
  cover: {
    upload: "Upload cover",
    replace: "Replace",
    remove: "Remove",
    none: "No cover yet — the placeholder art shows until you upload one.",
    hint: "PNG, JPG or WebP, up to 5 MB.",
    eyebrow: "COVER",
    drop: "Drop an image here",
    title: "Upload a cover",
    description: "It replaces the current cover once you save.",
  },
  remove: {
    action: "Delete",
    title: (name: string) => `Delete “${name}”?`,
    description: "It will be removed from your portfolio and the dashboard. This can’t be undone.",
    listNote: "Removed from this list for now — deleting for good connects with the backend.",
    editorNote: "Deleting connects with the backend — nothing was removed yet.",
    zone: { title: "Delete", body: "Remove this from your portfolio for good." },
  },
  listItem: { eyebrow: "LIST ITEM", title: "Edit item", description: "Change the title and the short description.", name: "Title", detail: "Description", hint: "One line works best.", save: "Save changes" },
};

export const dashboardNotFound = {
  eyebrow: "ERROR 404 · NOT IN YOUR DASHBOARD",
  title: "Nothing here",
  body: "This page doesn’t exist — it may have been deleted, or the link is wrong.",
  home: "Back to overview",
  search: "Search your dashboard",
  explore: "OR GO TO",
};

export const statusLabel = { draft: "DRAFT", published: "PUBLISHED" } as const;
