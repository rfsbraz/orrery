import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces, Spectral, Source_Serif_4 } from "next/font/google";
import { RegisterSW } from "@/components/pwa/register-sw";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });
// The curated display faces (CONCEPT §6): each franchise's theme.yaml picks
// one by key via lib/theme.ts DISPLAY_FACES; the body/mono faces never vary.
// Characterful-but-modern serifs only - no novelty or genre fonts.
const fraunces = Fraunces({
  variable: "--font-display-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});
const spectral = Spectral({
  variable: "--font-display-spectral",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});
const sourceSerif = Source_Serif_4({
  variable: "--font-display-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orrery",
  description: "Reading journeys in context",
  applicationName: "Orrery",
  appleWebApp: { capable: true, title: "Orrery", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

// Installed, the app draws into the safe areas (see globals.css) and keeps the
// browser chrome dark to match the museum.
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${spectral.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-neutral-950 font-sans text-neutral-200">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
