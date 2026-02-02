import {useMutation} from "@tanstack/react-query";
import {AuthService} from "@/services/auth/auth.service";
import {ILogin, ITokenForm} from "../types/ITokenForm";
import {useAuthStore} from "@/store/auth/authReducer";

export const useAuthViaTokenMutation = () => {
	const {setTokens, clearTokens, clearStorage} = useAuthStore()
	return useMutation({
		mutationKey: ["login"],
		mutationFn: (token: ITokenForm) =>
			AuthService.checkToken(token).then(
				(data) => data.data.data as ILogin
			),
		onSuccess: (data) => {
			setTokens(data.accessToken, data.refreshToken, data.user.roles.name);
		},
		onError: () => {
			clearTokens();
			clearStorage();
		}
	});
}