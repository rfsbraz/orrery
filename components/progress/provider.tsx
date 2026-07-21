"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadMyProgressAction, setProgressAction } from "@/app/actions/progress";
import type { ReadStatus } from "@/lib/progress/types";

interface ProgressCtx {
  ready: boolean;
  authed: boolean;
  /** True when tracking locally in this browser (signed out). */
  guest: boolean;
  get: (workId: string) => ReadStatus | undefined;
  set: (workId: string, status: ReadStatus) => Promise<void>;
  /** Work IDs with status "read" - the spoiler engine's ReadSet. */
  readSet: Set<string>;
  /** Work IDs currently marked "reading" (drives continue-reading surfaces). */
  reading: string[];
}

// Guest progress lives in the browser until there is an account to attach it
// to - track first, sign up later. Same shape as the server statuses map.
const GUEST_KEY = "orrery.guest-progress";

function loadGuest(): Record<string, ReadStatus> {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveGuest(statuses: Record<string, ReadStatus>) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(statuses));
  } catch {
    // storage full/blocked: guest progress is best-effort
  }
}

const Ctx = createContext<ProgressCtx | null>(null);
export const useProgress = () => useContext(Ctx);

/**
 * Loads the signed-in user's progress via a server action (reliable cookie
 * session) and writes the same way, so the static museum page can layer
 * personal data without the browser client hitting PostgREST as anon.
 */
export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [statuses, setStatuses] = useState<Record<string, ReadStatus>>({});
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The whole load (middleware + action) gets one budget; past it we start
    // in guest mode and let a slow sign-in state resolve on the next visit.
    const budget = new Promise<{ authed: false; progress: [] }>((r) =>
      setTimeout(() => r({ authed: false, progress: [] }), 4000)
    );
    Promise.race([loadMyProgressAction(), budget])
      .then(({ authed, progress }) => {
        setAuthed(authed);
        if (authed) {
          const m: Record<string, ReadStatus> = {};
          for (const p of progress) m[p.workId] = p.status;
          setStatuses(m);
        } else {
          setStatuses(loadGuest());
        }
      })
      .catch(() => {
        // Action unreachable (offline, backend down): guest mode.
        setAuthed(false);
        setStatuses(loadGuest());
      })
      .finally(() => setReady(true));
  }, []);

  const set = useCallback(
    async (workId: string, status: ReadStatus) => {
      const prev = statuses[workId];
      const apply = (s: Record<string, ReadStatus>) => {
        const next = { ...s };
        if (status === "unread") delete next[workId];
        else next[workId] = status;
        return next;
      };
      setStatuses(apply); // optimistic; guest persistence follows state (effect below)
      if (!authed) return;
      const res = await setProgressAction(workId, status);
      if (!res.ok) {
        setStatuses((s) => {
          const next = { ...s };
          if (prev) next[workId] = prev;
          else delete next[workId];
          return next;
        });
      }
    },
    [statuses, authed]
  );

  // Guest persistence follows the state, so rapid updates never race a
  // stale snapshot into storage.
  useEffect(() => {
    if (ready && !authed) saveGuest(statuses);
  }, [ready, authed, statuses]);

  const readSet = useMemo(
    () =>
      new Set(
        Object.entries(statuses)
          .filter(([, s]) => s === "read")
          .map(([id]) => id)
      ),
    [statuses]
  );

  const reading = useMemo(
    () =>
      Object.entries(statuses)
        .filter(([, s]) => s === "reading")
        .map(([id]) => id),
    [statuses]
  );

  return (
    <Ctx.Provider
      value={{ ready, authed, guest: ready && !authed, get: (id) => statuses[id], set, readSet, reading }}
    >
      {children}
    </Ctx.Provider>
  );
}
