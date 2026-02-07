import {useQuery} from "@tanstack/react-query";
import {IOrderStatus} from "@/screens/order/types/order-status/IOrderStataus";
import {OrderStatusService} from "@/services/order/order-status/order-status.service";

export const useOrderStatus = () => {
    return useQuery({
        queryKey: ['all-user-role'],
        queryFn: () => OrderStatusService.getAllOrderStatus()
            .then(data => data.data.data as IOrderStatus[])
    })
}