import React, {FC} from "react";
import {useParams, useNavigate} from "react-router";
import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import Button from "@/ui/button/Button";
import {ArrowLeft, Edit3, Trash2} from "lucide-react";
import Loading from "@/ui/loading/Loading";
import useModal from "@/hooks/useModal";
import OrderCreateModal from "@/screens/order/features/order-modals/modal-create-order";
import {useOrderDelMutation} from "@/screens/order/hooks/order/useOrderDelMutation";
import {useOrderDetails} from "@/screens/order/hooks/order/useOrderDetails";

const OrderDetails: FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const modalEditOrder = useModal();

    const orderId = id ? Number(id) : undefined;

    const { data: order, isPending: isPendingOrder, isError, error } = useOrderDetails(orderId as number);
    const { mutateAsync: deleteOrder, isPending: isDeleting } = useOrderDelMutation();

    const handleBack = () => {
        navigate('/order');
    };

    const handleEdit = () => {
        modalEditOrder.onOpen();
    };

    const handleDelete = async () => {
        if (!order?.id) return;

        const confirmed = window.confirm('Are you sure you want to delete this order?');
        if (!confirmed) return;

        try {
            // await deleteOrder(orderId);
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
            <div className="flex flex-col gap-6 items-start w-full">
                <div className="flex gap-4 justify-between">
                    <Button
                        onClick={handleBack}
                        className="w-fit"
                        color="gray"
                    >
                        <ArrowLeft size={20} /> Back to Orders
                    </Button>

                    <div className="flex gap-3">
                        <Button
                            onClick={handleEdit}
                            color="greenDarkgreen"
                            className="flex items-center"
                        >
                            <Edit3 size={18} />
                        </Button>
                        <Button
                            onClick={handleDelete}
                            color="red"
                            className="flex items-center"
                            disabled={isDeleting}
                        >
                            <Trash2 size={18} />
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{order.name}</h1>
                            <p className="text-gray-600 mt-2">Order #{order.orderNumber}</p>
                        </div>
                        <div className="text-right">
                            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                {order.status?.title || 'No Status'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <div className="flex flex-col">
                            <p className="text-gray-600 text-sm font-semibold mb-1">Order Number</p>
                            <p className="text-gray-900 font-semibold">{order.orderNumber}</p>
                        </div>

                        <div className="flex flex-col">
                            <p className="text-gray-600 text-sm font-semibold mb-1">Client</p>
                            <p className="text-gray-900 font-semibold">
                                {order.client.firstName} {order.client.lastName}
                            </p>
                        </div>

                        <div className="flex flex-col">
                            <p className="text-gray-600 text-sm font-semibold mb-1">Created Date</p>
                            <p className="text-gray-900 font-semibold">
                                {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                            </p>
                        </div>

                        <div className="flex flex-col">
                            <p className="text-gray-600 text-sm font-semibold mb-1">Status</p>
                            <p className="text-gray-900 font-semibold">
                                {order.status?.title || 'Not Set'}
                            </p>
                        </div>
                    </div>

                    <hr className="my-6" />

                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-gray-900">Order Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <p className="text-gray-600 text-sm mb-2">Name</p>
                                <p className="text-gray-900">{order.name}</p>
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
        </MainLayout>
    );
};

export default OrderDetails;