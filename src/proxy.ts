import { NextResponse, type NextRequest } from "next/server";

const locales = ["en", "km", "zh"];

function preferredLocale(request: NextRequest) {
  const saved = request.cookies.get("locale")?.value;
  if (saved && locales.includes(saved)) return saved;
  const accept = request.headers.get("accept-language") ?? "";
  if (/(^|,)\s*km\b/i.test(accept)) return "km";
  return /(^|,)\s*zh\b/i.test(accept) ? "zh" : "en";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  const dashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  // No login yet: in production the dashboard doesn't exist unless DASHBOARD_ENABLED=true (turn on once auth is in).
  if (dashboard && process.env.NODE_ENV === "production" && process.env.DASHBOARD_ENABLED !== "true") {
    return new NextResponse("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  }
  // The dashboard is English-only and lives outside the locale routes.
  if (hasLocale || dashboard) return;
  request.nextUrl.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|images|favicon.ico|.*\\..*).*)"],
};
