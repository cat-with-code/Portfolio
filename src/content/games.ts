/** Game Hub (Figma Desktop 694:11927) and game pages (Games / Game page, 1239:95379 …). */

export type GameKey =
  | "chess" | "checkers" | "connect-four" | "tic-tac-toe"
  | "sudoku" | "2048" | "minesweeper" | "sliding-puzzle"
  | "word-guess" | "hangman"
  | "tetris" | "simon-says" | "memory-match" | "snake"
  | "solitaire" | "rock-paper-scissors";

export type Kind = "duel" | "solo";

export type Game = {
  key: GameKey;
  title: string;
  kind: Kind;
  section: SectionKey;
  /** Hub / game page badge */
  badge: string;
  description: string;
  /** Game Library drawer tag + teaser */
  tag: string;
  teaser: string;
  /** Hub card background token class */
  tint: string;
  play: string;
  how: [string, string, string];
  more: [GameKey, GameKey, GameKey];
  /** Duel: side labels; Solo: unused */
  sides?: [string, string];
  /** The game-specific picker: label + three options */
  option: { label: string; values: [string, string, string]; initial?: number };
  /** Third stat on the play panel (after MOVES); TIME is always last */
  stat: string;
};

export type SectionKey = "strategy" | "puzzles" | "words" | "arcade" | "cards";
export const sections: { key: SectionKey; title: string; crumb: string }[] = [
  { key: "strategy", title: "Strategy & board", crumb: "STRATEGY & BOARD" },
  { key: "puzzles", title: "Puzzles & logic", crumb: "PUZZLES & LOGIC" },
  { key: "words", title: "Word games", crumb: "WORD GAMES" },
  { key: "arcade", title: "Arcade & memory", crumb: "ARCADE & MEMORY" },
  { key: "cards", title: "Cards & quick play", crumb: "CARDS & QUICK PLAY" },
];

const g = (game: Game) => game;

export const games: Record<GameKey, Game> = {
  chess: g({
    key: "chess", title: "Chess", kind: "duel", section: "strategy", badge: "STRATEGY",
    description: "A timeless battle of strategy, patience, and beautifully planned moves.",
    tag: "#Strategy", teaser: "Play a thoughtful game of strategy and plan your next move.", tint: "bg-accent-blue-subtle", play: "Play Chess",
    how: ["Move one piece per turn; every piece has its own path.", "Capture by landing on an opponent’s piece.", "Checkmate the king to win."],
    more: ["checkers", "connect-four", "tic-tac-toe"], sides: ["White", "Black"],
    option: { label: "TIME CONTROL", values: ["5 min", "10 min", "No clock"] }, stat: "CAPTURED",
  }),
  checkers: g({
    key: "checkers", title: "Checkers", kind: "duel", section: "strategy", badge: "BOARD GAME",
    description: "Capture pieces. Claim the board.",
    tag: "#Strategy", teaser: "Capture pieces and control the board in a classic match.", tint: "bg-surface-primary", play: "Play Checkers",
    how: ["Move one piece diagonally forward.", "Jump over an opponent’s piece to capture it.", "Reach the far row to crown a king."],
    more: ["chess", "connect-four", "tic-tac-toe"], sides: ["Red", "Black"],
    option: { label: "MATCH LENGTH", values: ["1 game", "Best of 3", "Best of 5"] }, stat: "CAPTURED",
  }),
  "connect-four": g({
    key: "connect-four", title: "Connect Four", kind: "duel", section: "strategy", badge: "STRATEGY",
    description: "Get four pieces into a line.",
    tag: "#Board Game", teaser: "Drop your pieces and connect four in a row to win.", tint: "bg-accent-violet-subtle", play: "Play Connect Four",
    how: ["Drop one disc per turn into any column.", "Discs fall to the lowest open space.", "Line up four in a row, column or diagonal."],
    more: ["chess", "checkers", "tic-tac-toe"], sides: ["Red", "Yellow"],
    option: { label: "MATCH LENGTH", values: ["Best of 1", "Best of 3", "Best of 5"] }, stat: "DISCS",
  }),
  "tic-tac-toe": g({
    key: "tic-tac-toe", title: "Tic-Tac-Toe", kind: "duel", section: "strategy", badge: "QUICK MATCH",
    description: "Three in a row wins.",
    tag: "#Quick Play", teaser: "Take turns placing X and O to get three in a row.", tint: "bg-brand-subtle", play: "Play Tic-Tac-Toe",
    how: ["Take turns placing X and O.", "Block your opponent’s lines.", "Get three in a row to win."],
    more: ["chess", "checkers", "connect-four"], sides: ["X", "O"],
    option: { label: "BOARD SIZE", values: ["3 × 3", "4 × 4", "5 × 5"] }, stat: "MARKS",
  }),
  sudoku: g({
    key: "sudoku", title: "Sudoku", kind: "solo", section: "puzzles", badge: "LOGIC",
    description: "Fill the grid. Find your flow. Every number has its place.",
    tag: "#Logic Puzzle", teaser: "Complete the grid using numbers one through nine.", tint: "bg-accent-violet-subtle", play: "Play Sudoku",
    how: ["Fill every row with the numbers 1 to 9.", "Each column and 3×3 box uses every number once.", "Use notes when you’re not sure yet."],
    more: ["2048", "minesweeper", "sliding-puzzle"],
    option: { label: "DIFFICULTY", values: ["Easy", "Medium", "Hard"] }, stat: "MISTAKES",
  }),
  "2048": g({
    key: "2048", title: "2048", kind: "solo", section: "puzzles", badge: "NUMBER PUZZLE",
    description: "Merge the tiles, grow your score and see how high you can get.",
    tag: "#Number Puzzle", teaser: "Combine numbered tiles to reach the ultimate 2048 tile.", tint: "bg-accent-green-subtle", play: "Play 2048",
    how: ["Use the arrow keys or swipe to slide every tile.", "Equal tiles merge into one and double.", "Reach the 2048 tile before the board fills up."],
    more: ["sudoku", "minesweeper", "sliding-puzzle"],
    option: { label: "GOAL TILE", values: ["2048", "4096", "Endless"] }, stat: "SCORE",
  }),
  minesweeper: g({
    key: "minesweeper", title: "Minesweeper", kind: "solo", section: "puzzles", badge: "LOGIC",
    description: "Use clues to reveal each safe square.",
    tag: "#Logic", teaser: "Use number clues to reveal safe squares and avoid mines.", tint: "bg-accent-blue-subtle", play: "Play Minesweeper",
    how: ["Click a square to reveal it.", "Numbers show how many mines touch that square.", "Flag every mine and clear the rest."],
    more: ["sudoku", "2048", "sliding-puzzle"],
    option: { label: "BOARD", values: ["Beginner", "Medium", "Expert"] }, stat: "FLAGS",
  }),
  "sliding-puzzle": g({
    key: "sliding-puzzle", title: "Sliding Puzzle", kind: "solo", section: "puzzles", badge: "LOGIC",
    description: "Put every tile in its place.",
    tag: "#Logic Puzzle", teaser: "Slide numbered tiles into the correct order.", tint: "bg-accent-green-subtle", play: "Play Sliding Puzzle",
    how: ["Slide a tile into the empty space.", "Put the tiles back in order, starting from 1.", "Finish in as few moves as you can."],
    more: ["sudoku", "2048", "minesweeper"],
    option: { label: "GRID", values: ["3 × 3", "4 × 4", "5 × 5"] }, stat: "IN PLACE",
  }),
  "word-guess": g({
    key: "word-guess", title: "Word Guess", kind: "solo", section: "words", badge: "WORD GAME",
    description: "Five letters. Six tries. One solution.",
    tag: "#Word Game", teaser: "Solve the hidden five-letter word in six attempts.", tint: "bg-accent-green-subtle", play: "Play Word Guess",
    how: ["Guess a word of the chosen length.", "Green means right spot, yellow means in the word, gray means not in it.", "Find the word within six tries."],
    more: ["hangman", "sudoku", "memory-match"],
    option: { label: "WORD LENGTH", values: ["4 letters", "5 letters", "6 letters"], initial: 1 }, stat: "TRIES LEFT",
  }),
  hangman: g({
    key: "hangman", title: "Hangman", kind: "solo", section: "words", badge: "WORD CHALLENGE",
    description: "Find the missing letters before your attempts run out.",
    tag: "#Word Game", teaser: "Guess each missing letter before you run out of tries.", tint: "bg-surface-primary", play: "Play Hangman",
    how: ["Pick one letter at a time.", "Each wrong letter adds a piece to the drawing.", "Solve the word before the drawing is finished."],
    more: ["word-guess", "sudoku", "memory-match"],
    option: { label: "CATEGORY", values: ["Animals", "Movies", "Random"] }, stat: "MISSES",
  }),
  tetris: g({
    key: "tetris", title: "Tetris", kind: "solo", section: "arcade", badge: "ARCADE",
    description: "Slot the blocks, clear a line and keep the stack alive.",
    tag: "#Arcade", teaser: "Arrange falling blocks, clear lines and set a new high score.", tint: "bg-accent-blue-subtle", play: "Play Tetris",
    how: ["Move and rotate the falling blocks.", "Fill a whole row to clear it.", "Keep the stack from reaching the top."],
    more: ["simon-says", "memory-match", "snake"],
    option: { label: "GAME TYPE", values: ["Marathon", "Sprint", "Ultra"] }, stat: "LINES",
  }),
  "simon-says": g({
    key: "simon-says", title: "Simon Says", kind: "solo", section: "arcade", badge: "MEMORY",
    description: "Watch. Listen. Repeat.",
    tag: "#Memory", teaser: "Remember and repeat the pattern as it grows.", tint: "bg-accent-violet-subtle", play: "Play Simon Says",
    how: ["Watch the colors light up.", "Repeat the pattern in the same order.", "Each round adds one more step."],
    more: ["tetris", "memory-match", "snake"],
    option: { label: "SEQUENCE", values: ["Classic", "Reverse", "Speed run"] }, stat: "ROUND",
  }),
  "memory-match": g({
    key: "memory-match", title: "Memory Match", kind: "solo", section: "arcade", badge: "CARD PUZZLE",
    description: "Spot the pairs and train your memory.",
    tag: "#Memory", teaser: "Flip cards and remember where matching pairs are hidden.", tint: "bg-accent-violet-subtle", play: "Play Memory Match",
    how: ["Flip two cards each turn.", "Matching pairs stay face up.", "Clear the board in as few moves as you can."],
    more: ["tetris", "simon-says", "snake"],
    option: { label: "GRID", values: ["4 × 4", "4 × 5", "6 × 6"] }, stat: "PAIRS",
  }),
  snake: g({
    key: "snake", title: "Snake", kind: "solo", section: "arcade", badge: "ARCADE",
    description: "Stay on the board. Keep growing.",
    tag: "#Arcade", teaser: "Eat the fruit, grow longer, and avoid hitting the walls.", tint: "bg-surface-primary", play: "Play Snake",
    how: ["Steer with the arrow keys or swipe.", "Eat the fruit to grow longer.", "Don’t hit the walls or your own tail."],
    more: ["tetris", "simon-says", "memory-match"],
    option: { label: "WALLS", values: ["Classic", "No walls", "Maze"] }, stat: "LENGTH",
  }),
  solitaire: g({
    key: "solitaire", title: "Solitaire", kind: "solo", section: "cards", badge: "CARD GAME",
    description: "Clear the tableau and enjoy a quiet moment with the cards.",
    tag: "#Card Game", teaser: "Sort the cards and clear the board at your own pace.", tint: "bg-brand-subtle", play: "Play Solitaire",
    how: ["Build down the columns in alternating colors.", "Move aces to the foundations and build up by suit.", "Move every card to the foundations to win."],
    more: ["rock-paper-scissors", "memory-match", "tic-tac-toe"],
    option: { label: "DRAW", values: ["Draw 1", "Draw 3", "Vegas"] }, stat: "FOUNDATION",
  }),
  "rock-paper-scissors": g({
    key: "rock-paper-scissors", title: "Rock Paper Scissors", kind: "duel", section: "cards", badge: "QUICK DUEL",
    description: "Make your move. Outsmart your opponent.",
    tag: "#Quick Play", teaser: "Pick rock, paper or scissors and try to outsmart your rival.", tint: "bg-accent-red-subtle", play: "Play now",
    how: ["Choose rock, paper or scissors.", "Rock beats scissors, scissors beat paper, paper beats rock.", "Win the most rounds to take the match."],
    more: ["solitaire", "tic-tac-toe", "connect-four"], sides: ["Blue hand", "Red hand"],
    option: { label: "MATCH LENGTH", values: ["Best of 3", "Best of 5", "Best of 7"] }, stat: "ROUNDS",
  }),
};

export const gameOrder: GameKey[] = ["chess", "sudoku", "2048", "snake", "tic-tac-toe", "memory-match", "minesweeper", "word-guess", "tetris", "checkers", "connect-four", "solitaire", "sliding-puzzle", "simon-says", "hangman", "rock-paper-scissors"];

export const hub = {
  eyebrow: "MY PLAYGROUND  /  DESIGN + CODE",
  title: "Where design meets play.",
  body: "Classic games, explored through interface design and code. Try a round.",
  count: "16 GAMES",
  /** Games in one section of the hub */
  sectionCount: (n: number) => `${n} GAMES`,
  browse: "Browse all games ↗",
  editorsPick: "✦  EDITOR’S PICK",
  chessTags: ["STRATEGY", "1–2 PLAYERS"],
  sudoku: { message: "Fill the grid.\nFind your flow.", body: "Every number has its place." },
  library: { eyebrow: "BROWSE    /    16 GAMES", title: "Game Library", summary: "Explore sixteen games, choose a favorite, and start playing.", play: "Play" },
};

export const panelCopy = {
  setup: { eyebrow: "GAME SETUP", title: "Choose how to play" },
  duelModes: [
    { title: "Play Sdabby", caption: "Our AI opponent · three levels" },
    { title: "Two players", caption: "Pass and play on one screen" },
    { title: "Invite a friend", caption: "Online play is coming soon" },
  ],
  soloModes: [
    { title: "Solo", caption: "Classic rules at your own pace" },
    { title: "Race Sdabby", caption: "Same puzzle — first to finish wins" },
    { title: "Two players", caption: "Take turns — best score wins" },
  ],
  level: { label: "SDABBY’S LEVEL", values: ["Easy", "Medium", "Hard"] as const },
  pace: { label: "SDABBY’S PACE", values: ["Relaxed", "Steady", "Speedy"] as const },
  side: "PLAY AS",
  random: "Random",
  time: { label: "TIME CONTROL", values: ["5 min", "10 min", "No clock"] as const },
  players: "PLAYERS",
  rounds: { label: "ROUNDS", values: ["1 round", "3 rounds", "5 rounds"] as const },
  goesFirst: "Goes first",
  goesSecond: "Goes second",
  bestNote: "Your best score is saved on this device.",
  raceNote: "Sdabby plays the same board beside you.",
  start: { duel1: "Start vs Sdabby", duel2: "Start match", solo1: "Start game", solo2: "Start the race", solo3: "Start match" },
  playing: {
    title: "Match in progress",
    soloTitle: "Game in progress",
    live: "LIVE",
    duelEyebrow: ["VS SDABBY", "TWO PLAYERS"],
    soloEyebrow: ["SOLO", "RACE VS SDABBY", "PASS AND PLAY"],
    you: "You",
    sdabby: "Sdabby",
    yourMove: "YOUR MOVE",
    toMove: "TO MOVE",
    turn: "TURN",
    thinking: "THINKING…",
    wins: "WINS",
    score: "SCORE",
    moves: "MOVES",
    time: "TIME",
    goal: "Daily goal",
    goalCount: (n: number) => `${Math.min(n, 3)} of 3 games`,
    solving: "Solving…",
    paceDetail: ["Relaxed pace", "Steady pace", "Speedy pace"],
    playingNow: "Playing now",
    upNext: "Up next",
    undo: "Undo",
    hint: "Hint",
    pause: "Pause",
    resume: "Resume",
    sound: "Sound",
    restart: "Restart",
    resign: "Resign",
    endMatch: "End match",
    endGame: "End game",
    changeMode: "Change mode",
    paused: "Paused",
  },
  result: {
    matchOver: "MATCH OVER",
    gameOver: "GAME OVER",
    raceOver: "RACE OVER",
    rematch: "Rematch",
    playAgain: "Play again",
    raceAgain: "Race again",
    changeMode: "Change mode",
    youWin: "You beat Sdabby!",
    youWinBody: "Sdabby wants a rematch. Try a harder level next time?",
    youLose: "Sdabby wins this one",
    youLoseBody: "Good effort. Want another go — or a gentler level?",
    draw: "It’s a draw",
    drawBody: "Evenly matched. One more to settle it?",
    playerWins: (name: string) => `${name} wins!`,
    playerWinsBody: "Great game, both of you. Swap sides and go again?",
    best: "New personal best!",
    bestBody: "That’s your best run on this device so far.",
    done: "Nicely done!",
    doneBody: "Another round complete. Ready for one more?",
    over: "Game over",
    overBody: "Shake it off — the next run could be your best.",
    raceWin: "You beat Sdabby!",
    raceWinBody: (s: string) => `You finished ${s} ahead. Try a faster pace?`,
    raceLose: "Sdabby finished first",
    raceLoseBody: "So close. Race again, or pick a gentler pace?",
    stats: { time: "TIME", result: "RESULT", streak: "STREAK", score: "SCORE", draws: "DRAWS", ahead: "AHEAD", rounds: "ROUNDS" },
    win: "Win",
    loss: "Loss",
    drawShort: "Draw",
  },
  /** Text shown inside a few games while playing */
  inGame: {
    rps: {
      moves: ["Rock", "Paper", "Scissors"],
      draw: "Draw",
      youRound: "You win the round",
      sdabbyRound: "Sdabby wins the round",
      playerRound: (n: number) => `Player ${n} wins the round`,
      chooseSecret: "Player 1 — choose in secret",
      p2Turn: "Player 2 — your turn",
      makeMove: "Make your move",
      you: "You",
      player: (n: number) => `Player ${n}`,
    },
    chess: { checkmate: "Checkmate", draw: "Draw", thinking: "Sdabby is thinking…", check: "Check!" },
    twenty48: { swipe: (dir: "up" | "down" | "left" | "right") => `Try swiping ${dir}.`, keys: "Arrow keys or swipe to move." },
  },
  howTo: "HOW TO PLAY",
  /** Page title for search results: "Chess — play online" */
  pageTitle: (game: string) => `${game} — play online`,
  more: "More games to try",
  back: "Back to Game Hub",
  crumb: (section: string) => `GAMES  /  ${section}`,
};
