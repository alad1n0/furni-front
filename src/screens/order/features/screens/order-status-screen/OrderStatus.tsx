import ToggleOrder from "@/screens/order/shared/toggle-order";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import Button from "@/ui/button/Button";
import PlusSvg from "@/assets/plusSvg";
import PaginationControl from "@/componets/pagination/Pagination";
import {Table} from "@/ui/table/table";
import {TrHead} from "@/ui/table/tr-head";
import {TrBody} from "@/ui/table/tr-body";
import {EditSvg, refreshIcon} from "@/assets";
import useModal from "@/hooks/useModal";
import {useOrderStatusFilterStore} from "@/store/order/order-status-store/useOrderStatusRolesFilter";
import React, {useState} from "react";
import {cn} from "@/helpers/cn";
import {IOrderStatus} from "@/screens/order/types/order-status/IOrderStataus";
import {useOrderStatusQuery} from "@/screens/order/hooks/order-status/useOrderStatusQuery";

const OrderStatus = () => {
    const { data: dataOrderStatus, isPending: isPendingOrderStatus } = useOrderStatusQuery();

    const { page, setPage, limit, setLimit } = useOrderStatusFilterStore();
    const modalCreateOrderStatus = useModal();

    const [selectedOrderStatus, setSelectedOrderStatus] = useState<IOrderStatus | null>(null);

    const meta = dataOrderStatus?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalPages, currentPage } = meta;

    const onEdit = (orderStatus: IOrderStatus) => {
        setSelectedOrderStatus(orderStatus);
        modalCreateOrderStatus.onOpen();
    };

    const handleModalClose = () => {
        setSelectedOrderStatus(null);
        modalCreateOrderStatus.onClose();
    };

    return (
        <>
            <div className={"flex flex-col gap-3 w-full"}>
                <div className={"flex gap-4 justify-between items-end"}>
                    <div className={"flex items-center flex-row gap-4"}>
                        <ToggleOrder />
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
                            modalCreateOrderStatus.onOpen();
                        }}
                    >
                        <PlusSvg width={20} height={20} /> Create Order
                    </Button>
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className={"overflow-x-auto w-full"}>
                        <Table>
                            <thead>
                            <TrHead>
                                <th>type</th>
                                <th>title</th>
                                <th className={"w-[80px]"}></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataOrderStatus?.orderStatus.map((item) => (
                                <TrBody key={item.id}>
                                    <td>{item.code}</td>
                                    <td>{item.title}</td>
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
                                    </td>
                                </TrBody>
                            ))}
                            {isPendingOrderStatus && (
                                <TrBody>
                                    <td colSpan={6}>
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
                    disabled={isPendingOrderStatus}
                />
            </div>

            {/*<OrderCreateModal*/}
            {/*    {...modalCreateOrder}*/}
            {/*    order={selectedOrder}*/}
            {/*    onClose={handleModalClose}*/}
            {/*/>*/}
        </>
    );
};

export default OrderStatus;