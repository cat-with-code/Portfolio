/**
 * ⚠️ SAMPLE CONTENT — every post below is placeholder copy taken from the Figma prototype
 * (Blog — Magazine 694:19591, Reading room 449:9648, Browse posts 694:19844, Post preview 694:19920).
 * None of these posts exist yet. Replace them with real writing before launch.
 */
import type { TopicKey } from "@/components/blog/topic-art";

export const SAMPLE_BLOG = true;

export type PostTopicFilter = "technology" | "books" | "stories" | "life";

export type Post = {
  slug: string;
  topic: TopicKey;
  /** Browse drawer filter chip */
  filter: PostTopicFilter;
  /** "TECHNOLOGY", "BOOKS & READING" … as printed in meta lines */
  category: string;
  minutes: number;
  title: string;
  /** Card excerpt */
  excerpt: string;
  /** One-line dek used in the Browse posts drawer */
  dek: string;
  /** Full preview body — only the cover story has one in the prototype */
  article?: {
    /** Title as set in the preview, with its line break */
    title: string;
    introduction: string;
    heading: string;
    body: string;
    quote: string;
    questionsHeading: string;
    questions: string[];
  };
};

const p = (post: Post) => post;

export const posts: Record<string, Post> = Object.fromEntries(
  [
    p({
      slug: "what-ai-changes-about-learning",
      topic: "technology",
      filter: "technology",
      category: "TECHNOLOGY",
      minutes: 8,
      title: "What AI changes about the way we learn",
      excerpt:
        "AI tools can explain concepts in seconds, but learning is more than finding the quickest answer. The interesting question is how these tools shape our curiosity, attention, and willingness to explore.",
      dek: "New tools, old habits, endless curiosity.",
      article: {
        title: "What AI changes\nabout the way we learn",
        introduction:
          "AI tools can explain concepts in seconds, but learning is more than finding the quickest answer. The interesting question is how these tools shape our curiosity, attention, and willingness to explore.",
        heading: "Better questions, not just faster answers",
        body: "When technology becomes an everyday companion, we have more opportunities to learn independently. Yet that convenience brings a challenge: it can be tempting to stop at the first answer.\n\nI’m curious about what happens when we treat AI as a partner for brainstorming, checking assumptions, and finding new directions rather than as a replacement for thinking.",
        quote: "“The real value may be the questions we learn to ask next.”",
        questionsHeading: "Three things I’m thinking about",
        questions: ["Keep curiosity in the driver’s seat", "Test information instead of accepting it", "Leave room for human creativity"],
      },
    }),
    p({ slug: "a-book-that-stayed-with-me", topic: "books", filter: "books", category: "BOOKS & READING", minutes: 5, title: "A book that stayed with me", excerpt: "Ideas from the pages I keep thinking about.", dek: "Ideas from the pages I keep thinking about." }),
    p({ slug: "a-story-about-starting-over", topic: "fiction", filter: "stories", category: "SHORT STORIES", minutes: 6, title: "A story about starting over", excerpt: "A little fiction about a second chance.", dek: "A little fiction about a second chance." }),
    p({ slug: "when-technology-feels-human", topic: "technology", filter: "technology", category: "TECHNOLOGY", minutes: 6, title: "When technology feels human", excerpt: "Small reflections on the tools we use and the habits they quietly shape.", dek: "On the tools shaping everyday life." }),
    p({ slug: "what-i-learned-from-slowing-down", topic: "notes", filter: "life", category: "PERSONAL", minutes: 4, title: "What I learned from slowing down", excerpt: "A short note about noticing more by trying to do less.", dek: "Finding a little more space to think." }),
    p({ slug: "between-the-pages", topic: "books", filter: "books", category: "BOOKS & READING", minutes: 5, title: "Between the pages", excerpt: "A few thoughts from books that made me see things differently.", dek: "A few thoughts from books that made me see things differently." }),
    p({ slug: "the-last-train-home", topic: "fiction", filter: "stories", category: "SHORT STORIES", minutes: 7, title: "The last train home", excerpt: "A small fictional journey through one unforgettable night.", dek: "A small fictional journey through one unforgettable night." }),
    p({ slug: "the-music-that-stays-with-us", topic: "culture", filter: "life", category: "CULTURE", minutes: 5, title: "The music that stays with us", excerpt: "On the songs that become part of our everyday memories.", dek: "On the songs that become part of our everyday memories." }),
    p({ slug: "small-tools-big-changes", topic: "technology", filter: "technology", category: "TECHNOLOGY", minutes: 6, title: "Small tools, big changes", excerpt: "Thoughts on how everyday apps reshape small routines.", dek: "Thoughts on how everyday apps reshape small routines." }),
    p({ slug: "a-quieter-internet", topic: "technology", filter: "technology", category: "TECHNOLOGY", minutes: 6, title: "A quieter internet", excerpt: "Why a slower, more thoughtful web still matters.", dek: "Why a slower, more intentional web feels worth building" }),
    p({ slug: "lessons-from-a-rainy-afternoon", topic: "notes", filter: "life", category: "PERSONAL NOTES", minutes: 4, title: "Lessons from a rainy afternoon", excerpt: "Finding small lessons in an ordinary, rainy day.", dek: "A little reflection on noticing the everyday" }),
    p({ slug: "the-mapmaker-and-the-moon", topic: "fiction", filter: "stories", category: "SHORT STORIES", minutes: 5, title: "The mapmaker and the moon", excerpt: "A little tale about finding a way through the unknown.", dek: "A short fiction about directions, distance, and wonder" }),
    p({ slug: "notes-from-atomic-habits", topic: "books", filter: "books", category: "BOOKS & READING", minutes: 7, title: "Notes from Atomic Habits", excerpt: "The small ideas I’m still trying to practice.", dek: "Small ideas, considered one at a time." }),
    p({ slug: "a-letter-from-the-future", topic: "fiction", filter: "stories", category: "SHORT STORIES", minutes: 5, title: "A letter from the future", excerpt: "A fictional journey into the unknown.", dek: "A brief piece of speculative fiction." }),
    p({ slug: "songs-that-soundtrack-my-study-hours", topic: "culture", filter: "life", category: "CULTURE", minutes: 6, title: "Songs that soundtrack my study hours", excerpt: "How a few familiar albums help me settle into focus.", dek: "How a few familiar albums help me settle into focus." }),
    p({ slug: "building-a-portfolio-in-public", topic: "technology", filter: "technology", category: "TECHNOLOGY", minutes: 5, title: "Building a portfolio in public", excerpt: "What I'm learning by sharing work before it feels finished.", dek: "What I'm learning by sharing work before it feels finished." }),
    p({ slug: "reading-slowly-on-purpose", topic: "books", filter: "books", category: "BOOKS & READING", minutes: 4, title: "Reading slowly on purpose", excerpt: "Why I've started taking notes in the margins again.", dek: "Why I've started taking notes in the margins again." }),
  ].map((post) => [post.slug, post])
);

/** A post as placed on the magazine page: its printed number and kicker belong to the placement. */
export type Placement = { slug: string; number: string; kicker?: string; excerpt?: string };

export const magazine = {
  issue: "OCTOBER 2026",
  issueLong: "ISSUE 001  /  OCTOBER 2026",
  publisher: "DESIGN, CODE & CURIOSITY  ·  BY HOEURN DAREACH",
  wordmark: "THE NOTEBOOK",
  columnEyebrow: "NOTES FROM MY PRACTICE",
  caption: "Design, development, and the ideas\nthat shape my work.",
  browseAll: "BROWSE ALL POSTS   ↗",
  readStory: "Read the story",
  cover: { slug: "what-ai-changes-about-learning", number: "01", kicker: "COVER STORY" } as Placement,
  features: [
    { slug: "a-book-that-stayed-with-me", number: "02", kicker: "BOOK NOTES" },
    { slug: "a-story-about-starting-over", number: "03", kicker: "SHORT STORY" },
  ] as Placement[],
  readingRoom: {
    eyebrow: "THE READING ROOM",
    title: "Fresh from the notebook",
    total: "LATEST POSTS  /  MOST RECENT FIRST",
    pages: [
      { slug: "when-technology-feels-human", number: "04", kicker: "THOUGHTS" },
      { slug: "what-i-learned-from-slowing-down", number: "05", kicker: "LIFE" },
      { slug: "between-the-pages", number: "06", kicker: "READING" },
      { slug: "the-last-train-home", number: "07", kicker: "FICTION" },
      { slug: "the-music-that-stays-with-us", number: "08", kicker: "CULTURE" },
      { slug: "small-tools-big-changes", number: "09", kicker: "TECH" },
      { slug: "a-quieter-internet", number: "10", kicker: "TECHNOLOGY" },
      { slug: "lessons-from-a-rainy-afternoon", number: "11", kicker: "JOURNAL" },
      { slug: "the-mapmaker-and-the-moon", number: "12", kicker: "FICTION" },
    ] as Placement[],
  },
  archive: {
    label: "THE ARCHIVE  /  ALL SORTS OF STORIES",
    title: "More stories, less noise.",
    library: "VIEW BOOK LIBRARY   ↗",
    libraryButton: "View book library",
    viewMore: "View more",
    /** First five show; "View more" reveals the rest */
    initial: 5,
    posts: [
      { slug: "notes-from-atomic-habits", number: "04" },
      { slug: "a-letter-from-the-future", number: "05" },
      { slug: "a-quieter-internet", number: "06", excerpt: "Why a slower, more intentional web feels worth building" },
      { slug: "lessons-from-a-rainy-afternoon", number: "07", excerpt: "A little reflection on noticing the everyday" },
      { slug: "the-mapmaker-and-the-moon", number: "08", excerpt: "A short fiction about directions, distance, and wonder" },
      { slug: "songs-that-soundtrack-my-study-hours", number: "09" },
      { slug: "building-a-portfolio-in-public", number: "10" },
      { slug: "reading-slowly-on-purpose", number: "11" },
    ] as Placement[],
  },
};

/** Browse posts drawer (694:19844) */
export const browse = {
  eyebrow: "BROWSE THE NOTEBOOK",
  title: "All stories",
  summary: "Tech explorations, book notes, personal reflections, short stories, and everything in between.",
  note: "EXPLORE BY TOPIC",
  filters: [
    { key: "all", label: "All" },
    { key: "technology", label: "Technology" },
    { key: "books", label: "Books" },
    { key: "stories", label: "Stories" },
    { key: "life", label: "Life & ideas" },
  ] as const,
  posts: [
    "what-ai-changes-about-learning",
    "a-book-that-stayed-with-me",
    "a-story-about-starting-over",
    "when-technology-feels-human",
    "what-i-learned-from-slowing-down",
    "notes-from-atomic-habits",
    "a-letter-from-the-future",
  ],
  /** Topic label printed on each row */
  rowCategory: { technology: "TECHNOLOGY", books: "BOOKS & READING", stories: "SHORT STORIES", life: "LIFE & IDEAS" } as Record<PostTopicFilter, string>,
};

/** Post preview drawer (694:19920) */
export const preview = {
  eyebrow: "THE NOTEBOOK   /   ARTICLE PREVIEW",
  title: "Inside the story",
  sample: "SAMPLE EXCERPT",
  byline: "WRITTEN BY HOEURN DAREACH   /   PERSONAL NOTES",
  quoteLabel: "FROM THE NOTEBOOK",
  back: "←   BACK TO ALL POSTS",
};
