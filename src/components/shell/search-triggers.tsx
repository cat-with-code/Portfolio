"use client";

import { CommandIcon, SearchIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";
import { useSearch } from "./search-provider";

/** Top bar / Search field (Figma 1145:105933) — Default and Hover states. */
export function SearchField({ placeholder }: { placeholder: string }) {
  const { setOpen } = useSearch();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-keyshortcuts="Meta+K Control+K"
      className="group/search flex h-44 w-375 shrink-0 cursor-pointer items-center gap-8 rounded-shell border border-general-primary bg-surface-primary px-12 py-8 transition-colors duration-(--duration-fast) hover:border-general-strong hover:bg-surface-hover"
    >
      <SearchIcon className="shrink-0 text-icon-general-secondary group-hover/search:text-(--color-bg-brand)" />
      <span className="type-input min-w-0 flex-1 truncate text-left text-general-placeholder group-hover/search:text-primary">
        {placeholder}
      </span>
      <span className="flex shrink-0 items-center gap-4 px-2 text-icon-general-secondary">
        <span className="flex size-12 items-center justify-center">
          <CommandIcon className="shrink-0" />
        </span>
        <span className="type-body text-secondary">K</span>
      </span>
    </button>
  );
}

/** Mobile top bar "Search portfolio" icon button. */
export function SearchIconButton({ label }: { label: string }) {
  const { setOpen } = useSearch();
  return (
    <IconButton aria-label={label} size={32} surface="secondary" bordered={false} onClick={() => setOpen(true)}>
      <SearchIcon />
    </IconButton>
  );
}
