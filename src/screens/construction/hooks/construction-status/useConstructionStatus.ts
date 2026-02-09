import {useQuery} from "@tanstack/react-query";
import {ConstructionStatusService} from "@/services/construction/construction-status/construction-status.service";
import {IConstructionStatus} from "@/screens/construction/type/construction/IConstruction";

export const useConstructionStatus = () => {
    return useQuery({
        queryKey: ['all-construction-status'],
        queryFn: () => ConstructionStatusService.getAllConstructionStatus()
            .then(data => data.data.data as IConstructionStatus[])
    })
}