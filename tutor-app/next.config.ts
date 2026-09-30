import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // This app lives in a subdirectory alongside an unrelated sibling project
  // (a separate Next.js app with its own lockfile) — pin the workspace root
  // so Turbopack doesn't try to resolve files from the sibling's src/.
  turbopack: {
    root: path.join(__dirname),
  },
  // Lets `npm run dev` be reached from another device on the same Wi-Fi
  // (e.g. a phone) by its LAN IP, which Next.js otherwise blocks as a
  // cross-origin dev request. Set ALLOWED_DEV_ORIGINS in .env to your
  // machine's LAN IP (see .env.example). Not needed for `npm run start`.
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(",") ?? [],
};

export default nextConfig;
