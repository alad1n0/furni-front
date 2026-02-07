import {getOrderStatusUrl} from "@/config/api.config";
import instance from "@/services/api/interceptors.api";

export const OrderStatusService = {
    getAllOrderStatus: () =>
        instance({
            url: getOrderStatusUrl(),
            method: 'GET'
        })
};
