import {useMutation, useQueryClient} from "@tanstack/react-query";
import {ConstructionDetailsService} from "@/services/construction/construction-details/construction-details.service";

export const useConstructionDetailOperationCompleteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['update-construction-detail-operation-complete'],
        mutationFn: ({detailId, operationId}: { detailId: number; operationId: number; }) =>
            ConstructionDetailsService.updateConstructionDetailOperationComplete(detailId, operationId),
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