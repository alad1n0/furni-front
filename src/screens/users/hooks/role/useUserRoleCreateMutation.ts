import {useMutation, useQueryClient} from "@tanstack/react-query";
import {IUserRolesForm} from "@/screens/users/types/user-roles/IUserRolesForm";
import {UserRolesService} from "@/services/user/user-roles/user-roles.service";

export const useUserRolesCreateMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['create-user-role'],
        mutationFn: (data: IUserRolesForm) => UserRolesService.createUserRoles(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-user-role']})
            await queryClient.invalidateQueries({ queryKey: ['all-user-role-query']})
        },
        onError: async (error) => {
            await queryClient.invalidateQueries({ queryKey: ['all-user-role']})
            await queryClient.invalidateQueries({ queryKey: ['all-user-role-query']})
            console.error('Error creating user:', error)
        },
    })
}