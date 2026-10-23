/** Remembers the chosen interface language for the proxy's redirect from "/". */
export function rememberLocale(lang: string) {
  document.cookie = `locale=${lang}; path=/; max-age=31536000; samesite=lax`;
}
