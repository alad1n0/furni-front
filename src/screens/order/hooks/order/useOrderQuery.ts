import {useQuery} from "@tanstack/react-query";
import {IPagination} from "@/types/IPagination";
import {OrderService} from "@/services/order/order/order.service";
import {useOrderFilterStore} from "@/store/order/order-store/useOrderFilter";
import {IOrderQuery} from "@/screens/order/types/order/IOrderQuery";

export const useOrderQuery = () => {
    const useFilteredOrder = () => {
        const {page, limit} = useOrderFilterStore();
        return {page, limit: Number(limit)}
    };
    const filterParams = useFilteredOrder()
    return useQuery({
        queryKey: ['all-order', filterParams],
        queryFn: () => OrderService.getAllOrder(filterParams)
            .then(data =>
                data.data.data as { meta: IPagination,  orders: Array<IOrderQuery> })
    })
}