"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createGroupAction } from "@/app/actions/groups";
import { GROUP_HANDLE_RE, GROUP_NAME_MAX } from "@/lib/groups/types";

interface FranchiseOption {
  slug: string;
  name: string;
  orders: { value: string; label: string }[];
}

/** Create a book club: name, handle, franchise + which order to read together. */
export function CreateGroupForm({ franchises }: { franchises: FranchiseOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [franchiseSlug, setFranchiseSlug] = useState(franchises[0]?.slug ?? "");
  const [orderRef, setOrderRef] = useState("canon:default");
  const [pace, setPace] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const orders = useMemo(
    () => franchises.find((f) => f.slug === franchiseSlug)?.orders ?? [{ value: "canon:default", label: "Complete works" }],
    [franchises, franchiseSlug]
  );
  const handleValid = GROUP_HANDLE_RE.test(handle);

  function pickFranchise(slug: string) {
    setFranchiseSlug(slug);
    setOrderRef("canon:default"); // reset order to the always-valid default
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await createGroupAction({
      handle,
      name,
      description: description || null,
      franchiseSlug,
      orderRef,
      pace: pace || null,
      isPublic,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Could not create the group.");
      return;
    }
    router.push(`/g/${res.handle}`);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white"
      >
        Start a book club
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
      <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-500">New book club</h2>
      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm text-neutral-400">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, GROUP_NAME_MAX))}
            placeholder="e.g. The Constant Readers"
            className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
          />
        </label>

        <label className="block">
          <span className="text-sm text-neutral-400">Handle</span>
          <div className="mt-1 flex items-center rounded-md border border-neutral-800 bg-neutral-900 focus-within:border-neutral-600">
            <span className="pl-3 text-sm text-neutral-600">g/</span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase())}
              placeholder="constant_readers"
              className="w-full bg-transparent px-1 py-2 text-sm text-neutral-100 outline-none"
            />
          </div>
          {handle && !handleValid && (
            <span className="mt-1 block text-xs text-amber-500">
              3-30 characters: lowercase letters, numbers or underscore.
            </span>
          )}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-neutral-400">Franchise</span>
            <select
              value={franchiseSlug}
              onChange={(e) => pickFranchise(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
            >
              {franchises.map((f) => (
                <option key={f.slug} value={f.slug}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-neutral-400">Reading order</span>
            <select
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
            >
              {orders.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm text-neutral-400">Pace (optional)</span>
          <input
            value={pace}
            onChange={(e) => setPace(e.target.value)}
            placeholder="e.g. one book a month"
            className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
          />
        </label>

        <label className="block">
          <span className="text-sm text-neutral-400">Description (optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full resize-none rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
          />
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 accent-neutral-200"
          />
          <span className="text-sm text-neutral-300">Anyone can find and join</span>
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy || !name.trim() || !handleValid}
            className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create club"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-300">
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
