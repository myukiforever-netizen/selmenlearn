"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/useApiClient";
import { useUserStore } from "@/stores/useUserStore";
import type { UserStats } from "@/types";

export function useUserStats() {
  const api     = useApiClient();
  const hydrate = useUserStore((s) => s.hydrate);

  const query = useQuery({
    queryKey:        ["user-stats"],
    queryFn:         () => api.get<UserStats>("/users/me/stats"),
    staleTime: 3 * 60_000, // 3 min
  });

  // Sync stats into the Zustand store so Header badges stay in sync
  useEffect(() => {
    if (query.data) {
      hydrate({
        xp:            query.data.xp,
        level:         query.data.level,
        streak:        query.data.streak,
        lastStudyDate: null,
      });
    }
  }, [query.data, hydrate]);

  return query;
}
