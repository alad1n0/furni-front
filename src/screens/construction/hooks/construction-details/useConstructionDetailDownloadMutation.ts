import { useMutation, useQueryClient } from "@tanstack/react-query";
import {ConstructionDetailsService} from "@/services/construction/construction-details/construction-details.service";

export const useConstructionDetailDownloadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['update-construction-detail-label-download'],
        mutationFn: (detailId: number) => ConstructionDetailsService.updateConstructionDetailDownload(detailId),
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