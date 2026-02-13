import { create } from 'zustand';
import { useEffect, useRef } from "react";
import { useNavigateWithParams } from "@/utils/useNavigate/useNavigateWithParams";
import { useQueryParams } from "@/utils/useQueryParams/useQueryParams";

import {useOrderStatusPageStore} from "@/store/order/order-status-store/useOrderStatusRolesFilter";
import {useOrderPageStore} from "@/store/order/order-store/useOrderFilter";

type ToggleKey = 'order' | 'order-status';

interface IMainFilterState {
    isToggle: ToggleKey;
}

interface IMainFilterAction {
    setIsToggle: (isToggle: IMainFilterState['isToggle']) => void;
}

export const useMainFilterStore = create<IMainFilterState & IMainFilterAction>((set) => ({
    isToggle: 'order',
    setIsToggle: (isToggle) => set({ isToggle }),
}));

const resetAllStoresExcept = (activeToggle: ToggleKey) => {
    if (activeToggle !== 'order') {
        useOrderPageStore.getState().resetToDefaults();
    }
    if (activeToggle !== 'order-status') {
        useOrderStatusPageStore.getState().resetToDefaults();
    }
};

const buildParamsForToggle = (toggle: ToggleKey) => {
    switch (toggle) {
        case 'order': {
            const order = useOrderPageStore.getState();
            const params: Record<string, string | number | boolean> = {
                page: order.page,
                limit: order.limit,
            };

            if (order.client) params.client = order.client;
            if (order.status) params.status = order.status;

            return params;
        }

        case 'order-status': {
            const userRoles = useOrderStatusPageStore.getState();
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
        case 'order':
            useOrderPageStore.getState().setAll({
                page,
                limit,
                client: params.client ?? '',
                status: params.status ?? ''
            });
            break;
        case 'order-status':
            useOrderStatusPageStore.getState().setAll({ page, limit });
            break;
    }
};

export const useMainOrderFilterStore = () => {
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
                store.setIsToggle('order');
                useOrderPageStore.getState().setAll({
                    page: 1,
                    limit: '20',
                    client: '',
                    status: ''
                });
                navTo('', { isToggle: 'order', ...buildParamsForToggle('order') }, false);
            }

            isFirstRender.current = false;
            prevToggle.current = store.isToggle;
            return;
        }

        if (prevToggle.current !== store.isToggle) {
            const newToggle = store.isToggle;
            resetAllStoresExcept(newToggle);

            switch (newToggle) {
                case 'order':
                    useOrderPageStore.getState().setAll({
                        page: 1,
                        limit: '20',
                        client: params.client ?? '',
                        status: params.status ?? ''
                    });
                    break;
                case 'order-status':
                    useOrderStatusPageStore.getState().setAll({ page: 1, limit: '20' });
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