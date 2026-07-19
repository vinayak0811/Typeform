import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  /** True once the persisted store has finished rehydrating from
   * localStorage — avoids a flash of "logged out" UI on first paint. */
  hasHydrated: boolean;

  setSession: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
}

// The middleware runs on the Edge runtime and can't read localStorage, so we
// mirror a tiny, non-sensitive "am I logged in" flag into a plain cookie.
// It carries no token material — it's purely a UX hint for route redirects.
// The backend is the real source of truth: every API call still needs a
// valid Bearer token and returns 401 if it's missing/expired.
const SESSION_COOKIE = "has_session";

function setSessionCookie(present: boolean) {
  if (typeof document === "undefined") return;
  if (present) {
    document.cookie = `${SESSION_COOKIE}=1; path=/; samesite=lax; max-age=${60 * 60 * 24 * 30}`;
  } else {
    document.cookie = `${SESSION_COOKIE}=; path=/; samesite=lax; max-age=0`;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      hasHydrated: false,

      setSession: (user, accessToken) => {
        setSessionCookie(true);
        set({ user, accessToken });
      },
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      clearSession: () => {
        setSessionCookie(false);
        set({ user: null, accessToken: null });
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "formly-auth",
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
