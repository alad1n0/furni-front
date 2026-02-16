import {useQuery} from "@tanstack/react-query";
import {IPagination} from "@/types/IPagination";
import {ConstructionService} from "@/services/construction/construction/construction.service";
import {IConstruction} from "@/screens/construction/type/construction/IConstruction";
import {useConstructionFilterStore} from "@/store/construction/construction-fiter/useConstructionFilter";

export const useConstructionQuery = () => {
    const useFilteredUsers = () => {
        const {page, limit, constructionNo, orderNumber, status} = useConstructionFilterStore();
        return {
            page,
            limit: Number(limit),
            orderNumber: orderNumber || undefined,
            constructionNo: constructionNo || undefined,
            constructionStatusId: status || undefined
        }
    };
    const filterParams = useFilteredUsers()
    return useQuery({
        queryKey: ['all-construction', filterParams],
        queryFn: () => ConstructionService.getAllConstruction(filterParams)
            .then(data =>
                data.data.data as { meta: IPagination,  construction: Array<IConstruction> })
    })
}