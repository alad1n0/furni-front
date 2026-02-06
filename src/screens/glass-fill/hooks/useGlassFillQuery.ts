import {useQuery} from "@tanstack/react-query";
import {IPagination} from "@/types/IPagination";
import {GlassFillService} from "@/services/glass-fill/glass-fill.service";
import {GlassFillQuery} from "@/screens/glass-fill/types/IGlassFillQuery";
import {useGlassFillFilterStore} from "@/store/glass-fill/useGlassFillFilter";

export const useGlassFillQuery = () => {
    const useFilteredGlassFill = () => {
        const {page, limit} = useGlassFillFilterStore();
        return {page, limit}
    };
    const filterParams = useFilteredGlassFill()
    return useQuery({
        queryKey: ['all-glass-fill', filterParams],
        queryFn: () => GlassFillService.getGlassFill(filterParams)
            .then(data =>
                data.data.data as { meta: IPagination,  glassFill: Array<GlassFillQuery> })
    })
}