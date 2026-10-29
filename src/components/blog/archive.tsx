"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { ArchiveCard } from "./post-card";
import { useT } from "@/i18n/lang-context";


/** Archive / Post list: five rows, then "View more" shows the rest (Blog / View more button 1095:2368, disabled once all are shown). */
export function Archive() {
  const { archive } = useT("magazine");
  const [all, setAll] = useState(false);
  const shown = all ? archive.posts : archive.posts.slice(0, archive.initial);
  const done = shown.length === archive.posts.length;
  return (
    <div className="flex w-full flex-col items-start gap-16 tablet:gap-8">
      {shown.map((placement) => (
        <ArchiveCard key={placement.slug} placement={placement} />
      ))}
      <div className="flex w-full justify-center tablet:pt-16">
        <button
          type="button"
          disabled={done}
          onClick={() => setAll(true)}
          className="type-label flex h-44 w-full cursor-pointer items-center justify-center gap-8 rounded-full border border-general-default bg-surface-primary px-24 text-primary transition-colors duration-(--duration-fast) hover:bg-surface-hover disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-general-disabled tablet:w-auto"
        >
          {archive.viewMore}
          <ChevronDownIcon className="size-16" />
        </button>
      </div>
    </div>
  );
}
