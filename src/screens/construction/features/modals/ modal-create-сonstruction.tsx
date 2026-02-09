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
// import {useConstructionCreateMutation} from "@/screens/construction/hooks/construction/useConstructionCreateMutation";
// import {useConstructionUpdateMutation} from "@/screens/construction/hooks/construction/useConstructionUpdateMutation";
import {useConstructionStatus} from "@/screens/construction/hooks/construction-status/useConstructionStatus";
import {HandleSideEnum} from "@/screens/construction/type/construction/IConstruction";
import {IConstructionForm} from "@/screens/construction/type/construction/IConstructionForm";
import {useGlassFill} from "@/screens/glass-fill/hooks/useGlassFill";
import {useProfileSystem} from "@/screens/profile-system/hooks/useProfileSystem";
import {useNavigate} from "react-router";

interface IConstruction extends IConstructionForm {
    id: number;
}

type IConstructionCreateModal = ModalProps & {
    construction?: IConstruction | null;
    orderId: number;
}

const ConstructionCreateModal: FC<IConstructionCreateModal> = ({ construction, orderId, ...props }) => {
    const navigate = useNavigate();
    const isEditMode = !!construction;

    const { data: dataConstructionStatus, isPending: isPendingConstructionStatus } = useConstructionStatus();
    const { data: dataProfileSystem, isPending: isPendingProfileSystem } = useProfileSystem();
    const { data: dataGlassFill, isPending: isPendingGlassFill } = useGlassFill();

    const { control, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<IConstructionForm>({
        defaultValues: {
            orderId: orderId,
            constructionNo: '',
            profileSystemId: 0,
            constructionStatusId: 0,
            width: 0,
            height: 0,
            glassFillId: undefined,
            hasHandle: false,
            handleSide: undefined,
            handleOffset: 0,
            handlePosition: 0
        }
    });

    // const { mutateAsync: createConstruction, isPending: isCreating } = useConstructionCreateMutation();
    // const { mutateAsync: updateConstruction, isPending: isUpdating } = useConstructionUpdateMutation();

    // const isPending = isCreating || isUpdating || isPendingConstructionStatus || isPendingProfileSystem || isPendingGlassFill;

    const isPending = isPendingConstructionStatus || isPendingProfileSystem || isPendingGlassFill;

    const formattedConstructionStatusOptions = dataConstructionStatus?.map(status => ({
        label: status.title,
        value: status.id
    })) || [];

    const formattedProfileSystemOptions = dataProfileSystem?.map(system => ({
        label: system.title,
        value: system.id
    })) || [];

    const formattedGlassFillOptions = dataGlassFill?.map(fill => ({
        label: fill.type,
        value: fill.id
    })) || [];

    const handleSideOptions = Object.values(HandleSideEnum).map(side => ({
        label: side,
        value: side
    }));

    useEffect(() => {
        if (construction && props.open) {
            setValue('constructionNo', construction.constructionNo || '');
            setValue('profileSystemId', construction.profileSystemId || 0);
            setValue('constructionStatusId', construction.constructionStatusId || 0);
            setValue('width', construction.width || 0);
            setValue('height', construction.height || 0);
            setValue('glassFillId', construction.glassFillId);
            setValue('hasHandle', construction.hasHandle || false);
            setValue('handleSide', construction.handleSide);
            setValue('handleOffset', construction.handleOffset || 0);
            setValue('handlePosition', construction.handlePosition || 0);
        } else if (!construction && props.open) {
            reset();
            setValue('orderId', orderId);
        }
    }, [construction, props.open, setValue, reset, orderId]);

    useEffect(() => {
        if (!props.open) {
            reset();
        }
    }, [props.open, reset]);

    const onSubmit = async (data: IConstructionForm) => {
        try {
            if (isEditMode && construction) {
                const updateData = {
                    id: construction.id,
                    ...data
                };
                // await updateConstruction(updateData);
                reset();
                props.onClose();
            } else {
                const createData = {
                    ...data,
                    orderId: orderId
                };
                // await createConstruction(createData);
                reset();
                props.onClose();

                const constructionId = 2;
                const editorUrl = `/construction-editor?id=${constructionId}&orderId=${orderId}`;

                navigate(editorUrl);

                // if (response?.data?.data?.id) {
                //     const constructionId = response.data.data.id;
                //     const editorUrl = `/construction-editor?id=${constructionId}&orderId=${orderId}`;
                //
                //     // Варіант 1: Новий tab
                //     window.open(editorUrl, '_blank');
                //
                //     // Варіант 2: Той же tab (розкомментуйте якщо потрібно)
                //     // navigate(editorUrl);
                // }
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} construction:`, error);
        }
    };

    const profileSystemIdValue = watch('profileSystemId');
    const constructionStatusIdValue = watch('constructionStatusId');
    const glassFillIdValue = watch('glassFillId');
    const handleSideValue = watch('handleSide');
    const hasHandleValue = watch('hasHandle');

    return (
        <Modal
            {...props}
            className={cn(
                'flex flex-col gap-2.5 max-w-[500px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
            )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                {isEditMode ? 'Edit Construction' : 'Add Construction'}
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4 rounded-xl p-3'}>
                <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-4'}>
                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Construction Number *</p>
                        <Input
                            control={control}
                            name={'constructionNo'}
                            placeholder={'Enter construction number'}
                            rules={{
                                required: 'Construction number is required'
                            }}
                        />
                        {errors.constructionNo && (
                            <p className={'text-red-500 text-sm'}>{errors.constructionNo.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Profile System *</p>
                        {!isPendingProfileSystem ? (
                            <>
                                <SelectorSearch
                                    getAndSet={[
                                        profileSystemIdValue?.toString() || '',
                                        (value) => setValue('profileSystemId', parseInt(value as string) || 0)
                                    ]}
                                    options={formattedProfileSystemOptions}
                                    placeholder={'Select profile system'}
                                    optionValue="value"
                                    optionLabel="label"
                                    isEmptyValueDisable={true}
                                    searchable={true}
                                />
                                {errors.profileSystemId && (
                                    <p className={'text-red-500 text-sm'}>Profile system is required</p>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm">Loading profile systems...</p>
                        )}
                    </div>

                    <div className={'flex gap-4'}>
                        <div className={'relative flex flex-col gap-[5px] h-fit flex-1'}>
                            <p className="text-xs font-semibold pl-4">Width (mm) *</p>
                            <Input
                                control={control}
                                name={'width'}
                                type={'number'}
                                placeholder={'0'}
                                rules={{
                                    required: 'Width is required',
                                    min: { value: 0, message: 'Width must be positive' }
                                }}
                            />
                            {errors.width && (
                                <p className={'text-red-500 text-sm'}>{errors.width.message}</p>
                            )}
                        </div>

                        <div className={'relative flex flex-col gap-[5px] h-fit flex-1'}>
                            <p className="text-xs font-semibold pl-4">Height (mm) *</p>
                            <Input
                                control={control}
                                name={'height'}
                                type={'number'}
                                placeholder={'0'}
                                rules={{
                                    required: 'Height is required',
                                    min: { value: 0, message: 'Height must be positive' }
                                }}
                            />
                            {errors.height && (
                                <p className={'text-red-500 text-sm'}>{errors.height.message}</p>
                            )}
                        </div>
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Glass Fill (Optional)</p>
                        {!isPendingGlassFill ? (
                            <SelectorSearch
                                getAndSet={[
                                    glassFillIdValue?.toString() || '',
                                    (value) => setValue('glassFillId', value ? parseInt(value as string) : undefined)
                                ]}
                                options={formattedGlassFillOptions}
                                placeholder={'Select glass fill'}
                                optionValue="value"
                                optionLabel="label"
                                isEmptyValueDisable={false}
                                searchable={true}
                            />
                        ) : (
                            <p className="text-gray-400 text-sm">Loading glass fills...</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Construction Status *</p>
                        {!isPendingConstructionStatus ? (
                            <>
                                <SelectorSearch
                                    getAndSet={[
                                        constructionStatusIdValue?.toString() || '',
                                        (value) => setValue('constructionStatusId', parseInt(value as string) || 0)
                                    ]}
                                    options={formattedConstructionStatusOptions}
                                    placeholder={'Select status'}
                                    optionValue="value"
                                    optionLabel="label"
                                    isEmptyValueDisable={true}
                                    searchable={true}
                                />
                                {errors.constructionStatusId && (
                                    <p className={'text-red-500 text-sm'}>Construction status is required</p>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm">Loading statuses...</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit border-t pt-4'}>
                        <div className={'flex items-center gap-2'}>
                            <input
                                type="checkbox"
                                id="hasHandle"
                                {...control.register('hasHandle')}
                                className={'cursor-pointer'}
                            />
                            <label htmlFor="hasHandle" className="text-xs font-semibold cursor-pointer">
                                Add Handle
                            </label>
                        </div>

                        {hasHandleValue && (
                            <>
                                {/* Handle Side */}
                                <div className={'mt-4'}>
                                    <p className="text-xs font-semibold pl-4 mb-2">Handle Side *</p>
                                    <SelectorSearch
                                        getAndSet={[
                                            handleSideValue || '',
                                            (value) => setValue('handleSide', value as HandleSideEnum)
                                        ]}
                                        options={handleSideOptions}
                                        placeholder={'Select handle side'}
                                        optionValue="value"
                                        optionLabel="label"
                                        isEmptyValueDisable={true}
                                        searchable={true}
                                    />
                                </div>

                                {/* Handle Offset */}
                                <div className={'mt-4'}>
                                    <p className="text-xs font-semibold pl-4">Handle Offset (mm)</p>
                                    <Input
                                        control={control}
                                        name={'handleOffset'}
                                        type={'number'}
                                        placeholder={'0'}
                                    />
                                </div>

                                {/* Handle Position */}
                                <div className={'mt-4'}>
                                    <p className="text-xs font-semibold pl-4">Handle Position (mm)</p>
                                    <Input
                                        control={control}
                                        name={'handlePosition'}
                                        type={'number'}
                                        placeholder={'0'}
                                    />
                                </div>
                            </>
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
                            {isEditMode ? 'Update Construction' : 'Add Construction'}
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

export default ConstructionCreateModal;