"use client";

import { useUserStats } from "@/hooks/useUserStats";

// Invisible component mounted in the dashboard layout.
// Fetches /users/me/stats and syncs XP / level / streak into the Zustand store
// so the Header badges reflect live data without prop-drilling.
export function UserStatsHydrator() {
  useUserStats();
  return null;
}
