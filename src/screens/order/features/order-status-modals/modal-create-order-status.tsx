'use client'

import {ModalProps} from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import {cn} from "@/helpers/cn";
import React, {FC, useEffect} from "react";
import Input from "@/ui/input/Input";
import {useForm} from "react-hook-form";
import Button from "@/ui/button/Button";
import Loading from "@/ui/loading/Loading";
import {IUserForm} from "@/screens/users/types/user/IUserForm";
import {IOrderStatusForm} from "@/screens/order/types/order-status/IOrderStatusForm";
import {useOrderStatusCreateMutation} from "@/screens/order/hooks/order-status/useOrderStatusCreateMutation";
import {useOrderStatusUpdateMutation} from "@/screens/order/hooks/order-status/useOrderStatusUpdateMutation";
import {IOrderStatus} from "@/screens/order/types/order-status/IOrderStataus";

type IModalCreateOrderStatus = ModalProps & {
    orderStatus?: IOrderStatus | null;
}

const OrderStatusCreateModal: FC<IModalCreateOrderStatus> = ({orderStatus, ...props}) => {
    const isEditMode = !!orderStatus;

    const {control, handleSubmit, reset, formState: {errors}, setValue} = useForm<IOrderStatusForm>({
        defaultValues: {
            code: '',
            title: ''
        }
    });

    const {mutateAsync: createOrderStatus, isPending: isCreating} = useOrderStatusCreateMutation();
    const {mutateAsync: updateOrderStatus, isPending: isUpdating} = useOrderStatusUpdateMutation();

    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (orderStatus && props.open) {
            setValue('code', orderStatus.code);
            setValue('title', orderStatus.title);
        } else if (!orderStatus && props.open) {
            reset();
        }
    }, [orderStatus, props.open, setValue, reset]);

    useEffect(() => {
        if (!props.open) {
            reset();
        }
    }, [props.open, reset]);

    const onSubmit = async (data: IOrderStatusForm) => {
        try {
            if (isEditMode && orderStatus) {
                const updateData = {
                    id: orderStatus.id,
                    code: data.code,
                    title: data.title,
                };
                await updateOrderStatus(updateData);
            } else {
                const createData = { ...data };
                await createOrderStatus(createData);
            }

            reset();
            props.onClose();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} order status:`, error);
        }
    };

    return (
        <Modal {...props} className={cn(
            'flex flex-col gap-2.5 max-w-[500px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
        )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                {isEditMode ? 'Edit Order Status' : 'Create Order Status'}
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4 rounded-xl p-3'}>
                <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-4'}>
                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Code</p>
                        <Input
                            control={control}
                            name={'code'}
                            placeholder={'Enter code'}
                            classNameContainer={'w-full'}
                            rules={{
                                required: 'Code is required'
                            }}
                        />
                        {errors.code && (
                            <p className={'text-red-500 text-sm'}>{errors.code.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Title</p>
                        <Input
                            control={control}
                            name={'title'}
                            placeholder={'Enter title'}
                            classNameContainer={'w-full'}
                            rules={{
                                required: 'Title is required'
                            }}
                        />
                        {errors.title && (
                            <p className={'text-red-500 text-sm'}>{errors.title.message}</p>
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
                            {isEditMode ? 'Update Order Status' : 'Create Order Status'}
                        </Button>
                    </div>
                </form>

                {isPending && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Loading/>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default OrderStatusCreateModal;