import { create } from 'zustand';

interface IConstructionFilterState {
    page: number;
    setPage: (page: number) => void;
    limit: number;
    setLimit: (limit: number) => void;
}

export const useConstructionFilterStore = create<IConstructionFilterState>((set) => ({
    page: 1,
    setPage: (page) => set(() => ({ page })),
    limit: 20,
    setLimit: (limit) => set(() => ({ limit })),
}));