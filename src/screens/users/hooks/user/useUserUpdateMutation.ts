import {useMutation, useQueryClient} from "@tanstack/react-query";
import {UserService} from "@/services/user/user/user.service";

export interface IUserUpdateData {
    name: string;
    email: string;
    password?: string;
    role_id: number;
    source_id?: number | null;
}

export const useUserUpdateMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['update-user'],
        mutationFn: ({id, ...data}: IUserUpdateData & { id: number }) =>
            UserService.updateUser(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-user']})
        },
        onError: async (error) => {
            console.error('Error updating user:', error)
        },
    })
}