/**
 * Random id for saved items. `crypto.randomUUID()` only exists on secure pages (https or localhost), so a phone
 * testing the dev server at http://192.168.x.x has no `randomUUID`; `getRandomValues` works everywhere.
 */
export function uid() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
}
