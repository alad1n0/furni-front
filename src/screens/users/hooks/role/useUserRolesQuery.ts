import {useUserRolesFilterStore} from "@/store/user/user-role-store/useUserRolesFilter";
import {useQuery} from "@tanstack/react-query";
import {UserRolesService} from "@/services/user/user-roles/user-roles.service";
import {IPagination} from "@/types/IPagination";
import {IUserRolesQuery} from "@/screens/users/types/user-roles/IUserRolesQuery";

export const useUserRolesQuery = () => {
    const useFilteredUsers = () => {
        const {page, limit} = useUserRolesFilterStore();
        return {page, limit: Number(limit)}
    };
    const filterParams = useFilteredUsers()
    return useQuery({
        queryKey: ['all-user-role-query', filterParams],
        queryFn: () => UserRolesService.getUserRolesQuery(filterParams)
            .then(data =>
                data.data.data as { meta: IPagination,  roles: Array<IUserRolesQuery> })
    })
}