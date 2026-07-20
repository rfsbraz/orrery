"use client";

import { useLocale, useT } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n/config";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { joinGroupAction, leaveGroupAction } from "@/app/actions/groups";

/** Join/leave toggle for a group. Owners can't leave their own club here. */
export function Membership({
  groupId,
  handle,
  isMember,
  isOwner,
  authed,
}: {
  groupId: string;
  handle: string;
  isMember: boolean;
  isOwner: boolean;
  authed: boolean;
}) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authed) {
    return (
      <Link
        href={localePath(locale, "/login")}
        className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white"
      >
        {t("groups.signInToJoin")}
      </Link>
    );
  }
  if (isOwner) return <span className="text-sm text-neutral-500">You own this club</span>;

  async function toggle() {
    setBusy(true);
    setError(null);
    const res = isMember ? await leaveGroupAction(groupId, handle) : await joinGroupAction(groupId, handle);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Failed.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggle}
        disabled={busy}
        className={
          isMember
            ? "rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:border-neutral-500 disabled:opacity-50"
            : "rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white disabled:opacity-50"
        }
      >
        {busy ? "…" : isMember ? "Leave club" : "Join club"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
