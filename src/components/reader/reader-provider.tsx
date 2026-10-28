"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useStudy } from "@/components/study/study-provider";
import { chunks, estimate, pickVoice, SPEEDS, WPS, words, readSpeed } from "@/lib/speech";

export type ReaderLabels = { idleMeta: string; playing: string; play: string; pause: string };
type Session = { id: string; title: string; text: string; lang: string; labels: ReaderLabels; href: string };
type State = "idle" | "playing" | "paused";

type ReaderContext = {
  supported: boolean;
  /** What is being read (or was last read), with the page it started on. */
  session: Session | null;
  state: State;
  elapsed: number;
  total: number;
  speed: number;
  start: (s: Omit<Session, "href">) => void;
  toggle: () => void;
  stop: () => void;
  cycleSpeed: () => void;
  /** Ids of the TextReaders on screen; the floating reader shows only when the one speaking isn't. */
  mounted: ReadonlySet<string>;
  mount: (id: string) => () => void;
  /** Which floating box wins when both the reader and the music could show: whichever was played last. */
  front: "reader" | "music";
};

const Ctx = createContext<ReaderContext | null>(null);
const subscribeNothing = () => () => {};

/**
 * One speech session for the whole site, so reading carries on when you leave the page (see FloatingReader).
 * Must sit inside StudyProvider: starting to read pauses the focus music.
 */
export function ReaderProvider({ children }: { children: ReactNode }) {
  const supported = useSyncExternalStore(subscribeNothing, () => "speechSynthesis" in window, () => true);
  const music = useStudy();
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<State>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [mounted, setMounted] = useState<ReadonlySet<string>>(new Set());
  const [front, setFront] = useState<"reader" | "music">("music");
  /** Bumped on every (re)start, so events from cancelled utterances are ignored. */
  const run = useRef(0);
  /** Chunk being spoken, so a speed change can pick up from there. */
  const at = useRef(0);
  const total = session ? estimate(session.text, speed) : 0;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from localStorage
    setSpeed(readSpeed());
    if (!("speechSynthesis" in window)) return;
    // Chrome loads voices asynchronously; ask early so the best one is ready by the first tap.
    speechSynthesis.getVoices();
    // Some browsers keep talking after a reload; stop with the page.
    const end = () => speechSynthesis.cancel();
    window.addEventListener("pagehide", end);
    return () => {
      window.removeEventListener("pagehide", end);
      end();
    };
  }, []);

  useEffect(() => {
    if (state !== "playing") return;
    const id = setInterval(() => setElapsed((e) => Math.min(total, e + 1)), 1000);
    return () => clearInterval(id);
  }, [state, total]);

  /** Queues `s.text` from chunk `from` at `rate`. */
  const speak = useCallback((s: Omit<Session, "href">, from: number, rate: number) => {
    speechSynthesis.cancel();
    // Safari stays paused after cancel(), which would hold the new queue too.
    if (speechSynthesis.paused) speechSynthesis.resume();
    const id = ++run.current;
    const voice = pickVoice(s.lang);
    const list = chunks(s.text);
    let before = list.slice(0, from).reduce((n, c) => n + words(c), 0);
    list.slice(from).forEach((c, k) => {
      const i = from + k;
      const wordsBefore = before;
      before += words(c);
      const u = new SpeechSynthesisUtterance(c);
      u.lang = voice?.lang ?? s.lang;
      if (voice) u.voice = voice;
      u.rate = rate;
      u.onstart = () => {
        if (run.current !== id) return;
        at.current = i;
        setElapsed(Math.round(wordsBefore / (WPS * rate)));
      };
      if (i === list.length - 1)
        u.onend = () => {
          if (run.current !== id) return;
          setState("idle");
          setElapsed(0);
        };
      speechSynthesis.speak(u);
    });
  }, []);

  // Only one plays at a time. Reading aloud pauses the music (it can be resumed from the player)…
  const { status: musicStatus, toggle: toggleMusic } = music;
  const pauseMusic = useCallback(() => {
    setFront("reader");
    if (musicStatus === "playing") toggleMusic();
  }, [musicStatus, toggleMusic]);
  // …and playing music pauses the reader.
  const reading = useRef(state);
  useEffect(() => {
    reading.current = state;
  });
  useEffect(() => {
    if (musicStatus !== "playing") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- follows the music player, which lives in StudyProvider
    setFront("music");
    if (reading.current === "playing") {
      speechSynthesis.pause();
      setState("paused");
    }
  }, [musicStatus]);

  const start = useCallback(
    (s: Omit<Session, "href">) => {
      if (!supported) return;
      pauseMusic();
      at.current = 0;
      speak(s, 0, speed);
      setSession({ ...s, href: window.location.pathname });
      setElapsed(0);
      setState("playing");
    },
    [supported, pauseMusic, speak, speed]
  );

  const toggle = useCallback(() => {
    if (!session) return;
    if (state === "playing") {
      speechSynthesis.pause();
      setState("paused");
    } else if (state === "paused" && speechSynthesis.paused) {
      pauseMusic();
      speechSynthesis.resume();
      setState("playing");
    } else start(session);
  }, [session, state, start, pauseMusic]);

  const stop = useCallback(() => {
    run.current++;
    speechSynthesis.cancel();
    setState("idle");
    setElapsed(0);
  }, []);

  const cycleSpeed = useCallback(() => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(next);
    try {
      localStorage.setItem("reading-speed", String(next));
    } catch {}
    // The browser can't change the rate of a queued utterance: restart from the current sentence.
    if (session && state !== "idle") {
      if (state === "paused") pauseMusic();
      speak(session, at.current, next);
      setState("playing");
    }
  }, [speed, session, state, speak, pauseMusic]);

  const mount = useCallback((id: string) => {
    setMounted((m) => new Set(m).add(id));
    return () =>
      setMounted((m) => {
        const next = new Set(m);
        next.delete(id);
        return next;
      });
  }, []);

  const value = useMemo<ReaderContext>(
    () => ({ supported, session, state, elapsed, total, speed, start, toggle, stop, cycleSpeed, mounted, mount, front }),
    [supported, session, state, elapsed, total, speed, start, toggle, stop, cycleSpeed, mounted, mount, front]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Whether the reader could float: it is reading (or paused) and its TextReader isn't on screen. */
export function useReaderCanFloat() {
  const { session, state, mounted } = useReader();
  return !!session && state !== "idle" && !mounted.has(session.id);
}

export function useReader() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useReader must be used inside ReaderProvider");
  return ctx;
}
