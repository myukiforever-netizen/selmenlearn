"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/useApiClient";
import type { ActivityDay } from "@/types";

export function useActivity() {
  const api = useApiClient();

  return useQuery({
    queryKey:  ["user-activity"],
    queryFn:   () => api.get<ActivityDay[]>("/users/me/activity"),
    staleTime: 5 * 60_000,
  });
}
