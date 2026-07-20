import type { ArcModel } from "@/lib/content/connections";

// Layout constants (SVG user units). The diagram is a vertical beam: one row
// per participating work, arcs bowing right - the franchise signature made
// navigable. Server-rendered static SVG; text scales with the viewBox.
const ROW = 34;
const PAD_TOP = 14;
const BEAM_X = 250;
const LABEL_X = BEAM_X - 14;
const WIDTH = 640;

/**
 * The connections arc diagram. Works sit chronologically on the beam; each
 * explicit connection is an arc whose reach shows how far back a book leans.
 * Deliberately quiet: thin strokes, the accent color only, no legend clutter.
 */
export function ArcMap({ model }: { model: ArcModel }) {
  const height = PAD_TOP * 2 + model.nodes.length * ROW;
  const y = (i: number) => PAD_TOP + i * ROW + ROW / 2;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      role="img"
      aria-label="Map of connections between works"
      className="w-full"
    >
      {/* the beam */}
      <line
        x1={BEAM_X}
        y1={PAD_TOP}
        x2={BEAM_X}
        y2={height - PAD_TOP}
        stroke="var(--accent)"
        strokeOpacity={0.35}
        strokeWidth={1}
      />
      {/* arcs */}
      {model.arcs.map((a, k) => {
        const y1 = y(a.i);
        const y2 = y(a.j);
        const span = y2 - y1;
        const bow = Math.min(40 + span * 0.18, 300);
        return (
          <path
            key={k}
            d={`M ${BEAM_X} ${y1} C ${BEAM_X + bow} ${y1}, ${BEAM_X + bow} ${y2}, ${BEAM_X} ${y2}`}
            fill="none"
            stroke="var(--accent)"
            strokeOpacity={0.55}
            strokeWidth={1.2}
          />
        );
      })}
      {/* nodes + labels */}
      {model.nodes.map((n, i) => (
        <g key={n.id}>
          <circle cx={BEAM_X} cy={y(i)} r={3.2} fill="var(--accent)" />
          <a href={`/f/${n.id.split("/")[0]}#w-${n.id.split("/")[1]}`}>
            <text
              x={LABEL_X}
              y={y(i) + 3.5}
              textAnchor="end"
              fill="var(--ink)"
              fillOpacity={0.85}
              style={{ fontSize: "12px" }}
            >
              {n.title}
            </text>
          </a>
          <text
            x={BEAM_X + 10}
            y={y(i) + 3.5}
            fill="var(--muted)"
            style={{ fontSize: "10px", fontFamily: "var(--font-mono, monospace)" }}
          >
            {n.year}
          </text>
        </g>
      ))}
    </svg>
  );
}
