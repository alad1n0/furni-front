import {useQuery} from "@tanstack/react-query";
import {IPagination} from "@/types/IPagination";
import {ClientService} from "@/services/client/client.service";
import {IClientsQuery} from "@/screens/client/types/IClientsQuery";
import {useClientFilterStore} from "@/store/client/useClientFilter";

export const useClientsQuery = () => {
    const useFilteredClients = () => {
        const {page, limit} = useClientFilterStore();
        return {page, limit}
    };
    const filterParams = useFilteredClients()
    return useQuery({
        queryKey: ['all-client', filterParams],
        queryFn: () => ClientService.getClients(filterParams)
            .then(data =>
                data.data.data as { meta: IPagination,  clients: Array<IClientsQuery> })
    })
}