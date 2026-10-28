import type { Metadata } from "next";
import { NotFoundView } from "@/components/feedback/not-found-view";
import { BlogIcon, ContactIcon, GamesIcon, ProjectsIcon, StudyIcon } from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

/** 404 for the site: shown for unknown addresses and anything that calls notFound(). */
export default async function NotFound() {
  const [lang, dict] = await Promise.all([getLocale(), getDictionary()]);
  const icon = "size-18";
  return (
    <NotFoundView
      copy={dict.notFound}
      home={`/${lang}`}
      links={[
        { href: `/${lang}/projects`, label: dict.nav.projects, icon: <ProjectsIcon className={icon} /> },
        { href: `/${lang}/blog`, label: dict.nav.blog, icon: <BlogIcon className={icon} /> },
        { href: `/${lang}/study`, label: dict.nav.study, icon: <StudyIcon className={icon} /> },
        { href: `/${lang}/games`, label: dict.nav.games, icon: <GamesIcon className={icon} /> },
        { href: `/${lang}/contact`, label: dict.nav.contact, icon: <ContactIcon className={icon} /> },
      ]}
    />
  );
}
