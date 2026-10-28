"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, PlaylistIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { useDrawer, useDrawerPayload, useDrawerState } from "@/components/shell/drawer-provider";
import { PanelClose, SidePanel } from "@/components/ui/side-panel";
import { audioCopy as a, tracks, vibes, type Vibe } from "@/content/study";
import { youTubeId, youTubeInfo, youTubeThumb } from "@/lib/youtube";
import { CustomCover, covers } from "./focus-audio";
import { useStudy, type CustomSong, type Playlist } from "./study-provider";
import { uid } from "@/lib/uid";

const CustomArt = covers.custom;
const sourceOf = (url: string) =>
  /youtu\.?be/.test(url) ? "YouTube" : /soundcloud/.test(url) ? "SoundCloud" : /spotify/.test(url) ? "Spotify" : new URL(url).hostname.replace(/^www\./, "");
const validUrl = (v: string) => {
  try {
    return ["http:", "https:"].includes(new URL(v).protocol);
  } catch {
    return false;
  }
};

function EmptyState({ title, hint, action }: { title: string; hint: string; action?: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center gap-8 rounded-lg border border-general-default px-24 py-32 text-center">
      <PlaylistIcon className="size-32 text-icon-general-primary" />
      <p className="type-label text-primary">{title}</p>
      <p className="type-caption text-muted">{hint}</p>
      {action}
    </div>
  );
}

/** Audio / Custom playlists (1018:2540): Empty → Create → Detail ↔ List. Songs are links that open on their own site. */
function CustomPlaylists() {
  const { playlists, savePlaylists, playCustom, customSong, status, stop } = useStudy();
  const [view, setView] = useState<{ mode: "list" | "create" | "detail"; id?: string }>({ mode: "list" });
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [adding, setAdding] = useState(false);
  /** Playlist waiting for "Delete" to be confirmed. */
  const [confirming, setConfirming] = useState<string | null>(null);
  const deletePlaylist = (id: string) => {
    // Deleting the playlist that holds the current song stops it, so the player isn't left on a song that no longer exists.
    if (playlists.find((p) => p.id === id)?.songs.some((x) => x.id === customSong?.id)) stop();
    savePlaylists(playlists.filter((p) => p.id !== id));
    setConfirming(null);
    setView({ mode: "list" });
  };
  const removeSong = (playlistId: string, songId: string) => {
    if (customSong?.id === songId) stop();
    savePlaylists(playlists.map((p) => (p.id === playlistId ? { ...p, songs: p.songs.filter((x) => x.id !== songId) } : p)));
  };
  const confirmBox = (p: Playlist) => (
    <div role="alertdialog" aria-label={c.deletePlaylist} className="flex w-full flex-col gap-12 rounded-lg border border-general-default bg-surface-secondary p-12">
      <p className="type-caption text-primary">{c.confirmDelete(p.name, p.songs.length)}</p>
      <div className="flex justify-end gap-8">
        <button type="button" autoFocus onClick={() => setConfirming(null)} className="type-label h-36 cursor-pointer rounded-shell bg-surface-primary px-16 text-primary hover:bg-surface-hover">
          {c.cancel}
        </button>
        <button type="button" onClick={() => deletePlaylist(p.id)} className="type-label h-36 cursor-pointer rounded-shell bg-(--color-bg-status-error) px-16 text-(--color-text-on-error) hover:opacity-90">
          {c.delete}
        </button>
      </div>
    </div>
  );
  const c = a.customLists;
  const current = playlists.find((p) => p.id === view.id);
  const newButton = (
    <button type="button" onClick={() => setView({ mode: "create" })} className="type-label mt-8 flex h-44 cursor-pointer items-center gap-8 rounded-shell bg-brand px-20 text-on-brand hover:bg-brand-hover">
      <PlusIcon className="size-16" />
      {c.newPlaylist}
    </button>
  );

  if (view.mode === "create")
    return (
      <form
        className="flex w-full flex-col gap-16"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          const p: Playlist = { id: uid(), name: name.trim(), songs: [] };
          savePlaylists([...playlists, p]);
          setName("");
          setView({ mode: "detail", id: p.id });
        }}
      >
        <p className="type-card-title text-primary">{c.newPlaylist}</p>
        <label className="flex flex-col gap-4">
          <span className="type-label text-primary">{c.nameLabel}</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={c.namePlaceholder}
            className="type-body h-48 rounded-lg border border-general-default bg-surface-primary px-16 text-primary outline-none placeholder:text-muted focus:border-(--color-border-interaction-focus)"
          />
        </label>
        <div className="flex justify-end gap-8">
          <button type="button" onClick={() => setView({ mode: "list" })} className="type-label h-44 cursor-pointer rounded-shell bg-surface-secondary px-20 text-primary">
            {c.cancel}
          </button>
          <button type="submit" disabled={!name.trim()} className="type-label h-44 cursor-pointer rounded-shell bg-brand px-20 text-on-brand disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)">
            {c.create}
          </button>
        </div>
      </form>
    );

  if (view.mode === "detail" && current)
    return (
      <div className="flex w-full flex-col gap-12">
        <button type="button" onClick={() => setView({ mode: "list" })} className="type-caption flex w-fit cursor-pointer items-center gap-4 text-brand">
          <ChevronLeftIcon className="size-16" />
          {c.back}
        </button>
        <div className="flex items-center gap-12">
          <CustomArt aria-hidden className="size-48 shrink-0 rounded-[9px]" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="type-card-title truncate text-primary">{current.name}</p>
            <p className="type-caption text-secondary">{current.songs.length ? `${current.songs.length} songs` : c.noSongs}</p>
          </div>
          <button
            type="button"
            aria-label={c.deletePlaylist}
            title={c.deletePlaylist}
            onClick={() => setConfirming(current.id)}
            className="flex size-40 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-secondary text-icon-general-primary hover:bg-surface-hover"
          >
            <TrashIcon />
          </button>
        </div>
        {confirming === current.id && confirmBox(current)}
        <form
          className="flex items-center gap-8"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!validUrl(link) || adding) return;
            const fallback = `${sourceOf(link)} link ${current.songs.length + 1}`;
            let song: CustomSong = { id: uid(), url: link, source: `${sourceOf(link)} · added from link`, title: fallback };
            const videoId = youTubeId(link);
            if (videoId) {
              // YouTube: keep the video's title and thumbnail so the song plays here with its own cover.
              setAdding(true);
              const info = await youTubeInfo(videoId);
              setAdding(false);
              song = { ...song, videoId, thumb: youTubeThumb(videoId), title: info?.title ?? fallback, source: `YouTube · ${info?.author ?? "audio only"}` };
            }
            savePlaylists(playlists.map((p) => (p.id === current.id ? { ...p, songs: [...p.songs, song] } : p)));
            setLink("");
          }}
        >
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder={c.linkPlaceholder}
            inputMode="url"
            className="type-body h-48 min-w-0 flex-1 rounded-lg border border-general-default bg-surface-primary px-16 text-primary outline-none placeholder:text-muted focus:border-(--color-border-interaction-focus)"
          />
          <button type="submit" disabled={!validUrl(link) || adding} className="type-label h-44 cursor-pointer rounded-shell bg-surface-secondary px-20 text-primary disabled:cursor-not-allowed disabled:text-muted">
            {adding ? c.adding : c.add}
          </button>
        </form>
        <p className="type-caption text-muted">{c.linkHint}</p>
        {current.songs.length ? (
          <ol className="flex flex-col">
            {current.songs.map((song, i) => {
              const here = !!(song.videoId ?? youTubeId(song.url));
              const playing = customSong?.id === song.id && (status === "playing" || !here);
              return (
                <li key={song.id} className="group/song flex items-center gap-4">
                  <button type="button" onClick={() => playCustom(song)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-12 rounded-lg px-12 py-8 text-left hover:bg-surface-hover">
                    <span className="type-body w-20 shrink-0 text-secondary">{String(i + 1).padStart(2, "0")}</span>
                    <CustomCover song={song} className="size-44 rounded-md" />
                    <span className="flex min-w-0 flex-1 flex-col gap-2">
                      <span className="type-body truncate text-primary">{song.title}</span>
                      <span className="type-caption truncate text-secondary">{song.source}</span>
                    </span>
                    <span className="type-caption shrink-0 text-brand">{playing ? a.library.playing : here ? c.play : c.open}</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`${c.remove}: ${song.title}`}
                    title={c.remove}
                    onClick={() => removeSong(current.id, song.id)}
                    className="flex size-36 shrink-0 cursor-pointer items-center justify-center rounded-full text-icon-general-primary hover:bg-surface-hover"
                  >
                    <TrashIcon className="size-16" />
                  </button>
                </li>
              );
            })}
          </ol>
        ) : (
          <EmptyState title={c.noSongs} hint={c.songsEmptyHint} />
        )}
      </div>
    );

  if (!playlists.length) return <EmptyState title={c.emptyTitle} hint={c.emptyHint} action={newButton} />;
  return (
    <div className="flex w-full flex-col gap-8">
      {playlists.map((p) =>
        confirming === p.id ? (
          <div key={p.id}>{confirmBox(p)}</div>
        ) : (
          <div key={p.id} className="flex w-full items-center gap-4 rounded-lg border border-general-default pr-8 hover:bg-surface-hover">
            <button type="button" onClick={() => setView({ mode: "detail", id: p.id })} className="flex min-w-0 flex-1 cursor-pointer items-center gap-12 p-12 text-left">
              <CustomArt aria-hidden className="size-48 shrink-0 rounded-[9px]" />
              <span className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="type-body truncate text-primary">{p.name}</span>
                <span className="type-caption text-secondary">{p.songs.length ? `${p.songs.length} songs` : c.noSongs}</span>
              </span>
              <ChevronRightIcon className="size-16 shrink-0 text-icon-general-primary" />
            </button>
            <button
              type="button"
              aria-label={`${c.deletePlaylist}: ${p.name}`}
              title={c.deletePlaylist}
              onClick={() => setConfirming(p.id)}
              className="flex size-36 shrink-0 cursor-pointer items-center justify-center rounded-full text-icon-general-primary hover:bg-surface-primary"
            >
              <TrashIcon className="size-16" />
            </button>
          </div>
        )
      )}
      <button type="button" onClick={() => setView({ mode: "create" })} className="type-label flex h-46 cursor-pointer items-center gap-8 rounded-lg border border-general-strong px-12 text-brand hover:bg-surface-hover">
        <PlusIcon className="size-16" />
        {c.newPlaylist}
      </button>
    </div>
  );
}

/** Music library drawer — Audio / Track library (523:11967): browse the five vibes, or your own playlists. */
export function MusicDrawer({ closeLabel }: { closeLabel: string }) {
  const state = useDrawerState("study-music");
  const opened = useDrawerPayload("study-music") as Vibe | "custom" | null;
  const { setOpen } = useDrawer();
  const { playTrack, vibe: current, index, status } = useStudy();
  const [tab, setTab] = useState<Vibe | "custom">(opened ?? "lofi");
  const [lastOpened, setLastOpened] = useState(opened);
  if (opened !== lastOpened) {
    setLastOpened(opened);
    if (opened) setTab(opened);
  }
  const label = tab === "custom" ? a.custom : vibes.find((v) => v.key === tab)!.label;
  return (
    <SidePanel {...state} title={a.library.title} className="inset-8 gap-16 bg-surface-primary p-24 tablet:inset-y-24 tablet:right-24 tablet:left-auto tablet:w-640">
      <div className="flex w-full shrink-0 items-start gap-16">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="type-page-title text-primary">{a.library.title}</p>
          <p className="type-caption text-secondary">{a.library.body}</p>
        </div>
        <PanelClose aria-label={closeLabel} className="flex size-44 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-secondary text-icon-general-primary">
          <CloseIcon />
        </PanelClose>
      </div>
      <div className="flex w-full shrink-0 items-start gap-8 overflow-x-auto [scrollbar-width:none]" role="tablist">
        {[...vibes.map((v) => ({ key: v.key as Vibe | "custom", label: v.label })), { key: "custom" as const, label: a.custom }].map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`type-caption flex h-36 shrink-0 cursor-pointer items-center gap-4 rounded-full px-16 ${tab === t.key ? "bg-brand text-on-brand" : "bg-surface-primary text-primary hover:bg-surface-hover"}`}
          >
            {t.label}
            {t.key === "custom" && <span aria-hidden className={`size-6 rounded-full ${tab === "custom" ? "bg-(--color-icon-on-brand)" : "bg-brand"}`} />}
          </button>
        ))}
      </div>
      <p className="type-label shrink-0 text-primary">{tab === "custom" ? a.customLists.count : tracks[tab].length > 1 ? `${label} · ${tracks[tab].length} tracks` : `${label} · ${a.collection}`}</p>
      <div className="flex min-h-0 w-full flex-1 flex-col gap-8 overflow-y-auto [scrollbar-width:none]">
        {tab === "custom" ? (
          <CustomPlaylists />
        ) : (
          tracks[tab].map(([title, len], i) => {
            const active = current === tab && index === i;
            return (
              <button
                key={title}
                type="button"
                onClick={() => { playTrack(tab, i); setOpen(null); }}
                className="flex h-60 w-full shrink-0 cursor-pointer items-center gap-12 rounded-lg px-12 text-left transition-colors duration-(--duration-fast) hover:bg-surface-hover"
              >
                <span className="type-label text-secondary tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex min-w-0 flex-1 flex-col gap-4">
                  <span className="type-body truncate text-primary">{title}</span>
                  <span className="type-caption text-secondary">{`${label} · ${a.collection}`}</span>
                </span>
                <span className="type-caption text-secondary">{len}</span>
                <span className="type-caption w-44 text-right text-brand">{active && status === "playing" ? a.library.playing : a.library.select}</span>
              </button>
            );
          })
        )}
      </div>
    </SidePanel>
  );
}
