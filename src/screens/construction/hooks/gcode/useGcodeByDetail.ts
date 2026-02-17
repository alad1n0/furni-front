import { useMutation } from "@tanstack/react-query";
import { GcodeService } from "@/services/gcode/gcode.service";

export const useGcodeByDetail = () => {
    return useMutation({
        mutationFn: (detailId: number) => GcodeService.getGcodeByDetail(detailId)
            .then(data => data.data.data),
    });
};