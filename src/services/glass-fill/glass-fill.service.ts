import instance from "../api/interceptors.api";
import {IQueryPagination} from "@/types/IQueryPagination";
import { createGlassFill, deleteGlassFill, getGlassFillUrl, updateGlassFill } from "@/config/api.config";
import {IGlassFillForm} from "@/screens/glass-fill/types/IGlassFillForm";

export const GlassFillService = {
    getGlassFill: (params: IQueryPagination) =>
        instance({
            url: getGlassFillUrl(),
            method: 'GET',
            params
        }),
    deleteGlassFill: ({id}: { id: number }) =>
        instance({
            url: deleteGlassFill(id),
            method: 'DELETE',
        }),
    createGlassFill: (data: IGlassFillForm) =>
        instance({
            url: createGlassFill(),
            method: 'POST',
            data
        }),
    updateGlassFill: (id: number, data: IGlassFillForm) =>
        instance({
            url: updateGlassFill(id),
            method: 'PUT',
            data
        })
};
