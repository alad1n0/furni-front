import instance from "../../api/interceptors.api";
import {
    createUserRole,
    getUserRoles, getUserRolesQuery,
    updateUserRole
} from "@/config/api.config";
import {IUserRolesForm} from "@/screens/users/types/user-roles/IUserRolesForm";
import {IQueryPagination} from "@/types/IQueryPagination";

export const UserRolesService = {
    createUserRoles: (data: IUserRolesForm) =>
        instance({
            url: createUserRole(),
            method: 'POST',
            data
        }),
    getUserRoles: () =>
        instance({
            url: getUserRoles(),
            method: 'GET',
        }),
    getUserRolesQuery: (params: IQueryPagination) =>
        instance({
            url: getUserRolesQuery(),
            method: 'GET',
            params
        }),
    updateUserRole: (id: number, data: IUserRolesForm) =>
        instance({
            url: updateUserRole(id),
            method: 'PUT',
            data
        })
};
