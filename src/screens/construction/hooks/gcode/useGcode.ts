import {useQuery} from "@tanstack/react-query";
import {GcodeService} from "@/services/gcode/gcode.service";

export const useGcode = (id: number) => {
    return useQuery({
        queryKey: ['get-gcode-for-operation-and-detail', id],
        queryFn: () => GcodeService.getGcodeByDetailOperations(id)
            .then(data => data.data.data),
        enabled: !!id,
    });
};