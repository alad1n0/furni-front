import {useMutation, useQueryClient} from "@tanstack/react-query";
import {UserRolesService} from "@/services/user/user-roles/user-roles.service";
import {IUserRolesForm} from "@/screens/users/types/user-roles/IUserRolesForm";

export const useUserRoleUpdateMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['update-user-role'],
        mutationFn: ({id, ...data}: IUserRolesForm & { id: number }) =>
            UserRolesService.updateUserRole(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-user-role']})
            await queryClient.invalidateQueries({ queryKey: ['all-user-role-query']})
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-user-role']})
            await queryClient.invalidateQueries({ queryKey: ['all-user-role-query']})
        },
    })
}