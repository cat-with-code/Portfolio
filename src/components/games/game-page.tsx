"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { ChevronLeftIcon, PauseIcon, PlayFilledIcon, PencilIcon, VolumeOffIcon, VolumeOnIcon } from "@/components/icons";
import { games, panelCopy as pc, type GameKey } from "@/content/games";
import { BotIcon, InfoIcon, LightbulbIcon, LinkIcon20, TrophyIcon, UndoIcon, UserIcon, UsersIcon, ZapIcon } from "./icons";
import type { Controls, DuelEnd, GameProps, Mode, Report, SoloEnd } from "./types";

const load = (fn: () => Promise<{ default: ComponentType<GameProps> }>) => dynamic(fn, { ssr: false, loading: () => <div className="size-full animate-pulse rounded-card bg-surface-primary/40" /> });
const registry: Record<GameKey, ComponentType<GameProps>> = {
  chess: load(() => import("./play/chess")),
  checkers: load(() => import("./play/checkers")),
  "connect-four": load(() => import("./play/connect-four")),
  "tic-tac-toe": load(() => import("./play/tic-tac-toe")),
  sudoku: load(() => import("./play/sudoku")),
  "2048": load(() => import("./play/twenty48")),
  minesweeper: load(() => import("./play/minesweeper")),
  "sliding-puzzle": load(() => import("./play/sliding-puzzle")),
  "word-guess": load(() => import("./play/word-guess")),
  hangman: load(() => import("./play/hangman")),
  tetris: load(() => import("./play/tetris")),
  "simon-says": load(() => import("./play/simon")),
  "memory-match": load(() => import("./play/memory-match")),
  snake: load(() => import("./play/snake")),
  solitaire: load(() => import("./play/solitaire")),
  "rock-paper-scissors": load(() => import("./play/rps")),
};

/** Games won before the match ends, per the game's MATCH LENGTH option. */
const firstTo = (key: GameKey, option: number) =>
  key === "checkers" || key === "connect-four" ? [1, 2, 3][option] : key === "rock-paper-scissors" ? [2, 3, 4][option] : 1;
/** Games with no win condition — every run ends in "game over", so the best score is what counts. */
const scoreRuns = new Set<GameKey>(["snake", "tetris", "2048", "simon-says"]);
/** Race: seconds Sdabby needs at steady pace. */
const raceTarget: Partial<Record<GameKey, number>> = { sudoku: 540, "2048": 420, minesweeper: 240, "sliding-puzzle": 150, "word-guess": 150, hangman: 120, tetris: 300, "simon-says": 180, "memory-match": 150, snake: 240, solitaire: 600 };
const timeLimits = [300, 600, Infinity];
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const store = {
  get<T>(k: string, f: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : f;
    } catch {
      return f;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};

type Phase = "setup" | "playing" | "result";
type Result = { title: string; body: string; eyebrow: string; stats: [string, string][]; primary: string };

function Chips({ label, values, value, onChange }: { label: string; values: readonly string[]; value: number; onChange: (i: number) => void }) {
  return (
    <div className="flex flex-col gap-8">
      <p className="type-table-heading text-secondary">{label}</p>
      <div className="grid grid-cols-3 gap-8" role="radiogroup" aria-label={label}>
        {values.map((v, i) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === i}
            onClick={() => onChange(i)}
            className={`type-label h-38 cursor-pointer rounded-full border px-12 text-primary transition-colors duration-(--duration-fast) ${value === i ? "border-[1.5px] border-(--color-bg-brand) bg-brand-subtle" : "border-general-default bg-surface-primary hover:bg-surface-hover"}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function ModeOption({ icon, title, caption, selected, disabled, onClick }: { icon: ReactNode; title: string; caption: string; selected: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`flex w-full items-center gap-12 rounded-xl border p-12 text-left transition-colors duration-(--duration-fast) ${selected ? "border-[1.5px] border-(--color-bg-brand) bg-brand-subtle" : "border-general-default bg-surface-primary"} ${disabled ? "cursor-not-allowed opacity-(--opacity-disabled)" : "cursor-pointer hover:bg-surface-hover"}`}
    >
      <span className={`flex size-40 shrink-0 items-center justify-center rounded-lg text-icon-general-primary ${selected ? "bg-surface-primary" : "bg-surface-secondary"}`}>{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="type-mobile-label text-primary">{title}</span>
        <span className="type-caption text-secondary">{caption}</span>
      </span>
      <span className={`flex size-20 shrink-0 items-center justify-center rounded-[10px] ${selected ? "bg-brand" : "border-[1.5px] border-general-strong"}`}>
        {selected && <span className="size-8 rounded-full bg-on-brand" />}
      </span>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-lg bg-surface-secondary p-12">
      <span className="type-table-heading truncate text-secondary">{label}</span>
      <span className="type-subheading text-primary tabular-nums">{value}</span>
    </div>
  );
}

function Action({ icon, label, onClick, disabled }: { icon: ReactNode; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      className="flex flex-1 cursor-pointer flex-col items-center gap-6 rounded-lg border border-general-default bg-surface-primary px-8 py-12 text-icon-general-primary transition-colors duration-(--duration-fast) hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)"
    >
      {icon}
      <span className="type-label text-primary">{label}</span>
    </button>
  );
}

function Player({ icon, name, detail, tag, label, value, active }: { icon: ReactNode; name: string; detail: string; tag?: string; label: string; value: number; active: boolean }) {
  return (
    <div className={`flex items-center gap-12 rounded-xl py-12 pr-16 pl-12 ${active ? "border-[1.5px] border-(--color-bg-brand) bg-brand-subtle" : "bg-surface-secondary"}`}>
      {icon}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-8">
          <span className="type-mobile-label truncate text-primary">{name}</span>
          {tag && <span className="type-table-heading rounded-full bg-brand px-8 py-2 whitespace-nowrap text-on-brand">{tag}</span>}
        </div>
        <span className="type-caption text-secondary">{detail}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="type-table-heading text-secondary">{label}</span>
        <span className="type-subheading text-primary tabular-nums">{value}</span>
      </div>
    </div>
  );
}

const Avatar = ({ children, tone }: { children: ReactNode; tone: "brand" | "violet" }) => (
  <span className={`flex size-40 shrink-0 items-center justify-center rounded-full text-icon-general-primary ${tone === "brand" ? "bg-brand-subtle" : "bg-accent-violet-subtle"}`}>{children}</span>
);

/** Games / Game page (Figma 1239:95379) — board stage + Games / Play panel (Setup → Playing → Result). */
export function GamePlay({ gameKey, stageClass }: { gameKey: GameKey; stageClass: string }) {
  const game = games[gameKey];
  const duel = game.kind === "duel";
  const Game = registry[gameKey];

  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<Mode>(1);
  const [level, setLevel] = useState(1);
  const [side, setSide] = useState(0);
  const [option, setOption] = useState(game.option.initial ?? 0);
  const [time, setTime] = useState(0);
  const [rounds, setRounds] = useState(1);
  const [names, setNames] = useState(["Player 1", "Player 2"]);
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(true);
  const [gameId, setGameId] = useState(0);
  const [report, setReport] = useState<Report>({ moves: 0, stat: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [wins, setWins] = useState<[number, number]>([0, 0]);
  const [draws, setDraws] = useState(0);
  const [actualSide, setActualSide] = useState<0 | 1>(0);
  const [turnPlayer, setTurnPlayer] = useState<0 | 1>(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [played, setPlayed] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [today, setToday] = useState(0);
  const [ctrl, setCtrl] = useState<Controls>({});
  const matchStart = useRef(0);

  useEffect(() => {
    try {
      const preset = sessionStorage.getItem(`game-option-${gameKey}`);
      if (preset !== null) {
        sessionStorage.removeItem(`game-option-${gameKey}`);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time preset from the hub
        setOption(Number(preset));
      }
    } catch {}
    const day = new Date().toISOString().slice(0, 10);
    const t = store.get<{ day: string; n: number }>("games-today", { day, n: 0 });
    setToday(t.day === day ? t.n : 0);
  }, [gameKey]);

  // Game clock
  useEffect(() => {
    if (phase !== "playing" || paused) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase, paused]);

  const countToday = () => {
    const day = new Date().toISOString().slice(0, 10);
    const t = store.get<{ day: string; n: number }>("games-today", { day, n: 0 });
    const n = (t.day === day ? t.n : 0) + 1;
    store.set("games-today", { day, n });
    setToday(n);
  };
  const streak = (won: boolean) => {
    const k = `game-streak-${gameKey}`;
    const v = won ? store.get(k, 0) + 1 : 0;
    store.set(k, v);
    return v;
  };

  const newGame = () => {
    setCtrl({});
    setReport({ moves: 0, stat: 0 });
    setElapsed(0);
    setPaused(false);
    setGameId((n) => n + 1);
  };

  const start = () => {
    setWins([0, 0]);
    setDraws(0);
    setScores([0, 0]);
    setPlayed(0);
    setTurnPlayer(0);
    setActualSide(side === 2 ? (Math.random() < 0.5 ? 0 : 1) : (side as 0 | 1));
    matchStart.current = Date.now();
    newGame();
    setPhase("playing");
  };

  const finish = (r: Result) => {
    countToday();
    setResult(r);
    setPhase("result");
  };

  const matchTime = () => clock(Math.round((Date.now() - matchStart.current) / 1000));

  const onEnd = useCallback(
    (e: DuelEnd | SoloEnd) => {
      if (duel) {
        const { winner } = e as DuelEnd;
        const nextWins: [number, number] = [...wins];
        if (winner === null) setDraws((d) => d + 1);
        else nextWins[winner] += 1;
        setWins(nextWins);
        const need = firstTo(gameKey, option);
        const done = winner !== null ? nextWins[winner] >= need : need === 1;
        if (!done) {
          setTimeout(newGame, 1200);
          return;
        }
        const r = pc.result;
        if (mode === 1) {
          const won = winner === 0;
          const s = streak(won);
          finish({
            eyebrow: r.matchOver,
            title: winner === null ? r.draw : won ? r.youWin : r.youLose,
            body: winner === null ? r.drawBody : won ? r.youWinBody : r.youLoseBody,
            stats: [[r.stats.time, matchTime()], [r.stats.result, winner === null ? r.drawShort : won ? r.win : r.loss], [r.stats.streak, String(s)]],
            primary: r.rematch,
          });
        } else {
          finish({
            eyebrow: r.matchOver,
            title: winner === null ? r.draw : r.playerWins(names[winner]),
            body: winner === null ? r.drawBody : r.playerWinsBody,
            stats: [[r.stats.time, matchTime()], [r.stats.score, `${nextWins[0]}–${nextWins[1]}`], [r.stats.draws, String(draws + (winner === null ? 1 : 0))]],
            primary: r.playAgain,
          });
        }
        return;
      }
      // Solo
      const { won, score } = e as SoloEnd;
      const r = pc.result;
      if (mode === 1) {
        const bestKey = `game-best-${gameKey}`;
        const best = store.get(bestKey, 0);
        // Endless score-chasers always end in a loss, so any higher score is a best; win/lose games only count wins.
        const isBest = score > best && (won || scoreRuns.has(gameKey));
        if (isBest) store.set(bestKey, score);
        const s = streak(won);
        finish({
          eyebrow: r.gameOver,
          title: isBest && score > 0 ? r.best : won ? r.done : r.over,
          body: isBest && score > 0 ? r.bestBody : won ? r.doneBody : r.overBody,
          stats: [[r.stats.time, clock(elapsed)], [r.stats.score, String(score)], [r.stats.streak, String(s)]],
          primary: r.playAgain,
        });
      } else if (mode === 2) {
        const target = (raceTarget[gameKey] ?? 300) * [1.3, 1, 0.7][level];
        const beat = won && elapsed < target;
        const s = streak(beat);
        finish({
          eyebrow: r.raceOver,
          title: beat ? r.raceWin : r.raceLose,
          body: beat ? r.raceWinBody(clock(Math.round(target - elapsed))) : r.raceLoseBody,
          stats: [[r.stats.time, clock(elapsed)], [r.stats.ahead, beat ? clock(Math.round(target - elapsed)) : "—"], [r.stats.streak, String(s)]],
          primary: r.raceAgain,
        });
      } else {
        const total = [1, 3, 5][rounds];
        const nextScores: [number, number] = [...scores];
        nextScores[turnPlayer] += score;
        setScores(nextScores);
        const nextPlayed = played + 1;
        setPlayed(nextPlayed);
        if (nextPlayed < total * 2) {
          setTurnPlayer(turnPlayer === 0 ? 1 : 0);
          setTimeout(newGame, 900);
          return;
        }
        const winner = nextScores[0] === nextScores[1] ? null : nextScores[0] > nextScores[1] ? 0 : 1;
        finish({
          eyebrow: r.matchOver,
          title: winner === null ? r.draw : r.playerWins(names[winner]),
          body: winner === null ? r.drawBody : `${names[winner]} takes the match ${Math.max(...nextScores)}–${Math.min(...nextScores)}. Hand it over for a rematch?`,
          stats: [[r.stats.time, matchTime()], [r.stats.score, `${nextScores[0]}–${nextScores[1]}`], [r.stats.rounds, String(total)]],
          primary: r.playAgain,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reads the latest match state on each game end
    [duel, wins, draws, mode, option, level, elapsed, rounds, scores, turnPlayer, played, names, gameKey]
  );

  // Race: Sdabby finishing first, or the solo time limit running out, ends the game.
  const raceTargetSec = (raceTarget[gameKey] ?? 300) * [1.3, 1, 0.7][level];
  useEffect(() => {
    if (phase !== "playing" || duel) return;
    const out = (mode === 2 && elapsed >= raceTargetSec) || (mode !== 1 && elapsed >= timeLimits[time]);
    if (!out) return;
    const id = setTimeout(() => onEnd({ won: false, score: 0 }), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick-driven check
  }, [elapsed]);

  const resign = () => {
    if (duel && mode === 1) onEnd({ winner: 1 });
    else if (duel) {
      const w = wins[0] === wins[1] ? null : wins[0] > wins[1] ? 0 : 1;
      const r = pc.result;
      finish({ eyebrow: r.matchOver, title: w === null ? r.draw : r.playerWins(names[w]), body: w === null ? r.drawBody : r.playerWinsBody, stats: [[r.stats.time, matchTime()], [r.stats.score, `${wins[0]}–${wins[1]}`], [r.stats.draws, String(draws)]], primary: r.playAgain });
    } else onEnd({ won: false, score: 0 });
  };

  const sides = game.sides ?? ["", ""];
  const playerASide = sides[actualSide];
  const playerBSide = sides[actualSide === 0 ? 1 : 0];
  const p = pc.playing;
  const modes = duel ? pc.duelModes : pc.soloModes;
  const modeIcons = duel ? [<BotIcon key="b" />, <UsersIcon key="u" />, <LinkIcon20 key="l" />] : [<UserIcon key="u" />, <ZapIcon key="z" />, <UsersIcon key="us" />];

  const panel = (
    <section aria-label={game.title} className="flex w-full flex-col gap-20 rounded-card border border-general-default bg-surface-primary p-20">
      {phase === "setup" && (
        <>
          <div className="flex flex-col gap-4">
            <p className="type-eyebrow text-secondary">{pc.setup.eyebrow}</p>
            <h2 className="type-subheading text-primary">{pc.setup.title}</h2>
          </div>
          <div className="flex flex-col gap-8" role="radiogroup" aria-label={pc.setup.title}>
            {modes.map((m, i) => (
              <ModeOption key={m.title} icon={modeIcons[i]} title={m.title} caption={m.caption} selected={mode === i + 1} disabled={duel && i === 2} onClick={() => setMode((i + 1) as Mode)} />
            ))}
          </div>
          <div className="flex flex-col gap-16">
            {duel && mode === 1 && <Chips label={pc.level.label} values={pc.level.values} value={level} onChange={setLevel} />}
            {!duel && mode === 2 && <Chips label={pc.pace.label} values={pc.pace.values} value={level} onChange={setLevel} />}
            {duel && <Chips label={pc.side} values={[sides[0], sides[1], pc.random]} value={side} onChange={setSide} />}
            {!duel && mode === 3 && (
              <div className="flex flex-col gap-8">
                <p className="type-table-heading text-secondary">{pc.players}</p>
                {names.map((n, i) => (
                  <label key={i} className="flex items-center gap-12 rounded-lg border border-general-default p-8">
                    <Avatar tone={i ? "violet" : "brand"}><span className="type-card-title text-brand">{i + 1}</span></Avatar>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <input value={n} onChange={(e) => setNames((prev) => prev.map((x, j) => (j === i ? e.target.value.slice(0, 18) : x)))} className="type-mobile-label w-full bg-transparent text-primary outline-none" aria-label={`Player ${i + 1} name`} />
                      <span className="type-caption text-secondary">{i ? pc.goesSecond : pc.goesFirst}</span>
                    </span>
                    <PencilIcon className="size-16 text-icon-general-primary" />
                  </label>
                ))}
              </div>
            )}
            {!duel && mode === 3 && <Chips label={pc.rounds.label} values={pc.rounds.values} value={rounds} onChange={setRounds} />}
            {(duel || mode === 1) && <Chips label={game.option.label} values={game.option.values} value={option} onChange={setOption} />}
            {!duel && mode !== 1 && <Chips label={pc.time.label} values={pc.time.values} value={time} onChange={setTime} />}
            {!duel && mode !== 3 && (
              <p className="type-caption flex items-center gap-8 text-secondary">
                {mode === 2 ? <ZapIcon className="size-16" /> : <InfoIcon className="size-16" />}
                {mode === 2 ? pc.raceNote : pc.bestNote}
              </p>
            )}
          </div>
          <button type="button" onClick={start} className="type-label h-44 w-full cursor-pointer rounded-full bg-brand text-on-brand transition-colors duration-(--duration-fast) hover:bg-brand-hover">
            {duel ? (mode === 1 ? pc.start.duel1 : pc.start.duel2) : mode === 1 ? pc.start.solo1 : mode === 2 ? pc.start.solo2 : pc.start.solo3}
          </button>
        </>
      )}

      {phase === "playing" && (
        <>
          <div className="flex items-center gap-12">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <p className="type-eyebrow text-secondary">{duel ? p.duelEyebrow[mode - 1] : p.soloEyebrow[mode - 1]}</p>
              <h2 className="type-subheading text-primary">{duel ? p.title : p.soloTitle}</h2>
            </div>
            <span className="type-table-heading flex items-center gap-6 rounded-full bg-status-success-subtle px-10 py-4 text-status-success">
              <span className="size-8 rounded-full bg-(--color-icon-status-success)" />
              {paused ? p.paused.toUpperCase() : p.live}
            </span>
          </div>
          {duel ? (
            <div className="flex flex-col gap-8">
              <Player
                icon={mode === 1 ? <Avatar tone="brand"><UserIcon /></Avatar> : <Avatar tone="brand"><span className="type-card-title text-brand">1</span></Avatar>}
                name={mode === 1 ? p.you : names[0]}
                detail={playerASide}
                tag={report.turn === 0 ? (mode === 1 ? p.yourMove : p.toMove) : undefined}
                label={p.wins}
                value={wins[0]}
                active={report.turn !== 1}
              />
              <Player
                icon={mode === 1 ? <Avatar tone="violet"><BotIcon /></Avatar> : <Avatar tone="violet"><span className="type-card-title text-primary">2</span></Avatar>}
                name={mode === 1 ? p.sdabby : names[1]}
                detail={playerBSide}
                tag={report.turn === 1 ? (mode === 1 ? p.thinking : p.toMove) : undefined}
                label={p.wins}
                value={wins[1]}
                active={report.turn === 1}
              />
            </div>
          ) : mode === 1 ? (
            <div className="flex items-center gap-12 rounded-xl bg-brand-subtle p-12">
              <Avatar tone="brand"><TrophyIcon /></Avatar>
              <div className="flex flex-1 flex-col gap-2">
                <span className="type-mobile-label text-primary">{p.goal}</span>
                <span className="type-caption text-secondary">{p.goalCount(today)}</span>
              </div>
              <div className="h-8 w-80 overflow-clip rounded-full bg-surface-primary">
                <span className="block h-8 rounded-full bg-brand" style={{ width: `${Math.min(1, today / 3) * 100}%` }} />
              </div>
            </div>
          ) : mode === 2 ? (
            <div className="flex flex-col gap-8">
              {[
                { icon: <UserIcon />, name: p.you, detail: p.solving, value: report.progress ?? 0, tone: "brand" as const },
                { icon: <BotIcon />, name: p.sdabby, detail: p.paceDetail[level], value: Math.min(1, elapsed / raceTargetSec), tone: "violet" as const },
              ].map((r) => (
                <div key={r.name} className="flex flex-col gap-8 rounded-xl bg-surface-secondary p-12">
                  <div className="flex items-center gap-12">
                    <Avatar tone={r.tone}>{r.icon}</Avatar>
                    <div className="flex flex-1 flex-col">
                      <span className="type-mobile-label text-primary">{r.name}</span>
                      <span className="type-caption text-secondary">{r.detail}</span>
                    </div>
                    <span className="type-subheading text-primary tabular-nums">{Math.round(r.value * 100)}%</span>
                  </div>
                  <div className="h-6 w-full overflow-clip rounded-full bg-surface-primary">
                    <span className={`block h-6 rounded-full ${r.tone === "brand" ? "bg-brand" : "bg-accent-violet"}`} style={{ width: `${r.value * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {[0, 1].map((i) => (
                <Player
                  key={i}
                  icon={<Avatar tone={i ? "violet" : "brand"}><span className={`type-card-title ${i ? "text-primary" : "text-brand"}`}>{i + 1}</span></Avatar>}
                  name={names[i]}
                  detail={turnPlayer === i ? p.playingNow : p.upNext}
                  tag={turnPlayer === i ? p.turn : undefined}
                  label={p.score}
                  value={scores[i]}
                  active={turnPlayer === i}
                />
              ))}
            </div>
          )}
          <div className="flex gap-8">
            <Stat label={p.moves} value={report.moves} />
            <Stat label={game.stat} value={report.stat} />
            <Stat label={p.time} value={clock(elapsed)} />
          </div>
          <div className="flex gap-8">
            {(duel ? mode === 1 || mode === 2 : mode !== 2) && <Action icon={<UndoIcon />} label={p.undo} onClick={ctrl.undo} />}
            {!(duel && mode === 2) && <Action icon={<LightbulbIcon />} label={p.hint} onClick={ctrl.hint} />}
            <Action icon={paused ? <PlayFilledIcon /> : <PauseIcon />} label={paused ? p.resume : p.pause} onClick={() => setPaused((v) => !v)} />
            {((duel && mode === 2) || (!duel && mode === 2)) && <Action icon={sound ? <VolumeOnIcon /> : <VolumeOffIcon />} label={p.sound} onClick={() => setSound((v) => !v)} />}
          </div>
          <div className="flex flex-col items-center gap-12">
            <div className="flex w-full gap-8">
              <button type="button" onClick={() => { setWins([0, 0]); setScores([0, 0]); setPlayed(0); setTurnPlayer(0); newGame(); }} className="type-label h-44 flex-1 cursor-pointer rounded-full border border-general-primary bg-surface-primary text-primary hover:bg-surface-hover">
                {p.restart}
              </button>
              <button type="button" onClick={resign} className="type-label h-44 flex-1 cursor-pointer rounded-full border border-general-primary bg-surface-primary text-primary hover:bg-surface-hover">
                {duel ? (mode === 1 ? p.resign : p.endMatch) : p.endGame}
              </button>
            </div>
            <button type="button" onClick={() => setPhase("setup")} className="type-label flex cursor-pointer items-center gap-4 text-brand">
              <ChevronLeftIcon className="size-16" />
              {p.changeMode}
            </button>
          </div>
        </>
      )}

      {phase === "result" && result && (
        <>
          <div className="flex flex-col items-center gap-12 pt-8 text-center" aria-live="polite">
            <span className="flex size-72 items-center justify-center rounded-full bg-brand-subtle text-brand">
              <TrophyIcon className="size-32" />
            </span>
            <p className="type-eyebrow text-secondary">{result.eyebrow}</p>
            <h2 className="type-page-title text-primary">{result.title}</h2>
            <p className="type-body text-secondary">{result.body}</p>
          </div>
          <div className="flex gap-8">
            {result.stats.map(([l, v]) => (
              <Stat key={l} label={l} value={v} />
            ))}
          </div>
          <div className="flex flex-col gap-8">
            <button type="button" onClick={start} className="type-label h-44 w-full cursor-pointer rounded-full bg-brand text-on-brand hover:bg-brand-hover">
              {result.primary}
            </button>
            <button type="button" onClick={() => setPhase("setup")} className="type-label h-44 w-full cursor-pointer rounded-full border border-general-primary bg-surface-primary text-primary hover:bg-surface-hover">
              {pc.result.changeMode}
            </button>
          </div>
        </>
      )}
    </section>
  );

  return (
    <>
      <div className={`relative flex w-full items-center justify-center overflow-clip rounded-shell bg-surface-secondary p-16 tablet:min-w-0 tablet:flex-1 [--board:440px] tablet:p-24 tablet:[--board:min(100%,560px,calc(100dvh-220px))] desktop:[--board:min(100%,680px,calc(100dvh-200px))] ${stageClass}`}>
        {phase === "playing" ? (
          <div className="flex size-full items-center justify-center">
            <Game
              key={gameId}
              mode={mode}
              level={level as 0 | 1 | 2}
              side={actualSide}
              option={option as 0 | 1 | 2}
              paused={paused}
              sound={sound}
              onReport={setReport}
              onEnd={onEnd}
              onControls={setCtrl}
            />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- static preview art (Figma Game board image)
          <img src={`/images/games/${gameKey}.webp`} alt="" className="game-board-art max-h-280 w-auto max-w-[280px] object-contain tablet:max-h-440 tablet:max-w-[440px]" />
        )}
        {phase === "playing" && paused && (
          <button type="button" onClick={() => setPaused(false)} className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-8 bg-overlay-scrim text-on-brand backdrop-blur-backdrop">
            <PlayFilledIcon className="size-32" />
            <span className="type-label">{p.resume}</span>
          </button>
        )}
      </div>
      <div className="flex w-full shrink-0 flex-col gap-16 tablet:w-360">{panel}</div>
    </>
  );
}
