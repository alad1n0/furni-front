import {useQuery} from "@tanstack/react-query";
import {IPagination} from "@/types/IPagination";
import {IOrderStatus} from "@/screens/order/types/order-status/IOrderStataus";
import {OrderStatusService} from "@/services/order/order-status/order-status.service";
import {useOrderStatusFilterStore} from "@/store/order/order-status-store/useOrderStatusRolesFilter";

export const useOrderStatusQuery = () => {
    const useFilteredOrderStatus = () => {
        const {page, limit} = useOrderStatusFilterStore();
        return {page, limit: Number(limit)}
    };
    const filterParams = useFilteredOrderStatus()
    return useQuery({
        queryKey: ['all-order-status-query', filterParams],
        queryFn: () => OrderStatusService.getSllOrderStatusQuery(filterParams)
            .then(data =>
                data.data.data as { meta: IPagination,  orderStatus: Array<IOrderStatus> })
    })
}