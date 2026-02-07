import {useMutation, useQueryClient} from "@tanstack/react-query";
import {OrderService} from "@/services/order/order/order.service";

export const useOrderDelMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['delete-order'],
        mutationFn: (data: { id: number }) => OrderService.deleteOrder(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-order']})
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-order']})
        },
    })
}