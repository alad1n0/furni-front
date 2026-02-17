import instance from "../api/interceptors.api";
import {getGcodeByDetailUrl, getGcodeProgramUrl} from "@/config/api.config";

export const GcodeService = {
    getGcodeByDetailOperations: (id: number) =>
        instance({
            url: getGcodeProgramUrl(id),
            method: 'GET'
        }),
    getGcodeByDetail: (detailId: number) =>
        instance({
            url: getGcodeByDetailUrl(detailId),
            method: 'GET'
        })
};
