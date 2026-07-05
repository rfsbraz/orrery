// A small, honest curation credit: shows the Curator role and how many
// community orders this reader has had approved. Rendered on profiles.
export function CuratorCredit({
  isModerator,
  approvedOrders,
}: {
  isModerator: boolean;
  approvedOrders: number;
}) {
  if (!isModerator && approvedOrders === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {isModerator && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-700/50 bg-amber-950/30 px-3 py-1 text-xs font-medium text-amber-300">
          <span>✦</span> Curator
        </span>
      )}
      {approvedOrders > 0 && (
        <span className="rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1 text-xs text-neutral-400">
          {approvedOrders} reading order{approvedOrders === 1 ? "" : "s"} accepted
        </span>
      )}
    </div>
  );
}
