const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Fetch de base ────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const url = `${BASE_URL}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers as Record<string, string> | undefined),
  };

  const res = await fetch(url, { ...fetchOptions, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Erreur inconnue" }));
    throw new ApiError(res.status, body.message ?? "Erreur serveur");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Client non-authentifié (pages publiques uniquement) ─────────────────────
// Pour les routes protégées, utilise le hook useApiClient()

export const apiClient = {
  get<T>(path: string):                   Promise<T> { return request<T>(path); },
  post<T>(path: string, body?: unknown):  Promise<T> {
    return request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined });
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined });
  },
  delete<T>(path: string):                Promise<T> { return request<T>(path, { method: "DELETE" }); },
};

// ─── Factory : client authentifié (pour les composants Clerk) ────────────────

export function createAuthClient(token: string) {
  return {
    get<T>(path: string):                   Promise<T> { return request<T>(path, { token }); },
    post<T>(path: string, body?: unknown):  Promise<T> {
      return request<T>(path, { method: "POST", token, body: body !== undefined ? JSON.stringify(body) : undefined });
    },
    patch<T>(path: string, body?: unknown): Promise<T> {
      return request<T>(path, { method: "PATCH", token, body: body !== undefined ? JSON.stringify(body) : undefined });
    },
    delete<T>(path: string):                Promise<T> { return request<T>(path, { method: "DELETE", token }); },

    // Upload multipart (PDF) — sans Content-Type pour laisser le browser gérer le boundary
    async upload<T>(path: string, formData: FormData): Promise<T> {
      const url = `${BASE_URL}${path}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: "Erreur inconnue" }));
        throw new ApiError(res.status, body.message ?? "Erreur serveur");
      }
      if (res.status === 204) return undefined as T;
      return res.json() as Promise<T>;
    },
  };
}
