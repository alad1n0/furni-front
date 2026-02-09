import {useQuery} from "@tanstack/react-query";
import {GlassFillService} from "@/services/glass-fill/glass-fill.service";
import {IGlassFill} from "@/screens/glass-fill/types/IGlassFill";

export const useGlassFill = () => {
    return useQuery({
        queryKey: ['all-glass-fill-simple'],
        queryFn: () => GlassFillService.getGlassFillSimple()
            .then(data => data.data.data.formation as IGlassFill[])
    })
}