/**
 * Inline SVG data-URI placeholders for the layout-grammar review page
 * (app/[locale]/demo/page.tsx). DEMO-ONLY: nothing here is wired into the
 * real content pipeline, and nothing under lib/demo/ should ever be imported
 * by a production route.
 *
 * There is no real generated art yet for any of the fifteen organisations, so
 * each placeholder is drawn at the EXACT pixel aspect orrery-content
 * docs/LAYOUT.md specifies for that organisation - a vista placeholder is
 * wide, a medallion placeholder is square, a strip placeholder is
 * wide-and-shallow - so the grammar reads truthfully even with nothing but a
 * labelled box standing in for the drawing.
 *
 * Swapping a placeholder for real generated art later is a one-line change
 * at the call site (replace `demoPlaceholder(...)` with the filed asset's
 * repo-relative path in `images.sketch`) - the shape of the field does not
 * change, only what it points at.
 *
 * Why a data: URI instead of a file under public/: the point of this page is
 * reviewing LAYOUT.md before any art is drawn, so nothing here should depend
 * on a committed asset (binary or otherwise) landing in the repo just to
 * demonstrate a layout.
 *
 * Colour is threaded in from the SAME themeVars() object the page applies as
 * its container's inline style (lib/theme.ts) - never hardcoded here - but it
 * has to be baked in as literal hex, not `var(--accent)`: an
 * `<img src="data:...">` is a separate, unstyled resource, not inline markup
 * in this document's tree, so it cannot see this page's CSS custom
 * properties the way an inline `<svg>` could. Only Sketch's `tint` mode gets
 * to paint `var(--accent)` through an image, and it does that by masking a
 * coloured DOM element rather than editing pixels inside the resource - see
 * components/sketch.tsx.
 *
 * One regex-driven fixed point to protect: `imageSlots()`
 * (components/river/shared.tsx) derives a second/third slot from the FIRST
 * slot's raw string by splicing "-2" in front of its trailing ".ext" (see
 * lib/content/assets.ts `slotPath` - this mirrors how real filed assets are
 * named, `<id>-2.webp`, `<id>-3.webp`). A data URI has no such extension, so
 * every placeholder here ends in an inert `#.svg` fragment purely so
 * `slotPath` has a `.svg` to split in front of. A data: URL's fragment is
 * dropped before the browser decodes the resource (the fragment is never
 * part of what gets fetched/parsed), so `slotPath`'s inserted "-2" lands
 * inside that dropped fragment and the image itself is untouched - which is
 * also why a diptych/split-counterpoint placeholder's two panels show the
 * same drawing: there is exactly one real image behind both slots, which is
 * an honest placeholder for two organisations whose art has not been drawn
 * at all yet (a real wing files a genuinely different `<id>-2.webp`).
 *
 * Every numeric value that ends up in the generated markup is an integer.
 * That is not a style preference: it is what keeps the string free of a
 * stray "." anywhere except the trailing `#.svg`, which is the one dot
 * `slotPath`'s regex is meant to find.
 */

export interface PlaceholderColors {
  surface: string;
  ink: string;
  accent: string;
}

export type PlaceholderPattern = "plain" | "strip" | "mosaic";

export interface PlaceholderSpec {
  /** Baked into the drawing itself, e.g. "MEDALLION" or "STRIP · UNIT 4/8". */
  label: string;
  /** e.g. "1:1", "16:9" - the aspect LAYOUT.md names for this organisation. */
  aspectLabel: string;
  /** Integer pixel dimensions. Keep these even so every derived midpoint
   * (width/2, height/2) is also an integer - see the file comment above. */
  width: number;
  height: number;
  colors: PlaceholderColors;
  pattern?: PlaceholderPattern;
}

function escapeText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeText(s).replace(/"/g, "&quot;");
}

/** A row of repeated modular units, echoing `strip`'s "5-12 units read left
 * to right" - so even the placeholder hints at sequence rather than reading
 * as a single flat rectangle. */
function stripShapes(w: number, h: number, accent: string): string {
  const n = 8;
  const gap = Math.round(w / 48);
  const unit = Math.round((w - gap * (n + 1)) / n);
  const y = Math.round(h / 5);
  const uh = Math.round((h * 3) / 5);
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = gap + i * (unit + gap);
    out += `<rect x="${x}" y="${y}" width="${unit}" height="${uh}" rx="6" fill="${accent}22" stroke="${accent}90" stroke-width="2"/>`;
  }
  return out;
}

/** A handful of unequal, overlapping fragments with one dominant piece -
 * `mosaic`'s "irregular editorial field" in miniature. Fractions are only
 * ever used as JS arithmetic inputs; every coordinate written into the SVG
 * itself is rounded to an integer before it is stringified. */
function mosaicShapes(w: number, h: number, accent: string): string {
  const frags: Array<[number, number, number, number]> = [
    [6, 10, 55, 60],
    [50, 6, 46, 40],
    [46, 50, 30, 34],
    [70, 46, 26, 30],
    [10, 66, 34, 26],
  ];
  let out = "";
  for (const [fx, fy, fw, fh] of frags) {
    const x = Math.round((fx * w) / 100);
    const y = Math.round((fy * h) / 100);
    const rw = Math.round((fw * w) / 100);
    const rh = Math.round((fh * h) / 100);
    out += `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" rx="8" fill="${accent}18" stroke="${accent}80" stroke-width="2"/>`;
  }
  return out;
}

/** Build one placeholder data URI at the given spec. See the file header for
 * why it is a data: URI, why every number in it is an integer, and why it
 * ends in an inert `#.svg`. */
export function demoPlaceholder(spec: PlaceholderSpec): string {
  const { label, aspectLabel, width: w, height: h, colors, pattern = "plain" } = spec;
  const cx = w / 2;
  const cy = h / 2;

  // Font size is the smaller of two independent constraints: a box-relative
  // size (so a tiny marginalia placeholder doesn't get the same absolute
  // point size as a full-bleed vista) AND a width-relative size that keeps
  // the label from overrunning the canvas (a long label like "SPLIT
  // COUNTERPOINT · LANE" on an 800-wide panel needs a noticeably smaller
  // face than a short one like "PASSAGE" on the same width). Monospace glyph
  // advance is close enough to a fixed fraction of the em size that this
  // integer approximation (no real text-measurement API exists at this
  // layer - this is a data URI, not the DOM) keeps every label safely inside
  // its dashed border with margin to spare.
  const sizeForLabel = (text: string, base: number, margin: number) => {
    const byBox = base;
    const byWidth = Math.floor((w * margin) / (Math.max(text.length, 1) * 0.64));
    return Math.max(14, Math.min(byBox, byWidth));
  };
  const fontSize = sizeForLabel(label, Math.round(Math.min(w, h) / 14) || 20, 0.82);
  const smallFont = sizeForLabel(aspectLabel, Math.max(14, fontSize - 8), 0.7);

  // Proportional, not fixed: several organisations (immersion on a short
  // mobile band, interlude, marginalia) render the sketch at a small
  // fraction of its source canvas. A flat "3px" stroke at, say, 1200 source
  // units becomes sub-pixel once scaled down to a 240px-tall card and
  // effectively disappears - which defeats the one thing a placeholder is
  // for (reading truthfully even with no art). Scaling with the canvas keeps
  // the dashed border legible at whatever size the organisation actually
  // displays it.
  const strokeWidth = Math.max(3, Math.round(Math.min(w, h) * 0.008));
  const dash = strokeWidth * 5;
  const dashGap = strokeWidth * 3;

  const shapes =
    pattern === "strip"
      ? stripShapes(w, h, colors.accent)
      : pattern === "mosaic"
        ? mosaicShapes(w, h, colors.accent)
        : "";

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeAttr(label)}">` +
    `<rect width="${w}" height="${h}" fill="${colors.surface}"/>` +
    `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" fill="none" stroke="${colors.accent}c0" stroke-width="${strokeWidth}" stroke-dasharray="${dash} ${dashGap}"/>` +
    shapes +
    `<text x="${cx}" y="${cy - smallFont}" font-family="ui-monospace,monospace" font-size="${fontSize}" font-weight="600" fill="${colors.ink}" text-anchor="middle" dominant-baseline="middle">${escapeText(label)}</text>` +
    `<text x="${cx}" y="${cy + smallFont}" font-family="ui-monospace,monospace" font-size="${smallFont}" fill="${colors.accent}" text-anchor="middle" dominant-baseline="middle">${escapeText(aspectLabel)}</text>` +
    `</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}#.svg`;
}
