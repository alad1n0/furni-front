import {useMutation, useQueryClient} from "@tanstack/react-query";
import {IClientForm} from "@/screens/client/types/IClientForm";
import {ClientService} from "@/services/client/client.service";

export const useClientCreateMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['create-client'],
        mutationFn: (data: IClientForm) => ClientService.createClient(data),
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