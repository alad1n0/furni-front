import {useQuery} from "@tanstack/react-query";
import {IPagination} from "@/types/IPagination";
import {ConstructionService} from "@/services/construction/construction/construction.service";
import {IConstruction} from "@/screens/construction/type/construction/IConstruction";
import {useConstructionFilterStore} from "@/store/construction/useConstructionFilter";

export const useConstructionQuery = () => {
    const useFilteredUsers = () => {
        const {page, limit} = useConstructionFilterStore();
        return {page, limit: Number(limit)}
    };
    const filterParams = useFilteredUsers()
    return useQuery({
        queryKey: ['all-construction', filterParams],
        queryFn: () => ConstructionService.getAllConstruction(filterParams)
            .then(data =>
                data.data.data as { meta: IPagination,  construction: Array<IConstruction> })
    })
}