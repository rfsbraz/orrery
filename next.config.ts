import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The River (strata) is now the franchise root; keep shared /river links alive.
  async redirects() {
    return [{ source: "/f/:slug/river", destination: "/f/:slug", permanent: true }];
  },
  // Standalone output for a lean Docker image (homeberry now, cloud later).
  output: "standalone",
};

export default nextConfig;
