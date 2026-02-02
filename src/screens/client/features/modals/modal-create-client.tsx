'use client'

import {ModalProps} from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import {cn} from "@/helpers/cn";
import React, {FC, useEffect} from "react";
import Input from "@/ui/input/Input";
import {useForm} from "react-hook-form";
import Button from "@/ui/button/Button";
import Loading from "@/ui/loading/Loading";
import {IClient} from "@/screens/client/types/IClient";
import {IClientForm} from "@/screens/client/types/IClientForm";
import {useClientCreateMutation} from "@/screens/client/hooks/useClientCreateMutation";
import {useClientUpdateMutation} from "@/screens/client/hooks/useClientUpdateMutation";

type IClientCreateModal = ModalProps & {
    client?: IClient | null;
}

const ClientCreateModal: FC<IClientCreateModal> = ({ client, ...props }) => {
    const isEditMode = !!client;

    const { control, handleSubmit, reset, formState: { errors }, setValue } = useForm<IClientForm>({
        defaultValues: {
            firstName: '',
            lastName: '',
            middleName: '',
            email: '',
            phone: '',
        }
    });

    const { mutateAsync: createClient, isPending: isCreating } = useClientCreateMutation();
    const { mutateAsync: updateClient, isPending: isUpdating } = useClientUpdateMutation();

    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (client && props.open) {
            setValue('firstName', client.firstName || '');
            setValue('lastName', client.lastName || '');
            setValue('middleName', client.middleName || '');
            setValue('email', client.email || '');
            setValue('phone', client.phone || '');
        } else if (!client && props.open) {
            reset();
        }
    }, [client, props.open, setValue, reset]);

    useEffect(() => {
        if (!props.open) {
            reset();
        }
    }, [props.open, reset]);

    const onSubmit = async (data: IClientForm) => {
        try {
            if (isEditMode && client) {
                const updateData = {
                    id: client.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    middleName: data.middleName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                };
                await updateClient(updateData);
            } else {
                const createData = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    middleName: data.middleName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                };
                await createClient(createData);
            }

            reset();
            props.onClose();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} client:`, error);
        }
    };

    return (
        <Modal
            {...props}
            className={cn(
                'flex flex-col gap-2.5 max-w-[500px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
            )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                {isEditMode ? 'Edit Client' : 'Create Client'}
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4 rounded-xl p-3'}>
                <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-4'}>
                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">First Name *</p>
                        <Input
                            control={control}
                            name={'firstName'}
                            placeholder={'Enter first name'}
                            classNameContainer={'w-full'}
                            rules={{
                                required: 'First name is required'
                            }}
                        />
                        {errors.firstName && (
                            <p className={'text-red-500 text-sm'}>{errors.firstName.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Last Name *</p>
                        <Input
                            control={control}
                            name={'lastName'}
                            placeholder={'Enter last name'}
                            classNameContainer={'w-full'}
                            rules={{
                                required: 'Last name is required'
                            }}
                        />
                        {errors.lastName && (
                            <p className={'text-red-500 text-sm'}>{errors.lastName.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Middle Name (optional)</p>
                        <Input
                            control={control}
                            name={'middleName'}
                            placeholder={'Enter middle name'}
                            classNameContainer={'w-full'}
                        />
                        {errors.middleName && (
                            <p className={'text-red-500 text-sm'}>{errors.middleName.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Email (optional)</p>
                        <Input
                            control={control}
                            name={'email'}
                            type={'email'}
                            placeholder={'Enter email'}
                            classNameContainer={'w-full'}
                            rules={{
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            }}
                        />
                        {errors.email && (
                            <p className={'text-red-500 text-sm'}>{errors.email.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Phone (optional)</p>
                        <Input
                            control={control}
                            name={'phone'}
                            type={'tel'}
                            placeholder={'Enter phone number'}
                            classNameContainer={'w-full'}
                        />
                        {errors.phone && (
                            <p className={'text-red-500 text-sm'}>{errors.phone.message}</p>
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
                            {isEditMode ? 'Update User' : 'Create User'}
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

export default ClientCreateModal;