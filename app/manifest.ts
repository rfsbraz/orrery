import type { MetadataRoute } from "next";

// PWA manifest. Installed, Orrery should feel like a reading companion you
// keep on the home screen: opens standalone, dark by default (the museum is
// dark), portrait-first because the walk is a vertical scroll.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Orrery - reading journeys in context",
    short_name: "Orrery",
    description:
      "Follow an author through their reading orders on a timeline of the life, world, and cultural events that shaped each book.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    categories: ["books", "education", "lifestyle"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "The Hall", short_name: "Hall", url: "/hall" },
      { name: "My shelf", short_name: "Shelf", url: "/me" },
    ],
  };
}
