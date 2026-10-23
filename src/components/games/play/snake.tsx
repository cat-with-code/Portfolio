"use client";

import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../types";
import { useSwipe, type SwipeDir } from "./use-swipe";

const N = 18;
type P = [number, number];
const DIR: Record<SwipeDir, P> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

function maze() {
  const walls = new Set<number>();
  for (let x = 4; x < 14; x++) { walls.add(5 * N + x); walls.add(12 * N + x); }
  for (let y = 8; y < 10; y++) { walls.add(y * N + 3); walls.add(y * N + 14); }
  return walls;
}

/** Snake — eat the fruit, grow, don't crash. Classic walls, wrap-around, or a maze. */
export default function Snake({ option, paused, onReport, onEnd, onControls }: GameProps) {
  const wrap = option === 1;
  const [walls] = useState(() => (option === 2 ? maze() : new Set<number>()));
  const [snake, setSnake] = useState<P[]>([[5, 9], [4, 9], [3, 9]]);
  const [fruit, setFruit] = useState<P>([12, 9]);
  const [dead, setDead] = useState(false);
  const [moves, setMoves] = useState(0);
  const dir = useRef<P>([1, 0]);
  const queued = useRef<P[]>([]);
  const ended = useRef(false);

  const turn = (d: SwipeDir) => {
    const v = DIR[d];
    const last = queued.current[queued.current.length - 1] ?? dir.current;
    if (v[0] === -last[0] && v[1] === -last[1]) return;
    if (queued.current.length < 2) queued.current.push(v);
  };
  const swipe = useSwipe(turn, 16);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, SwipeDir> = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" };
      if (!map[e.key]) return;
      e.preventDefault();
      turn(map[e.key]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => onControls({}), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (paused || dead) return;
    const speed = Math.max(70, 150 - snake.length * 2);
    const id = setTimeout(() => {
      if (queued.current.length) dir.current = queued.current.shift()!;
      const [hx, hy] = snake[0];
      let nx = hx + dir.current[0], ny = hy + dir.current[1];
      if (wrap) { nx = (nx + N) % N; ny = (ny + N) % N; }
      const hitWall = nx < 0 || ny < 0 || nx >= N || ny >= N || walls.has(ny * N + nx);
      const hitSelf = snake.slice(0, -1).some(([x, y]) => x === nx && y === ny);
      if (hitWall || hitSelf) { setDead(true); return; }
      const ate = nx === fruit[0] && ny === fruit[1];
      const next: P[] = [[nx, ny], ...snake];
      if (!ate) next.pop();
      else {
        let f: P;
        do f = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)];
        while (next.some(([x, y]) => x === f[0] && y === f[1]) || walls.has(f[1] * N + f[0]));
        setFruit(f);
      }
      setSnake(next);
      setMoves((m) => m + 1);
    }, speed);
    return () => clearTimeout(id);
  }, [snake, paused, dead]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onReport({ moves, stat: snake.length, progress: Math.min(1, (snake.length - 3) / 27) });
    if (dead && !ended.current) {
      ended.current = true;
      setTimeout(() => onEnd({ won: snake.length >= 20, score: (snake.length - 3) * 10 }), 800);
    }
  }, [snake, dead]); // eslint-disable-line react-hooks/exhaustive-deps

  const body = new Map(snake.map(([x, y], i) => [y * N + x, i]));
  return (
    <div className="flex w-full max-w-(--board) flex-col items-center gap-12">
      <div {...swipe} className={`grid aspect-square w-full touch-none gap-px rounded-[16px] bg-[#cfe6d2] p-6 shadow-[0_6px_0_#9cc3a3] ${wrap ? "" : "ring-4 ring-[#2f7a46] ring-inset"}`} style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }} role="img" aria-label={`Snake, length ${snake.length}`}>
        {Array.from({ length: N * N }, (_, i) => {
          const b = body.get(i);
          const isFruit = i === fruit[1] * N + fruit[0];
          return (
            <span
              key={i}
              className={`rounded-[3px] ${b === 0 ? (dead ? "bg-[#e5484d]" : "bg-[#145c2e]") : b !== undefined ? "bg-[#1f8a45]" : walls.has(i) ? "bg-[#5b6472]" : isFruit ? "" : "bg-[#e3f1e5]"}`}
            >
              {isFruit && <span className="block size-full scale-90 rounded-full bg-[#e5484d]" />}
            </span>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-6 tablet:hidden" aria-label="Controls">
        <span />
        <button type="button" aria-label="Up" onClick={() => turn("up")} className="size-44 rounded-lg bg-surface-primary text-primary">▲</button>
        <span />
        <button type="button" aria-label="Left" onClick={() => turn("left")} className="size-44 rounded-lg bg-surface-primary text-primary">◀</button>
        <button type="button" aria-label="Down" onClick={() => turn("down")} className="size-44 rounded-lg bg-surface-primary text-primary">▼</button>
        <button type="button" aria-label="Right" onClick={() => turn("right")} className="size-44 rounded-lg bg-surface-primary text-primary">▶</button>
      </div>
    </div>
  );
}
