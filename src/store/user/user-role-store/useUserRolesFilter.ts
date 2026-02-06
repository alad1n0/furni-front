import { create } from 'zustand';
import { useNavigateWithParams } from "@/utils/useNavigate/useNavigateWithParams";
import { useQueryParams } from "@/utils/useQueryParams/useQueryParams";
import { useEffect, useRef } from "react";
import { useMainFilterStore } from "@/store/user/useMainUserFilterStore";

interface IUserRolesPageState {
    page: number;
    limit: string;
}

interface IUserRolesPageAction {
    setPage: (page: number) => void;
    setLimit: (limit: string) => void;
    setAll: (prev: Partial<IUserRolesPageState>) => void;
    resetToDefaults: () => void;
}

const defaultState: IUserRolesPageState = {
    page: 1,
    limit: '20',
};

export const useUserRolesPageStore = create<IUserRolesPageState & IUserRolesPageAction>((set) => ({
    ...defaultState,

    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit, page: 1 }),
    setAll: (value) => set((prev) => ({
        page: value?.page ?? prev.page,
        limit: value?.limit ?? prev.limit,
    })),
    resetToDefaults: () => set(defaultState),
}));

export const useUserRolesFilterStore = () => {
    const store = useUserRolesPageStore();
    const { isToggle } = useMainFilterStore();
    const stateJson = JSON.stringify(store);
    const state = JSON.parse(stateJson);
    const navTo = useNavigateWithParams<IUserRolesPageState & { isToggle: string }>();
    const params = useQueryParams<IUserRolesPageState & { isToggle: string }>();
    const prevState = useRef(state);
    const isActive = isToggle === 'user-roles';

    useEffect(() => {
        if (!isActive) {
            prevState.current = state;
            return;
        }

        const stateChanged = JSON.stringify(prevState.current) !== JSON.stringify(state);

        if (stateChanged) {
            navTo('', {
                isToggle: 'user-roles',
                page: state.page,
                limit: state.limit
            }, false);
        }

        prevState.current = state;
    }, [stateJson, isActive]);

    return { ...store, navTo, searchParams: params };
};