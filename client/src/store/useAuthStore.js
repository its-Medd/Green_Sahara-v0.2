import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      language: "fr",
      setSession: ({ token, user }) =>
        set({ token, user, language: user?.preferredLanguage || "fr" }),
      clearSession: () => set({ token: null, user: null }),
      setLanguage: (language) => set({ language })
    }),
    { name: "green-sahara-auth" }
  )
);
