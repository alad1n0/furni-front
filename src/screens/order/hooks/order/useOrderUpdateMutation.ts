import {useMutation, useQueryClient} from "@tanstack/react-query";
import {OrderService} from "@/services/order/order/order.service";
import {IOrderForm} from "@/screens/order/types/order/IOrderForm";

export const useOrderUpdateMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['update-order'],
        mutationFn: ({id, ...data}: IOrderForm & { id: number }) =>
            OrderService.updateOrder(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-order']})
            await queryClient.invalidateQueries({ queryKey: ['get-order-details']})
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-order']})
            await queryClient.invalidateQueries({ queryKey: ['get-order-details']})
        },
    })
}