import { getAllBundles } from "@/lib/content";
import { getCurrentUser } from "@/lib/supabase/server";
import { getMyProgress } from "@/lib/supabase/progress";
import { buildYearRecap } from "@/lib/progress/recap";
import { renderRecapCard } from "@/lib/og/recap-card";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ locale: string; year: string }> }) {
  const { year: raw } = await ctx.params;
  const year = Number(raw);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return new Response("Not found", { status: 404 });
  }
  const user = await getCurrentUser();
  if (!user) return new Response("Sign in required", { status: 401 });

  return renderRecapCard(buildYearRecap(year, getAllBundles(), await getMyProgress()));
}
