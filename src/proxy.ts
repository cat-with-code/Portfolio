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
  if (hasLocale) return;
  request.nextUrl.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|images|favicon.ico|.*\\..*).*)"],
};
