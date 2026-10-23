/**
 * ⚠️ SAMPLE CONTENT — the reading list and book briefs come from the Figma prototype
 * (Study / Book Library drawer 694:20083, Study / Book brief 1195:4785). Replace them with the
 * books actually read (and briefs actually written) before launch. Covers are the publishers' art.
 */
export type Book = {
  key: string;
  title: string;
  author: string;
  /** Topic shown as "#Habits" on the row and "James Clear  ·  Habits" in the brief */
  topic: string;
  teaser: string;
  /** Cover banner tint behind the book in the brief */
  tint: string;
  brief: {
    bigIdea: string;
    ideas: [string, string, string];
    sentence: string;
    question: string;
  };
};

export const library = {
  eyebrow: (count: number) => `BROWSE    /    ${count} BOOKS`,
  title: "Book Library",
  summary: "Discover what each book wants to teach you.",
  brief: "Brief",
  briefEyebrow: (topic: string) => `BOOK BRIEF    /    #${topic.toUpperCase()}`,
  bigIdea: "THE BIG IDEA",
  ideas: "THREE IDEAS TO REMEMBER",
  sentence: "IN ONE SENTENCE",
  question: "A QUESTION TO TAKE INTO YOUR STUDY",
  back: "Back to Book Library",
};

export const books: Book[] = [
  {
    key: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    topic: "Habits",
    teaser: "Small actions compound into remarkable change.",
    tint: "bg-accent-green-subtle",
    brief: {
      bigIdea: "Tiny, repeated improvements can change your results and your sense of identity. Build systems that make good habits easier instead of relying on motivation alone.",
      ideas: ["Start so small that showing up feels easy.", "Design your environment to support good choices.", "Become the person who practices the habit."],
      sentence: "“Lasting change grows out of everyday actions.”",
      question: "What tiny action can you repeat tomorrow?",
    },
  },
  {
    key: "deep-work",
    title: "Deep Work",
    author: "Cal Newport",
    topic: "Focus",
    teaser: "Make space for concentration in a noisy world.",
    tint: "bg-accent-blue-subtle",
    brief: {
      bigIdea: "Distraction-free concentration is a valuable skill. Protecting your attention lets you learn hard things and produce work that shallow busyness cannot.",
      ideas: ["Schedule uninterrupted blocks for demanding work.", "Limit context switching and low-value distractions.", "Rest deliberately so your attention can recover."],
      sentence: "“Your best work needs room to think.”",
      question: "When could you protect 25 minutes of focus?",
    },
  },
  {
    key: "make-it-stick",
    title: "Make It Stick",
    author: "Brown, Roediger & McDaniel",
    topic: "Learning",
    teaser: "Learn better through recall, practice, and effort.",
    tint: "bg-accent-red-subtle",
    brief: {
      bigIdea: "Memory gets stronger when learning is active and effortful. Rereading can feel smooth, but retrieval, spacing, and varied practice tend to stick longer.",
      ideas: ["Recall ideas from memory before opening notes.", "Space practice across days, not one long cram.", "Mix related skills and explain what you learn."],
      sentence: "“Difficulty during practice can build lasting learning.”",
      question: "Which idea can you recall without looking?",
    },
  },
  {
    key: "psychology-of-money",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    topic: "Money",
    teaser: "Wealth depends on behavior, not just numbers.",
    tint: "bg-accent-green-subtle",
    brief: {
      bigIdea: "Money decisions are shaped by human behavior, luck, personal history, and emotion. Patience and resilience often matter more than looking clever.",
      ideas: ["Decide what enough means for your own life.", "Leave a margin for uncertainty and surprise.", "Favor sustainable habits over flashy wins."],
      sentence: "“Financial peace is often more useful than applause.”",
      question: "Which money decision would benefit from patience?",
    },
  },
  {
    key: "mindset",
    title: "Mindset",
    author: "Carol S. Dweck",
    topic: "Growth",
    teaser: "Abilities can develop with practice and feedback.",
    tint: "bg-accent-violet-subtle",
    brief: {
      bigIdea: "Abilities are not simply fixed labels. A growth mindset means developing skills through sound strategies, feedback, practice, and a willingness to learn.",
      ideas: ["Treat mistakes as information, not identity.", "Value learning strategies, not only outcomes.", "Try a new approach when effort alone fails."],
      sentence: "“Not yet opens a door that never closes.”",
      question: "Where could you try a different learning strategy?",
    },
  },
  {
    key: "little-prince",
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    topic: "Fiction",
    teaser: "A tender story about connection and what matters.",
    tint: "bg-accent-blue-subtle",
    brief: {
      bigIdea: "A poetic journey reminds readers that care, friendship, and responsibility matter more than status or appearances. Seeing like a child reveals what adults overlook.",
      ideas: ["Look beyond what is obvious or measurable.", "Time and care give relationships meaning.", "Protect curiosity and your sense of wonder."],
      sentence: "“What matters deeply is not always visible.”",
      question: "Who or what deserves more of your attention?",
    },
  },
  {
    key: "alchemist",
    title: "The Alchemist",
    author: "Paulo Coelho",
    topic: "Purpose",
    teaser: "Following a dream reshapes how we see the journey.",
    tint: "bg-status-warning-subtle",
    brief: {
      bigIdea: "A young shepherd’s journey explores dreams, courage, choices, and listening to the world. The lessons gathered along the way matter as much as finding treasure.",
      ideas: ["Take recurring hopes and ambitions seriously.", "Don’t allow fear to decide everything for you.", "Notice what people and places can teach you."],
      sentence: "“The journey changes the person seeking the dream.”",
      question: "What meaningful step would bring a dream closer?",
    },
  },
  {
    key: "brief-history-of-time",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    topic: "Science",
    teaser: "Discover the questions behind space and time.",
    tint: "bg-accent-violet-subtle",
    brief: {
      bigIdea: "A guide to big cosmological questions: where the universe came from, how black holes behave, and what modern physics says about space and time.",
      ideas: ["The universe changes according to physical laws.", "Gravity shapes our understanding of space-time.", "Scientific explanations evolve with new evidence."],
      sentence: "“Keep asking questions larger than yourself.”",
      question: "What question about the universe sparks your curiosity?",
    },
  },
];
