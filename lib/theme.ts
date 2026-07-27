import type { CSSProperties } from "react";
import type { Theme } from "./content/types";

// Franchise theming is content-driven (CONCEPT §6): the palette, the display
// face, and the signature element all come from the franchise's theme.yaml.
// The app supplies only the *curated set* those choices pick from - which is
// the design law itself ("one display typeface, from a curated set"), not a
// hardcoded franchise preference.

// Default (brand-neutral) palette; a franchise theme overrides these via CSS vars.
const DEFAULT = {
  bg: "#0f1115",
  surface: "#171a21",
  accent: "#8a8f98",
  ink: "#e8e6e1",
  muted: "#8b8f98",
};

/**
 * The curated display faces. A theme's `displayFace` selects one by key; the
 * value is the CSS variable the root layout loads it into. Adding a face is a
 * deliberate design decision (new font import in layout.tsx + an entry here),
 * which is exactly the gate the design law wants.
 */
export const DISPLAY_FACES: Record<string, string> = {
  fraunces: "var(--font-display-fraunces)",
  spectral: "var(--font-display-spectral)",
  sourceSerif: "var(--font-display-source-serif)",
  "instrument-serif": "var(--font-display-instrument-serif)",
};

export const DEFAULT_DISPLAY_FACE = "fraunces";

/** Signature elements a franchise can choose in theme.yaml. */
export type SignatureKind = "beam" | "thread" | "rule" | "filament" | "none";

const SIGNATURES = new Set<SignatureKind>([
  "beam",
  "thread",
  "rule",
  "filament",
  "none",
]);

/** The franchise's signature element, defaulting to the neutral vertical thread. */
export function signatureOf(theme?: Theme): SignatureKind {
  const s = theme?.signature;
  return s && SIGNATURES.has(s as SignatureKind) ? (s as SignatureKind) : "thread";
}

/**
 * Turn a franchise theme into CSS custom properties for its page: the palette
 * plus the display face it selected (falling back to the curated default when
 * a theme names a face the app has not curated yet).
 */
export function themeVars(theme?: Theme): CSSProperties {
  const p = { ...DEFAULT, ...(theme?.palette ?? {}) };
  const face =
    DISPLAY_FACES[theme?.displayFace ?? ""] ?? DISPLAY_FACES[DEFAULT_DISPLAY_FACE];
  return {
    ["--bg" as string]: p.bg,
    ["--surface" as string]: p.surface,
    ["--accent" as string]: p.accent,
    ["--ink" as string]: p.ink,
    ["--muted" as string]: p.muted,
    ["--font-display" as string]: face,
  };
}

/** Tailwind classes for the signature's vertical line, per franchise choice. */
export const signatureLine: Record<SignatureKind, string> = {
  // A bold, warm gradient rail - the works string along it.
  beam: "w-px bg-gradient-to-b from-[var(--accent)] via-[var(--accent)]/35 to-transparent",
  // A quiet hairline: continuity without drama (the neutral default).
  thread: "w-px bg-[var(--ink)]/15",
  // A firm architectural rule.
  rule: "w-0.5 bg-[var(--accent)]/45",
  // A single luminous strand threading the works - hairline, lit rather than
  // coloured, so it reads as one continuous filament rather than a border.
  filament: "w-px bg-[var(--accent)]/70 shadow-[0_0_4px_var(--accent)]",
  // `none` opts a wing OUT OF A BRANDED SIGNATURE (Jim Butcher: fabricating a
  // cross-series thread would assert a link the author denies), not out of
  // the river having a spine at all - the rail is the read itself, not a
  // decoration, and a reader on a `none` wing still needs to see one
  // continuous line down the page. So it renders the same quiet hairline as
  // the neutral `thread` default rather than nothing.
  none: "w-px bg-[var(--ink)]/15",
};

export const impactStyles: Record<string, string> = {
  high: "border-[var(--accent)] opacity-100",
  med: "border-[var(--accent)]/50 opacity-90",
  low: "border-[var(--ink)]/20 opacity-70",
};
