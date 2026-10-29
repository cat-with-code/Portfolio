/**
 * How long a dashboard sign-in lasts (Supabase's own session limits are a paid feature, so the site enforces them):
 *   • inactivity — signed out after this long with no clicks or typing in the dashboard (default 30 min)
 *   • maximum    — signed out this long after signing in, however active (default 12 h)
 * Override for testing with DASHBOARD_IDLE_MINUTES / DASHBOARD_MAX_HOURS (e.g. 1 and 0.05).
 * The database caps sessions at 24 h on its own (supabase/migrations/0005_session_limit.sql), so keep these below that.
 * Used by the proxy (every dashboard request) and by the server's owner check (server actions).
 */
const num = (value: string | undefined, fallback: number, min: number, max: number) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
};

export const IDLE_MS = num(process.env.DASHBOARD_IDLE_MINUTES, 30, 0.5, 24 * 60) * 60_000;
export const MAX_MS = num(process.env.DASHBOARD_MAX_HOURS, 12, 0.01, 24) * 3_600_000;

/** httpOnly cookie with the time of the owner's last dashboard activity (ms since epoch). */
export const ACTIVE_COOKIE = "dash_active";

export type Expiry = "idle" | "max" | null;

/** When this session signed in: the earliest authentication in the token's `amr` (seconds → ms). */
export function signedInAt(claims: { amr?: unknown } | null | undefined): number | null {
  const amr = Array.isArray(claims?.amr) ? (claims.amr as { timestamp?: unknown }[]) : [];
  const times = amr.map((a) => Number(a?.timestamp)).filter((t) => Number.isFinite(t) && t > 0);
  return times.length ? Math.min(...times) * 1000 : null;
}

/**
 * Whether the session is over. Inactivity counts from the later of the last activity and the sign-in itself, so a
 * fresh sign-in isn't "inactive", and a copied session without the activity cookie still runs out on time.
 * A session whose sign-in time can't be read counts as over.
 */
export function sessionExpiry(signedIn: number | null, lastActive: number | null, now = Date.now()): Expiry {
  if (!signedIn) return "max";
  if (now - signedIn > MAX_MS) return "max";
  if (now - Math.max(signedIn, lastActive ?? 0) > IDLE_MS) return "idle";
  return null;
}

/**
 * Supabase sign-in cookies normally last 400 days. Keeping them only until the browser closes means a closed browser
 * is signed out. Deletions (maxAge 0) pass through untouched — that's how signing out clears them.
 */
export function browserSessionCookie<T extends { maxAge?: number; expires?: Date }>(options: T): T {
  if (options.maxAge === 0) return options;
  const { maxAge: _maxAge, expires: _expires, ...rest } = options;
  void _maxAge;
  void _expires;
  return rest as T;
}
