import {
    createConstruction,
    deleteConstruction,
    getConstruction,
    getConstructionByOrder,
    updateConstruction
} from "@/config/api.config";
import instance from "@/services/api/interceptors.api";
import {IConstructionForm} from "@/screens/order/types/construction/IConstructionForm";
import {IQueryPagination} from "@/types/IQueryPagination";

export const ConstructionService = {
    getAllConstruction: (params: IQueryPagination) =>
        instance({
            url: getConstruction(),
            method: 'GET',
            params
        }),
    getConstructionByOrder: (orderId: number) =>
        instance({
            url: getConstructionByOrder(orderId),
            method: 'GET'
        }),
    createConstruction: (data: IConstructionForm) =>
        instance({
            url: createConstruction(),
            method: 'POST',
            data
        }),
    updateConstruction: (id: number, data: IConstructionForm) =>
        instance({
            url: updateConstruction(id),
            method: 'PUT',
            data
        }),
    deleteConstruction: ({id}: { id: number }) =>
        instance({
            url: deleteConstruction(id),
            method: 'DELETE'
        }),
};
