"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/useApiClient";
import type { Badge } from "@/types";

export function useAchievements() {
  const api = useApiClient();
  return useQuery({
    queryKey: ["achievements"],
    queryFn:  () => api.get<Badge[]>("/users/me/achievements"),
    staleTime: 10 * 60_000,
  });
}
