import {useMutation, useQueryClient} from "@tanstack/react-query";
import {UserService} from "@/services/user/user.service";

interface IUserCreateData {
    name: string;
    email: string;
    password: string;
    marker: string;
    role_id: number;
    source_id?: number | null;
}

export const useUserCreateMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['create-user'],
        mutationFn: (data: IUserCreateData) => UserService.createUser(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-user']})
        },
        onError: async (error) => {
            await queryClient.invalidateQueries({ queryKey: ['all-user']})
            console.error('Error creating user:', error)
        },
    })
}