'use client'

import {ModalProps} from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import {cn} from "@/helpers/cn";
import React, {FC, useEffect} from "react";
import Input from "@/ui/input/Input";
import {useForm} from "react-hook-form";
import Button from "@/ui/button/Button";
import Loading from "@/ui/loading/Loading";
import {IGlassFill} from "@/screens/glass-fill/types/IGlassFill";
import {IGlassFillForm} from "@/screens/glass-fill/types/IGlassFillForm";
import {useGlassFillCreateMutation} from "@/screens/glass-fill/hooks/useGlassFillCreateMutation";
import {useGlassFillUpdateMutation} from "@/screens/glass-fill/hooks/useGlassFillUpdateMutation";

type IGlassFillCreateModal = ModalProps & {
    glassFill?: IGlassFill | null;
}

const GlassFillCreateModal: FC<IGlassFillCreateModal> = ({ glassFill, ...props }) => {
    const isEditMode = !!glassFill;

    const { control, handleSubmit, reset, formState: { errors }, setValue } = useForm<IGlassFillForm>({
        defaultValues: {
            type: '',
            thickness: ''
        }
    });

    const { mutateAsync: createGlassFill, isPending: isCreating } = useGlassFillCreateMutation();
    const { mutateAsync: updateGlassFill, isPending: isUpdating } = useGlassFillUpdateMutation();

    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (glassFill && props.open) {
            setValue('type', glassFill.type || '');
            setValue('thickness', glassFill.thickness || '');
        } else if (!glassFill && props.open) {
            reset();
        }
    }, [glassFill, props.open, setValue, reset]);

    useEffect(() => {
        if (!props.open) {
            reset();
        }
    }, [props.open, reset]);

    const onSubmit = async (data: IGlassFillForm) => {
        try {
            if (isEditMode && glassFill) {
                const updateData = {
                    id: glassFill.id,
                    type: data.type,
                    thickness: data.thickness,
                };
                await updateGlassFill(updateData);
            } else {
                const createData = {
                    type: data.type,
                    thickness: data.thickness,
                };
                await createGlassFill(createData);
            }

            reset();
            props.onClose();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} glass fill:`, error);
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
                {isEditMode ? 'Edit Glass Fill' : 'Create Glass Fill'}
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4 rounded-xl p-3'}>
                <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-4'}>
                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Type *</p>
                        <Input
                            control={control}
                            name={'type'}
                            placeholder={'Enter type'}
                            classNameContainer={'w-full'}
                            rules={{
                                required: 'Type is required'
                            }}
                        />
                        {errors.type && (
                            <p className={'text-red-500 text-sm'}>{errors.type.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Thickness </p>
                        <Input
                            control={control}
                            name={'thickness'}
                            placeholder={'Enter thickness (optional)'}
                            classNameContainer={'w-full'}
                            type={'number'}
                        />
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
                            {isEditMode ? 'Update Glass Fill' : 'Create Glass Fill'}
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

export default GlassFillCreateModal;