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
import {IUserRoles} from "@/screens/users/types/user-roles/IUserRoles";
import {useUserRolesCreateMutation} from "@/screens/users/hooks/role/useUserRoleCreateMutation";
import {useUserRoleUpdateMutation} from "@/screens/users/hooks/role/useUserRoleUpdateMutation";

type IModalCreateUserRoles = ModalProps & {
    role?: IUserRoles | null;
}

const UserRolesCreateModal: FC<IModalCreateUserRoles> = ({role, ...props}) => {
    const isEditMode = !!role;

    const {control, handleSubmit, reset, formState: {errors}, setValue} = useForm<IUserForm>({
        defaultValues: {
            name: ''
        }
    });

    const {mutateAsync: createUser, isPending: isCreating} = useUserRolesCreateMutation();
    const {mutateAsync: updateUser, isPending: isUpdating} = useUserRoleUpdateMutation();

    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (role && props.open) {
            setValue('name', role.name);
        } else if (!role && props.open) {
            reset();
        }
    }, [role, props.open, setValue, reset]);

    useEffect(() => {
        if (!props.open) {
            reset();
        }
    }, [props.open, reset]);

    const onSubmit = async (data: IUserForm) => {
        try {
            if (isEditMode && role) {
                const updateData = {
                    id: role.id,
                    name: data.name,
                };
                await updateUser(updateData);
            } else {
                const createData = { ...data };
                await createUser(createData);
            }

            reset();
            props.onClose();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} user role:`, error);
        }
    };

    return (
        <Modal {...props} className={cn(
            'flex flex-col gap-2.5 max-w-[500px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
        )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                {isEditMode ? 'Edit User Role' : 'Create User Role'}
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4 rounded-xl p-3'}>
                <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-4'}>
                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Name</p>
                        <Input
                            control={control}
                            name={'name'}
                            placeholder={'Enter name'}
                            classNameContainer={'w-full'}
                            rules={{
                                required: 'Name is required'
                            }}
                        />
                        {errors.name && (
                            <p className={'text-red-500 text-sm'}>{errors.name.message}</p>
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
                            {isEditMode ? 'Update User Role' : 'Create User Role'}
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

export default UserRolesCreateModal;