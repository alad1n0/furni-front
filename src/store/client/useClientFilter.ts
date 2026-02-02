import { create } from 'zustand';

interface IClientFilterState {
    page: number;
    setPage: (page: number) => void;
    limit: number;
    setLimit: (limit: number) => void;
}

export const useClientFilterStore = create<IClientFilterState>((set) => ({
    page: 1,
    setPage: (page) => set(() => ({ page })),
    limit: 20,
    setLimit: (limit) => set(() => ({ limit })),
}));