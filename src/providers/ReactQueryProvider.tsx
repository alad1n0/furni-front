'use client'
import {FC, PropsWithChildren} from 'react';
import {keepPreviousData, QueryClient, QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 1800000,
            retry: 2,
            refetchInterval: 1800000,
            placeholderData: keepPreviousData,
        }
    }
})

const ReactQueryProvider: FC<PropsWithChildren> = ({children}) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default ReactQueryProvider;