"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfileAction } from "@/app/actions/profile";
import { HANDLE_RE, type Profile } from "@/lib/profile/types";

// Country drives locale + per-country store links later. Small curated list;
// blank is fine (falls back to generic links).
const COUNTRIES = [
  ["", "—"],
  ["PT", "Portugal"],
  ["ES", "Spain"],
  ["GB", "United Kingdom"],
  ["US", "United States"],
  ["FR", "France"],
  ["DE", "Germany"],
  ["BR", "Brazil"],
  ["IT", "Italy"],
];

/** Create/edit the signed-in user's public profile, inline on /me. */
export function ProfileEditor({ initial }: { initial: Profile | null }) {
  const router = useRouter();
  const [handle, setHandle] = useState(initial?.handle ?? "");
  const [displayName, setDisplayName] = useState(initial?.displayName ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleValid = HANDLE_RE.test(handle);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);
    const res = await saveProfileAction({
      handle,
      displayName: displayName || null,
      bio: bio || null,
      country: country || null,
      isPublic,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Could not save.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <section className="mt-14 rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
      <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-500">Public profile</h2>
      <p className="mt-2 text-sm text-neutral-400">
        Your shelf is private until you make it public. A public shelf lives at{" "}
        <span className="text-neutral-300">orrery/u/{handle || "handle"}</span>.
      </p>

      <form onSubmit={save} className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm text-neutral-400">Handle</span>
          <div className="mt-1 flex items-center rounded-md border border-neutral-800 bg-neutral-900 focus-within:border-neutral-600">
            <span className="pl-3 text-sm text-neutral-600">u/</span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase())}
              placeholder="reader_name"
              className="w-full bg-transparent px-1 py-2 text-sm text-neutral-100 outline-none"
            />
          </div>
          {handle && !handleValid && (
            <span className="mt-1 block text-xs text-amber-500">
              3-30 characters: lowercase letters, numbers or underscore.
            </span>
          )}
        </label>

        <label className="block">
          <span className="text-sm text-neutral-400">Display name</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Optional"
            className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
          />
        </label>

        <label className="block">
          <span className="text-sm text-neutral-400">Bio</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            placeholder="Optional"
            className="mt-1 w-full resize-none rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
          />
        </label>

        <label className="block">
          <span className="text-sm text-neutral-400">Country</span>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
          >
            {COUNTRIES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 accent-neutral-200"
          />
          <span className="text-sm text-neutral-300">Make my shelf public</span>
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy || !handleValid}
            className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save profile"}
          </button>
          {saved && isPublic && handleValid && (
            <a href={`/u/${handle}`} className="text-sm text-neutral-400 underline hover:text-neutral-200">
              View public shelf →
            </a>
          )}
          {saved && !isPublic && <span className="text-sm text-neutral-500">Saved.</span>}
        </div>
      </form>
    </section>
  );
}
