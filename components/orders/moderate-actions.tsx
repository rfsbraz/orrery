"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { moderateOrderAction } from "@/app/actions/orders";

/** Approve/reject buttons for one pending order. Removes the card on success. */
export function ModerateActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  async function act(status: "approved" | "rejected") {
    setBusy(true);
    setError(null);
    const res = await moderateOrderAction(id, status);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Failed.");
      return;
    }
    setDone(status);
    router.refresh();
  }

  if (done) {
    return <span className="text-sm text-neutral-500">{done === "approved" ? "Approved ✓" : "Rejected"}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => act("approved")}
        disabled={busy}
        className="rounded-md bg-emerald-600/90 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={() => act("rejected")}
        disabled={busy}
        className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:border-neutral-500 disabled:opacity-50"
      >
        Reject
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
