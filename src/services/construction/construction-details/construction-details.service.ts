import instance from "@/services/api/interceptors.api";
import {
    getConstructionDetails,
    updateConstructionDetailComplete,
    updateConstructionDetailOperationComplete
} from "@/config/api.config";

export const ConstructionDetailsService = {
    getAllConstructionDetails: (constructionId: number) =>
        instance({
            url: getConstructionDetails(constructionId),
            method: 'GET'
        }),
    updateConstructionDetailComplete: (detailId: number) =>
        instance({
            url: updateConstructionDetailComplete(detailId),
            method: 'PUT'
        }),
    updateConstructionDetailOperationComplete: (detailId: number, operationId: number) =>
        instance({
            url: updateConstructionDetailOperationComplete(detailId, operationId),
            method: 'PUT'
        })
}