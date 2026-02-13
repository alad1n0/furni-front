import {IQueryPagination} from "@/types/IQueryPagination";
import {
    createOrder,
    deleteOrder,
    getOrderDetails,
    getOrdersUrl,
    updateOrder
} from "@/config/api.config";
import instance from "@/services/api/interceptors.api";
import {IOrderForm} from "@/screens/order/types/order/IOrderForm";

export const OrderService = {
    getAllOrder: (params: IQueryPagination) =>
        instance({
            url: getOrdersUrl(),
            method: 'GET',
            params
        }),
    getOrderDetails: (id: number) =>
        instance({
            url: getOrderDetails(id),
            method: 'GET'
        }),
    createOrder: (data: IOrderForm) =>
        instance({
            url: createOrder(),
            method: 'POST',
            data
        }),
    updateOrder: (id: number, data: IOrderForm) =>
        instance({
            url: updateOrder(id),
            method: 'PUT',
            data
        }),
    deleteOrder: ({id}: { id: number }) =>
        instance({
            url: deleteOrder(id),
            method: 'DELETE'
        }),
};
