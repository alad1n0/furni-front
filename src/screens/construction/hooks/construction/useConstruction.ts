import { useQuery } from "@tanstack/react-query";
import { ConstructionService } from "@/services/construction/construction/construction.service";
import { IConstruction } from "@/screens/construction/type/construction/IConstruction";

export const useConstruction = (id: number) => {
    return useQuery({
        queryKey: ['get-construction', id],
        queryFn: () => ConstructionService.getConstruction(id)
            .then(data => data.data.data as IConstruction)
    });
}