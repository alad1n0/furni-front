'use client'

import {ModalProps} from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import {cn} from "@/helpers/cn";
import React, {FC, useEffect, useState} from "react";
import Input from "@/ui/input/Input";
import {useForm} from "react-hook-form";
import Button from "@/ui/button/Button";
import Loading from "@/ui/loading/Loading";
import {useUserCreateMutation} from "@/screens/users/hooks/user/useUserCreateMutation";
import {useUserUpdateMutation} from "@/screens/users/hooks/user/useUserUpdateMutation";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import {IUserForm} from "@/screens/users/types/user/IUserForm";
import {IUser} from "@/screens/users/types/user/IUser";
import {generatePassword} from "@/helpers/user-password/generatePassword";
import EyeSvg from "@/assets/eye-svg";
import EyeOffSvg from "@/assets/eye-off-svg";
import {useUserRoles} from "@/screens/users/hooks/role/useUserRoles";

type IModalCreateUser = ModalProps & {
    user?: IUser | null;
}

const UserCreateModal: FC<IModalCreateUser> = ({user, ...props}) => {
    const isEditMode = !!user;

    const {control, handleSubmit, reset, formState: {errors}, setValue} = useForm<IUserForm>({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            role_id: undefined,
        }
    });

    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<number | null>(null);

    const {mutateAsync: createUser, isPending: isCreating} = useUserCreateMutation();
    const {mutateAsync: updateUser, isPending: isUpdating} = useUserUpdateMutation();
    const {data: rolesData, isPending: isLoadingRoles} = useUserRoles();

    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (user && props.open) {
            setValue('name', user.name);
            setValue('email', user.email);
            setValue('role_id', user.role_id);
            setSelectedRole(user.role_id);
        } else if (!user && props.open) {
            reset();
            setSelectedRole(null);
        }
    }, [user, props.open, setValue, reset]);

    useEffect(() => {
        if (!props.open) {
            reset();
            setSelectedRole(null);
        }
    }, [props.open, reset]);

    useEffect(() => {
        if (selectedRole) {
            setValue('role_id', selectedRole);
        }
    }, [selectedRole, setValue, rolesData]);

    const onSubmit = async (data: IUserForm) => {
        try {
            if (!selectedRole) {
                return;
            }

            if (isEditMode && user) {
                const updateData = {
                    id: user.id,
                    name: data.name,
                    email: data.email,
                    role_id: selectedRole,
                    ...(data.password && { password: data.password }),
                };
                await updateUser(updateData);
            } else {
                const createData = {
                    ...data,
                    role_id: selectedRole,
                };
                await createUser(createData);
            }

            reset();
            setSelectedRole(null);
            props.onClose();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} user:`, error);
        }
    };

    const isSubmitDisabled = isPending || isLoadingRoles;

    return (
        <Modal {...props} className={cn(
            'flex flex-col gap-2.5 max-w-[500px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
        )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                {isEditMode ? 'Редагувати користувача' : 'Створити користувача'}
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4 rounded-xl p-3'}>
                <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-4'}>
                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Ім'я</p>
                        <Input
                            control={control}
                            name={'name'}
                            placeholder={"Введіть ім'я"}
                            classNameContainer={'w-full'}
                            rules={{
                                required: "Ім'я обов'язкове"
                            }}
                        />
                        {errors.name && (
                            <p className={'text-red-500 text-sm'}>{errors.name.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Пошта</p>
                        <Input
                            control={control}
                            name={'email'}
                            type={'email'}
                            placeholder={'Введіть пошту'}
                            classNameContainer={'w-full'}
                            rules={{
                                required: 'Пошта обов\'язкова',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Невірна адреса пошти'
                                }
                            }}
                        />
                        {errors.email && (
                            <p className={'text-red-500 text-sm'}>{errors.email.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">
                            Пароль {isEditMode && '(залиште порожнім, щоб не змінювати)'}
                        </p>
                        <div className="flex flex-col gap-2">
                            <Input
                                control={control}
                                name={'password'}
                                type={showPassword ? 'text' : 'password'}
                                placeholder={isEditMode ? 'Введіть новий пароль (необов\'язково)' : 'Введіть пароль (мін. 6 символів)'}
                                classNameContainer={'w-full'}
                                rules={{
                                    required: isEditMode ? false : 'Пароль обов\'язковий',
                                    minLength: {
                                        value: 6,
                                        message: 'Пароль має містити щонайменше 6 символів',
                                    },
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute right-3 top-[45%] transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-800"
                                tabIndex={0}
                            >
                                {showPassword ? <EyeOffSvg className={'w-[18px] h-[18px]'} /> : <EyeSvg className={'w-[18px] h-[18px]'} />}
                            </button>
                            <p
                                onClick={() => {
                                    const newPassword = generatePassword();
                                    setValue('password', newPassword);
                                    setShowPassword(true);
                                }}
                                className={'cursor-pointer text-sm text-right'}
                            >
                                Згенерувати {isEditMode && 'новий'} пароль?
                            </p>
                        </div>
                        {errors.password && (
                            <p className={'text-red-500 text-sm'}>{errors.password.message}</p>
                        )}
                    </div>

                    <div className={'w-full'}>
                        <SelectorSearch<{id: number, name: string}>
                            options={rolesData || []}
                            optionValue={'id'}
                            optionLabel={'name'}
                            placeholder={'Оберіть роль'}
                            getAndSet={[selectedRole as never, setSelectedRole as (limit: never) => void]}
                            label={'Роль'}
                            searchable={false}
                            className={'w-full'}
                        />
                        {errors.role_id && (
                            <p className={'text-red-500 text-sm mt-1'}>{errors.role_id.message}</p>
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
                            Скасувати
                        </Button>
                        <Button
                            type="submit"
                            color="greenDarkgreen"
                            className="flex-1"
                            disabled={isSubmitDisabled}
                        >
                            {isEditMode ? 'Оновити користувача' : 'Створити користувача'}
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

export default UserCreateModal;