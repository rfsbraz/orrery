import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for a lean Docker image (homeberry now, cloud later).
  output: "standalone",
};

export default nextConfig;
