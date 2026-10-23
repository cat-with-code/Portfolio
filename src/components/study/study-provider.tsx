"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { tracks, techniques, type Technique, type Vibe } from "@/content/study";
import { FocusAudio, toSeconds } from "@/lib/focus-audio";

export type CustomSong = { id: string; url: string; title: string; source: string };
export type Playlist = { id: string; name: string; songs: CustomSong[] };
type Status = "stopped" | "playing" | "paused";

type Player = {
  vibe: Vibe | "custom";
  index: number;
  status: Status;
  elapsed: number;
  duration: number;
  title: string;
  muted: boolean;
  loop: boolean;
  sleep: { minutes: number; endsAt: number | null };
  playlists: Playlist[];
  customSong: CustomSong | null;
};

type StudyContext = Player & {
  playTrack: (vibe: Vibe, index: number) => void;
  chooseVibe: (vibe: Vibe | "custom") => void;
  toggle: () => void;
  stop: () => void;
  skip: (dir: 1 | -1) => void;
  seek: (fraction: number) => void;
  setMuted: (m: boolean) => void;
  setLoop: (l: boolean) => void;
  setSleep: (minutes: number) => void;
  savePlaylists: (p: Playlist[]) => void;
  playCustom: (song: CustomSong) => void;
  // Focus sessions
  technique: Technique;
  setTechnique: (t: Technique) => void;
  sessionsToday: number;
  addSession: () => void;
};

const Ctx = createContext<StudyContext | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};
const today = () => new Date().toISOString().slice(0, 10);

/** Shared state for the Study page: the generated-music player and today's focus sessions. */
export function StudyProvider({ children }: { children: ReactNode }) {
  const engine = useRef<FocusAudio | null>(null);
  const [p, setP] = useState<Player>({
    vibe: "lofi",
    index: 0,
    status: "stopped",
    elapsed: 0,
    duration: toSeconds(tracks.lofi[0][1]),
    title: tracks.lofi[0][0],
    muted: false,
    loop: false,
    sleep: { minutes: 0, endsAt: null },
    playlists: [],
    customSong: null,
  });
  const [technique, setTechnique] = useState<Technique>("pomodoro");
  const [sessionsToday, setSessions] = useState(0);

  // Restore preferences after hydration.
  useEffect(() => {
    const muted = read("study-muted", false);
    const playlists = read<Playlist[]>("study-playlists", []);
    const sessions = read<{ day: string; n: number }>("study-sessions", { day: today(), n: 0 });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from localStorage
    setP((prev) => ({ ...prev, muted, playlists }));
    setSessions(sessions.day === today() ? sessions.n : 0);
  }, []);

  useEffect(() => () => engine.current?.dispose(), []);

  const audio = () => (engine.current ??= new FocusAudio());

  const load = useCallback((vibe: Vibe, index: number, autoplay: boolean) => {
    const [title, len] = tracks[vibe][index];
    setP((prev) => ({ ...prev, vibe, index, title, duration: toSeconds(len), elapsed: 0, customSong: null, status: autoplay ? "playing" : prev.status === "stopped" ? "stopped" : "paused" }));
    if (autoplay) {
      const a = audio();
      a.setMuted(read("study-muted", false));
      void a.play(vibe, index);
    } else engine.current?.stop();
  }, []);

  const playTrack = useCallback((vibe: Vibe, index: number) => load(vibe, index, true), [load]);

  const chooseVibe = useCallback(
    (vibe: Vibe | "custom") => {
      if (vibe === "custom") {
        engine.current?.stop();
        setP((prev) => ({ ...prev, vibe, status: "stopped", elapsed: 0 }));
        return;
      }
      load(vibe, 0, p.status === "playing");
    },
    [load, p.status]
  );

  const toggle = useCallback(() => {
    if (p.vibe === "custom") {
      if (p.customSong) window.open(p.customSong.url, "_blank", "noopener");
      return;
    }
    const a = audio();
    if (p.status === "playing") {
      void a.pause();
      setP((prev) => ({ ...prev, status: "paused" }));
    } else if (p.status === "paused") {
      void a.resume();
      setP((prev) => ({ ...prev, status: "playing" }));
    } else {
      a.setMuted(p.muted);
      void a.play(p.vibe, p.index);
      setP((prev) => ({ ...prev, status: "playing", elapsed: 0 }));
    }
  }, [p.vibe, p.customSong, p.status, p.muted, p.index]);

  const stop = useCallback(() => {
    engine.current?.stop();
    setP((prev) => ({ ...prev, status: "stopped", elapsed: 0 }));
  }, []);

  const skip = useCallback(
    (dir: 1 | -1) => {
      if (p.vibe === "custom") return;
      load(p.vibe, (p.index + dir + 8) % 8, p.status === "playing");
    },
    [load, p.vibe, p.index, p.status]
  );

  const seek = useCallback((fraction: number) => setP((prev) => ({ ...prev, elapsed: Math.round(prev.duration * Math.min(1, Math.max(0, fraction))) })), []);

  const setMuted = useCallback((muted: boolean) => {
    write("study-muted", muted);
    engine.current?.setMuted(muted);
    setP((prev) => ({ ...prev, muted }));
  }, []);

  const setLoop = useCallback((loop: boolean) => setP((prev) => ({ ...prev, loop })), []);
  const setSleep = useCallback((minutes: number) => setP((prev) => ({ ...prev, sleep: { minutes, endsAt: minutes ? Date.now() + minutes * 60_000 : null } })), []);
  const savePlaylists = useCallback((playlists: Playlist[]) => {
    write("study-playlists", playlists);
    setP((prev) => ({ ...prev, playlists }));
  }, []);
  const playCustom = useCallback((song: CustomSong) => {
    engine.current?.stop();
    setP((prev) => ({ ...prev, vibe: "custom", customSong: song, title: song.title, duration: 0, elapsed: 0, status: "stopped" }));
    window.open(song.url, "_blank", "noopener");
  }, []);

  // Playback clock: advance elapsed, move to the next track (or loop), honour the sleep timer.
  useEffect(() => {
    if (p.status !== "playing") return;
    const id = setInterval(() => {
      setP((prev) => {
        if (prev.sleep.endsAt && Date.now() >= prev.sleep.endsAt) {
          void engine.current?.pause();
          return { ...prev, status: "paused", sleep: { minutes: 0, endsAt: null } };
        }
        if (prev.elapsed + 1 < prev.duration) return { ...prev, elapsed: prev.elapsed + 1 };
        if (prev.vibe === "custom") return prev;
        const index = prev.loop ? prev.index : (prev.index + 1) % 8;
        void engine.current?.play(prev.vibe, index);
        const [title, len] = tracks[prev.vibe][index];
        return { ...prev, index, title, duration: toSeconds(len), elapsed: 0 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [p.status]);

  const addSession = useCallback(() => {
    setSessions((n) => {
      write("study-sessions", { day: today(), n: n + 1 });
      return n + 1;
    });
  }, []);

  const value = useMemo<StudyContext>(
    () => ({ ...p, playTrack, chooseVibe, toggle, stop, skip, seek, setMuted, setLoop, setSleep, savePlaylists, playCustom, technique, setTechnique, sessionsToday, addSession }),
    [p, playTrack, chooseVibe, toggle, stop, skip, seek, setMuted, setLoop, setSleep, savePlaylists, playCustom, technique, sessionsToday, addSession]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudy() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStudy must be used inside StudyProvider");
  return ctx;
}

export const focusMinutes = (t: Technique) => techniques[t].focus;
