import { create } from 'zustand';

interface IConstructionFilterState {
    page: number;
    setPage: (page: number) => void;
    limit: number;
    setLimit: (limit: number) => void;
    status: number | string;
    setStatus: (status: number | string) => void;
    orderNumber: string;
    setOrderNumber: (orderNumber: string) => void;
    constructionNo: string;
    setConstructionNumber: (constructionNo: string) => void;
}

export const useConstructionFilterStore = create<IConstructionFilterState>((set) => ({
    page: 1,
    setPage: (page) => set(() => ({ page })),
    limit: 20,
    setLimit: (limit) => set(() => ({ limit })),
    status: '',
    setStatus: (status) => set({ status, page: 1 }),
    orderNumber: '',
    setOrderNumber: (orderNumber) => set({ orderNumber, page: 1 }),
    constructionNo: '',
    setConstructionNumber: (constructionNo) => set({ constructionNo, page: 1 })
}));