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
import ToggleUser from "@/screens/users/shared/toggle-user";
import ConstructionCreateModal from "@/screens/construction/features/modals/ modal-create-сonstruction";
import {useConstructionDelMutation} from "@/screens/construction/hooks/construction/useConstructionDelMutation";
import {IConstruction} from "@/screens/construction/type/construction/IConstruction";
import {useConstructionQuery} from "@/screens/construction/hooks/construction/useConstructionQuery";
import {useConstructionFilterStore} from "@/store/construction/useConstructionFilter";
import {formatDateTime} from "@/utils/time/formatDateTime";

const Construction = () => {
    const { data: dataConstruction, isPending: isPendingConstruction } = useConstructionQuery();
    const { mutateAsync: mutateAsyncConstructionDel } = useConstructionDelMutation();

    const { page, setPage, limit, setLimit } = useConstructionFilterStore();
    const modalCreateUser = useModal();

    const [selectedConstruction, setSelectedConstruction] = useState<IConstruction | null>(null);

    const meta = dataConstruction?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalPages, currentPage } = meta;

    const onEdit = (construction: IConstruction) => {
        setSelectedConstruction(construction);
        modalCreateUser.onOpen();
    };

    const onDelete = async (id: number, orderId: number) => {
        await mutateAsyncConstructionDel({
            id: id,
            orderId: orderId
        });
    };

    const handleModalClose = () => {
        setSelectedConstruction(null);
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
                        <PlusSvg width={20} height={20} /> Add Construction
                    </Button>
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className={"overflow-x-auto w-full"}>
                        <Table>
                            <thead>
                            <TrHead>
                                <th>constructionNumber</th>
                                <th>width</th>
                                <th>height</th>
                                <th>createdAt</th>
                                <th className={"w-[120px]"}></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataConstruction?.construction.map((item) => (
                                <TrBody key={item.id}>
                                    <td>{item.constructionNo}</td>
                                    <td>{item.width}</td>
                                    <td>{item.height}</td>
                                    <td>{formatDateTime(item.createdAt)}</td>
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

                                        <ButtonDel
                                            onClick={() => onDelete(item.id, item.orderId)}
                                            className={"min-h-[36px]"}
                                        />
                                    </td>
                                </TrBody>
                            ))}
                            {isPendingConstruction && (
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
                    disabled={isPendingConstruction}
                />
            </div>

            {/*<ConstructionCreateModal*/}
            {/*    {...modalCreateUser}*/}
            {/*    construction={selectedConstruction}*/}
            {/*    onClose={handleModalClose}*/}
            {/*/>*/}
        </>
    );
};

export default Construction;