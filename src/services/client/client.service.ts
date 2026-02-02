import instance from "../api/interceptors.api";
import {IQueryPagination} from "@/types/IQueryPagination";
import {IClientForm} from "@/screens/client/types/IClientForm";
import {createClient, deleteClient, getClientsUrl, updateClient} from "@/config/api.config";

export const ClientService = {
    getClients: (params: IQueryPagination) =>
        instance({
            url: getClientsUrl(),
            method: 'GET',
            params
        }),
    delClient: ({id}: { id: number }) =>
        instance({
            url: deleteClient(id),
            method: 'DELETE',
        }),
    createClient: (data: IClientForm) =>
        instance({
            url: createClient(),
            method: 'POST',
            data
        }),
    updateClient: (id: number, data: IClientForm) =>
        instance({
            url: updateClient(id),
            method: 'PUT',
            data
        })
};
