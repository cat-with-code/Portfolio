/**
 * Skeleton loaders: grey placeholder blocks in the shape of the page that's coming, with a soft shimmer. Every page
 * has its own (picked from the address by siteSkeleton / dashboardSkeleton), so the swap to real content barely moves.
 * They stay up for at least a moment on every page switch (see page-hold.tsx); with "Reduce motion" the shimmer
 * stays still.
 */
import type { ReactNode } from "react";

function Bone({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`relative block shrink-0 overflow-clip bg-surface-secondary ${className}`}>
      <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-(--color-bg-surface-primary) to-transparent opacity-70 motion-safe:animate-shimmer" />
    </span>
  );
}

function Frame({ label, still, children }: { label: string; still?: boolean; children: ReactNode }) {
  return (
    <div role="status" aria-busy="true" className={`flex w-full flex-col gap-(--layout-gap) ${still ? "" : "animate-dissolve-in"}`}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

// ── Building blocks ──────────────────────────────────────────────────────────

/** A line of text; `w` is a width class. */
const Line = ({ w, h = "h-12" }: { w: string; h?: string }) => <Bone className={`${h} ${w} rounded-full`} />;

function Lines({ n = 2 }: { n?: number }) {
  const widths = ["w-full", "w-11/12", "w-4/5", "w-2/3"];
  return (
    <div className="flex w-full flex-col gap-8">
      {Array.from({ length: n }, (_, i) => (
        <Line key={i} w={i === n - 1 ? "w-3/5" : widths[i % widths.length]} />
      ))}
    </div>
  );
}

/** Page title + description, with an optional button on the right. */
function Heading({ action = true }: { action?: boolean }) {
  return (
    <div className="flex w-full items-center gap-16">
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <Line h="h-28" w="w-180" />
        <Line h="h-14" w="w-full max-w-420" />
      </div>
      {action && <Bone className="hidden h-36 w-140 rounded-full tablet:block" />}
    </div>
  );
}

const Card = ({ className = "", children }: { className?: string; children: ReactNode }) => (
  <div className={`flex flex-col gap-16 rounded-card bg-surface-primary p-20 ${className}`}>{children}</div>
);
const Outlined = ({ className = "", children }: { className?: string; children: ReactNode }) => (
  <div className={`flex flex-col gap-16 rounded-card border border-general-default bg-surface-primary p-16 tablet:p-24 ${className}`}>{children}</div>
);

/** Card with a cover image, eyebrow, title and two lines. */
function CoverCard({ ratio = "aspect-[316/198]", className = "" }: { ratio?: string; className?: string }) {
  return (
    <Card className={className}>
      <Bone className={`${ratio} w-full rounded-xl`} />
      <Line w="w-1/3" />
      <Line h="h-20" w="w-3/4" />
      <Lines />
    </Card>
  );
}

/** Small card: thumbnail on the left, text on the right. */
function SideCard({ className = "" }: { className?: string }) {
  return (
    <Card className={`flex-row! items-center ${className}`}>
      <Bone className="size-72 rounded-xl" />
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <Line w="w-1/3" h="h-10" />
        <Line w="w-4/5" h="h-16" />
        <Line w="w-1/4" h="h-10" />
      </div>
    </Card>
  );
}

const Chips = ({ widths }: { widths: string[] }) => (
  <div className="flex flex-wrap gap-8">
    {widths.map((w, i) => (
      <Bone key={i} className={`h-34 ${w} rounded-full`} />
    ))}
  </div>
);

/** Dashboard list row: thumbnail, two lines of text, an action. */
function RowBones() {
  return (
    <div className="flex w-full items-center gap-16 border-t border-general-default py-16 first:border-t-0">
      <Bone className="size-40 rounded-lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <Line h="h-16" w="w-1/2" />
        <Line w="w-1/3" />
      </div>
      <Bone className="hidden h-28 w-88 rounded-full tablet:block" />
      <Bone className="h-36 w-80 rounded-full" />
    </div>
  );
}
const Rows = ({ n }: { n: number }) => (
  <div className="flex w-full flex-col rounded-card border border-general-default bg-surface-primary px-16 py-8 tablet:px-24">
    {Array.from({ length: n }, (_, i) => (
      <RowBones key={i} />
    ))}
  </div>
);

/** Labelled input. */
const Field = ({ tall }: { tall?: boolean }) => (
  <div className="flex w-full flex-col gap-8">
    <Line w="w-88" />
    <Bone className={`${tall ? "h-120" : "h-44"} w-full rounded-lg`} />
  </div>
);

// ── Site pages ───────────────────────────────────────────────────────────────

const site = {
  /** Developer (home): hero card, then four skill cards. */
  home: () => (
    <>
      <Heading />
      <Card className="tablet:flex-row! tablet:items-center tablet:p-32">
        <div className="flex flex-1 flex-col gap-12">
          <Line w="w-140" h="h-10" />
          <Line w="w-3/4" h="h-28" />
          <Line w="w-2/3" h="h-28" />
          <Lines />
        </div>
        <Bone className="aspect-[4/3] w-full rounded-xl tablet:w-280" />
      </Card>
      <div className="grid w-full grid-cols-1 gap-20 tablet:grid-cols-2 desktop:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <CoverCard key={i} ratio="aspect-[4/3]" className={i > 1 ? "max-tablet:hidden" : ""} />
        ))}
      </div>
    </>
  ),
  /** Projects: section title, three project cards, two "try it" cards. */
  projects: () => (
    <>
      <Heading />
      <div className="flex flex-col gap-10">
        <Line w="w-200" h="h-10" />
        <Line w="w-full max-w-440" h="h-28" />
        <Line w="w-full max-w-360" />
      </div>
      <div className="grid w-full grid-cols-1 gap-20 tablet:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className={i ? "max-tablet:hidden" : ""}>
            <Bone className="aspect-[316/198] w-full rounded-xl" />
            <div className="flex justify-between">
              <Line w="w-1/3" h="h-10" />
              <Bone className="h-20 w-64 rounded-full" />
            </div>
            <Line h="h-20" w="w-3/4" />
            <Lines n={3} />
            <Chips widths={["w-56", "w-80", "w-72"]} />
          </Card>
        ))}
      </div>
      <div className="grid w-full grid-cols-1 gap-20 tablet:grid-cols-2">
        <SideCard />
        <SideCard className="max-tablet:hidden" />
      </div>
    </>
  ),
  /** Case study: big title with a summary beside it, credits, the cover. */
  caseStudy: () => (
    <>
      <div className="flex justify-between">
        <Line w="w-100" h="h-10" />
        <Line w="w-100" h="h-10" />
      </div>
      <div className="flex flex-col gap-16 tablet:flex-row tablet:items-end">
        <div className="flex flex-1 flex-col gap-12">
          <Line w="w-120" h="h-10" />
          <Line w="w-full max-w-420" h="h-48" />
        </div>
        <div className="w-full tablet:w-300">
          <Lines n={3} />
        </div>
      </div>
      <div className="grid w-full grid-cols-2 gap-20 tablet:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-8">
            <Line w="w-1/3" h="h-10" />
            <Line w="w-4/5" />
          </div>
        ))}
      </div>
      <Bone className="aspect-[16/9] w-full rounded-card" />
    </>
  ),
  /** Blog: masthead, cover story beside two short ones, latest posts. */
  blog: () => (
    <>
      <div className="flex justify-between">
        <Line w="w-100" h="h-10" />
        <Line w="w-200" h="h-10" />
      </div>
      <div className="flex flex-col gap-16 tablet:flex-row tablet:items-end">
        <Line w="w-full max-w-480" h="h-56" />
        <div className="w-full tablet:ml-auto tablet:w-280">
          <Lines n={3} />
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-20 desktop:grid-cols-3">
        <Card className="tablet:flex-row! desktop:col-span-2">
          <Bone className="aspect-[4/3] w-full rounded-xl tablet:w-260" />
          <div className="flex flex-1 flex-col gap-12">
            <Line w="w-1/3" h="h-10" />
            <Line w="w-4/5" h="h-20" />
            <Lines n={4} />
          </div>
        </Card>
        <div className="flex flex-col gap-20">
          <SideCard />
          <SideCard />
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <Line w="w-120" h="h-10" />
        <Line w="w-260" h="h-24" />
      </div>
      <Card className="tablet:flex-row!">
        <Bone className="aspect-[16/9] w-full rounded-xl tablet:w-1/2" />
        <div className="flex flex-1 flex-col gap-12">
          <Line w="w-1/4" h="h-10" />
          <Line w="w-2/3" h="h-20" />
          <Lines />
        </div>
      </Card>
    </>
  ),
  /** Blog post: tags, a two-line headline, the cover, the audio player, then text. */
  post: () => (
    <>
      <div className="flex justify-between border-b border-general-default pb-16">
        <Line w="w-88" h="h-10" />
        <Line w="w-100" h="h-10" />
      </div>
      <div className="flex flex-col gap-16">
        <Chips widths={["w-88", "w-80", "w-72"]} />
        <Line w="w-full max-w-480" h="h-48" />
        <Line w="w-3/4 max-w-420" h="h-48" />
        <Line w="w-240" h="h-14" />
        <Line w="w-160" h="h-10" />
      </div>
      <Bone className="aspect-[16/7] w-full rounded-card" />
      <div className="mx-auto flex w-full max-w-640 flex-col gap-24">
        <Bone className="h-56 w-full rounded-full" />
        <Lines n={4} />
      </div>
    </>
  ),
  /** Study: focus lab beside the player, then three small cards. */
  study: () => (
    <>
      <Heading />
      <div className="grid w-full grid-cols-1 gap-20 desktop:grid-cols-3">
        <Card className="tablet:flex-row! tablet:items-center desktop:col-span-2">
          <Bone className="mx-auto size-180 rounded-full" />
          <div className="flex flex-1 flex-col gap-12">
            <Line w="w-1/2" h="h-20" />
            <Line w="w-1/3" />
            {[0, 1, 2].map((i) => (
              <Bone key={i} className="h-48 w-full rounded-lg" />
            ))}
            <Bone className="h-40 w-full rounded-full" />
          </div>
        </Card>
        <Card>
          <Line w="w-1/3" h="h-10" />
          <div className="flex items-center gap-12">
            <Bone className="size-48 rounded-lg" />
            <div className="flex flex-1 flex-col gap-8">
              <Line w="w-3/4" h="h-16" />
              <Line w="w-1/2" h="h-10" />
            </div>
          </div>
          <Bone className="h-48 w-full rounded-lg" />
          <div className="flex items-center justify-center gap-12">
            {[0, 1, 2, 3].map((i) => (
              <Bone key={i} className={`${i === 1 ? "size-40" : "size-28"} rounded-full`} />
            ))}
          </div>
          <Chips widths={["w-48", "w-48", "w-64", "w-48"]} />
        </Card>
      </div>
      <div className="grid w-full grid-cols-1 gap-20 tablet:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className={i ? "max-tablet:hidden" : ""}>
            <Line w="w-1/3" h="h-10" />
            <Line w="w-1/2" h="h-32" />
            <Lines />
          </Card>
        ))}
      </div>
    </>
  ),
  /** Games: featured game beside three rows, then the next section. */
  games: () => (
    <>
      <Heading />
      <Line w="w-160" h="h-20" />
      <div className="grid w-full grid-cols-1 gap-20 tablet:grid-cols-2">
        <Bone className="aspect-[4/3] w-full rounded-card" />
        <div className="flex flex-col gap-20">
          {[0, 1, 2].map((i) => (
            <SideCard key={i} />
          ))}
        </div>
      </div>
      <Line w="w-160" h="h-20" />
      <div className="grid w-full grid-cols-1 gap-20 tablet:grid-cols-3">
        <Bone className="aspect-square w-full rounded-card" />
        <Bone className="w-full rounded-card max-tablet:hidden tablet:col-span-2" />
      </div>
    </>
  ),
  /** A game: board beside its setup panel. */
  game: () => (
    <>
      <div className="flex justify-between">
        <Line w="w-120" h="h-10" />
        <Line w="w-140" h="h-10" />
      </div>
      <div className="flex flex-col gap-10">
        <Line w="w-72" h="h-10" />
        <Line w="w-160" h="h-32" />
        <Line w="w-full max-w-420" />
      </div>
      <div className="grid w-full grid-cols-1 gap-20 desktop:grid-cols-3">
        <Card className="items-center desktop:col-span-2">
          <Bone className="aspect-square w-full max-w-440 rounded-xl" />
        </Card>
        <Card>
          <Line w="w-1/3" h="h-10" />
          <Line w="w-2/3" h="h-20" />
          {[0, 1, 2].map((i) => (
            <Bone key={i} className="h-56 w-full rounded-lg" />
          ))}
          <Chips widths={["w-64", "w-64", "w-64"]} />
          <Bone className="h-40 w-full rounded-full" />
        </Card>
      </div>
    </>
  ),
  /** Contact: the form beside availability and questions. */
  contact: () => (
    <>
      <Heading action={false} />
      <div className="grid w-full grid-cols-1 gap-20 desktop:grid-cols-3">
        <Card className="desktop:col-span-2">
          <Line w="w-180" h="h-24" />
          <Line w="w-2/3" />
          <div className="grid grid-cols-1 gap-16 tablet:grid-cols-2">
            <Field />
            <Field />
          </div>
          <Chips widths={["w-88", "w-140", "w-120", "w-120"]} />
          <Field tall />
          <Bone className="ml-auto h-40 w-140 rounded-full" />
        </Card>
        <div className="flex flex-col gap-20">
          <Card>
            <Line w="w-1/3" h="h-10" />
            <Line w="w-2/3" h="h-20" />
            <Lines n={3} />
          </Card>
          {[0, 1, 2].map((i) => (
            <Bone key={i} className="h-48 w-full rounded-card" />
          ))}
        </div>
      </div>
    </>
  ),
};

/** Shown where the page type isn't known (e.g. an unknown address): a plain title and a few cards. */
const generic = () => (
  <>
    <Heading />
    <div className="grid w-full grid-cols-1 gap-20 tablet:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <CoverCard key={i} className={i ? "max-tablet:hidden" : ""} />
      ))}
    </div>
  </>
);

/** The site skeleton for an address like "/en/blog/some-post" (null: the address isn't known yet). */
export function siteSkeleton(pathname: string | null, label: string) {
  const [, , section = "", item] = (pathname ?? "/").split("/");
  const page =
    pathname === null ? generic
    : section === "" ? site.home
    : section === "projects" ? (item ? site.caseStudy : site.projects)
    : section === "blog" ? (item ? site.post : site.blog)
    : section === "games" ? (item ? site.game : site.games)
    : section === "study" ? site.study
    : section === "contact" ? site.contact
    : generic;
  return (
    <Frame label={label} still>
      {page()}
    </Frame>
  );
}

// ── Dashboard pages ──────────────────────────────────────────────────────────

const dashboard = {
  /** Overview: welcome banner, four stat cards, widgets. */
  overview: () => (
    <>
      <Heading action={false} />
      <Bone className="h-140 w-full rounded-card" />
      <div className="grid w-full grid-cols-1 gap-24 tablet:grid-cols-2 desktop:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Outlined key={i}>
            <Bone className="size-40 rounded-lg" />
            <Line w="w-1/3" h="h-28" />
            <Line w="w-2/3" />
          </Outlined>
        ))}
        <Outlined className="tablet:col-span-2 desktop:row-span-2">
          <Line w="w-1/3" h="h-20" />
          <div className="flex flex-col">
            {[0, 1, 2, 3].map((i) => (
              <RowBones key={i} />
            ))}
          </div>
        </Outlined>
        {[0, 1].map((i) => (
          <Outlined key={i} className="tablet:col-span-2">
            <Line w="w-1/4" h="h-20" />
            <Lines />
          </Outlined>
        ))}
      </div>
    </>
  ),
  /** Projects / Writing: filter chips and a list of rows. */
  list: () => (
    <>
      <Heading />
      <Chips widths={["w-72", "w-88", "w-104"]} />
      <Rows n={6} />
    </>
  ),
  /** Inbox: filter chips and the message card. */
  inbox: () => (
    <>
      <Heading action={false} />
      <Chips widths={["w-72", "w-88", "w-88"]} />
      <Outlined className="items-center py-56!">
        <Bone className="size-48 rounded-full" />
        <Line w="w-200" h="h-20" />
        <Line w="w-full max-w-280" />
        <Chips widths={["w-120", "w-120"]} />
      </Outlined>
    </>
  ),
  /** Study library: track rows, then a grid of book covers. */
  study: () => (
    <>
      <Heading />
      <Chips widths={["w-72", "w-72", "w-72", "w-72"]} />
      <Rows n={4} />
      <div className="grid w-full grid-cols-2 gap-20 tablet:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-8">
            <Bone className="aspect-[3/4] w-full rounded-xl" />
            <Line w="w-3/4" />
          </div>
        ))}
      </div>
    </>
  ),
  /** Games: one row per game with its link. */
  games: () => (
    <>
      <Heading action={false} />
      <Rows n={8} />
    </>
  ),
  /** Media: grids of images per group. */
  media: () => (
    <>
      <Heading />
      {["grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3", "grid-cols-2 tablet:grid-cols-4"].map((cols, g) => (
        <div key={g} className="flex w-full flex-col gap-16">
          <Line w="w-120" h="h-20" />
          <div className={`grid w-full gap-20 ${cols}`}>
            {Array.from({ length: g ? 4 : 3 }, (_, i) => (
              <div key={i} className="flex flex-col gap-8">
                <Bone className={`${g ? "aspect-square" : "aspect-[16/10]"} w-full rounded-xl`} />
                <Line w="w-2/3" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  ),
  /** Settings: cards of fields, then switches. */
  settings: () => (
    <>
      <Heading action={false} />
      <div className="grid w-full grid-cols-1 gap-24 tablet:grid-cols-2">
        {[0, 1].map((i) => (
          <Outlined key={i}>
            <Line w="w-1/3" h="h-20" />
            <Field />
            <Field />
          </Outlined>
        ))}
      </div>
      <Outlined>
        <Line w="w-1/4" h="h-20" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-16">
            <div className="flex flex-1 flex-col gap-8">
              <Line w="w-1/3" h="h-14" />
              <Line w="w-1/2" h="h-10" />
            </div>
            <Bone className="h-24 w-44 rounded-full" />
          </div>
        ))}
      </Outlined>
    </>
  ),
  /** Editors (project, story, track, book): back link, title with actions, sections of fields. */
  editor: () => (
    <>
      <Line w="w-100" h="h-14" />
      <div className="flex w-full items-center gap-16">
        <div className="flex flex-1 flex-col gap-8">
          <Line w="w-240" h="h-28" />
          <Line w="w-160" />
        </div>
        <Bone className="hidden h-36 w-100 rounded-full tablet:block" />
        <Bone className="h-36 w-100 rounded-full" />
      </div>
      {[0, 1].map((i) => (
        <Outlined key={i}>
          <div className="flex flex-col gap-6">
            <Line w="w-88" h="h-10" />
            <Line w="w-200" h="h-20" />
          </div>
          <div className="grid w-full grid-cols-1 items-start gap-16 tablet:grid-cols-2">
            <Field />
            <Field />
            {i === 0 && <Bone className="aspect-[16/10] w-full rounded-xl tablet:col-span-2 tablet:aspect-[16/5]" />}
            <div className="tablet:col-span-2">
              <Field tall />
            </div>
          </div>
        </Outlined>
      ))}
    </>
  ),
  /** Publish review: checklist card, then the case study preview. */
  publish: () => (
    <>
      <Line w="w-100" h="h-14" />
      <Heading />
      <Outlined className="tablet:flex-row!">
        {[0, 1, 2].map((i) => (
          <Bone key={i} className="h-64 w-full rounded-lg" />
        ))}
      </Outlined>
      {site.caseStudy()}
    </>
  ),
};

/** The dashboard skeleton for an address like "/dashboard/writing/my-story" (null: the address isn't known yet). */
export function dashboardSkeleton(pathname: string | null, label: string) {
  const [, , section = "", item, sub] = (pathname ?? "/").split("/");
  const page =
    pathname === null ? dashboard.list
    : section === "" ? dashboard.overview
    : section === "projects" || section === "writing" ? (item ? (sub === "publish" ? dashboard.publish : dashboard.editor) : dashboard.list)
    : section === "study" ? (item ? dashboard.editor : dashboard.study)
    : section === "games" ? dashboard.games
    : section === "media" ? dashboard.media
    : section === "inbox" ? dashboard.inbox
    : section === "settings" ? dashboard.settings
    : dashboard.list;
  return (
    <Frame label={label} still>
      {page()}
    </Frame>
  );
}
