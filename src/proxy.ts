import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { needsCode } from "./lib/supabase/mfa";
import { ACTIVE_COOKIE, browserSessionCookie, IDLE_MS, sessionExpiry, signedInAt } from "./lib/supabase/session-policy";

const locales = ["en", "km", "zh"];

function preferredLocale(request: NextRequest) {
  const saved = request.cookies.get("locale")?.value;
  if (saved && locales.includes(saved)) return saved;
  const accept = request.headers.get("accept-language") ?? "";
  if (/(^|,)\s*km\b/i.test(accept)) return "km";
  return /(^|,)\s*zh\b/i.test(accept) ? "zh" : "en";
}

/**
 * Dashboard gate: refreshes the Supabase session cookie and lets only the owner (OWNER_USER_ID) in.
 * Everyone else goes to Sign in; an owner who still owes the authenticator code goes to the code page. Sessions end
 * after a stretch without activity or a maximum length (lib/supabase/session-policy). This is the first of several
 * checks — every server action re-checks, and the database's security rules are the last line.
 */
async function dashboardGate(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return new NextResponse("Dashboard needs Supabase settings", { status: 503 });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, browserSessionCookie(options)));
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  const owner = !!data.user && data.user.id === process.env.OWNER_USER_ID;
  const pending = owner && (await needsCode(supabase));
  const { pathname, search } = request.nextUrl;
  const signIn = pathname === "/dashboard/sign-in";
  const verify = pathname === "/dashboard/sign-in/verify";
  const next = encodeURIComponent(pathname + search);

  const redirect = (to: string) => {
    const target = NextResponse.redirect(new URL(to, request.url));
    response.cookies.getAll().forEach((c) => target.cookies.set(c));
    return target;
  };

  // Session limits: too long since sign-in, or too long without activity → signed out, back to Sign in with a note.
  if (owner) {
    const { data: auth } = await supabase.auth.getClaims();
    const lastActive = Number(request.cookies.get(ACTIVE_COOKIE)?.value) || null;
    const ended = sessionExpiry(signedInAt(auth?.claims), lastActive);
    if (ended) {
      await supabase.auth.signOut({ scope: "local" });
      const target = redirect(`/dashboard/sign-in?reason=${ended}${signIn || verify ? "" : `&next=${next}`}`);
      target.cookies.set(ACTIVE_COOKIE, "", { path: "/dashboard", maxAge: 0 });
      return target;
    }
  }

  if (!owner && !signIn) return redirect(`/dashboard/sign-in?next=${verify ? "" : next}`);
  if (pending && !verify) return redirect(signIn ? `/dashboard/sign-in/verify${search}` : `/dashboard/sign-in/verify?next=${next}`);
  if (owner && !pending && (signIn || verify)) return redirect("/dashboard");
  // Any real visit counts as activity (background link prefetches don't).
  if (owner && !pending && !request.headers.get("next-router-prefetch")) {
    response.cookies.set(ACTIVE_COOKIE, String(Date.now()), { path: "/dashboard", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: Math.ceil(IDLE_MS / 1000) });
  }
  response.headers.set("X-Robots-Tag", "noindex");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  const dashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  // In production the dashboard doesn't exist unless DASHBOARD_ENABLED=true.
  if (dashboard && process.env.NODE_ENV === "production" && process.env.DASHBOARD_ENABLED !== "true") {
    return new NextResponse("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  }
  // The dashboard is English-only and lives outside the locale routes.
  if (dashboard) return dashboardGate(request);
  if (hasLocale) return;
  request.nextUrl.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|images|favicon.ico|.*\\..*).*)"],
};
