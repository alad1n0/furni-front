import { create } from 'zustand';
import { useNavigateWithParams } from "@/utils/useNavigate/useNavigateWithParams";
import { useQueryParams } from "@/utils/useQueryParams/useQueryParams";
import { useEffect, useRef } from "react";
import { useMainOrderFilterStore } from "@/store/order/useMainOrderFilterStore";

interface IOrderPageState {
    page: number;
    limit: string;
    client: number | string;
    status: number | string;
    orderNumber: string;
}

interface IOrderPageAction {
    setPage: (page: number) => void;
    setLimit: (limit: string) => void;
    setClient: (client: number | string) => void;
    setStatus: (status: number | string) => void;
    setOrderNumber: (orderNumber: string) => void;
    setAll: (prev: Partial<IOrderPageState>) => void;
    resetToDefaults: () => void;
}

const defaultState: IOrderPageState = {
    page: 1,
    limit: '20',
    client: '',
    status: '',
    orderNumber: ''
};

export const useOrderPageStore = create<IOrderPageState & IOrderPageAction>((set) => ({
    ...defaultState,

    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit, page: 1 }),
    setClient: (client) => set({ client }),
    setStatus: (status) => set({ status, page: 1 }),
    setOrderNumber: (orderNumber) => set({ orderNumber, page: 1 }),
    setAll: (value) => set((prev) => ({
        page: value?.page ?? prev.page,
        limit: value?.limit ?? prev.limit,
        client: value?.client ?? prev.client,
        status: value?.status ?? prev.status,
        orderNumber: value?.orderNumber ?? prev.orderNumber,
    })),
    resetToDefaults: () => set(defaultState),
}));

export const useOrderFilterStore = () => {
    const store = useOrderPageStore();
    const { isToggle } = useMainOrderFilterStore();
    const stateJson = JSON.stringify(store);
    const state = JSON.parse(stateJson);
    const navTo = useNavigateWithParams<IOrderPageState & { isToggle: string }>();
    const params = useQueryParams<IOrderPageState & { isToggle: string }>();
    const prevState = useRef(state);
    const isActive = isToggle === 'order';

    useEffect(() => {
        if (!isActive) {
            prevState.current = state;
            return;
        }

        const stateChanged = JSON.stringify(prevState.current) !== JSON.stringify(state);

        if (stateChanged) {
            const filteredState: Record<string, string | number> = {
                isToggle: 'order',
                page: state.page,
                limit: state.limit
            };

            if (state.client) filteredState.client = state.client;
            if (state.status) filteredState.status = state.status;
            if (state.orderNumber) filteredState.orderNumber = state.orderNumber;

            navTo(window.location.pathname, filteredState, false);
        }

        prevState.current = state;
    }, [stateJson, isActive]);

    return { ...store, navTo, searchParams: params };
};