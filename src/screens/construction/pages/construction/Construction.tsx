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
import ConstructionCreateModal from "@/screens/construction/features/modals/modal-create-update-construction/ modal-create-сonstruction";
import {useConstructionDelMutation} from "@/screens/construction/hooks/construction/useConstructionDelMutation";
import {IConstruction} from "@/screens/construction/type/construction/IConstruction";
import {useConstructionQuery} from "@/screens/construction/hooks/construction/useConstructionQuery";
import {useConstructionFilterStore} from "@/store/construction/construction-fiter/useConstructionFilter";
import {formatDateTime} from "@/utils/time/formatDateTime";
import ToggleConstruction from "@/screens/construction/shared/toggle-construction";
import {useConstructionStatus} from "@/screens/construction/hooks/construction-status/useConstructionStatus";
import {useConstructionUpdateMutation} from "@/screens/construction/hooks/construction/useConstructionUpdateMutation";
import {Eye} from "lucide-react";
import {useNavigate} from "react-router";
import Input from "@/ui/input/Input";
import {useForm} from "react-hook-form";
import {IConstructionFilterForm} from "@/screens/construction/type/construction/IConstructionFilterForm";

const Construction = () => {
    const {control} = useForm<IConstructionFilterForm>()
    const navigate = useNavigate();

    const { data: dataConstruction, isPending: isPendingConstruction } = useConstructionQuery();
    const { data: dataConstructionStatus, isPending: isPendingConstructionStatus } = useConstructionStatus();

    const { mutateAsync: mutateAsyncConstructionDel } = useConstructionDelMutation();
    const { mutateAsync: mutateAsyncUpdateConstruction } = useConstructionUpdateMutation();

    const {
        page, setPage,
        limit, setLimit,
        status, setStatus,
        orderNumber, setOrderNumber,
        constructionNo, setConstructionNumber
    } = useConstructionFilterStore();

    const modalCreateUser = useModal();

    const [selectedConstruction, setSelectedConstruction] = useState<IConstruction | null>(null);
    const [selectedConstructionStatus, setSelectedConstructionStatus] = useState<Record<string, number>>({});

    const meta = dataConstruction?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalPages, currentPage } = meta;

    const onView = (construction: IConstruction) => {
        navigate(`/construction-editor?id=${construction.id}&orderId=${construction.orderId}`);
    };

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

    const formattedConstructionStatusOptions = dataConstructionStatus?.map(constructionStatus => ({
        label: constructionStatus.title,
        value: constructionStatus.id
    })) || [];

    const getProgressColor = (progress: number) => {
        if (progress < 25) return 'bg-red/500';
        if (progress < 50) return 'bg-yellow-attentiom/50';
        if (progress < 75) return 'bg-blue/400';
        return 'bg-emerald/500';
    };

    return (
        <>
            <div className={"flex flex-col gap-3 w-full"}>
                <div className={"flex gap-4 justify-between items-end"}>
                    <div className={"flex items-center flex-row gap-4"}>
                        <ToggleConstruction />

                        <SelectorSearch
                            getAndSet={[limit, setLimit]}
                            searchable={false}
                            className={'w-[80px]'}
                            options={[20, 40, 60, 80]}
                        />

                        <Input
                            placeholder={'orderNumber'}
                            control={control}
                            name={'orderNumber'}
                            value={orderNumber}
                            className={'w-[180px]'}
                            onChange={(e) => setOrderNumber(e.target.value)}
                        />

                        <Input
                            placeholder={'constructionNo'}
                            control={control}
                            name={'constructionNo'}
                            value={constructionNo}
                            className={'w-[180px]'}
                            onChange={(e) => setConstructionNumber(e.target.value)}
                        />

                        {!isPendingConstructionStatus && formattedConstructionStatusOptions.length > 0 && (
                            <SelectorSearch
                                getAndSet={[status, (value: string) => setStatus(value || '')]}
                                className={'w-[240px]'}
                                options={formattedConstructionStatusOptions}
                                allowClear={true}
                                placeholder={'all statuses'}
                                optionValue="value"
                                optionLabel="label"
                                searchable={true}
                            />
                        )}
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
                                <th>orderNumber</th>
                                <th>constructionNumber</th>
                                <th>status</th>
                                <th>width</th>
                                <th>height</th>
                                <th>profileSystem</th>
                                <th>progress</th>
                                <th>createdAt</th>
                                <th className={"w-[180px]"}></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataConstruction?.construction.map((item) => (
                                <TrBody key={item.id}>
                                    <td>{item.order.orderNumber}</td>
                                    <td>{item.constructionNo}</td>
                                    <td className={'!max-w-[150px] !p-0'}>
                                        {!isPendingConstructionStatus ? (
                                            <SelectorSearch
                                                getAndSet={[
                                                    selectedConstructionStatus[item.id] || item.constructionStatus?.id || '',
                                                    async (value: number | string) => {
                                                        if (!value || value === '') return;

                                                        const numericValue = Number(value);

                                                        setSelectedConstructionStatus(prev => ({
                                                            ...prev,
                                                            [item.id]: numericValue
                                                        }));

                                                        try {
                                                            await mutateAsyncUpdateConstruction({
                                                                constructionStatusId: numericValue,
                                                                id: item.id,
                                                                orderId: item.orderId
                                                            });
                                                        } catch (error) {
                                                            console.error('Error updating order status:', error);
                                                            setSelectedConstructionStatus(prev => {
                                                                const updated = {...prev};
                                                                delete updated[item.id];
                                                                return updated;
                                                            });
                                                        }
                                                    }
                                                ]}
                                                options={formattedConstructionStatusOptions}
                                                placeholder={'select status'}
                                                optionValue="value"
                                                optionLabel="label"
                                                isEmptyValueDisable={true}
                                                searchable={true}
                                            />
                                        ) : (
                                            <span className="text-gray-400">Loading...</span>
                                        )}
                                    </td>
                                    <td>{item.width}</td>
                                    <td>{item.height}</td>
                                    <td>{item.profileSystem.title}</td>
                                    <td>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-xs text-gray-500 font-medium">Progress</span>
                                            <span className="text-xs font-bold text-gray-900">
                                                            {item.progress}%
                                                        </span>
                                        </div>
                                        <div className="w-full bg-react/400 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-2 rounded-full transition-all duration-300",
                                                    getProgressColor(Number(item.progress))
                                                )}
                                                style={{ width: `${Math.min(Number(item.progress), 100)}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td>{formatDateTime(item.createdAt)}</td>
                                    <td className={"!p-0 flex flex-row g-2"}>
                                        <Button
                                            className={"min-h-[36px] w-fit"}
                                            color="blue"
                                            onClick={() => onView(item)}
                                            title="View order details"
                                        >
                                            <Eye size={16} />
                                        </Button>

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

            <ConstructionCreateModal
                {...modalCreateUser}
                construction={selectedConstruction}
                onClose={handleModalClose}
            />
        </>
    );
};

export default Construction;