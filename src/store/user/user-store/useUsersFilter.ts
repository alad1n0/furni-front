import { create } from 'zustand';
import { useNavigateWithParams } from "@/utils/useNavigate/useNavigateWithParams";
import { useQueryParams } from "@/utils/useQueryParams/useQueryParams";
import { useEffect, useRef } from "react";
import { useMainFilterStore } from "@/store/user/useMainUserFilterStore";

interface IUserPageState {
    page: number;
    limit: string;
}

interface IUserPageAction {
    setPage: (page: number) => void;
    setLimit: (limit: string) => void;
    setAll: (prev: Partial<IUserPageState>) => void;
    resetToDefaults: () => void;
}

const defaultState: IUserPageState = {
    page: 1,
    limit: '20',
};

export const useUsersPageStore = create<IUserPageState & IUserPageAction>((set) => ({
    ...defaultState,

    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit, page: 1 }),
    setAll: (value) => set((prev) => ({
        page: value?.page ?? prev.page,
        limit: value?.limit ?? prev.limit,
    })),
    resetToDefaults: () => set(defaultState),
}));

export const useUsersFilterStore = () => {
    const store = useUsersPageStore();
    const { isToggle } = useMainFilterStore();
    const stateJson = JSON.stringify(store);
    const state = JSON.parse(stateJson);
    const navTo = useNavigateWithParams<IUserPageState & { isToggle: string }>();
    const params = useQueryParams<IUserPageState & { isToggle: string }>();
    const prevState = useRef(state);
    const isActive = isToggle === 'users';

    useEffect(() => {
        if (!isActive) {
            prevState.current = state;
            return;
        }

        const stateChanged = JSON.stringify(prevState.current) !== JSON.stringify(state);

        if (stateChanged) {
            navTo('', {
                isToggle: 'users',
                page: state.page,
                limit: state.limit
            }, false);
        }

        prevState.current = state;
    }, [stateJson, isActive]);

    return { ...store, navTo, searchParams: params };
};