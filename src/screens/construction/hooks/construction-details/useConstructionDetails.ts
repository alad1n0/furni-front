import {ConstructionDetailsService} from "@/services/construction/construction-details/construction-details.service";
import {useQuery} from "@tanstack/react-query";
import {ConstructionDetail} from "@/screens/construction/type/construction-details/IConstructionDetail";

export const useConstructionDetails = (constructionId: number) => {
    return useQuery({
        queryKey: ['construction-details', constructionId],
        queryFn: () => ConstructionDetailsService.getAllConstructionDetails(constructionId)
            .then(data => data.data.data as ConstructionDetail[])
    });
};