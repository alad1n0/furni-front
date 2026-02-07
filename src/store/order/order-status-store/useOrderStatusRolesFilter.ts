import { create } from 'zustand';
import { useNavigateWithParams } from "@/utils/useNavigate/useNavigateWithParams";
import { useQueryParams } from "@/utils/useQueryParams/useQueryParams";
import { useEffect, useRef } from "react";
import {useMainOrderFilterStore} from "@/store/order/useMainOrderFilterStore";

interface IOrderStatusPageState {
    page: number;
    limit: string;
}

interface IOrderStatusPageAction {
    setPage: (page: number) => void;
    setLimit: (limit: string) => void;
    setAll: (prev: Partial<IOrderStatusPageState>) => void;
    resetToDefaults: () => void;
}

const defaultState: IOrderStatusPageState = {
    page: 1,
    limit: '20',
};

export const useOrderStatusPageStore = create<IOrderStatusPageState & IOrderStatusPageAction>((set) => ({
    ...defaultState,

    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit, page: 1 }),
    setAll: (value) => set((prev) => ({
        page: value?.page ?? prev.page,
        limit: value?.limit ?? prev.limit,
    })),
    resetToDefaults: () => set(defaultState),
}));

export const useOrderStatusFilterStore = () => {
    const store = useOrderStatusPageStore();
    const { isToggle } = useMainOrderFilterStore();
    const stateJson = JSON.stringify(store);
    const state = JSON.parse(stateJson);
    const navTo = useNavigateWithParams<IOrderStatusPageState & { isToggle: string }>();
    const params = useQueryParams<IOrderStatusPageState & { isToggle: string }>();
    const prevState = useRef(state);
    const isActive = isToggle === 'order-status';

    useEffect(() => {
        if (!isActive) {
            prevState.current = state;
            return;
        }

        const stateChanged = JSON.stringify(prevState.current) !== JSON.stringify(state);

        if (stateChanged) {
            navTo('', {
                isToggle: 'order-status',
                page: state.page,
                limit: state.limit
            }, false);
        }

        prevState.current = state;
    }, [stateJson, isActive]);

    return { ...store, navTo, searchParams: params };
};