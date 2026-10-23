/** Duel: 1 = vs Sdabby, 2 = two players on one screen. Solo: 1 = solo, 2 = race Sdabby, 3 = two players. */
export type Mode = 1 | 2 | 3;

export type Report = {
  moves: number;
  /** Game-specific second stat (label comes from content/games.ts) */
  stat: number | string;
  /** Duel: whose turn — 0 = player A (you / Player 1), 1 = player B */
  turn?: 0 | 1;
  /** Solo race: 0–1 of the puzzle done */
  progress?: number;
};

export type DuelEnd = { winner: 0 | 1 | null };
export type SoloEnd = { won: boolean; score: number };

export type Controls = { undo?: () => void; hint?: () => void };

export type GameProps = {
  mode: Mode;
  /** Sdabby's level (duel) or pace (race): 0 easy · 1 medium · 2 hard */
  level: 0 | 1 | 2;
  /** Duel: side player A plays (0 = first side, e.g. White) */
  side: 0 | 1;
  /** The game's own picker (time control, board size, difficulty …) */
  option: 0 | 1 | 2;
  paused: boolean;
  sound: boolean;
  onReport: (r: Report) => void;
  onEnd: (e: DuelEnd | SoloEnd) => void;
  /** Games register their Undo / Hint handlers here (omit one to disable that button). */
  onControls: (c: Controls) => void;
};
