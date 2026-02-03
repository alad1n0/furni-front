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
import ButtonDel from "@/ui/button/ButtonDel";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import PaginationControl from "@/componets/pagination/Pagination";
import {useClientsQuery} from "@/screens/client/hooks/useClientsQuery";
import {useClientDelMutation} from "@/screens/client/hooks/useClientDelMutation";
import {useClientFilterStore} from "@/store/client/useClientFilter";
import ClientCreateModal from "@/screens/client/features/modals/modal-create-client";
import {IClient} from "@/screens/client/types/IClient";

const Clients = () => {
    const { data: dataUsers, isPending: isPendingDomain } = useClientsQuery();
    const { mutateAsync: mutateAsyncClientDel } = useClientDelMutation();

    const { page, setPage, limit, setLimit } = useClientFilterStore();
    const modalCreateClient = useModal();

    const [selectedClient, setSelectedClient] = useState<IClient | null>(null);

    const meta = dataUsers?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalPages, currentPage } = meta;

    const onEdit = (client: IClient) => {
        setSelectedClient(client);
        modalCreateClient.onOpen();
    };

    const onDelete = async (id: number) => {
        await mutateAsyncClientDel({ id });
    };

    const handleModalClose = () => {
        setSelectedClient(null);
        modalCreateClient.onClose();
    };

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
                            modalCreateClient.onOpen();
                        }}
                    >
                        <PlusSvg width={20} height={20} /> Add Client
                    </Button>
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className={"overflow-x-auto w-full"}>
                        <Table>
                            <thead>
                                <TrHead>
                                    <th>firstName</th>
                                    <th>lastName</th>
                                    <th>middleName</th>
                                    <th>email</th>
                                    <th>phone</th>
                                    <th className={"w-[120px]"}></th>
                                </TrHead>
                            </thead>
                            <tbody>
                            {dataUsers?.clients.map((item) => (
                                <TrBody key={item.id}>
                                    <td>{item.firstName}</td>
                                    <td>{item.lastName}</td>
                                    <td>{item.middleName}</td>
                                    <td>{item.email}</td>
                                    <td>{item.phone}</td>
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

            <ClientCreateModal
                {...modalCreateClient}
                client={selectedClient}
                onClose={handleModalClose}
            />
        </MainLayout>
    );
};

export default Clients;