import {useMutation, useQueryClient} from "@tanstack/react-query";
import {IClientForm} from "@/screens/client/types/IClientForm";
import {ClientService} from "@/services/client/client.service";

export const useClientUpdateMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['update-client'],
        mutationFn: ({id, ...data}: IClientForm & { id: number }) =>
            ClientService.updateClient(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-client']})
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-client']})
        },
    })
}