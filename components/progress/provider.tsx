"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { loadMyProgressAction, setProgressAction } from "@/app/actions/progress";
import type { ReadStatus } from "@/lib/progress/types";

interface ProgressCtx {
  ready: boolean;
  authed: boolean;
  get: (workId: string) => ReadStatus | undefined;
  set: (workId: string, status: ReadStatus) => Promise<void>;
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
    loadMyProgressAction().then(({ authed, progress }) => {
      setAuthed(authed);
      const m: Record<string, ReadStatus> = {};
      for (const p of progress) m[p.workId] = p.status;
      setStatuses(m);
      setReady(true);
    });
  }, []);

  const set = useCallback(
    async (workId: string, status: ReadStatus) => {
      const prev = statuses[workId];
      setStatuses((s) => ({ ...s, [workId]: status })); // optimistic
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
    [statuses]
  );

  return (
    <Ctx.Provider value={{ ready, authed, get: (id) => statuses[id], set }}>{children}</Ctx.Provider>
  );
}
