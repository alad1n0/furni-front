import instance from "../api/interceptors.api";
import {getGcodeProgramUrl} from "@/config/api.config";

export const GcodeService = {
    getGcodeByDetailOperations: (id: number) =>
        instance({
            url: getGcodeProgramUrl(id),
            method: 'GET'
        })
};
