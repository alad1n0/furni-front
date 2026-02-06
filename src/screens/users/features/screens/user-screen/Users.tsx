import useModal from "@/hooks/useModal";
import React, { useState } from "react";
import Button from "@/ui/button/Button";
import PlusSvg from "@/assets/plusSvg";
import { Table } from "@/ui/table/table";
import { TrHead } from "@/ui/table/tr-head";
import { TrBody } from "@/ui/table/tr-body";
import { cn } from "@/helpers/cn";
import { EditSvg, refreshIcon } from "@/assets";
import { useUsersQuery } from "@/screens/users/hooks/user/useUsersQuery";
import ButtonDel from "@/ui/button/ButtonDel";
import { useUserDelMutation } from "@/screens/users/hooks/user/useUserDelMutation";
import UserCreateModal from "@/screens/users/features/user-modals/modal-create-user";
import { IUser } from "@/screens/users/types/user/IUser";
import { useUsersFilterStore } from "@/store/user/user-store/useUsersFilter";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import PaginationControl from "@/componets/pagination/Pagination";
import ToggleUser from "@/screens/users/shared/toggle-user";

const Users = () => {
    const { data: dataUsers, isPending: isPendingDomain } = useUsersQuery();
    const { mutateAsync: mutateAsyncUserDel } = useUserDelMutation();

    const { page, setPage, limit, setLimit } = useUsersFilterStore();
    const modalCreateUser = useModal();

    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

    const meta = dataUsers?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalPages, currentPage } = meta;

    const onEdit = (user: IUser) => {
        setSelectedUser(user);
        modalCreateUser.onOpen();
    };

    const onDelete = async (id: number) => {
        await mutateAsyncUserDel({ id });
    };

    const handleModalClose = () => {
        setSelectedUser(null);
        modalCreateUser.onClose();
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
                            modalCreateUser.onOpen();
                        }}
                    >
                        <PlusSvg width={20} height={20} /> Add User
                    </Button>
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className={"overflow-x-auto w-full"}>
                        <Table>
                            <thead>
                            <TrHead>
                                <th>name</th>
                                <th>email</th>
                                <th>role</th>
                                <th className={"w-[120px]"}></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataUsers?.users.map((item) => (
                                <TrBody key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.email}</td>
                                    <td>{item.role}</td>
                                    <td className={"!p-0 flex flex-row g-2"}>
                                        <Button
                                            className={"min-h-[36px] w-fit"}
                                            onClick={() => onEdit(item)}
                                        >
                                            <img
                                                src={EditSvg}
                                                alt={"edit"}
                                                className="w-4 h-4"
                                            />
                                        </Button>

                                        <ButtonDel
                                            onClick={() => onDelete(item.id)}
                                            className={"min-h-[36px]"}
                                        />
                                    </td>
                                </TrBody>
                            ))}
                            {isPendingDomain && (
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
                    disabled={isPendingDomain}
                />
            </div>

            <UserCreateModal
                {...modalCreateUser}
                user={selectedUser}
                onClose={handleModalClose}
            />
        </>
    );
};

export default Users;