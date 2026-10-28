import type { NextConfig } from "next";

// Uploaded covers live in Supabase Storage; next/image may load them from that one bucket path only.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/covers/**" }] : [],
  },
  // Lets phones on the same Wi-Fi use the dev server (http://<this Mac's IP>:3000) with hot reload.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  // The dev-only "N" button defaults to bottom-left, where it covers the sidebar's Settings button.
  devIndicators: { position: "bottom-right" },
  partialPrefetching: true,
  // Security headers on every page. No script CSP yet: the inline theme script and YouTube player would need nonces.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Nobody else may show the site in a frame (clickjacking); no plugins; forms only post back here.
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The site never uses these; YouTube's player keeps autoplay / fullscreen.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
