import {
    createOrderStatus,
    deleteOrderStatus,
    getOrderStatusQuery,
    getOrderStatusUrl,
    updateOrderStatus
} from "@/config/api.config";
import instance from "@/services/api/interceptors.api";
import {IQueryPagination} from "@/types/IQueryPagination";
import {IOrderStatusForm} from "@/screens/order/types/order-status/IOrderStatusForm";

export const OrderStatusService = {
    getAllOrderStatus: () =>
        instance({
            url: getOrderStatusUrl(),
            method: 'GET'
        }),
    getSllOrderStatusQuery: (params: IQueryPagination) =>
        instance({
            url: getOrderStatusQuery(),
            method: 'GET',
            params
        }),
    createOrderStatus: (data: IOrderStatusForm) =>
        instance({
            url: createOrderStatus(),
            method: 'POST',
            data
        }),
    updateOrderStatus: (id: number, data: IOrderStatusForm) =>
        instance({
            url: updateOrderStatus(id),
            method: 'PUT',
            data
        }),
    deleteOrderStatus: ({id}: { id: number }) =>
        instance({
            url: deleteOrderStatus(id),
            method: 'DELETE'
        })
};
