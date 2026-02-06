import {useMutation, useQueryClient} from "@tanstack/react-query";
import {GlassFillService} from "@/services/glass-fill/glass-fill.service";
import {IGlassFillForm} from "@/screens/glass-fill/types/IGlassFillForm";

export const useGlassFillUpdateMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['update-glass-fill'],
        mutationFn: ({id, ...data}: IGlassFillForm & { id: number }) =>
            GlassFillService.updateGlassFill(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-glass-fill']})
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-glass-fill']})
        },
    })
}