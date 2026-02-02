import axios from "axios";
import {API_URL, postRefreshTokenUrl} from "@/config/api.config";
import {IRefresh} from "@/screens/auth/types/ITokenForm";
import {useAuthStore} from "@/store/auth/authReducer";

export const getAccessTokenByRefresh = async () => {
    try {
        const { refreshToken, setAccessToken } = useAuthStore.getState()

        const response = await axios.post<string, {data: {data: IRefresh}}>(
            API_URL + postRefreshTokenUrl(),
            {refreshToken}
        )

        console.log(response.data.data)

        const { accessToken } = response.data.data;

        setAccessToken(accessToken);

        return accessToken;
    } catch (error) {
        console.log(error)
    }
}