"use client";

import { useEffect, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Fires a lightweight /health ping on first mount.
// This wakes the Render backend as early as possible, before TanStack Query
// begins its own data fetches — cuts perceived cold-start delay significantly.
export function ApiWarmup() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch(`${API_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    }).catch(() => {/* ignore — this is best-effort */});
  }, []);

  return null;
}
