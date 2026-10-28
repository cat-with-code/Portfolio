/**
 * YouTube links for custom playlists: read the video id, its thumbnail and title, and play the audio
 * through a hidden IFrame Player (https://developers.google.com/youtube/iframe_api_reference).
 */

/** watch?v=, youtu.be/, /shorts/, /embed/, /live/ and music.youtube.com links → 11-character id. */
export function youTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^(www|m|music)\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
    else if (host === "youtube.com" || host === "youtube-nocookie.com") id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/]+)/)?.[1] ?? null;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** 16:9 thumbnail with no letterbox bars (hqdefault pads 16:9 videos with black bands), so it crops cleanly to a square. */
export const youTubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

/** Video title and channel via oEmbed (no API key); null when the video is private or offline. */
export async function youTubeInfo(id: string): Promise<{ title: string; author: string } | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string; author_name?: string };
    return data.title ? { title: data.title, author: data.author_name ?? "YouTube" } : null;
  } catch {
    return null;
  }
}

// ── IFrame Player API (only the parts the study player uses) ──

export type YTPlayer = {
  loadVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  mute: () => void;
  setVolume: (volume: number) => void;
  unMute: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      width: number;
      height: number;
      playerVars: Record<string, number>;
      events: { onReady: () => void; onStateChange: (e: { data: number }) => void; onError: (e: { data: number }) => void };
    }
  ) => YTPlayer;
};
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** Player states from the API. */
export const YT_ENDED = 0;
export const YT_PLAYING = 1;
export const YT_PAUSED = 2;

let api: Promise<YTNamespace> | null = null;
function loadApi() {
  return (api ??= new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT!);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  }));
}

/** Creates a player inside `host` (React never renders into it). */
export async function createYouTubePlayer(host: HTMLElement, events: { onState: (state: number) => void; onError: () => void }) {
  const YT = await loadApi();
  const el = document.createElement("div");
  host.replaceChildren(el);
  return new Promise<YTPlayer>((resolve) => {
    const player = new YT.Player(el, {
      width: 200,
      height: 200,
      playerVars: { playsinline: 1, controls: 0, disablekb: 1, rel: 0 },
      events: { onReady: () => resolve(player), onStateChange: (e) => events.onState(e.data), onError: events.onError },
    });
  });
}
