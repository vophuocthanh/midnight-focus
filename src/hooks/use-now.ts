"use client";

import { useEffect, useState } from "react";

/**
 * Current time, refreshed every `intervalMs` and when the tab becomes visible again.
 * Returns null on the server and on the first client render, so the clock is never read during prerender.
 */
export function useNow(intervalMs: number): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [intervalMs]);

  return now;
}
