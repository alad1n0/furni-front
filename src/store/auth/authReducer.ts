import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

type State = {
    accessToken: string | null;
    refreshToken: string | null;
    role: string | null;
};

type Actions = {
    setAccessToken: (value: string | null) => void;
    setRefreshToken: (value: string | null) => void;
    setRole: (value: string | null) => void;
    setTokens: (access: string | null, refresh: string | null, role?: string | null) => void;
    clearTokens: () => void;
    clearStorage: () => void;
};

export const useAuthStore = create<State & Actions>()(
    persist(
        immer((set) => ({
            accessToken: null,
            refreshToken: null,
            role: null,

            setAccessToken: (value) =>
                set((state) => {
                    state.accessToken = value;
                }),

            setRefreshToken: (value) =>
                set((state) => {
                    state.refreshToken = value;
                }),

            setRole: (value) =>
                set((state) => {
                    state.role = value;
                }),

            setTokens: (access, refresh, role = null) =>
                set((state) => {
                    state.accessToken = access;
                    state.refreshToken = refresh;
                    state.role = role;
                }),

            clearTokens: () =>
                set((state) => {
                    state.accessToken = null;
                    state.refreshToken = null;
                    state.role = null;
                }),

            clearStorage: () =>
                localStorage.removeItem("auth-storage"),
        })),
        {
            name: "auth-storage",
        }
    )
);