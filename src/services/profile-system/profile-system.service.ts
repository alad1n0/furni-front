import instance from "@/services/api/interceptors.api";
import {getProfileSystemUrl} from "@/config/api.config";

export const ProfileSystemService = {
    getProfileSystemSimple: () =>
        instance({
            url: getProfileSystemUrl(),
            method: 'GET'
        })
}