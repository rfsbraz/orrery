"use client";

import { useEffect } from "react";

/**
 * Registers the service worker. Deliberately silent: no install prompts, no
 * update toasts, no badges. Installing Orrery should feel like the site simply
 * being available offline, not like an app nagging to be installed.
 */
export function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Register after load so it never competes with first paint.
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline support is a bonus; a failure here must never surface.
      });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
