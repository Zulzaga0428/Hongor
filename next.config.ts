import path from "node:path";
import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // PGlite нь WASM файлуудаа node_modules-оос уншдаг — багцлахгүй.
  serverExternalPackages: ["@electric-sql/pglite"],
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Service worker шинэчлэгдмэгц утсанд хүрэх ёстой — хөтөч кэшлэхгүй.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] },
    ];
  },
  turbopack: {
    // Гэрийн хавтас (C:\Users\User) өөрөө git repo тул үндсийг ил заана.
    root: path.resolve(process.cwd()),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
