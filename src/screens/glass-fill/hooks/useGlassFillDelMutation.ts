import {useMutation, useQueryClient} from "@tanstack/react-query";
import {GlassFillService} from "@/services/glass-fill/glass-fill.service";

export const useGlassFillDelMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['delete-glass-fill'],
        mutationFn: (data: { id: number }) => GlassFillService.deleteGlassFill(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-glass-fill']})
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-glass-fill']})
        },
    })
}