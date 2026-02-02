import { useLocation } from "react-router";

export const useQueryParams = <T extends object>(defaultParams?: T) => {
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);

    const params: Record<string, string | number> = { ...(defaultParams || {}) };

    searchParams.forEach((value, key) => {
        params[key] = isNaN(Number(value)) ? value : Number(value);
    });

    return params as T;
};