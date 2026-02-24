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
import {useClient} from "@/screens/client/hooks/useClient";
import {useNavigate} from "react-router";

type IOrderCreateModal = ModalProps & {
    order?: IOrder | null;
}

const OrderCreateModal: FC<IOrderCreateModal> = ({ order, ...props }) => {
    const navigate = useNavigate();
    const isEditMode = !!order;

    const { data: dataOrderStatus, isPending: isPendingOrderStatus } = useOrderStatus();
    const { data: dataClients, isPending: isPendingClients } = useClient();

    const { control, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<IOrderForm>({
        defaultValues: {
            name: '',
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
        if (!props.open) {
            reset();
            return;
        }

        if (isEditMode && order) {
            setValue('name', order.name || '');
            setValue('clientId', order.client?.id || '');
            setValue('statusId', order.status?.id || '');
        } else {
            reset();
        }
    }, [props.open, isEditMode, order, setValue, reset]);

    const onSubmit = async (data: IOrderForm) => {
        try {
            if (isEditMode && order) {
                const updateData = {
                    id: order.id,
                    name: data.name,
                    clientId: data.clientId,
                    statusId: data.statusId || undefined
                };
                await updateOrder(updateData);

                reset();
                props.onClose();
            } else {
                const createData = {
                    name: data.name,
                    clientId: data.clientId,
                    statusId: data.statusId || undefined
                };

                const response = await createOrder(createData);

                reset();
                props.onClose();

                console.log(response?.data)

                if (response?.data.data.id) {
                    console.log(response?.data.data.id)
                    navigate(`/order/${response?.data.data.id}`);
                } else {
                    navigate('/order');
                }
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} order:`, error);
        }
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