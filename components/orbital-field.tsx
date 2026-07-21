/**
 * The orbital field - the app's signature mark on mobile surfaces. A small
 * deterministic "orrery" of elliptical orbits and nodes, seeded from a slug so
 * every franchise carries its own stable constellation, drawn in the
 * franchise accent on the dark ground. Decorative only (aria-hidden); one
 * node drifts on a very slow orbit, and sits still under reduced motion
 * (the `orbit` keyframes are wrapped in a motion-safe media query).
 */

// Tiny deterministic PRNG (mulberry32) so a slug always draws the same sky.
function seeded(slug: string): () => number {
  let h = 1779033703;
  for (let i = 0; i < slug.length; i++) {
    h = Math.imul(h ^ slug.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function OrbitalField({
  seed,
  className = "",
}: {
  seed: string;
  className?: string;
}) {
  const rnd = seeded(seed);
  // 3 orbits around a common off-centre focus, like a sky chart's plate.
  const cx = 200 + (rnd() - 0.5) * 60;
  const cy = 110 + (rnd() - 0.5) * 40;
  const orbits = [0, 1, 2].map((i) => {
    const rx = 70 + i * 55 + rnd() * 22;
    const ry = rx * (0.42 + rnd() * 0.2);
    const rot = -18 + rnd() * 36;
    return { rx, ry, rot };
  });
  // Fixed nodes: each sits ON an orbit at a seeded angle.
  const nodes = orbits.flatMap((o, i) => {
    const count = 1 + (i % 2);
    return Array.from({ length: count }, () => {
      const a = rnd() * Math.PI * 2;
      return {
        x: Math.cos(a) * o.rx,
        y: Math.sin(a) * o.ry,
        rot: o.rot,
        r: 1.6 + rnd() * 1.8,
        dim: rnd() > 0.5,
      };
    });
  });
  const sat = orbits[1];

  return (
    <svg
      aria-hidden
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none select-none text-[var(--accent)] ${className}`}
    >
      <g transform={`translate(${cx} ${cy})`}>
        {orbits.map((o, i) => (
          <ellipse
            key={i}
            rx={o.rx}
            ry={o.ry}
            transform={`rotate(${o.rot})`}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.22 - i * 0.05}
            strokeWidth="1"
          />
        ))}
        {nodes.map((n, i) => (
          <g key={i} transform={`rotate(${n.rot})`}>
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill="currentColor"
              fillOpacity={n.dim ? 0.35 : 0.75}
            />
          </g>
        ))}
        {/* the satellite: one accent node on a slow, honest orbit */}
        <g transform={`rotate(${sat.rot})`}>
          <g className="orbital-sat" style={{ ["--orx" as string]: `${sat.rx}px`, ["--ory" as string]: `${sat.ry}px` }}>
            <circle r="2.6" fill="currentColor" />
            <circle r="6" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.75" />
          </g>
        </g>
      </g>
    </svg>
  );
}
