import React, {FC, useState} from "react";
import { useParams, useNavigate } from "react-router";
import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import Button from "@/ui/button/Button";
import {ArrowLeft, Edit2, Plus, Eye, ChevronDown, Download} from "lucide-react";
import Loading from "@/ui/loading/Loading";
import useModal from "@/hooks/useModal";
import OrderCreateModal from "@/screens/order/features/order-modals/modal-create-order";
import { useOrderDelMutation } from "@/screens/order/hooks/order/useOrderDelMutation";
import { useOrderDetails } from "@/screens/order/hooks/order/useOrderDetails";
import { formatDateTime } from "@/utils/time/formatDateTime";
import { useConstructionByOrder } from "@/screens/construction/hooks/construction/useConstructionByOrder";
import { IConstruction } from "@/screens/construction/type/construction/IConstruction";
import { useConstructionDelMutation } from "@/screens/construction/hooks/construction/useConstructionDelMutation";
import { useOrderUpdateMutation } from "@/screens/order/hooks/order/useOrderUpdateMutation";
import { useOrderStatus } from "@/screens/order/hooks/order-status/useOrderStatus";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import { cn } from "@/helpers/cn";
import ButtonDel from "@/ui/button/ButtonDel";
import PlusSvg from "@/assets/plusSvg";
import ConstructionDetailsView from "@/screens/order/component/ConstructionDetailsView";
import {useConstructionDetailOperationCompleteMutation} from "@/screens/construction/hooks/construction-details/useConstructionDetailOperationCompleteMutation";
import {useConstructionDetailCompleteMutation} from "@/screens/construction/hooks/construction-details/useConstructionDetailCompleteMutation";
import ConstructionCreateModal from "@/screens/construction/features/modals/modal-create-update-construction/ modal-create-сonstruction";
import ConstructionDetailModal from "@/screens/construction/features/modals/construction-details-modal/construction-details-modal";
import {useGcode} from "@/screens/construction/hooks/gcode/useGcode";
import toast from "react-hot-toast";
import {useGcodeByDetail} from "@/screens/construction/hooks/gcode/useGcodeByDetail";
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import {useConstructionDetailDownloadMutation} from "@/screens/construction/hooks/construction-details/useConstructionDetailDownloadMutation";
import {
    generateConstructionPdf,
} from "@/screens/construction/features/editor/utils/labelGenerator";

type GCodeItem = {
    operationId: number;
    operationType: string;
    operationTitle: string | null;
    code: string;
    fileName: string;
};

const OrderDetails: FC = () => {
    const { id } = useParams<{ id: string }>();
    const orderId = Number(id);
    const navigate = useNavigate();

    const modalEditOrder = useModal();
    const modalConstructionDetails = useModal();
    const modalCreateOrderConstruction = useModal();

    const [selectedConstructionForDetails, setSelectedConstructionForDetails] = useState<number | null>(null);
    const [selectedConstruction, setSelectedConstruction] = useState<IConstruction | null>(null);
    const [expandedConstructionDetails, setExpandedConstructionDetails] = useState<Set<number>>(new Set());
    const [selectedOrderStatus, setSelectedOrderStatus] = useState<Record<string, number>>({});
    const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
    const [isDownloadingLabels, setIsDownloadingLabels] = useState(false);
    const [isDownloadingGCode, setIsDownloadingGCode] = useState(false);

    const { data: order, isPending: isPendingOrder, isError, error } = useOrderDetails(orderId);
    const { data: orderConstruction, isPending: isPendingOrderConstruction, refetch: refetchConstructions } = useConstructionByOrder(orderId);
    const { data: dataOrderStatus, isPending: isPendingOrderStatus } = useOrderStatus();

    const { mutateAsync: downloadGCode } = useGcode();
    const { mutateAsync: getGcodeForDetail } = useGcodeByDetail();
    const { mutateAsync: deleteOrder, isPending: isDeleting } = useOrderDelMutation();
    const { mutateAsync: deleteConstruction, isPending: isDeletingConstruction } = useConstructionDelMutation();
    const { mutateAsync: mutateAsyncUpdateOrder } = useOrderUpdateMutation();

    const { mutateAsync: completeOperation } = useConstructionDetailOperationCompleteMutation();
    const { mutateAsync: completeDetail } = useConstructionDetailCompleteMutation();
    const { mutateAsync: downloadLabelByDetail } = useConstructionDetailDownloadMutation();

    const handleBack = () => {
        navigate('/order');
    };

    const handleEdit = () => {
        modalEditOrder.onOpen();
    };

    const handleDelete = async () => {
        if (!orderId || isDeleting) return;

        try {
            await deleteOrder({ id: orderId });
            navigate('/order');
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    const handleDeleteConstruction = async (constructionId: number) => {
        if (isDeletingConstruction) return;

        try {
            await deleteConstruction({
                id: constructionId,
                orderId: orderId,
            });
            await refetchConstructions();
        } catch (error) {
            console.error("Error deleting construction:", error);
        }
    };

    const handleEditClose = async () => {
        modalEditOrder.onClose();
    };

    const handleEditConstruction = (construction: IConstruction) => {
        setSelectedConstruction(construction);
        modalCreateOrderConstruction.onOpen();
    };

    const handleCreateConstruction = () => {
        setSelectedConstruction(null);
        modalCreateOrderConstruction.onOpen();
    };

    const handleConstructionModalClose = async () => {
        setSelectedConstruction(null);
        modalCreateOrderConstruction.onClose();
        await refetchConstructions();
    };

    const handleViewConstruction = (constructionId: number) => {
        navigate(`/construction-editor?id=${constructionId}&orderId=${orderId}`);
    };

    const toggleConstructionDetails = (constructionId: number) => {
        const newExpanded = new Set(expandedConstructionDetails);
        if (newExpanded.has(constructionId)) {
            newExpanded.delete(constructionId);
        } else {
            newExpanded.add(constructionId);
        }
        setExpandedConstructionDetails(newExpanded);
    };

    const handleDetailClick = (constructionId: number, detailId: number) => {
        setSelectedConstructionForDetails(constructionId);
        setSelectedDetailId(detailId);
        modalConstructionDetails.onOpen();
    };

    const handleCloseConstructionDetails = async () => {
        setSelectedConstructionForDetails(null);
        setSelectedDetailId(null);
        modalConstructionDetails.onClose();
        await refetchConstructions();
    };

    const handleOperationComplete = async (operationId: number, detailId: number) => {
        try {
            await completeOperation({ operationId, detailId });
            await refetchConstructions();
        } catch (error) {
            console.error('Error completing operation:', error);
        }
    };

    const handleDetailComplete = async (detailId: number) => {
        try {
            await completeDetail(detailId);
            await refetchConstructions();
        } catch (error) {
            console.error('Error completing detail:', error);
        }
    };

    const handleDownloadLabelByDetails = async (detailId: number) => {
        try {
            await downloadLabelByDetail(detailId);
            await refetchConstructions();
        } catch (error) {
            console.error('Error completing detail:', error);
        }
    };

    const handleDownloadBarcode = async () => {
        if (!orderConstruction || !order) return;

        setIsDownloadingLabels(true);

        try {
            const zip = new JSZip();

            for (const construction of orderConstruction) {

                const pdfBlob = await generateConstructionPdf(construction, order);

                const fileName = `Construction_${construction.constructionNo}_Labels.pdf`;

                zip.file(fileName, pdfBlob);
            }

            const content = await zip.generateAsync({ type: "blob" });

            saveAs(content, `Order_${order.orderNumber}_Labels.zip`);

            toast.success("PDF лейбли згенеровані");

        } catch (error) {
            toast.error("Помилка генерації PDF");
            console.error('Error completing detail:', error);
        } finally {
            setIsDownloadingLabels(false);
        }
    };

    const handleDownloadGCode = async (operationId: number) => {
        try {
            const { code, fileName } = await downloadGCode(operationId);

            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`G-code завантажено: ${fileName}`, {
                duration: 3000,
                position: 'top-right',
            });
        } catch (error) {
            console.error('Error downloading G-Code:', error);
            toast.error('Помилка завантаження G-Code', {
                duration: 4000,
                position: 'top-right',
            });
        }
    };

    const handleDownloadAllGCode = async (detailId: number) => {
        try {
            const { gcode } = await getGcodeForDetail(detailId);

            if (gcode.length === 0) {
                toast.error('No G-code available for this detail', {
                    duration: 3000,
                    position: 'top-right',
                });
                return;
            }

            const zip = new JSZip();

            gcode.forEach((item: GCodeItem) => {
                zip.file(item.fileName, item.code);
            });

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `Detail_${detailId}_GCode.zip`);

            toast.success(`G-code архів завантажено (${gcode.length} файлів)`, {
                duration: 3000,
                position: 'top-right',
            });
        } catch (error) {
            console.error('Error downloading all G-Code:', error);
            toast.error('Помилка завантаження G-Code', {
                duration: 4000,
                position: 'top-right',
            });
        }
    };

    const handleStatusChange = async (statusId: number) => {
        if (!statusId) return;

        try {
            await mutateAsyncUpdateOrder({
                statusId: statusId,
                id: orderId
            });
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const handleDownloadAllOrderData = async () => {
        if (!orderConstruction) return;

        setIsDownloadingGCode(true);
        try {
            const zip = new JSZip();
            const errorDetails: string[] = [];

            for (const construction of orderConstruction) {
                for (const detail of construction.details || []) {
                    try {
                        const { gcode } = await getGcodeForDetail(detail.id);

                        if (gcode.length > 0) {
                            gcode.forEach((item: GCodeItem) => {
                                const filePath =
                                    `Construction_${construction.constructionNo}/` +
                                    `Detail_${detail.detailNo}/` +
                                    `${item.fileName}`;

                                zip.file(filePath, item.code);
                            });
                        }
                    } catch (error) {
                        const errorMsg = `Detail ${detail.detailNo}`;
                        errorDetails.push(errorMsg);
                        console.error(`Error fetching G-code for ${errorMsg}:`, error);
                    }
                }
            }

            if (zip.file(/.*/).length === 0) {
                toast.error('No G-code files found for download', {
                    duration: 4000,
                    position: 'top-right',
                });
                return;
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `Order_${order?.orderNumber}_All_GCode.zip`);

            const successMsg = errorDetails.length === 0
                ? 'Всі G-code файли завантажені'
                : `G-code завантажено (${errorDetails.length} помилок)`;

            toast.success(successMsg, {
                duration: 3000,
                position: 'top-right',
            });
        } catch (error) {
            console.error('Error downloading order data:', error);
            toast.error('Помилка завантаження архіву', {
                duration: 4000,
                position: 'top-right',
            });
        } finally {
            setIsDownloadingGCode(false);
        }
    };

    const formattedOrderStatusOptions = dataOrderStatus?.map(orderStatus => ({
        label: orderStatus.title,
        value: orderStatus.id
    })) || [];

    const getProgressColor = (progress: number) => {
        if (progress < 25) return 'bg-red/500';
        if (progress < 50) return 'bg-yellow-attentiom/50';
        if (progress < 75) return 'bg-blue/400';
        return 'bg-emerald/500';
    };

    if (isPendingOrder) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-screen">
                    <Loading />
                </div>
            </MainLayout>
        );
    }

    if (isError || !order) {
        return (
            <MainLayout>
                <div className="flex flex-col gap-4 p-4">
                    <Button
                        onClick={handleBack}
                        className="w-fit"
                        color="gray"
                    >
                        <ArrowLeft size={20} /> Back to Orders
                    </Button>
                    <div className="text-red-500 text-center py-8">
                        Error loading order: {error?.message || 'Unknown error'}
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="w-full px-4">
                <div className="w-full max-w-[1800px] mx-auto h-[calc(100vh-100px)] flex flex-col">
                    <div className="px-4 py-2">
                        <Button
                            onClick={handleBack}
                            color="gray"
                            className="flex gap-2 w-fit ml-0"
                        >
                            <ArrowLeft size={18} />
                            Back to Orders
                        </Button>
                    </div>

                    <div className="flex-1 flex gap-6 overflow-hidden px-4 py-2">
                        <div className="w-80 flex-shrink-0">
                            <div className="bg-react/600 rounded-xl shadow-sm border border-react/500 overflow-hidden h-full flex flex-col">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Order Number</span>
                                        <span className="text-sm font-bold text-blue-600">{order.orderNumber}</span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Name</label>
                                        <div className="bg-react/500 border border-gray-100 rounded-lg p-3">
                                            <p className="text-sm font-semibold text-gray-900">{order.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</label>
                                        <div className="bg-react/500 border border-gray-100 rounded-lg p-3">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {order.client.firstName} {order.client.lastName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                                        {!isPendingOrderStatus ? (
                                            <SelectorSearch
                                                getAndSet={[
                                                    selectedOrderStatus[order.id] || order.status?.id || '',
                                                    (value: string | number) => handleStatusChange(Number(value))
                                                ]}
                                                options={formattedOrderStatusOptions}
                                                placeholder="Select status"
                                                optionValue="value"
                                                optionLabel="label"
                                                searchable={true}
                                                className="w-full border border-gray-100 rounded-lg"
                                            />
                                        ) : (
                                            <div className="text-gray-400 text-sm py-2">Loading...</div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</label>
                                        <div className="bg-react/500 border border-gray-100 rounded-lg p-3">
                                            <p className="text-sm text-gray-700">
                                                {formatDateTime(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-1 py-2 border-t border-gray-100 bg-gray-50 flex gap-2">
                                    <Button
                                        onClick={handleEdit}
                                        color="greenDarkgreen"
                                        className="flex-1 !py-2 text-sm"
                                    >
                                        <Edit2 size={16} /> Edit
                                    </Button>
                                    <ButtonDel
                                        onClick={handleDelete}
                                        title={'Delete'}
                                        className="flex-1 !py-2 text-sm"
                                    >
                                    </ButtonDel>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex flex-row gap-2 items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Order Constructions</h2>

                                <div className="flex gap-2">
                                    <Button
                                        color="blue"
                                        className={"w-auto mx-0 py-0 h-[40px]"}
                                        onClick={handleDownloadAllOrderData}
                                        disabled={isDownloadingGCode}
                                    >
                                        <Download size={14} /> {isDownloadingGCode ? 'Downloading...' : 'Download G-Code'}
                                    </Button>

                                    <Button
                                        color="blue"
                                        className={"w-auto mx-0 py-0 h-[40px]"}
                                        onClick={handleDownloadBarcode}
                                        disabled={isDownloadingLabels}
                                    >
                                        <Download size={14} /> {isDownloadingLabels ? 'Downloading...' : 'Download Labels'}
                                    </Button>

                                    <Button
                                        className={"w-auto mx-0 py-0 h-[40px]"}
                                        color={"greenDarkgreen"}
                                        onClick={handleCreateConstruction}
                                    >
                                        <PlusSvg width={20} height={20} /> Create Construction
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto h-[calc(100vh-200px)] bg-react/600 rounded-xl shadow-sm">
                                {isPendingOrderConstruction ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loading />
                                    </div>
                                ) : orderConstruction && orderConstruction.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {orderConstruction.map((construction: IConstruction) => (
                                            <div
                                                key={construction.id}
                                                className="border-b border-gray-100 last:border-b-0"
                                            >
                                                <button
                                                    onClick={() => toggleConstructionDetails(construction.id)}
                                                    className="w-full px-6 py-4 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <ChevronDown
                                                            size={20}
                                                            className={cn(
                                                                "flex-shrink-0 transition-transform duration-200",
                                                                expandedConstructionDetails.has(construction.id) ? "rotate-180" : ""
                                                            )}
                                                        />
                                                        <div className="flex-1 min-w-0 text-left">
                                                            <h3 className="text-sm font-bold text-gray-900 truncate">
                                                                Construction {construction.constructionNo}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {construction.profileSystem.title} • {construction.width} × {construction.height} mm
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                                        <div className="flex flex-row gap-2 items-center items-end">
                                                            <span className="text-xs font-medium text-gray-500">Progress</span>
                                                            <span className="text-sm font-bold text-gray-900">
                                                                {construction.progress}%
                                                            </span>
                                                        </div>
                                                        <div className="w-24 h-2 bg-react/400 rounded-full overflow-hidden">
                                                            <div
                                                                className={cn(
                                                                    "h-2 rounded-full transition-all duration-300",
                                                                    getProgressColor(Number(construction.progress))
                                                                )}
                                                                style={{ width: `${Math.min(Number(construction.progress), 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </button>

                                                {expandedConstructionDetails.has(construction.id) && (
                                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                                            {construction.hasHandle && (
                                                                <div className="p-3 rounded-lg flex flex-row items-center gap-2 border border-blue-100 bg-blue-50">
                                                                    <span className="text-xs text-blue-700 font-semibold">Handle</span>
                                                                    <div className="flex gap-4 text-xs text-gray-600">
                                                                        <span>Side: {construction.handleSide}</span>
                                                                        {construction.handleOffset && (
                                                                            <span>Offset: {construction.handleOffset} mm</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {construction.glassFill && (
                                                                <div className="p-3 bg-purple-50 rounded-lg flex flex-row items-center gap-2 border border-purple-100">
                                                                    <span className="text-xs text-purple-700 font-semibold">Glass Fill</span>
                                                                    <p className="text-sm font-semibold text-gray-900">
                                                                        {construction.glassFill.type} ({construction.glassFill.thickness} mm)
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="mb-4 pt-3">
                                                            <div className="text-xs font-semibold text-gray-700 mb-3">
                                                                Details
                                                            </div>
                                                            <ConstructionDetailsView
                                                                constructionId={construction.id}
                                                                className="bg-white rounded-lg p-3 border border-gray-200"
                                                                onDetailClick={(detailId) => handleDetailClick(construction.id, detailId)}
                                                            />
                                                        </div>

                                                        <div className="flex gap-2 pt-3 border-t border-gray-200">
                                                            <Button
                                                                onClick={() => handleViewConstruction(construction.id)}
                                                                color="blue"
                                                                className="flex-1 !py-1.5 text-xs"
                                                            >
                                                                <Eye size={16} /> View
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleEditConstruction(construction)}
                                                                color="greenDarkgreen"
                                                                className="flex-1 !py-1.5 text-xs"
                                                            >
                                                                <Edit2 size={16} /> Edit
                                                            </Button>
                                                            <ButtonDel
                                                                onClick={() => handleDeleteConstruction(construction.id)}
                                                                title={'Delete'}
                                                                className="flex-1 !py-1.5 text-xs"
                                                            >
                                                            </ButtonDel>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <p className="text-gray-500 mb-4">No constructions yet</p>
                                            <Button
                                                color="greenDarkgreen"
                                                onClick={handleCreateConstruction}
                                            >
                                                <Plus size={16} /> Create First Construction
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <OrderCreateModal
                {...modalEditOrder}
                order={order}
                onClose={handleEditClose}
            />

            <ConstructionCreateModal
                {...modalCreateOrderConstruction}
                orderId={orderId}
                construction={selectedConstruction}
                onClose={handleConstructionModalClose}
            />

            <ConstructionDetailModal
                {...modalConstructionDetails}
                constructionId={selectedConstructionForDetails}
                detailId={selectedDetailId}
                orderId={orderId}
                construction={orderConstruction?.find(c => c.id === selectedConstructionForDetails)}
                onClose={handleCloseConstructionDetails}
                onOperationComplete={handleOperationComplete}
                onDetailComplete={handleDetailComplete}
                onDownloadLabelByDetails={handleDownloadLabelByDetails}
                onDownloadGCode={handleDownloadGCode}
                onDownloadAllGCode={handleDownloadAllGCode}
            />
        </MainLayout>
    );
};

export default OrderDetails;