import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Parent directories may contain other lockfiles; pin the workspace root for Turbopack.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
