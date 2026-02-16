import {useMutation, useQueryClient} from "@tanstack/react-query";
import {ClientService} from "@/services/client/client.service";

export const useClientDelMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['delete-client'],
        mutationFn: (data: { id: number }) => ClientService.delClient(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-client']})
            await queryClient.invalidateQueries({ queryKey: ['all-client-simple']})
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-client']})
            await queryClient.invalidateQueries({ queryKey: ['all-client-simple']})
        },
    })
}