import {useQuery} from "@tanstack/react-query";
import {UserRolesService} from "@/services/user/user-roles/user-roles.service";
import {IUserRoles} from "@/screens/users/types/user-roles/IUserRoles";

export const useUserRoles = () => {
    return useQuery({
        queryKey: ['all-user-role'],
        queryFn: () => UserRolesService.getUserRoles()
            .then(data => data.data.data as IUserRoles[])
    })
}