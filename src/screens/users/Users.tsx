import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import useModal from "@/hooks/useModal";
import React, { useState } from "react";
import Button from "@/ui/button/Button";
import PlusSvg from "@/assets/plusSvg";
import { Table } from "@/ui/table/table";
import { TrHead } from "@/ui/table/tr-head";
import { TrBody } from "@/ui/table/tr-body";
import { cn } from "@/helpers/cn";
import { EditSvg, refreshIcon } from "@/assets";
import { useUsersQuery } from "@/screens/users/hooks/useUsersQuery";
import ButtonDel from "@/ui/button/ButtonDel";
import { useUserDelMutation } from "@/screens/users/hooks/useUserDelMutation";
import UserCreateModal from "@/screens/users/features/modals/modal-create-user";
import { IUser } from "@/screens/users/types/IUser";
import { useUsersFilterStore } from "@/store/user/useUsersFilter";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ButtonPg } from "@/ui/button/ButtonPg";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from "@/ui/pagination/pagination";

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

    const handlePageChange = (page: number) => setPage(page);

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

    const getPaginationNumbers = () => {
        const numbers: number[] = [];

        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        numbers.push(1);

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        if (start > 2) numbers.push(-1);

        for (let i = start; i <= end; i++) {
            numbers.push(i);
        }

        if (end < totalPages - 1) numbers.push(-1);
        numbers.push(totalPages);

        return numbers;
    };

    const paginationNumbers = getPaginationNumbers();
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    return (
        <MainLayout>
            <div className={"flex flex-col gap-3 w-full"}>
                <div className={"flex gap-4 justify-between items-end"}>
                    <div className={"flex flex-row gap-4"}>
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

                <div className="flex justify-center gap-6 items-center py-4">
                    <ButtonPg
                        variant="outline"
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={isFirstPage}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                    </ButtonPg>

                    <Pagination>
                        <PaginationContent>
                            {paginationNumbers.map((pageNum, index) =>
                                pageNum === -1 ? (
                                    <PaginationEllipsis key={`ellipsis-${index}`} />
                                ) : (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            isActive={pageNum === currentPage}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            )}
                        </PaginationContent>
                    </Pagination>

                    <ButtonPg
                        variant="outline"
                        onClick={() =>
                            handlePageChange(Math.min(currentPage + 1, totalPages))
                        }
                        disabled={isLastPage}
                    >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </ButtonPg>
                </div>
            </div>

            <UserCreateModal
                {...modalCreateUser}
                user={selectedUser}
                onClose={handleModalClose}
            />
        </MainLayout>
    );
};

export default Users;