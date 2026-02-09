import {useMutation, useQueryClient} from "@tanstack/react-query";
import {GlassFillService} from "@/services/glass-fill/glass-fill.service";
import {IGlassFillForm} from "@/screens/glass-fill/types/IGlassFillForm";

export const useGlassFillCreateMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['create-glass-fill'],
        mutationFn: (data: IGlassFillForm) => GlassFillService.createGlassFill(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-glass-fill']})
            await queryClient.invalidateQueries({ queryKey: ['all-glass-fill-simple']})
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-glass-fill']})
            await queryClient.invalidateQueries({ queryKey: ['all-glass-fill-simple']})
        },
    })
}