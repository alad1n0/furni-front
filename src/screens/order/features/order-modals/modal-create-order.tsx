'use client'

import {ModalProps} from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import {cn} from "@/helpers/cn";
import React, {FC, useEffect} from "react";
import Input from "@/ui/input/Input";
import {useForm} from "react-hook-form";
import Button from "@/ui/button/Button";
import Loading from "@/ui/loading/Loading";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import {IOrder} from "@/screens/order/types/order/IOrder";
import {IOrderForm} from "@/screens/order/types/order/IOrderForm";
import {useOrderCreateMutation} from "@/screens/order/hooks/order/useOrderCreateMutation";
import {useOrderUpdateMutation} from "@/screens/order/hooks/order/useOrderUpdateMutation";
import {useOrderStatus} from "@/screens/order/hooks/order-status/useOrderStatus";
import {RefreshCw} from "lucide-react";
import {generateOrderNumber} from "@/helpers/order-number/order-number";
import {useClient} from "@/screens/client/hooks/useClient";

type IOrderCreateModal = ModalProps & {
    order?: IOrder | null;
}

const OrderCreateModal: FC<IOrderCreateModal> = ({ order, ...props }) => {
    const isEditMode = !!order;

    const { data: dataOrderStatus, isPending: isPendingOrderStatus } = useOrderStatus();
    const { data: dataClients, isPending: isPendingClients } = useClient();

    console.log(dataClients)

    const { control, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<IOrderForm>({
        defaultValues: {
            name: '',
            orderNumber: '',
            clientId: '',
            statusId: ''
        }
    });

    const { mutateAsync: createOrder, isPending: isCreating } = useOrderCreateMutation();
    const { mutateAsync: updateOrder, isPending: isUpdating } = useOrderUpdateMutation();

    const isPending = isCreating || isUpdating || isPendingOrderStatus || isPendingClients;

    const formattedOrderStatusOptions = dataOrderStatus?.map(status => ({
        label: status.title,
        value: status.id
    })) || [];

    const formattedUsersOptions = dataClients?.map(client => ({
        label: `${client.firstName} ${client.lastName}`,
        value: client.id
    })) || [];

    useEffect(() => {
        if (order && props.open) {
            setValue('name', order.name || '');
            setValue('orderNumber', order.orderNumber || '');
            setValue('clientId', order.client?.id || '');
            setValue('statusId', order.status?.id || '');
        } else if (!order && props.open) {
            reset();
        }
    }, [order, props.open, setValue, reset]);

    useEffect(() => {
        if (!props.open) {
            reset();
        }
    }, [props.open, reset]);

    const onSubmit = async (data: IOrderForm) => {
        try {
            if (isEditMode && order) {
                const updateData = {
                    id: order.id,
                    name: data.name,
                    orderNumber: data.orderNumber,
                    clientId: data.clientId,
                    statusId: data.statusId || undefined
                };
                await updateOrder(updateData);
            } else {
                const createData = {
                    name: data.name,
                    orderNumber: data.orderNumber,
                    clientId: data.clientId,
                    statusId: data.statusId || undefined
                };
                await createOrder(createData);
            }

            reset();
            props.onClose();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} order:`, error);
        }
    };

    const handleRegenerateOrderNumber = () => {
        const generatedNumber = generateOrderNumber();
        setValue('orderNumber', generatedNumber);
    };

    const clientIdValue = watch('clientId');
    const statusIdValue = watch('statusId');

    return (
        <Modal
            {...props}
            className={cn(
                'flex flex-col gap-2.5 max-w-[500px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
            )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                {isEditMode ? 'Edit Order' : 'Create Order'}
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4 rounded-xl p-3'}>
                <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-4'}>
                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Order Number *</p>
                        <div className={'flex gap-2'}>
                            <div className={'flex-1'}>
                                <Input
                                    control={control}
                                    name={'orderNumber'}
                                    placeholder={'Enter order number'}
                                    rules={{
                                        required: 'Order number is required'
                                    }}
                                />
                                {errors.orderNumber && (
                                    <p className={'text-red-500 text-sm'}>{errors.orderNumber.message}</p>
                                )}
                            </div>
                            {!isEditMode && (
                                <Button
                                    type="button"
                                    onClick={handleRegenerateOrderNumber}
                                    className={'h-[40px] w-[40px] px-3 py-0 min-w-fit'}
                                    color="gray"
                                    title="Regenerate order number"
                                >
                                    <RefreshCw size={16} />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Name (optional)</p>
                        <Input
                            control={control}
                            name={'name'}
                            placeholder={'Enter order name (optional)'}
                            classNameContainer={'w-full'}
                        />
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Client *</p>
                        {!isPendingClients ? (
                            <>
                                <SelectorSearch
                                    getAndSet={[
                                        clientIdValue || '',
                                        (value) => setValue('clientId', value as string)
                                    ]}
                                    options={formattedUsersOptions}
                                    placeholder={'Select client'}
                                    optionValue="value"
                                    optionLabel="label"
                                    isEmptyValueDisable={true}
                                    searchable={true}
                                />
                                {errors.clientId && (
                                    <p className={'text-red-500 text-sm'}>Client is required</p>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm">Loading clients...</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Status (Optional)</p>
                        {!isPendingOrderStatus ? (
                            <SelectorSearch
                                getAndSet={[
                                    statusIdValue || '',
                                    (value) => setValue('statusId', value as string)
                                ]}
                                options={formattedOrderStatusOptions}
                                placeholder={'Select status'}
                                optionValue="value"
                                optionLabel="label"
                                isEmptyValueDisable={false}
                                searchable={true}
                            />
                        ) : (
                            <p className="text-gray-400 text-sm">Loading statuses...</p>
                        )}
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button
                            type="button"
                            onClick={props.onClose}
                            color="red"
                            className="flex-1"
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            color="greenDarkgreen"
                            className="flex-1"
                            disabled={isPending}
                        >
                            {isEditMode ? 'Update Order' : 'Create Order'}
                        </Button>
                    </div>
                </form>

                {isPending && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Loading />
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default OrderCreateModal;