"use client";

import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../types";

type Card = { s: 0 | 1 | 2 | 3; r: number; up: boolean }; // ♠ ♥ ♦ ♣
type State = { stock: Card[]; waste: Card[]; found: Card[][]; tab: Card[][]; passes: number };
type Src = { from: "waste" } | { from: "tab"; col: number; idx: number } | { from: "found"; pile: number };
type Move = { src: Src; to: { found: number } | { tab: number } };

const SUIT = ["♠", "♥", "♦", "♣"];
const red = (c: Card) => c.s === 1 || c.s === 2;
const RANK = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function deal(): State {
  const deck: Card[] = [];
  for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) deck.push({ s: s as Card["s"], r, up: false });
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  const tab: Card[][] = Array.from({ length: 7 }, (_, c) => deck.splice(0, c + 1).map((card, i) => ({ ...card, up: i === c })));
  return { stock: deck, waste: [], found: [[], [], [], []], tab, passes: 0 };
}
const clone = (s: State): State => ({ stock: [...s.stock], waste: [...s.waste], found: s.found.map((f) => [...f]), tab: s.tab.map((t) => [...t]), passes: s.passes });

const canFound = (card: Card, pile: Card[]) => (pile.length ? pile[pile.length - 1].s === card.s && pile[pile.length - 1].r === card.r - 1 : card.r === 1);
const canTab = (card: Card, col: Card[]) => {
  const top = col[col.length - 1];
  return top ? top.up && red(top) !== red(card) && top.r === card.r + 1 : card.r === 13;
};

function cardsOf(s: State, src: Src): Card[] {
  if (src.from === "waste") return s.waste.length ? [s.waste[s.waste.length - 1]] : [];
  if (src.from === "found") return s.found[src.pile].length ? [s.found[src.pile][s.found[src.pile].length - 1]] : [];
  return s.tab[src.col].slice(src.idx);
}

function apply(s: State, m: Move): State {
  const n = clone(s);
  let moving: Card[];
  if (m.src.from === "waste") moving = [n.waste.pop()!];
  else if (m.src.from === "found") moving = [n.found[m.src.pile].pop()!];
  else {
    moving = n.tab[m.src.col].splice(m.src.idx);
    const col = n.tab[m.src.col];
    if (col.length && !col[col.length - 1].up) col[col.length - 1] = { ...col[col.length - 1], up: true };
  }
  if ("found" in m.to) n.found[m.to.found].push(...moving);
  else n.tab[m.to.tab].push(...moving);
  return n;
}

/** Best target for the cards at `src`: a foundation first (single card), then a tableau column. */
function targetFor(s: State, src: Src): Move | null {
  const cards = cardsOf(s, src);
  if (!cards.length || !cards[0].up) return null;
  if (cards.length === 1 && src.from !== "found") for (let f = 0; f < 4; f++) if (canFound(cards[0], s.found[f])) return { src, to: { found: f } };
  const order = [...Array(7).keys()].sort((a, b) => (s.tab[a].length ? 0 : 1) - (s.tab[b].length ? 0 : 1));
  for (const c of order) {
    if (src.from === "tab" && src.col === c) continue;
    if (cards[0].r === 13 && src.from === "tab" && src.idx === 0 && !s.tab[c].length) continue; // pointless king shuffle
    if (canTab(cards[0], s.tab[c])) return { src, to: { tab: c } };
  }
  return null;
}

function anyMove(s: State): Move | null {
  const srcs: Src[] = [{ from: "waste" }];
  s.tab.forEach((col, c) => col.forEach((card, i) => card.up && srcs.push({ from: "tab", col: c, idx: i })));
  for (const src of srcs) {
    const m = targetFor(s, src);
    if (m && !(src.from === "tab" && "tab" in m.to && src.idx > 0 && s.tab[src.col][src.idx - 1].up)) return m;
  }
  return null;
}

/** Solitaire (Klondike) — click a card to move it to the best spot; click the stock to draw. */
export default function Solitaire({ option, paused, onReport, onEnd, onControls }: GameProps) {
  const draw = option === 0 ? 1 : 3;
  const vegas = option === 2;
  const [s, setS] = useState<State>(deal);
  const [history, setHistory] = useState<State[]>([]);
  const [hint, setHint] = useState<Move | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const ended = useRef(false);
  const inFound = s.found.reduce((n, f) => n + f.length, 0);
  const vegasScore = inFound * 5 - 52;

  const commit = (n: State) => { setHistory((h) => [...h, s]); setS(n); setHint(null); };

  const drawStock = () => {
    if (paused) return;
    if (s.stock.length) {
      const n = clone(s);
      const take = n.stock.splice(-draw).reverse().map((c) => ({ ...c, up: true }));
      n.waste.push(...take);
      commit(n);
    } else if (s.waste.length && (!vegas || s.passes < 2)) {
      const n = clone(s);
      n.stock = n.waste.reverse().map((c) => ({ ...c, up: false }));
      n.waste = [];
      n.passes++;
      commit(n);
    }
  };
  const tryMove = (src: Src, key: string) => {
    if (paused) return;
    const m = targetFor(s, src);
    if (m) commit(apply(s, m));
    else { setShake(key); setTimeout(() => setShake(null), 300); }
  };

  useEffect(() => {
    onReport({ moves: history.length, stat: vegas ? `$${vegasScore}` : `${inFound}/52`, progress: inFound / 52 });
    if (inFound === 52 && !ended.current) {
      ended.current = true;
      setTimeout(() => onEnd({ won: true, score: vegas ? vegasScore : Math.max(52, 520 - history.length) }), 600);
    }
  }, [s]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onControls({
      undo: history.length ? () => { setS(history[history.length - 1]); setHistory((h) => h.slice(0, -1)); } : undefined,
      hint: () => setHint(anyMove(s)),
    });
  }, [history, s]); // eslint-disable-line react-hooks/exhaustive-deps

  const face = (c: Card, extra = "") => (
    <span className={`flex h-full w-full flex-col justify-between rounded-[6px] border border-[#cfd5df] bg-[#fff] p-[3px] text-[clamp(9px,2.6vw,14px)] leading-none font-bold shadow-[0_2px_0_rgb(0_0_0/0.15)] ${red(c) ? "text-[#d63a3f]" : "text-[#1d2433]"} ${extra}`}>
      <span>{RANK[c.r]}{SUIT[c.s]}</span>
      <span className="self-end text-[1.4em]">{SUIT[c.s]}</span>
    </span>
  );
  const back = <span className="block h-full w-full rounded-[6px] border-2 border-[#fff] bg-[repeating-linear-gradient(45deg,#2b62c9_0_4px,#3a74de_4px_8px)] shadow-[0_2px_0_rgb(0_0_0/0.15)]" />;
  const slot = (label = "") => <span className="flex h-full w-full items-center justify-center rounded-[6px] border-2 border-dashed border-[#fff]/40 text-[14px] text-[#fff]/60">{label}</span>;
  const isHint = (src: Src) => hint && JSON.stringify(hint.src) === JSON.stringify(src);
  const wasteTop = s.waste.slice(-Math.min(draw, s.waste.length));

  return (
    <div className="flex w-full max-w-(--board) flex-col gap-10 rounded-[16px] bg-[#1f7a4a] p-10 shadow-[0_6px_0_#145c36]">
      <div className="grid grid-cols-7 gap-6">
        <button type="button" onClick={drawStock} aria-label={`Stock, ${s.stock.length} cards`} className="aspect-[5/7] cursor-pointer">
          {s.stock.length ? back : slot(vegas && s.passes >= 2 ? "✕" : "↺")}
        </button>
        <div className="relative col-span-2 aspect-[10/7]">
          {wasteTop.map((c, i) => {
            const top = i === wasteTop.length - 1;
            return (
              <button
                key={`${c.s}-${c.r}`}
                type="button"
                disabled={!top}
                onClick={() => tryMove({ from: "waste" }, "waste")}
                aria-label={top ? `Waste: ${RANK[c.r]} of ${SUIT[c.s]}` : undefined}
                className={`absolute top-0 aspect-[5/7] w-[46%] ${top ? "cursor-pointer" : ""} ${shake === "waste" && top ? "animate-[shake_0.3s]" : ""}`}
                style={{ left: `${i * 18}%` }}
              >
                {face(c, isHint({ from: "waste" }) && top ? "ring-4 ring-[#f5c400]" : "")}
              </button>
            );
          })}
          {!s.waste.length && <span className="absolute top-0 left-0 aspect-[5/7] w-[46%]">{slot()}</span>}
        </div>
        {s.found.map((f, i) => (
          <span key={i} className="aspect-[5/7]" aria-label={`Foundation ${i + 1}, ${f.length} cards`}>
            {f.length ? face(f[f.length - 1]) : slot(SUIT[i])}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-6">
        {s.tab.map((col, c) => (
          <div key={c} className="relative min-h-[110px]" style={{ height: `calc(${Math.max(1, col.length - 1)} * clamp(14px, 4.4vw, 22px) + clamp(56px, 13vw, 78px))` }}>
            {!col.length && <span className="absolute top-0 left-0 aspect-[5/7] w-full">{slot("K")}</span>}
            {col.map((card, i) => (
              <button
                key={`${card.s}-${card.r}`}
                type="button"
                disabled={!card.up}
                onClick={() => tryMove({ from: "tab", col: c, idx: i }, `${c}-${i}`)}
                aria-label={card.up ? `${RANK[card.r]} of ${SUIT[card.s]}` : "Face-down card"}
                className={`absolute left-0 aspect-[5/7] w-full ${card.up ? "cursor-pointer" : ""} ${shake === `${c}-${i}` ? "animate-[shake_0.3s]" : ""}`}
                style={{ top: `calc(${i} * clamp(14px, 4.4vw, 22px))` }}
              >
                {card.up ? face(card, isHint({ from: "tab", col: c, idx: i }) ? "ring-4 ring-[#f5c400]" : "") : back}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
