import {useQuery} from "@tanstack/react-query";
import {ConstructionService} from "@/services/construction/construction/construction.service";
import {IConstruction} from "@/screens/construction/type/construction/IConstruction";

export const useConstructionByOrder = (orderId: number) => {
    return useQuery({
        queryKey: ['get-construction-by-order', orderId],
        queryFn: () => ConstructionService.getConstructionByOrder(orderId)
            .then(data => data.data.data as IConstruction[])
    })
}