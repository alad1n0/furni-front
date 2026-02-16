import {useQuery} from "@tanstack/react-query";
import {OrderService} from "@/services/order/order/order.service";
import {IOrder} from "@/screens/order/types/order/IOrder";

export const useOrder = () => {
    return useQuery({
        queryKey: ['all-order-simple'],
        queryFn: () => OrderService.getAllOrderSimple()
            .then(data => data.data.data as IOrder[])
    })
}