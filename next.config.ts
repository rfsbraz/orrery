import type { NextConfig } from "next";

/** Old wing slug -> the author it was renamed to. Append, never remove: a
 * redirect is the only thing keeping a previously shared link working. */
const RENAMED_WINGS: [string, string][] = [
  ["cosmere", "brandon-sanderson"],
  ["discworld", "terry-pratchett"],
  ["wheel-of-time", "robert-jordan"],
];

const nextConfig: NextConfig = {
  // The River (strata) is now the franchise root; keep shared /river links alive.
  async redirects() {
    return [
      { source: "/f/:slug/river", destination: "/f/:slug", permanent: true },
      // Wings are authors, so three slugs named after the fiction were renamed
      // to the people who wrote it. Ids are permanent by rule, and these ones
      // moved, so every link ever shared to the old URL is kept alive here
      // rather than 404ing. Both locales, since /pt is a real prefix.
      ...RENAMED_WINGS.flatMap(([from, to]) => [
        { source: `/f/${from}`, destination: `/f/${to}`, permanent: true },
        { source: `/f/${from}/:path*`, destination: `/f/${to}/:path*`, permanent: true },
        { source: `/pt/f/${from}`, destination: `/pt/f/${to}`, permanent: true },
        { source: `/pt/f/${from}/:path*`, destination: `/pt/f/${to}/:path*`, permanent: true },
      ]),
    ];
  },
  // Standalone output for a lean Docker image (homeberry now, cloud later).
  output: "standalone",
};

export default nextConfig;
