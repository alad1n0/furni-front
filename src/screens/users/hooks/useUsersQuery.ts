import {useQuery} from "@tanstack/react-query";
import {IPagination} from "@/types/IPagination";
import {UserService} from "@/services/user/user.service";
import {IUsersQuery} from "@/screens/users/types/IUsersQuery";
import {useUsersFilterStore} from "@/store/user/useUsersFilter";

export const useUsersQuery = () => {
    const useFilteredUsers = () => {
        const {page, limit} = useUsersFilterStore();
        return {page, limit}
    };
    const filterParams = useFilteredUsers()
    return useQuery({
        queryKey: ['all-user', filterParams],
        queryFn: () => UserService.getUsers(filterParams)
            .then(data =>
                data.data.data as { meta: IPagination,  users: Array<IUsersQuery> })
    })
}