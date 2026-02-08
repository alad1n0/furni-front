import {useQuery} from "@tanstack/react-query";
import {ConstructionService} from "@/services/consctruction/construction.service";
import {IConstruction} from "@/screens/construction/type/IConstruction";

export const useConstructionByOrder = (orderId: number) => {
    return useQuery({
        queryKey: ['all-user-role', orderId],
        queryFn: () => ConstructionService.getConstructionByOrder(orderId)
            .then(data => data.data.data as IConstruction[])
    })
}