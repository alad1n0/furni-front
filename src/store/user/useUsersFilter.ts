import { create } from 'zustand';

interface IUsersFilterState {
    page: number;
    setPage: (page: number) => void;
    limit: number;
    setLimit: (limit: number) => void;
}

export const useUsersFilterStore = create<IUsersFilterState>((set) => ({
    page: 1,
    setPage: (page) => set(() => ({ page })),
    limit: 20,
    setLimit: (limit) => set(() => ({ limit })),
}));