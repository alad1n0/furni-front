import instance from "../api/interceptors.api";
import {postLoginUrl} from "@/config/api.config";
import {ITokenForm} from "@/screens/auth/types/ITokenForm";

export const AuthService = {
    checkToken: async (data: ITokenForm) => instance({
        url: postLoginUrl(),
        method: 'POST',
        data
    })
}