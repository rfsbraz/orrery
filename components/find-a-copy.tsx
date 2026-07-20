"use client";

import { useT } from "@/components/i18n/provider";

import { useEffect, useState } from "react";
import { storeLinks, type StoreLinkInput } from "@/lib/stores/links";

const COUNTRIES: [string, string][] = [
  ["", "Anywhere"],
  ["PT", "Portugal"],
  ["ES", "Spain"],
  ["GB", "United Kingdom"],
  ["US", "United States"],
  ["FR", "France"],
  ["DE", "Germany"],
  ["BR", "Brazil"],
  ["IT", "Italy"],
];

const KEY = "orrery.country";

/**
 * Per-work "find a copy" links, tuned to the reader's country. The choice is
 * remembered in localStorage so it's picked once, not per book. Museum pages
 * stay static; this is a small client affordance layered on top.
 */
export function FindACopy(props: StoreLinkInput) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState<string>("");

  useEffect(() => {
    // One-time hydration read: localStorage is client-only, so we start at ""
    // (matching SSR) and adopt the saved country after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountry(localStorage.getItem(KEY) ?? "");
  }, []);

  function pick(cc: string) {
    setCountry(cc);
    localStorage.setItem(KEY, cc);
  }

  const links = storeLinks(props, country);

  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-neutral-500 hover:text-neutral-300 inline-block min-h-[40px] leading-[40px] lg:min-h-0 lg:leading-normal"
        aria-expanded={open}
      >
        {open ? t("copy.hide") : t("copy.find")}
      </button>

      {open && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 underline decoration-neutral-700 underline-offset-2 hover:text-neutral-100"
            >
              {l.label}
            </a>
          ))}
          <select
            value={country}
            onChange={(e) => pick(e.target.value)}
            aria-label={t("copy.country")}
            className="ml-auto rounded border border-neutral-800 bg-neutral-900 text-neutral-400 outline-none focus:border-neutral-600 min-h-[40px] px-2 lg:min-h-0 lg:px-1.5 lg:py-0.5"
          >
            {COUNTRIES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
