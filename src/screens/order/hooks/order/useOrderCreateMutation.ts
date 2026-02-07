import {useMutation, useQueryClient} from "@tanstack/react-query";
import {OrderService} from "@/services/order/order/order.service";
import {IOrderForm} from "@/screens/order/types/order/IOrderForm";

export const useOrderCreateMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['create-order'],
        mutationFn: (data: IOrderForm) => OrderService.createOrder(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-order']})
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-order']})
        },
    })
}