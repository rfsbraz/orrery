import { ImageResponse } from "next/og";
import { getAllBundles } from "@/lib/content";
import { getCurrentUser } from "@/lib/supabase/server";
import { getMyProgress } from "@/lib/supabase/progress";
import { buildYearRecap, recapHeadline } from "@/lib/progress/recap";

export const dynamic = "force-dynamic";

// The shareable card: a 1200x630 image of the year's recap, generated for the
// signed-in reader on demand (their data stays theirs - they choose where it
// goes). Quiet dark card in the house style, no logos shouting.
export async function GET(req: Request, ctx: { params: Promise<{ locale: string; year: string }> }) {
  const { year: raw } = await ctx.params;
  const year = Number(raw);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return new Response("Not found", { status: 404 });
  }
  const user = await getCurrentUser();
  if (!user) return new Response("Sign in required", { status: 401 });

  const recap = buildYearRecap(year, getAllBundles(), await getMyProgress());
  const span = recap.publicationSpan;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#101014",
          color: "#e8e6e1",
          fontSize: 28,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, letterSpacing: 6, color: "#8b8f98" }}>{year}</div>
          <div style={{ fontSize: 56, fontWeight: 700, marginTop: 8 }}>
            A year in reading
          </div>
          <div style={{ fontSize: 32, marginTop: 20, color: "#c9c6bf" }}>
            {recapHeadline(recap)}
          </div>
          {recap.longestGap && (recap.longestGap.gapYears ?? 0) > 0 && (
            <div style={{ fontSize: 26, marginTop: 14, color: "#9a8f7e" }}>
              Longest wait closed: {recap.longestGap.work.title} (
              {recap.longestGap.gapYears} years).
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 40 }}>
            <Metric n={recap.books.length} label="books" />
            <Metric n={recap.franchisesTouched.length} label="franchises" />
            {span && <Metric n={span.to - span.from + 1} label="writing years" />}
          </div>
          <div style={{ fontSize: 24, color: "#8b8f98" }}>orrery</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

function Metric({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: 64, fontWeight: 700 }}>{n}</div>
      <div style={{ fontSize: 20, letterSpacing: 3, color: "#8b8f98" }}>{label}</div>
    </div>
  );
}
