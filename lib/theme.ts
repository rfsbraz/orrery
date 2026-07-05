import type { CSSProperties } from "react";
import type { Theme } from "./content/types";

// Default (brand-neutral) palette; a franchise theme overrides these via CSS vars.
const DEFAULT = {
  bg: "#0f1115",
  surface: "#171a21",
  accent: "#8a8f98",
  ink: "#e8e6e1",
};

/** Turn a franchise theme's palette into CSS custom properties for its page. */
export function themeVars(theme?: Theme): CSSProperties {
  const p = { ...DEFAULT, ...(theme?.palette ?? {}) };
  return {
    ["--bg" as string]: p.bg,
    ["--surface" as string]: p.surface,
    ["--accent" as string]: p.accent,
    ["--ink" as string]: p.ink,
  };
}

export const impactStyles: Record<string, string> = {
  high: "border-[var(--accent)] opacity-100",
  med: "border-[var(--accent)]/50 opacity-90",
  low: "border-[var(--ink)]/20 opacity-70",
};
