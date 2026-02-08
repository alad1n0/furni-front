import {useMutation, useQueryClient} from "@tanstack/react-query";
import {IOrderStatusForm} from "@/screens/order/types/order-status/IOrderStatusForm";
import {OrderStatusService} from "@/services/order/order-status/order-status.service";

export const useOrderStatusCreateMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['create-order-status'],
        mutationFn: (data: IOrderStatusForm) => OrderStatusService.createOrderStatus(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-order-status']})
            await queryClient.invalidateQueries({ queryKey: ['all-order-status-query']})
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-order-status']})
            await queryClient.invalidateQueries({ queryKey: ['all-order-status-query']})
        },
    })
}