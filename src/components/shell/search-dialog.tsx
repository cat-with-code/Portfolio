"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore, type ComponentType, type SVGProps } from "react";
import {
  ArrowUpRightIcon,
  BlogIcon18,
  DeveloperIcon18,
  GamesIcon18,
  LinkIcon18,
  ProjectsIcon18,
  RobotIcon18,
  SearchIcon,
  StudyIcon18,
} from "@/components/icons";
import { searchGroups, searchIndex, searchMatches, searchSuggestions, type SearchGroup, type SearchIconKey, type SearchItem } from "@/lib/search-index";
import { Chip } from "@/components/ui/chip";
import { useSearch } from "./search-provider";

const icons: Record<SearchIconKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  developer: DeveloperIcon18,
  projects: ProjectsIcon18,
  blog: BlogIcon18,
  study: StudyIcon18,
  games: GamesIcon18,
  contact: LinkIcon18,
  sdabby: RobotIcon18,
};

export type SearchCopy = {
  placeholder: string;
  placeholderShort: string;
  esc: string;
  close: string;
  clear: string;
  try: string;
  all: string;
  bestMatches: string;
  noResults: string;
  noResultsHint: string;
  navigate: string;
  open: string;
  closeHint: string;
  count: string;
};

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="text-(--color-bg-brand)">{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </>
  );
}

function Result({ item, query, onSelect }: { item: SearchItem; query: string; onSelect: (item: SearchItem) => void }) {
  const Icon = icons[item.icon];
  return (
    <Command.Item
      value={item.id}
      onSelect={() => onSelect(item)}
      className="group/row flex w-full shrink-0 cursor-pointer items-center gap-12 overflow-clip rounded-lg p-8 text-left data-[selected=true]:bg-surface-hover"
    >
      <span className="flex size-36 shrink-0 items-center justify-center overflow-clip rounded-lg bg-surface-subtle group-data-[selected=true]/row:bg-brand-subtle">
        <span className="relative size-18 shrink-0 text-icon-general-primary group-data-[selected=true]/row:text-(--color-bg-brand)">
          <Icon className="absolute top-0 left-0" />
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="type-label w-full truncate text-primary">
          <Highlight text={item.title} query={query} />
        </span>
        <span className="type-caption w-full text-muted">{item.meta}</span>
      </span>
      <span className="relative size-16 shrink-0 text-muted group-data-[selected=true]/row:text-(--color-bg-brand)">
        <ArrowUpRightIcon className="absolute top-0 left-0" />
      </span>
    </Command.Item>
  );
}

const desktopQuery = "(min-width: 1280px)";
const subscribeDesktop = (cb: () => void) => {
  const mq = window.matchMedia(desktopQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** Global search overlay (Desktop 710:44121 · Tablet 710:44232 · Mobile 710:44343). */
export function SearchDialog({ lang, copy }: { lang: string; copy: SearchCopy }) {
  const { open, setOpen } = useSearch();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchGroup | "all">("all");
  const isDesktop = useSyncExternalStore(subscribeDesktop, () => window.matchMedia(desktopQuery).matches, () => true);

  const groupsWithContent = searchGroups.filter((g) => searchIndex.some((i) => i.group === g.key));
  const suggestions = searchSuggestions.filter((s) => searchIndex.some((i) => searchMatches(i, s)));

  const results = useMemo(
    () => searchIndex.filter((i) => (filter === "all" || i.group === filter) && searchMatches(i, query)),
    [filter, query]
  );

  const reset = () => {
    setQuery("");
    setFilter("all");
  };
  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };
  const onSelect = (item: SearchItem) => {
    onOpenChange(false);
    router.push(`/${lang}${item.path}`);
  };

  const quote = (s: string) => `“${s}”`;
  const hintWords = suggestions.slice(0, 3).map(quote);
  const words =
    hintWords.length > 2 ? `${hintWords.slice(0, -1).join(", ")}, or ${hintWords.at(-1)}` : hintWords.join(" or ");
  const hint = copy.noResultsHint.replace("{words}", words);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay-scrim backdrop-blur-backdrop data-[state=closed]:animate-dissolve-out data-[state=open]:animate-dissolve-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-16 right-16 left-16 z-50 flex max-h-[calc(100dvh-32px)] flex-col overflow-clip rounded-shell border border-general-default bg-surface-primary shadow-card outline-none data-[state=closed]:animate-dissolve-out data-[state=open]:animate-dissolve-in tablet:top-96 tablet:right-auto tablet:left-1/2 tablet:max-h-[calc(100dvh-128px)] tablet:w-600 tablet:-translate-x-1/2 desktop:w-640"
        >
          <Dialog.Title className="sr-only">{copy.placeholderShort}</Dialog.Title>
          <Command shouldFilter={false} loop label={copy.placeholderShort} className="flex min-h-0 shrink flex-col">
            {/* Search field */}
            <div className="flex w-full shrink-0 items-center gap-12 overflow-clip border-b border-general-default p-16">
              <SearchIcon className="shrink-0 text-(--color-bg-brand)" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder={isDesktop ? copy.placeholder : copy.placeholderShort}
                className="type-body min-w-0 flex-1 bg-transparent text-primary caret-(--color-bg-brand) outline-none placeholder:text-muted focus-visible:shadow-none"
              />
              {query && (
                <button
                  type="button"
                  aria-label={copy.clear}
                  onClick={() => setQuery("")}
                  className="type-body flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-clip rounded-lg bg-surface-subtle text-secondary"
                >
                  ×
                </button>
              )}
              <Dialog.Close className="type-caption flex shrink-0 cursor-pointer items-start overflow-clip rounded-md bg-surface-subtle px-8 py-2 text-secondary">
                <span className="tablet:hidden">{copy.close}</span>
                <span className="hidden tablet:inline">{copy.esc}</span>
              </Dialog.Close>
            </div>

            {/* Suggestions (Desktop only) */}
            {suggestions.length > 0 && (
              <div className="hidden w-full shrink-0 items-center gap-8 overflow-clip px-16 pt-12 pb-2 desktop:flex">
                <p className="type-table-heading whitespace-nowrap text-muted">{copy.try}</p>
                {suggestions.map((s) => (
                  <Chip key={s} selected={query.trim().toLowerCase() === s.toLowerCase()} onClick={() => setQuery(s)}>
                    {s}
                  </Chip>
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="flex w-full shrink-0 items-start gap-4 overflow-x-auto px-12 pt-12 pb-8 [scrollbar-width:none]">
              <Chip selected={filter === "all"} onClick={() => setFilter("all")}>
                {copy.all}
              </Chip>
              {groupsWithContent.map((g) => (
                <Chip key={g.key} selected={filter === g.key} onClick={() => setFilter(g.key)}>
                  {g.filter}
                </Chip>
              ))}
            </div>

            {/* Results viewport */}
            <Command.List className="h-600 min-h-0 w-full shrink overflow-x-clip overflow-y-auto px-8 pt-2 pb-8 desktop:h-520 [&>[cmdk-list-sizer]]:flex [&>[cmdk-list-sizer]]:flex-col [&>[cmdk-list-sizer]]:gap-2">
              {results.length === 0 ? (
                <div className="flex w-full flex-col items-center gap-8 overflow-clip py-48">
                  <span className="relative size-28 shrink-0 text-icon-general-primary">
                    <SearchIcon className="absolute top-0 left-0" />
                  </span>
                  <p className="type-card-title text-center text-primary">{copy.noResults.replace("{query}", query.trim())}</p>
                  {hintWords.length > 0 && <p className="type-caption text-center text-muted">{hint}</p>}
                </div>
              ) : query.trim() ? (
                <Command.Group
                  heading={copy.bestMatches}
                  className="[&_[cmdk-group-heading]]:type-table-heading flex flex-col gap-2 [&_[cmdk-group-heading]]:px-8 [&_[cmdk-group-heading]]:pt-12 [&_[cmdk-group-heading]]:pb-4 [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-2"
                >
                  {results.map((item) => (
                    <Result key={item.id} item={item} query={query} onSelect={onSelect} />
                  ))}
                </Command.Group>
              ) : (
                searchGroups.map((g) => {
                  const items = results.filter((i) => i.group === g.key);
                  if (!items.length) return null;
                  return (
                    <Command.Group
                      key={g.key}
                      heading={g.label}
                      className="[&_[cmdk-group-heading]]:type-table-heading flex flex-col gap-2 [&_[cmdk-group-heading]]:px-8 [&_[cmdk-group-heading]]:pt-12 [&_[cmdk-group-heading]]:pb-4 [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-2"
                    >
                      {items.map((item) => (
                        <Result key={item.id} item={item} query={query} onSelect={onSelect} />
                      ))}
                    </Command.Group>
                  );
                })
              )}
            </Command.List>

            {/* Footer (Tablet + Desktop) */}
            <div className="type-caption hidden w-full shrink-0 items-start gap-24 overflow-clip border-t border-general-default bg-surface-subtle px-16 py-12 text-muted tablet:flex">
              <p className="whitespace-pre">{copy.navigate}</p>
              <p className="whitespace-pre">{copy.open}</p>
              <p className="whitespace-pre">{copy.closeHint}</p>
              <p className="whitespace-nowrap">{copy.count.replace("{count}", String(results.length))}</p>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
