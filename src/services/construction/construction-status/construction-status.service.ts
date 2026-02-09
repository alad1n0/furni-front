import instance from "@/services/api/interceptors.api";
import {getConstructionStatus} from "@/config/api.config";

export const ConstructionStatusService = {
    getAllConstructionStatus: () =>
        instance({
            url: getConstructionStatus(),
            method: 'GET'
        })
}