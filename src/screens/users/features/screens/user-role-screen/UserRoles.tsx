import ToggleUser from "@/screens/users/shared/toggle-user";
import PlusSvg from "@/assets/plusSvg";
import Button from "@/ui/button/Button";
import {useUserRolesQuery} from "@/screens/users/hooks/role/useUserRolesQuery";
import {useUserRolesFilterStore} from "@/store/user/user-role-store/useUserRolesFilter";
import useModal from "@/hooks/useModal";
import {IUserRoles} from "@/screens/users/types/user-roles/IUserRoles";
import React, {useState} from "react";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import {TrHead} from "@/ui/table/tr-head";
import {TrBody} from "@/ui/table/tr-body";
import {EditSvg, refreshIcon} from "@/assets";
import {cn} from "@/helpers/cn";
import PaginationControl from "@/componets/pagination/Pagination";
import UserRolesCreateModal from "@/screens/users/features/user-roles-modals/modal-create-user-role";
import {Table} from "@/ui/table/table";

const UserRoles = () => {
    const { data: dataUserRoles, isPending: isPendingUserRoles } = useUserRolesQuery();

    const { page, setPage, limit, setLimit } = useUserRolesFilterStore();
    const modalCreateUserRole = useModal();

    const [selectedUserRole, setSelectedUserRole] = useState<IUserRoles | null>(null);

    const meta = dataUserRoles?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalPages, currentPage } = meta;

    const onEdit = (user: IUserRoles) => {
        setSelectedUserRole(user);
        modalCreateUserRole.onOpen();
    };

    const handleModalClose = () => {
        setSelectedUserRole(null);
        modalCreateUserRole.onClose();
    };

    return (
        <>
            <div className={"flex flex-col gap-3 w-full"}>
                <div className={"flex gap-4 justify-between items-end"}>
                    <div className={"flex items-center flex-row gap-4"}>
                        <ToggleUser />
                        <SelectorSearch
                            getAndSet={[limit, setLimit]}
                            searchable={false}
                            className={'w-[80px]'}
                            options={[20, 40, 60, 80]}
                        />
                    </div>
                    <Button
                        className={"w-auto mx-0 py-0 h-[40px]"}
                        color={"greenDarkgreen"}
                        onClick={() => {
                            modalCreateUserRole.onOpen();
                        }}
                    >
                        <PlusSvg width={20} height={20} /> Add User Role
                    </Button>
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className={"overflow-x-auto w-full"}>
                        <Table>
                            <thead>
                            <TrHead>
                                <th>name</th>
                                <th className={"w-[60px]"}></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataUserRoles?.roles.map((item) => (
                                <TrBody key={item.id}>
                                    <td>{item.name}</td>
                                    <td className={"!p-0 flex flex-row g-2"}>
                                        <Button
                                            className={"min-h-[36px] w-fit"}
                                            color="greenDarkgreen"
                                            onClick={() => onEdit(item)}
                                        >
                                            <img
                                                src={EditSvg}
                                                alt={"edit"}
                                                className="w-4 h-4"
                                            />
                                        </Button>
                                    </td>
                                </TrBody>
                            ))}
                            {isPendingUserRoles && (
                                <TrBody>
                                    <td colSpan={5}>
                                        <div
                                            className={cn(
                                                "w-full h-6 animate-spin flex justify-center"
                                            )}
                                        >
                                            <img
                                                src={refreshIcon}
                                                alt={"refresh"}
                                            />
                                        </div>
                                    </td>
                                </TrBody>
                            )}
                            </tbody>
                        </Table>
                    </div>
                </div>

                <PaginationControl
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    disabled={isPendingUserRoles}
                />
            </div>

            <UserRolesCreateModal
                {...modalCreateUserRole}
                role={selectedUserRole}
                onClose={handleModalClose}
            />
        </>
    )
}

export default UserRoles