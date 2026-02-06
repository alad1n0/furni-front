import {useMutation, useQueryClient} from "@tanstack/react-query";
import {UserService} from "@/services/user/user/user.service";

export const useUserDelMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['delete-user'],
        mutationFn: (data: { id: number }) => UserService.delUser(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-user']})
        },
        onError: async (error) => {
            console.error('Error deleting user:', error)
        },
    })
}