import React, { FC } from "react";
import { useParams, useNavigate } from "react-router";
import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import Button from "@/ui/button/Button";
import { ArrowLeft, Plus } from "lucide-react";
import Loading from "@/ui/loading/Loading";
import useModal from "@/hooks/useModal";
import OrderCreateModal from "@/screens/order/features/order-modals/modal-create-order";
import { useOrderDelMutation } from "@/screens/order/hooks/order/useOrderDelMutation";
import { useOrderDetails } from "@/screens/order/hooks/order/useOrderDetails";
import { formatDateTime } from "@/utils/time/formatDateTime";
import ButtonDel from "@/ui/button/ButtonDel";
import {EditSvg} from "@/assets";
import {useConstructionByOrder} from "@/screens/construction/hooks/useConstructionByOrder";
import {IConstruction} from "@/screens/construction/type/IConstruction";
import PlusSvg from "@/assets/plusSvg";

const OrderDetails: FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const modalEditOrder = useModal();

    const orderId = Number(id);

    const { data: order, isPending: isPendingOrder, isError, error } = useOrderDetails(orderId);
    const { data: orderConstruction, isPending: isPendingOrderConstruction} = useConstructionByOrder(orderId);
    const { mutateAsync: deleteOrder, isPending: isDeleting } = useOrderDelMutation();


    const handleBack = () => {
        navigate('/order');
    };

    const handleEdit = () => {
        modalEditOrder.onOpen();
    };

    const handleDelete = async () => {
        if (!orderId) return;

        const confirmed = window.confirm('Are you sure you want to delete this order?');
        if (!confirmed) return;

        try {
            await deleteOrder({ id: orderId });
            navigate('/order');
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    const handleEditClose = () => {
        modalEditOrder.onClose();
    };

    const getProgressColor = (progress: number) => {
        if (progress < 25) return 'bg-red-500';
        if (progress < 50) return 'bg-orange-500';
        if (progress < 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    if (isPendingOrder) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-64">
                    <Loading />
                </div>
            </MainLayout>
        );
    }

    if (isError || !order) {
        return (
            <MainLayout>
                <div className="flex flex-col gap-4">
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
            <div className="text-white flex justify-between items-center">
                <div>
                    <Button
                        onClick={handleBack}
                        color="gray"
                        className="flex items-center w-fit gap-2"
                    >
                        <ArrowLeft size={18} />
                        Back to Orders
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-6 w-full">
                <div className="bg-white bg-react/500 rounded-lg p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Order #{order.orderNumber}</h1>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                className={"min-h-[40px] w-fit"}
                                color="greenDarkgreen"
                                onClick={handleEdit}
                            >
                                <img
                                    src={EditSvg}
                                    alt={"edit"}
                                    className="w-4 h-4"
                                />
                            </Button>

                            <ButtonDel
                                onClick={handleDelete}
                                className={"min-h-[40px]"}
                            />
                        </div>
                    </div>

                    <hr className="my-8" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-sm font-medium mb-2">Order Number</span>
                            <span className="text-gray-900 font-semibold text-lg">#{order.orderNumber}</span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-gray-500 text-sm font-medium mb-2">Client Name</span>
                            <span className="text-gray-900 font-semibold text-lg">
                                {order.client.firstName} {order.client.lastName}
                            </span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-gray-500 text-sm font-medium mb-2">Created Date</span>
                            <span className="text-gray-900 font-semibold text-lg">
                                {formatDateTime(order.createdAt)}
                            </span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-gray-500 text-sm font-medium mb-2">Current Status</span>
                            <span className="text-gray-900 font-semibold text-lg">
                                {order.status?.title || 'Not Set'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-8 bg-react/500">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Constructions</h2>
                        <Button
                            className={"w-auto mx-0 py-0 h-[40px]"}
                            color={"greenDarkgreen"}
                            // onClick={() => {
                            //     modalCreateOrder.onOpen();
                            // }}
                        >
                            <PlusSvg width={20} height={20} /> Add Construction
                        </Button>
                    </div>

                    {isPendingOrderConstruction ? (
                        <div className="flex justify-center items-center py-8">
                            <Loading />
                        </div>
                    ) : orderConstruction && orderConstruction.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {orderConstruction.map((construction: IConstruction) => (
                                <div
                                    key={construction.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                №{construction.constructionNo}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {construction.profileSystem.title}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold`}>
                                            {construction.constructionStatus.title}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100">
                                        <div>
                                            <span className="text-xs text-gray-500">Width</span>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {construction.width} mm
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500">Height</span>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {construction.height} mm
                                            </p>
                                        </div>
                                    </div>

                                    {construction.hasHandle && (
                                        <div className="mb-4 pb-4 border-b border-gray-100">
                                            <span className="text-xs text-gray-500">Handle</span>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <div>
                                                    <p className="text-xs text-gray-600">Side: {construction.handleSide}</p>
                                                </div>
                                                {construction.handleOffset && (
                                                    <div>
                                                        <p className="text-xs text-gray-600">Offset: {construction.handleOffset} mm</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {construction.glassFill && (
                                        <div className="mb-4 pb-4 border-b border-gray-100">
                                            <span className="text-xs text-gray-500">Glass Fill</span>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {construction.glassFill.type} ({construction.glassFill.thickness} mm)
                                            </p>
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-gray-500">Progress</span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {construction.progress}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${getProgressColor(Number(construction.progress))}`}
                                                style={{ width: `${Math.min(Number(construction.progress), 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            className="flex-1 min-h-[32px] text-sm"
                                            color="greenDarkgreen"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            className="flex-1 min-h-[32px] text-sm"
                                            color="red"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No constructions found</p>
                        </div>
                    )}
                </div>
            </div>

            <OrderCreateModal
                {...modalEditOrder}
                order={order}
                onClose={handleEditClose}
            />
        </MainLayout>
    );
};

export default OrderDetails;