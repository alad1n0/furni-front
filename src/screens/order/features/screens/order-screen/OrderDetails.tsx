import React, { FC } from "react";
import { useParams, useNavigate } from "react-router";
import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import Button from "@/ui/button/Button";
import { ArrowLeft, Edit3, Trash2 } from "lucide-react";
import Loading from "@/ui/loading/Loading";
import useModal from "@/hooks/useModal";
import OrderCreateModal from "@/screens/order/features/order-modals/modal-create-order";
import { useOrderDelMutation } from "@/screens/order/hooks/order/useOrderDelMutation";
import { useOrderDetails } from "@/screens/order/hooks/order/useOrderDetails";
import { formatDateTime } from "@/utils/time/formatDateTime";
import ButtonDel from "@/ui/button/ButtonDel";
import {EditSvg} from "@/assets";

const OrderDetails: FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const modalEditOrder = useModal();

    const orderId = Number(id);

    const { data: order, isPending: isPendingOrder, isError, error } = useOrderDetails(orderId as number);
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

            <div className="flex flex-col gap-6 w-full">
                <div className="bg-white rounded-lg shadow p-8 bg-react/500">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Order #{order.orderNumber}</h1>
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