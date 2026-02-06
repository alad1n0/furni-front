import { create } from 'zustand';
import { useEffect, useRef } from "react";
import { useNavigateWithParams } from "@/utils/useNavigate/useNavigateWithParams";
import { useQueryParams } from "@/utils/useQueryParams/useQueryParams";

import { useUsersPageStore } from "@/store/user/user-store/useUsersFilter";
import { useUserRolesPageStore } from "@/store/user/user-role-store/useUserRolesFilter";

type ToggleKey = 'users' | 'user-roles';

interface IMainFilterState {
    isToggle: ToggleKey;
}

interface IMainFilterAction {
    setIsToggle: (isToggle: IMainFilterState['isToggle']) => void;
}

export const useMainFilterStore = create<IMainFilterState & IMainFilterAction>((set) => ({
    isToggle: 'users',
    setIsToggle: (isToggle) => set({ isToggle }),
}));

const resetAllStoresExcept = (activeToggle: ToggleKey) => {
    if (activeToggle !== 'users') {
        useUsersPageStore.getState().resetToDefaults();
    }
    if (activeToggle !== 'user-roles') {
        useUserRolesPageStore.getState().resetToDefaults();
    }
};

const buildParamsForToggle = (toggle: ToggleKey) => {
    switch (toggle) {
        case 'users': {
            const users = useUsersPageStore.getState();
            return {
                page: users.page,
                limit: users.limit,
            };
        }

        case 'user-roles': {
            const userRoles = useUserRolesPageStore.getState();
            return {
                page: userRoles.page,
                limit: userRoles.limit,
            };
        }

        default:
            return { page: 1, limit: '20' };
    }
};

const initializeStoreFromParams = (toggle: ToggleKey, params: Record<string, string>) => {
    const page = params.page ? Number(params.page) : 1;
    const limit = params.limit ?? '20';

    switch (toggle) {
        case 'users':
            useUsersPageStore.getState().setAll({ page, limit });
            break;
        case 'user-roles':
            useUserRolesPageStore.getState().setAll({ page, limit });
            break;
    }
};

export const useMainUserFilterStore = () => {
    const store = useMainFilterStore();
    const navTo = useNavigateWithParams<Record<string, string | number>>();
    const params = useQueryParams<Record<string, string>>();
    const isFirstRender = useRef(true);
    const prevToggle = useRef(store.isToggle);

    useEffect(() => {
        if (isFirstRender.current) {
            if (params.isToggle) {
                const toggle = params.isToggle as ToggleKey;
                store.setIsToggle(toggle);
                initializeStoreFromParams(toggle, params);
                navTo('', { isToggle: toggle, ...buildParamsForToggle(toggle) }, false);
            } else {
                store.setIsToggle('users');
                useUsersPageStore.getState().setAll({
                    page: 1,
                    limit: '20'
                });
                navTo('', { isToggle: 'users', ...buildParamsForToggle('users') }, false);
            }

            isFirstRender.current = false;
            prevToggle.current = store.isToggle;
            return;
        }

        if (prevToggle.current !== store.isToggle) {
            const newToggle = store.isToggle;
            resetAllStoresExcept(newToggle);

            switch (newToggle) {
                case 'users':
                    useUsersPageStore.getState().setAll({ page: 1, limit: '20' });
                    break;
                case 'user-roles':
                    useUserRolesPageStore.getState().setAll({ page: 1, limit: '20' });
                    break;
            }

            const paramsForNav = {
                isToggle: newToggle,
                ...buildParamsForToggle(newToggle)
            };

            navTo('', paramsForNav, false);
            prevToggle.current = newToggle;
        }
    }, [store.isToggle, params.isToggle]);

    return { ...store, searchParams: params };
};