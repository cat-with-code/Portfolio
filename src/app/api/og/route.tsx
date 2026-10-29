/**
 * The site's share preview (1200×630), shown when a page is linked on social apps and chats. One fixed image — it
 * takes no input, so nobody can make it say something else — built once at build time.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

/** The memoji as a data URL, read once while building (cached, so the route can be prerendered). */
async function memojiDataUrl() {
  "use cache";
  return `data:image/png;base64,${(await readFile(join(process.cwd(), "public/images/memoji.png"))).toString("base64")}`;
}

export async function GET() {
  const memoji = await memojiDataUrl();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 64, padding: "0 96px", background: "#f5f6f8", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 20 }}>
          <div style={{ fontSize: 26, letterSpacing: 4, color: "#2267f2", fontWeight: 600 }}>PHNOM PENH · CAMBODIA</div>
          <div style={{ fontSize: 76, lineHeight: 1.05, fontWeight: 700, color: "#0d0d0d", letterSpacing: -2 }}>{profile.name}</div>
          <div style={{ fontSize: 34, color: "#4a4f57" }}>UI/UX designer & developer</div>
          <div style={{ display: "flex", gap: 14, marginTop: 24 }}>
            {["Projects", "Writing", "Study", "Games"].map((t) => (
              <div key={t} style={{ fontSize: 24, color: "#0d0d0d", background: "#ffffff", border: "2px solid #e3e6eb", borderRadius: 999, padding: "10px 24px" }}>
                {t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: 340, height: 340, borderRadius: 999, background: "#2267f2", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "16px solid #dbe6fd" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered into the PNG by next/og */}
          <img src={memoji} width={380} height={380} alt="" style={{ marginTop: 40 }} />
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } }
  );
}
