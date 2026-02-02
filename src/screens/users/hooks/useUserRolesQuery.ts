import {useQuery} from "@tanstack/react-query";
import {UserService} from "@/services/user/user.service";

interface IRole {
    id: number;
    name: string;
}

export const useUserRolesQuery = () => {
    return useQuery({
        queryKey: ['user-roles'],
        queryFn: () => UserService.getUserRoles()
            .then(data => data.data.data as IRole[])
    })
}