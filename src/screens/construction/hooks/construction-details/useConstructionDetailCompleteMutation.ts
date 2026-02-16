import { useMutation, useQueryClient } from "@tanstack/react-query";
import {ConstructionDetailsService} from "@/services/construction/construction-details/construction-details.service";

export const useConstructionDetailCompleteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['update-construction-detail-complete'],
        mutationFn: (detailId: number) => ConstructionDetailsService.updateConstructionDetailComplete(detailId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['construction-details']
            });
        },
        onError: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['construction-details']
            });
        },
    });
};