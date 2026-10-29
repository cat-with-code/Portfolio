"use client";

import { createContext, useContext, type ReactNode } from "react";
import { tr } from "./content";
import type { Sources } from "./content/sources";

/** The page's language, handed down from the [lang] layout. Outside it (the dashboard) everything is English. */
const LangContext = createContext("en");

export function LangProvider({ lang, children }: { lang: string; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/** Page text in the current language, e.g. `const form = useT("form")`. */
export const useT = <K extends keyof Sources>(key: K): Sources[K] => tr(useLang(), key);
