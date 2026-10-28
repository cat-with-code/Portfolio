"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { tracks, techniques, vibes, type Technique, type Vibe } from "@/content/study";
import { FocusAudio, toSeconds } from "@/lib/focus-audio";
import { createYouTubePlayer, youTubeId, youTubeThumb, YT_ENDED, YT_PAUSED, YT_PLAYING, type YTPlayer } from "@/lib/youtube";

/** `videoId` and `thumb` are set for YouTube links, which play here (audio only); other links open on their own site. */
export type CustomSong = { id: string; url: string; title: string; source: string; videoId?: string; thumb?: string };
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
  /** 0–1, remembered between visits. */
  volume: number;
  loop: boolean;
  sleep: { minutes: number; endsAt: number | null };
  playlists: Playlist[];
  customSong: CustomSong | null;
  /** The current YouTube video refuses to play embedded; the play button opens it on YouTube instead. */
  blocked: boolean;
};

type StudyContext = Player & {
  playTrack: (vibe: Vibe, index: number) => void;
  chooseVibe: (vibe: Vibe | "custom") => void;
  toggle: () => void;
  stop: () => void;
  skip: (dir: 1 | -1) => void;
  seek: (fraction: number) => void;
  setMuted: (m: boolean) => void;
  setVolume: (v: number) => void;
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
const videoOf = (song: CustomSong) => song.videoId ?? youTubeId(song.url);
/** Only open web links — playlists come from browser storage, which could have been edited. */
const openLink = (url: string) => {
  try {
    if (["http:", "https:"].includes(new URL(url).protocol)) window.open(url, "_blank", "noopener");
  } catch {}
};
/** Audio file for a track, if one has been uploaded (see `Track` in content/study). */
const fileOf = (vibe: Vibe | "custom", index: number) => (vibe === "custom" ? undefined : tracks[vibe][index]?.[2]);
/** The track `dir` steps away: within the vibe when it has several, otherwise the next / previous vibe. */
function step(vibe: Vibe, index: number, dir: 1 | -1): [Vibe, number] {
  const n = tracks[vibe].length;
  if (n > 1) return [vibe, (index + dir + n) % n];
  const i = vibes.findIndex((v) => v.key === vibe);
  return [vibes[(i + dir + vibes.length) % vibes.length].key, 0];
}

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
    volume: 1,
    loop: false,
    sleep: { minutes: 0, endsAt: null },
    playlists: [],
    customSong: null,
    blocked: false,
  });
  const [technique, setTechnique] = useState<Technique>("pomodoro");
  const [sessionsToday, setSessions] = useState(0);

  // Restore preferences after hydration.
  useEffect(() => {
    const muted = read("study-muted", false);
    const volume = read("study-volume", 1);
    // Songs saved before YouTube playback have no video id or thumbnail yet; fill them in from the link.
    const playlists = read<Playlist[]>("study-playlists", []).map((pl) => ({
      ...pl,
      songs: pl.songs.map((song) => {
        const videoId = song.videoId ?? youTubeId(song.url);
        return videoId ? { ...song, videoId, thumb: song.thumb ?? youTubeThumb(videoId) } : song;
      }),
    }));
    const sessions = read<{ day: string; n: number }>("study-sessions", { day: today(), n: 0 });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from localStorage
    setP((prev) => ({ ...prev, muted, volume, playlists }));
    setSessions(sessions.day === today() ? sessions.n : 0);
  }, []);

  useEffect(() => () => engine.current?.dispose(), []);

  const audio = () => (engine.current ??= new FocusAudio());

  // YouTube songs play through one hidden IFrame player, created on first use.
  const ytHost = useRef<HTMLDivElement>(null);
  const yt = useRef<YTPlayer | null>(null);
  const ytReady = useRef<Promise<YTPlayer> | null>(null);
  const latest = useRef(p);
  useEffect(() => {
    latest.current = p;
  });
  useEffect(() => () => yt.current?.destroy(), []);
  const onYouTubeState = useRef<(state: number) => void>(() => {});
  const youtube = () =>
    (ytReady.current ??= createYouTubePlayer(ytHost.current!, {
      onState: (state) => onYouTubeState.current(state),
      onError: () => setP((prev) => (prev.vibe === "custom" ? { ...prev, status: "stopped", blocked: true } : prev)),
    }).then((player) => (yt.current = player)));

  // Uploaded track files play through one <audio> element, created on first use.
  const file = useRef<HTMLAudioElement | null>(null);
  const onTrackEnd = useRef<() => void>(() => {});
  const audioFile = () => {
    if (!file.current) {
      file.current = new Audio();
      file.current.preload = "auto";
      file.current.addEventListener("ended", () => onTrackEnd.current());
    }
    return file.current;
  };
  useEffect(() => () => file.current?.pause(), []);

  const load = useCallback((vibe: Vibe, index: number, autoplay: boolean) => {
    const [title, len, src] = tracks[vibe][index];
    setP((prev) => ({ ...prev, vibe, index, title, duration: toSeconds(len), elapsed: 0, customSong: null, status: autoplay ? "playing" : prev.status === "stopped" ? "stopped" : "paused" }));
    yt.current?.stopVideo();
    file.current?.pause();
    if (!autoplay) {
      engine.current?.stop();
      return;
    }
    if (src) {
      engine.current?.stop();
      const f = audioFile();
      f.src = src;
      f.volume = read("study-volume", 1);
      f.muted = read("study-muted", false);
      void f.play();
      return;
    }
    const a = audio();
    a.setMuted(read("study-muted", false));
    a.setVolume(read("study-volume", 1));
    void a.play(vibe, index);
  }, []);

  const playTrack = useCallback((vibe: Vibe, index: number) => load(vibe, index, true), [load]);

  const chooseVibe = useCallback(
    (vibe: Vibe | "custom") => {
      if (vibe === "custom") {
        engine.current?.stop();
        file.current?.pause();
        yt.current?.stopVideo();
        setP((prev) => ({ ...prev, vibe, status: "stopped", elapsed: 0 }));
        return;
      }
      load(vibe, 0, p.status === "playing");
    },
    [load, p.status]
  );

  const playCustom = useCallback((song: CustomSong) => {
    engine.current?.stop();
    file.current?.pause();
    const id = videoOf(song);
    setP((prev) => ({ ...prev, vibe: "custom", customSong: song, title: song.title, duration: 0, elapsed: 0, blocked: false, status: id ? "playing" : "stopped" }));
    if (!id) {
      openLink(song.url);
      return;
    }
    void youtube().then((player) => {
      player.setVolume(Math.round(latest.current.volume * 100));
      if (latest.current.muted) player.mute();
      else player.unMute();
      player.loadVideoById(id);
    });
  }, []);

  /** The song `dir` steps away in the playlist that holds the current one (wrapping). */
  const nextSong = (dir: 1 | -1) => {
    const { customSong, playlists } = latest.current;
    const list = playlists.find((pl) => pl.songs.some((x) => x.id === customSong?.id))?.songs;
    if (!list || !customSong) return null;
    return list[(list.findIndex((x) => x.id === customSong.id) + dir + list.length) % list.length];
  };

  useEffect(() => {
    onYouTubeState.current = (state) => {
      const cur = latest.current;
      if (cur.vibe !== "custom" || cur.status === "stopped") return;
      if (state === YT_PLAYING) setP((prev) => ({ ...prev, status: "playing" }));
      else if (state === YT_PAUSED) setP((prev) => ({ ...prev, status: "paused" }));
      else if (state === YT_ENDED) {
        const next = cur.loop ? cur.customSong : nextSong(1);
        if (next) playCustom(next);
      }
    };
  });

  const toggle = useCallback(() => {
    if (p.vibe === "custom") {
      const song = p.customSong;
      if (!song) return;
      if (!videoOf(song) || p.blocked) openLink(song.url);
      else if (p.status === "playing") {
        yt.current?.pauseVideo();
        setP((prev) => ({ ...prev, status: "paused" }));
      } else if (p.status === "paused") {
        yt.current?.playVideo();
        setP((prev) => ({ ...prev, status: "playing" }));
      } else playCustom(song);
      return;
    }
    if (fileOf(p.vibe, p.index)) {
      if (p.status === "playing") {
        file.current?.pause();
        setP((prev) => ({ ...prev, status: "paused" }));
      } else if (p.status === "paused" && file.current) {
        void file.current.play();
        setP((prev) => ({ ...prev, status: "playing" }));
      } else load(p.vibe, p.index, true);
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
      a.setVolume(p.volume);
      void a.play(p.vibe, p.index);
      setP((prev) => ({ ...prev, status: "playing", elapsed: 0 }));
    }
  }, [p.vibe, p.customSong, p.blocked, p.status, p.muted, p.volume, p.index, playCustom, load]);

  const stop = useCallback(() => {
    engine.current?.stop();
    file.current?.pause();
    yt.current?.stopVideo();
    setP((prev) => ({ ...prev, status: "stopped", elapsed: 0 }));
  }, []);

  const skip = useCallback(
    (dir: 1 | -1) => {
      if (p.vibe === "custom") {
        const next = nextSong(dir);
        if (next) playCustom(next);
        return;
      }
      const [vibe, index] = step(p.vibe, p.index, dir);
      load(vibe, index, p.status === "playing");
    },
    [load, playCustom, p.vibe, p.index, p.status]
  );

  const seek = useCallback((fraction: number) => {
    const { vibe, index } = latest.current;
    const f = fileOf(vibe, index) ? file.current : null;
    // YouTube and file lengths are only known once they load, so ask the player rather than state.
    const duration = (vibe === "custom" ? Math.floor(yt.current?.getDuration() ?? 0) : f ? Math.floor(f.duration) || 0 : 0) || latest.current.duration;
    const elapsed = Math.round(duration * Math.min(1, Math.max(0, fraction)));
    if (vibe === "custom") yt.current?.seekTo(elapsed, true);
    if (f && file.current) file.current.currentTime = elapsed;
    setP((prev) => ({ ...prev, elapsed, duration }));
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    write("study-muted", muted);
    engine.current?.setMuted(muted);
    if (file.current) file.current.muted = muted;
    if (muted) yt.current?.mute();
    else yt.current?.unMute();
    setP((prev) => ({ ...prev, muted }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    write("study-volume", volume);
    engine.current?.setVolume(volume);
    if (file.current) file.current.volume = volume;
    yt.current?.setVolume(Math.round(volume * 100));
    // Turning the volume up from silence unmutes, like a system volume slider.
    if (volume > 0 && latest.current.muted) {
      write("study-muted", false);
      engine.current?.setMuted(false);
      if (file.current) file.current.muted = false;
      yt.current?.unMute();
      setP((prev) => ({ ...prev, volume, muted: false }));
    } else setP((prev) => ({ ...prev, volume }));
  }, []);

  const setLoop = useCallback((loop: boolean) => setP((prev) => ({ ...prev, loop })), []);
  const setSleep = useCallback((minutes: number) => setP((prev) => ({ ...prev, sleep: { minutes, endsAt: minutes ? Date.now() + minutes * 60_000 : null } })), []);
  const savePlaylists = useCallback((playlists: Playlist[]) => {
    write("study-playlists", playlists);
    setP((prev) => ({ ...prev, playlists }));
  }, []);

  // Track over (generated clock or an uploaded file's "ended"): replay it on Repeat, otherwise play the next one.
  useEffect(() => {
    onTrackEnd.current = () => {
      const cur = latest.current;
      if (cur.vibe === "custom") return;
      const [vibe, index] = cur.loop ? [cur.vibe, cur.index] : step(cur.vibe, cur.index, 1);
      load(vibe, index, true);
    };
  });

  // Playback clock: advance elapsed, move to the next track (or loop), honour the sleep timer.
  useEffect(() => {
    if (p.status !== "playing") return;
    const id = setInterval(() => {
      const cur = latest.current;
      if (cur.sleep.endsAt && Date.now() >= cur.sleep.endsAt) {
        void engine.current?.pause();
        file.current?.pause();
        yt.current?.pauseVideo();
        setP((prev) => ({ ...prev, status: "paused", sleep: { minutes: 0, endsAt: null } }));
        return;
      }
      // YouTube songs and uploaded files keep their own clock and say when they end.
      const player = cur.vibe === "custom" ? yt.current : null;
      const f = fileOf(cur.vibe, cur.index) ? file.current : null;
      if (player) setP((prev) => ({ ...prev, elapsed: Math.floor(player.getCurrentTime()), duration: Math.floor(player.getDuration()) || prev.duration }));
      else if (f) setP((prev) => ({ ...prev, elapsed: Math.floor(f.currentTime), duration: Math.floor(f.duration) || prev.duration }));
      else if (cur.vibe === "custom") return;
      else if (cur.elapsed + 1 < cur.duration) setP((prev) => ({ ...prev, elapsed: prev.elapsed + 1 }));
      else onTrackEnd.current();
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
    () => ({ ...p, playTrack, chooseVibe, toggle, stop, skip, seek, setMuted, setVolume, setLoop, setSleep, savePlaylists, playCustom, technique, setTechnique, sessionsToday, addSession }),
    [p, playTrack, chooseVibe, toggle, stop, skip, seek, setMuted, setVolume, setLoop, setSleep, savePlaylists, playCustom, technique, sessionsToday, addSession]
  );
  return (
    <Ctx.Provider value={value}>
      {children}
      {/* Audio-only YouTube player: kept off-screen at the API's minimum 200×200 size. */}
      <div ref={ytHost} aria-hidden className="pointer-events-none fixed top-0 -left-[10000px] size-200" />
    </Ctx.Provider>
  );
}

export function useStudy() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStudy must be used inside StudyProvider");
  return ctx;
}

export const focusMinutes = (t: Technique) => techniques[t].focus;
