import { create } from 'zustand';
import { useEffect, useRef } from 'react';
import {useNavigate, useSearchParams} from "react-router";

interface IConstructionState {
    isToggle: 'construction' | 'construction-status';
}

interface IConstructionActions {
    setIsToggle: (isToggle: 'construction' | 'construction-status') => void;
    setAll: (prev: Partial<IConstructionState>) => void;
}

export const useConstructionStore = create<IConstructionState & IConstructionActions>((set) => ({
    isToggle: 'construction',

    setIsToggle: (isToggle) => set({ isToggle }),
    setAll: (value) => set((prev) => ({
        isToggle: value?.isToggle || prev.isToggle,
    })),
}));

export const useConstructionStoreWithParams = () => {
    const store = useConstructionStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isFirstMount = useRef(true);

    useEffect(() => {
        if (isFirstMount.current) {
            const isToggle = searchParams.get('isToggle') as 'construction' | 'construction-status' || 'construction';
            store.setAll({ isToggle });
            isFirstMount.current = false;
            return;
        }

        const params = new URLSearchParams(searchParams);
        params.set('isToggle', store.isToggle);
        navigate(`?${params.toString()}`, { replace: true });
    }, [store.isToggle]);

    return store;
};