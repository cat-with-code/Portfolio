import { GoalCard, IntentionCard, PlanCard, ReminderCard } from "@/components/study/cards";
import { DayRhythm, FocusWindow, LocalClock } from "@/components/study/daytime";
import { FocusAudio } from "@/components/study/focus-audio";
import { FocusClock } from "@/components/study/focus-clock";
import { MusicDrawer } from "@/components/study/music-drawer";
import { RecentlyRead } from "@/components/study/recently-read";
import { StudyProvider } from "@/components/study/study-provider";
import { FavoriteBooksButton, LibraryLink } from "@/components/study/triggers";
import { recentlyRead as rr, welcome } from "@/content/study";
import { getDictionary } from "@/i18n/dictionaries";

/** Study — Focus Studio (Figma Desktop 694:14994 · Tablet 696:33340 · Mobile 696:40002). */
export default async function StudyPage() {
  const dict = await getDictionary();
  return (
    <StudyProvider>
      <div className="-mt-8 flex w-full flex-col items-stretch gap-16 pb-16 tablet:gap-20">
        {/* Welcome */}
        <section className="flex w-full flex-col items-stretch gap-16 overflow-clip rounded-shell bg-brand-subtle p-24 tablet:h-138 tablet:flex-row tablet:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <p className="type-eyebrow whitespace-pre-wrap text-brand">{welcome.eyebrow}</p>
            <h1 className="type-page-title tablet:type-kpi text-primary">{welcome.title}</h1>
            <p className="type-ui text-secondary">{welcome.body}</p>
          </div>
          <FavoriteBooksButton label={welcome.favorites} className="w-full tablet:w-auto" />
        </section>

        {/* Timer and sound */}
        <div className="flex w-full flex-col items-stretch gap-16 tablet:flex-row tablet:gap-24">
          <div className="flex w-full tablet:w-463 tablet:shrink-0 desktop:w-auto desktop:min-w-0 desktop:flex-1">
            <FocusClock />
          </div>
          <div className="flex w-full flex-col gap-16 tablet:min-w-0 tablet:flex-1 desktop:w-404 desktop:flex-none">
            <FocusAudio className="w-full tablet:h-456" />
            <DayRhythm tall className="hidden tablet:flex desktop:hidden" />
          </div>
        </div>

        {/* Daytime */}
        <div className="flex w-full flex-col items-stretch gap-16 tablet:flex-row tablet:items-start">
          <LocalClock className="w-full tablet:min-w-0 tablet:flex-1 desktop:flex-1" />
          <DayRhythm className="w-full tablet:hidden desktop:flex desktop:h-228 desktop:w-340 desktop:shrink-0" />
          <FocusWindow className="w-full tablet:hidden desktop:flex desktop:w-252 desktop:shrink-0" />
          <FocusWindow tall className="hidden tablet:flex tablet:h-414 tablet:w-439 tablet:shrink-0 desktop:hidden" />
        </div>

        {/* Intention and plan */}
        <div className="flex w-full flex-col items-stretch gap-16 tablet:flex-row tablet:gap-24">
          <IntentionCard className="w-full tablet:w-404 tablet:shrink-0" />
          <PlanCard className="w-full tablet:min-w-0 tablet:flex-1" />
        </div>

        {/* Momentum */}
        <div className="flex w-full flex-col items-stretch gap-16 tablet:flex-row tablet:gap-24">
          <GoalCard className="w-full tablet:min-w-0 tablet:flex-1" />
          <ReminderCard className="w-full tablet:min-w-0 tablet:flex-1" />
        </div>

        {/* Recently read */}
        <section className="flex w-full flex-col gap-16">
          <div className="flex w-full flex-col gap-12 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-16">
            <div className="flex min-w-0 flex-col gap-2">
              <h2 className="type-page-title text-primary">{rr.title}</h2>
              <p className="type-caption text-secondary">{rr.description}</p>
            </div>
            <LibraryLink label={rr.library} mobileLabel={rr.libraryMobile} />
          </div>
          <RecentlyRead />
        </section>
        <div aria-hidden className="h-16 w-full shrink-0" />
      </div>
      <MusicDrawer closeLabel={dict.a11y.close} />
    </StudyProvider>
  );
}
