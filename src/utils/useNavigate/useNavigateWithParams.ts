import { useLocation, useNavigate } from "react-router";

export const useNavigateWithParams = <T extends object>() => {
    const navigate = useNavigate()
    const { search } = useLocation()
    const searchParams = new URLSearchParams(search)

    const currentParams = Object.fromEntries(searchParams.entries()) as Partial<Record<keyof T, string>>

    return (path: string, params: Partial<T>, isSafeCurrentParams: boolean = true) => {
        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== "" && value !== undefined && value !== null)
        )

        const mergedParams = isSafeCurrentParams
            ? { ...currentParams, ...filteredParams }
            : filteredParams

        Object.keys(params).forEach((key) => {
            if (params[key as keyof T] === "" || params[key as keyof T] === undefined) {
                delete mergedParams[key]
            }
        })

        const formattedParams = new URLSearchParams(mergedParams as Record<string, string>)

        navigate({ pathname: path, search: formattedParams.toString() || "" })
    };
};