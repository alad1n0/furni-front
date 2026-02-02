import instance from "../api/interceptors.api";
import {IQueryPagination} from "@/types/IQueryPagination";
import {
    createUser,
    deleteUser,
    getUserRoles,
    getUsersUrl,
    updateUser
} from "@/config/api.config";
import {IUserForm} from "@/screens/users/types/IUserForm";
import {IUserUpdateData} from "@/screens/users/hooks/useUserUpdateMutation";

export const UserService = {
    getUsers: (params: IQueryPagination) =>
        instance({
            url: getUsersUrl(),
            method: 'GET',
            params
        }),
    delUser: ({id}: { id: number }) =>
        instance({
            url: deleteUser(id),
            method: 'DELETE',
        }),
    createUser: (data: IUserForm) =>
        instance({
            url: createUser(),
            method: 'POST',
            data
        }),
    getUserRoles: () =>
        instance({
            url: getUserRoles(),
            method: 'GET',
        }),
    updateUser: (id: number, data: IUserUpdateData) =>
        instance({
            url: updateUser(id),
            method: 'PUT',
            data
        })
};
