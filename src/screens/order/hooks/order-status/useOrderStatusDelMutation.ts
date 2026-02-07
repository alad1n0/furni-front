import {useMutation, useQueryClient} from "@tanstack/react-query";
import {OrderStatusService} from "@/services/order/order-status/order-status.service";

export const useOrderStatsDelMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['delete-order-status'],
        mutationFn: (data: { id: number }) => OrderStatusService.deleteOrderStatus(data),
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