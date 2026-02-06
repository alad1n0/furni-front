import {useMutation, useQueryClient} from "@tanstack/react-query";
import {UserService} from "@/services/user/user/user.service";
import {IUserForm} from "@/screens/users/types/user/IUserForm";

export const useUserCreateMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['create-user'],
        mutationFn: (data: IUserForm) => UserService.createUser(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-user']})
        },
        onError: async (error) => {
            await queryClient.invalidateQueries({ queryKey: ['all-user']})
            console.error('Error creating user:', error)
        },
    })
}