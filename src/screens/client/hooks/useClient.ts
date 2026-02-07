import {useQuery} from "@tanstack/react-query";
import {IClient} from "@/screens/client/types/IClient";
import {ClientService} from "@/services/client/client.service";

export const useClient = () => {
    return useQuery({
        queryKey: ['all-client-simple'],
        queryFn: () => ClientService.getClientsSimple()
            .then(data => data.data.data as IClient[])
    })
}