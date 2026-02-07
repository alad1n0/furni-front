import {useQuery} from "@tanstack/react-query";
import {OrderService} from "@/services/order/order/order.service";
import {IOrder} from "@/screens/order/types/order/IOrder";

export const useOrderDetails = (id: number) => {
    return useQuery({
        queryKey: ['get-order-details', id],
        queryFn: () => OrderService.getOrderDetails(id)
            .then(data => data.data.data as IOrder),
        enabled: !!id,
    });
};