import type { NextConfig } from "next";

// The Base44 sandbox serves the app through a public preview host. Everything
// below only applies when BASE44_PREVIEW_MODE is exactly "1"; otherwise the
// original (empty) configuration is used unchanged.
const inSandbox =
  process.env.BASE44_PREVIEW_MODE === "1" && !!process.env.BASE44_PUBLIC_HOST_SUFFIX;

// The dev server must accept dev-asset requests coming from the preview origin.
const allowedDevOrigins = inSandbox
  ? [`3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`]
  : [];

// The sandbox runs its own Supabase-compatible API (see docker-compose.base44.yml).
// Proxying it through this app's own origin keeps the session cookies same-origin
// and avoids third-party CORS entirely.
const rewrites =
  inSandbox && process.env.SUPABASE_GATEWAY_URL
    ? [{ source: "/api/supabase/:path*", destination: `${process.env.SUPABASE_GATEWAY_URL}/:path*` }]
    : [];

const nextConfig: NextConfig = {
  allowedDevOrigins,
  async rewrites() {
    return rewrites;
  },
};

export default nextConfig;
