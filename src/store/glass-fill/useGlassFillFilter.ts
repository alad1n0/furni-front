import { create } from 'zustand';

interface IGlassFillFilterState {
    page: number;
    setPage: (page: number) => void;
    limit: number;
    setLimit: (limit: number) => void;
}

export const useGlassFillFilterStore = create<IGlassFillFilterState>((set) => ({
    page: 1,
    setPage: (page) => set(() => ({ page })),
    limit: 20,
    setLimit: (limit) => set(() => ({ limit })),
}));