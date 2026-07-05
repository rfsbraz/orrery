"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { previewImportAction, type ImportPreview } from "@/app/actions/import";
import { importProgressAction } from "@/app/actions/progress";

// Import a Goodreads or StoryGraph library export. The file is read in the
// browser, matched to canon server-side, previewed, then committed on confirm.
export default function ImportPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setDone(false);
    setPreview(null);
    setFileName(file.name);
    setBusy(true);
    try {
      const text = await file.text();
      const result = await previewImportAction(text);
      if (!result.authed) {
        setError("Sign in first to import your shelf.");
      } else if (result.matched.length === 0 && result.unmatched.length === 0) {
        setError("No books found. Is this a Goodreads or StoryGraph CSV export?");
      } else {
        setPreview(result);
      }
    } catch {
      setError("Couldn't read that file.");
    }
    setBusy(false);
  }

  async function confirm() {
    if (!preview) return;
    setBusy(true);
    const res = await importProgressAction(preview.matched);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Import failed.");
      return;
    }
    setDone(true);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <Link href="/me" className="text-xs text-neutral-500 hover:text-neutral-300">
        ← Your shelf
      </Link>
      <h1 className="display mt-4 text-3xl font-semibold text-neutral-100">Import your reading</h1>
      <p className="mt-2 max-w-prose text-neutral-400">
        Bring your history from Goodreads or StoryGraph. Export your library as CSV, drop it here, and
        we&apos;ll match it to the canon before saving anything.
      </p>

      <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-700 bg-neutral-900/30 px-6 py-10 text-center hover:border-neutral-500">
        <span className="text-sm text-neutral-300">
          {fileName ? `Selected: ${fileName}` : "Choose a CSV file"}
        </span>
        <span className="mt-1 text-xs text-neutral-600">Goodreads or StoryGraph export</span>
        <input type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
      </label>

      {busy && !done && <p className="mt-6 text-sm text-neutral-400">Working…</p>}
      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      {done && (
        <div className="mt-6 rounded-lg border border-emerald-900/60 bg-emerald-950/30 p-4">
          <p className="text-sm text-emerald-300">
            Imported {preview?.matched.length} books.{" "}
            <Link href="/me" className="underline">
              See your shelf →
            </Link>
          </p>
        </div>
      )}

      {preview && !done && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-300">
              <span className="font-semibold text-neutral-100">{preview.matched.length}</span> matched
              {preview.unmatched.length > 0 && (
                <>
                  {" · "}
                  <span className="text-neutral-500">{preview.unmatched.length} not in canon (skipped)</span>
                </>
              )}
            </p>
            <button
              onClick={confirm}
              disabled={busy || preview.matched.length === 0}
              className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white disabled:opacity-50"
            >
              {busy ? "Importing…" : `Import ${preview.matched.length}`}
            </button>
          </div>

          {preview.matched.length > 0 && (
            <ol className="mt-5 space-y-1">
              {preview.matched.map((m) => (
                <li
                  key={m.workId}
                  className="flex items-baseline justify-between gap-4 border-b border-neutral-900 py-1.5 text-sm"
                >
                  <span className="text-neutral-200">{m.title}</span>
                  <span className="shrink-0 text-xs uppercase tracking-wide text-neutral-500">
                    {m.status}
                    {m.dateRead ? ` · ${m.dateRead}` : ""}
                  </span>
                </li>
              ))}
            </ol>
          )}

          {preview.unmatched.length > 0 && (
            <details className="mt-6">
              <summary className="cursor-pointer text-xs uppercase tracking-widest text-neutral-500">
                Not matched ({preview.unmatched.length})
              </summary>
              <ul className="mt-3 space-y-1 text-sm text-neutral-500">
                {preview.unmatched.map((u, i) => (
                  <li key={`${u.title}-${i}`}>
                    {u.title} <span className="text-neutral-700">— {u.reason}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </main>
  );
}
