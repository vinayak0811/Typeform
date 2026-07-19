import { useAuthStore } from "@/store/auth-store";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

const BASE_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    : ""; // client-side calls go through the Next.js rewrite (/api/*) to avoid CORS entirely

// Auth endpoints never get an Authorization header attached (register/login
// haven't got a token yet; refresh authenticates via its own cookie) and a
// 401 from them should never trigger the refresh-and-retry dance below.
const AUTH_PATH_PREFIX = "/api/auth";

let refreshPromise: Promise<boolean> | null = null;

/** Calls /api/auth/refresh (using the httpOnly refresh cookie) at most once
 * concurrently — if five requests 401 at the same time, they share a single
 * refresh call instead of racing five of them. */
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) return false;
        const body = await res.json();
        useAuthStore.getState().setSession(body.user, body.access_token);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

function firstPydanticMessage(errors: unknown): string | null {
  if (!Array.isArray(errors) || errors.length === 0) return null;
  const first = errors[0];
  return typeof first?.msg === "string" ? first.msg : null;
}

async function rawRequest<T>(path: string, options: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const token = useAuthStore.getState().accessToken;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token && !path.startsWith(AUTH_PATH_PREFIX)) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const detail = body?.detail;

    // FastAPI's default shape: {"detail": "..."} or {"detail": {...}}
    if (detail && typeof detail === "object" && "errors" in detail) {
      throw new ApiError(detail.message || "Validation failed", res.status, detail.errors);
    }
    if (typeof detail === "string") {
      throw new ApiError(detail, res.status);
    }

    // This project's global 422 handler (see backend/app/main.py) returns
    // {"message": "...", "errors": [...]} at the TOP level instead of
    // nested under "detail" — handle that shape too so field-level
    // validation errors (weak password, bad email, etc.) surface a real
    // message instead of falling through to res.statusText.
    if (body && typeof body === "object" && "errors" in body) {
      const specific = firstPydanticMessage((body as Record<string, unknown>).errors);
      throw new ApiError(specific || body.message || "Validation failed", res.status, (body as Record<string, unknown>).errors as Record<string, string> | undefined);
    }

    throw new ApiError(body?.message || res.statusText || "Request failed", res.status);
  }

  return body as T;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, options);
  } catch (err) {
    const isAuthRoute = path.startsWith(AUTH_PATH_PREFIX);
    if (err instanceof ApiError && err.status === 401 && !isAuthRoute) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return rawRequest<T>(path, options);
      }
      useAuthStore.getState().clearSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    throw err;
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
