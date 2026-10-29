import type { Sources } from "./sources";

/**
 * A translation of some of the English text: same shape, every part optional. Arrays of objects with a `key` (or
 * `id`) are matched by it; other arrays by position (so a translated list keeps the English length).
 */
export type DeepPartial<T> = T extends string
  ? string
  : T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

export type Overlay = { [K in keyof Sources]?: DeepPartial<Sources[K]> };
