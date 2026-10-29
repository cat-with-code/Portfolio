/**
 * Heartbeat for the session limits: the dashboard calls this while you type or click, so the proxy (which runs before
 * every /dashboard request) records the activity. It just answers "ok"; signed-out callers are redirected by the proxy.
 */
export function GET() {
  return new Response("ok", { headers: { "Cache-Control": "no-store" } });
}
