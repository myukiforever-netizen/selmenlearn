"use client";

import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import { createAuthClient } from "@/lib/api";

/**
 * Hook qui retourne un client API authentifié via le token Clerk.
 * À utiliser dans tous les composants qui appellent le backend.
 *
 * Usage :
 *   const api = useApiClient();
 *   const decks = await api.get<Deck[]>("/decks");
 */
export function useApiClient() {
  const { getToken } = useAuth();

  return useMemo(() => {
    // On retourne un proxy qui récupère le token à chaque appel
    return {
      async get<T>(path: string): Promise<T> {
        const token = await getToken();
        return createAuthClient(token ?? "").get<T>(path);
      },
      async post<T>(path: string, body?: unknown): Promise<T> {
        const token = await getToken();
        return createAuthClient(token ?? "").post<T>(path, body);
      },
      async patch<T>(path: string, body?: unknown): Promise<T> {
        const token = await getToken();
        return createAuthClient(token ?? "").patch<T>(path, body);
      },
      async delete<T>(path: string): Promise<T> {
        const token = await getToken();
        return createAuthClient(token ?? "").delete<T>(path);
      },
      async upload<T>(path: string, formData: FormData): Promise<T> {
        const token = await getToken();
        return createAuthClient(token ?? "").upload<T>(path, formData);
      },
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);
}
