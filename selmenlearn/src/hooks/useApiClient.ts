"use client";

import { useMemo } from "react";
import { createAuthClient } from "@/lib/api";

export function useApiClient() {
  return useMemo(() => createAuthClient("private"), []);
}
