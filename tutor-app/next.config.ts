import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // This app lives in a subdirectory alongside an unrelated sibling project
  // (a separate Next.js app with its own lockfile) — pin the workspace root
  // so Turbopack doesn't try to resolve files from the sibling's src/.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
