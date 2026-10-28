"use client";

import { useState } from "react";
import { LinkIcon } from "@/components/icons";
import { Chip } from "@/components/ui/chip";
import { dialogsCopy as d, gamesCopy as c } from "@/content/dashboard";
import { Rows, type ContentRow } from "./content-list";
import { SaveNote, TextField } from "./editor";
import { Modal } from "./modal";

const validUrl = (v: string) => {
  try {
    return ["http:", "https:"].includes(new URL(v).protocol);
  } catch {
    return false;
  }
};

/** Dashboard / Games body (Figma 1363:2892): All / Mobile ready filter, one Content row per game, Add game link dialog (1371:4420). */
export function GamesList({ games }: { games: { key: string; title: string; section: string; image: string; linked: boolean }[] }) {
  const [mobileOnly, setMobileOnly] = useState(false);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [linking, setLinking] = useState<{ key: string; title: string } | null>(null);
  const [url, setUrl] = useState("");
  const mobile = (key: string) => c.mobileReady.includes(key);
  const rows: ContentRow[] = games
    .filter((g) => !mobileOnly || mobile(g.key))
    .map((g) => {
      const linked = g.linked || !!links[g.key];
      return {
        key: g.key,
        title: g.title,
        meta: g.section,
        info: mobile(g.key) ? c.devices.all : c.devices.large,
        thumb: g.image,
        badge: linked ? { label: c.linked, tone: "success" } : { label: c.noLink, tone: "warning" },
        href: "",
        action: c.addLink,
        actionIcon: <LinkIcon className="size-20" />,
      };
    });
  return (
    <>
      <div role="group" aria-label="Filter" className="flex max-w-full gap-8 overflow-x-auto [scrollbar-width:none]">
        <Chip selected={!mobileOnly} onClick={() => setMobileOnly(false)}>{`${c.filters.all} · ${games.length}`}</Chip>
        <Chip selected={mobileOnly} onClick={() => setMobileOnly(true)}>{`${c.filters.mobile} · ${games.filter((g) => mobile(g.key)).length}`}</Chip>
      </div>
      {Object.keys(links).length > 0 && <SaveNote>{d.noBackend}</SaveNote>}
      <div className="flex w-full flex-col gap-16 rounded-card border border-general-default bg-surface-primary p-16 tablet:p-24">
        <Rows
          rows={rows}
          icon={null}
          onAction={(r) => {
            setLinking({ key: r.key, title: r.title });
            setUrl(links[r.key] ?? "");
          }}
        />
        <p className="type-caption w-full text-secondary">{rows.length === games.length ? `Showing all ${games.length} ${c.noun[1]}` : `Showing ${rows.length} of ${games.length} ${c.noun[1]}`}</p>
      </div>
      <Modal
        open={!!linking}
        onOpenChange={(o) => !o && setLinking(null)}
        title={d.gameLink.title(linking?.title ?? "")}
        description={d.gameLink.description}
        action={d.gameLink.save}
        actionDisabled={!validUrl(url)}
        onAction={() => {
          if (linking) setLinks({ ...links, [linking.key]: url });
          setLinking(null);
        }}
      >
        <TextField label={d.gameLink.label} value={url} onChange={setUrl} placeholder="https://" hint={d.gameLink.hint} type="url" />
      </Modal>
    </>
  );
}
