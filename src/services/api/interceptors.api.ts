import axios from 'axios'

import {API_URL} from "@/config/api.config";
import {tostik} from "@/utils/tostik";
import {getAccessTokenByRefresh} from "@/config/getAccessTokenByRefresh";
import {useAuthStore} from "@/store/auth/authReducer";

const instance = axios.create({
    baseURL: API_URL,
})

instance.interceptors.request.use(async config => {
    const { accessToken } = useAuthStore.getState();

    if (config.headers && accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    console.log(
        '< REQUEST >',
        config.url,
        config.params,
        config.data,
        {token: typeof config.headers?.Authorization === 'string' ? config.headers?.Authorization?.split(' ')[1] : ''}
    )

    return config
})

instance.interceptors.response.use(
    config => {
        console.log('< RESPONSE >', config.data.data)
        return config
    },
    async error => {
        const originalRequest = error.config;

        const isAuthEndpoint = originalRequest.url?.includes('/auth/login');

        if (error.response?.status === 401 && !originalRequest._isRetry && !isAuthEndpoint) {
            originalRequest._isRetry = true;
            const accessToken = await getAccessTokenByRefresh();
            if (accessToken) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return instance.request(originalRequest);
            } else {
                useAuthStore.getState().clearTokens();
                localStorage.removeItem('auth-storage');
            }
        } else if(error.response?.status === 401 && originalRequest._isRetry){
            useAuthStore.getState().clearTokens();
            localStorage.removeItem('auth-storage');
        }

        //console.log(error)

        tostik.error(error?.response?.data?.message || error?.message || 'Something went wrong')
        throw error?.response?.data?.message || error?.message || 'Something went wrong';
    },
);
export default instance
