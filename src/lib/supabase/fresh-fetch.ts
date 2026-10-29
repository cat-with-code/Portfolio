/**
 * fetch for Supabase on the server that never uses Next's own request cache. The site caches whole results itself
 * ("use cache" + tags that saving or publishing refresh); without this, Next also kept untagged copies of the raw
 * database answers, so a refreshed page could still read old settings or content.
 */
export const freshFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });
