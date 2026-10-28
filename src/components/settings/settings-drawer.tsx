"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import { CloseIcon, MonitorIcon, MoonIcon, SignatureLogo, SunIcon } from "@/components/icons";
import { useDrawerState } from "@/components/shell/drawer-provider";
import { applyTheme } from "@/components/shell/theme-toggle";
import { IconButton } from "@/components/ui/icon-button";
import { PanelClose, SidePanel } from "@/components/ui/side-panel";
import { languageOptions, settingsCopy } from "@/content/settings";
import type { Dictionary } from "@/i18n/dictionaries";
import { rememberLocale } from "@/lib/locale-cookie";
import { LocalTime, type Calendar } from "./clock";

type Mode = "light" | "dark" | "system";

/** Current theme mode from <html data-theme-mode>, kept in sync with the header toggle. */
function useThemeMode(): Mode {
  return useSyncExternalStore(
    (cb) => {
      const o = new MutationObserver(cb);
      o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme-mode"] });
      return () => o.disconnect();
    },
    () => (document.documentElement.dataset.themeMode as Mode) ?? "light",
    () => "light"
  );
}

const subscribeStorage = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener("local-preference", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("local-preference", cb);
  };
};
const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/** A per-visitor preference kept in localStorage (reading voice, calendar). */
function useStored<T extends string>(key: string, fallback: T): [T, (v: T) => void] {
  const value = useSyncExternalStore(subscribeStorage, () => (readStorage(key) as T | null) ?? fallback, () => fallback);
  return [
    value,
    (v: T) => {
      try {
        localStorage.setItem(key, v);
      } catch {}
      window.dispatchEvent(new Event("local-preference"));
    },
  ];
}

/** Settings selectors (Appearance 363:2041, Language 363:2099, Voice 1126:127800): selected = Button Primary, others = Secondary; 48px tall. */
function Option({ selected, onClick, children, className = "" }: { selected: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex h-48 min-w-0 flex-1 cursor-pointer items-center justify-center gap-8 rounded-full px-20 text-[length:var(--typography-label-size)] leading-[24px] font-medium whitespace-nowrap transition-colors duration-(--duration-fast) ${
        selected ? "bg-brand text-on-brand" : "border border-general-primary bg-surface-primary text-primary hover:bg-surface-hover"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Card({ title, help, children, gap = "gap-8" }: { title: ReactNode; help?: string; children: ReactNode; gap?: string }) {
  return (
    <section className={`flex w-full shrink-0 flex-col items-start overflow-clip rounded-shell bg-surface-primary p-16 ${gap}`}>
      {typeof title === "string" ? <h3 className="type-card-title w-full text-primary">{title}</h3> : title}
      {help && <p className="type-body w-full text-primary">{help}</p>}
      {children}
    </section>
  );
}

/** Settings drawer (Figma Desktop 707:43772 · Tablet 707:43867 · Mobile 707:43956). */
export function SettingsDrawer({ lang, dict }: { lang: string; dict: Dictionary }) {
  const state = useDrawerState("settings");
  const mode = useThemeMode();
  const router = useRouter();
  const [voice, setVoice] = useStored<(typeof settingsCopy.voices)[number]>("voice", "Female");
  const [calendar, setCalendar] = useStored<Calendar>("calendar", "gregorian");

  const switchLanguage = (next: string) => {
    if (next === lang) return;
    rememberLocale(next);
    router.push(window.location.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, `/${next}`));
  };

  const themes: { mode: Mode; label: string; Icon: typeof SunIcon }[] = [
    { mode: "light", label: dict.theme.light, Icon: SunIcon },
    { mode: "dark", label: dict.theme.dark, Icon: MoonIcon },
    { mode: "system", label: dict.theme.system, Icon: MonitorIcon },
  ];

  return (
    <SidePanel
      {...state}
      title={dict.nav.settings}
      className="inset-x-8 inset-y-16 gap-(--layout-gap) bg-page p-(--layout-gutter) tablet:right-8 tablet:left-auto tablet:w-592"
    >
      {/* Portfolio / Drawer header */}
      <div className="flex h-44 w-full shrink-0 items-center gap-16 overflow-clip">
        <p className="type-card-title min-w-0 flex-1 text-primary">{dict.nav.settings}</p>
        <PanelClose asChild>
          <IconButton aria-label={dict.a11y.close} bordered={false}>
            <CloseIcon />
          </IconButton>
        </PanelClose>
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col items-start gap-20 overflow-x-clip overflow-y-auto [scrollbar-width:none]">
        <Card title={dict.settings.appearance} help={settingsCopy.appearanceHelp}>
          <div className="flex h-48 w-full items-center gap-8">
            {themes.map(({ mode: m, label, Icon }) => (
              <Option key={m} selected={mode === m} onClick={() => applyTheme(m)}>
                <Icon className={`shrink-0 ${mode === m ? "text-icon-on-brand" : "text-icon-general-primary"}`} />
                <span className="shrink-0">{label}</span>
              </Option>
            ))}
          </div>
        </Card>

        <Card title={dict.settings.language} help={settingsCopy.languageHelp}>
          <div className="flex h-48 w-full items-center gap-8">
            {languageOptions.map((o) => (
              <Option key={o.lang} selected={lang === o.lang} onClick={() => switchLanguage(o.lang)} className={o.font}>
                <span lang={o.lang} className="shrink-0">{o.label}</span>
              </Option>
            ))}
          </div>
        </Card>

        <Card title={settingsCopy.voiceTitle} help={settingsCopy.voiceHelp}>
          <div className="flex h-48 w-full items-center gap-8">
            {settingsCopy.voices.map((v) => (
              <Option key={v} selected={voice === v} onClick={() => setVoice(v)}>
                <span className="shrink-0">{v}</span>
              </Option>
            ))}
          </div>
        </Card>

        <Card
          gap="gap-16"
          title={
            <div className="flex w-full items-center justify-between overflow-clip">
              <h3 className="type-card-title self-start text-primary">{settingsCopy.localTime}</h3>
              {/* Settings / Calendar toggle (1138:2599) */}
              <div className="flex items-start gap-4 rounded-full bg-surface-subtle p-4" role="group" aria-label="Calendar">
                {(["gregorian", "khmer"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={calendar === c}
                    onClick={() => setCalendar(c)}
                    className={`flex cursor-pointer items-center justify-center overflow-clip rounded-full px-16 py-8 text-center whitespace-nowrap ${
                      c === "khmer" ? "type-khmer-label" : "type-label"
                    } ${calendar === c ? "bg-surface-primary text-primary shadow-card" : "text-secondary"}`}
                  >
                    {c === "khmer" ? settingsCopy.calendarKhmer : settingsCopy.calendarGregorian}
                  </button>
                ))}
              </div>
            </div>
          }
        >
          <LocalTime calendar={calendar} />
        </Card>
      </div>

      {/* Settings / Footer */}
      <div className="flex w-full shrink-0 flex-col items-center justify-center gap-8 overflow-clip border-t border-(--color-border-line-divider) pt-16">
        <SignatureLogo className="h-28 w-[76.36px] overflow-visible" aria-hidden />
        <div className="type-caption flex w-full flex-col items-center gap-4 text-center">
          <p className="w-full text-muted">{settingsCopy.footerMade}</p>
          <p className="w-full text-subtle">{settingsCopy.footerCopyright}</p>
        </div>
      </div>
    </SidePanel>
  );
}
