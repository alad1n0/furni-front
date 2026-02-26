'use client'

import React, {useEffect} from 'react';
import { useForm } from 'react-hook-form';
import Button from "@/ui/button/Button";
import Input from "@/ui/input/Input";
import {ParametersPanelProps} from "@/screens/construction/type/editor/ThreeMesh";
import toast from "react-hot-toast";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import {HandleSideEnum} from "@/screens/construction/type/construction/IConstruction";
import { ChevronDown } from 'lucide-react';
import { cn } from "@/helpers/cn";

interface FrameParameters {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    sawThickness: number;
    hasHandle?: boolean;
    handleSide?: HandleSideEnum;
    handleOffset?: number;
    handlePosition?: number;
    handleHoleSpacingX?: number;
    handleHoleSpacingY?: number;
    drillStartOffsetX?: number;
    drillEndOffsetX?: number;
    drillOffsetY?: number;
    drillSpacingX?: number;
    drillPlaybook?: number;
}

interface ExtendedParametersPanelProps extends ParametersPanelProps {
    handleHoleSpacingX?: number;
    setHandleHoleSpacingX?: (value: number) => void;
    handleHoleSpacingY?: number;
    setHandleHoleSpacingY?: (value: number) => void;
    drillStartOffsetX?: number;
    setDrillStartOffsetX?: (value: number) => void;
    drillEndOffsetX?: number;
    setDrillEndOffsetX?: (value: number) => void;
    drillOffsetY?: number;
    setDrillOffsetY?: (value: number) => void;
    drillSpacingX?: number;
    setDrillSpacingX?: (value: number) => void;
    drillPlaybook?: number;
    setDrillPlaybook?: (value: number) => void;
}

export default function ParametersPanel({frameWidth, setFrameWidth, frameHeight, setFrameHeight, beamThickness, setBeamThickness, sawThickness, setSawThickness, hasHandle, setHasHandle, handleSide, setHandleSide, handleOffset, setHandleOffset, handlePosition, setHandlePosition, handleHoleSpacingX, setHandleHoleSpacingX, handleHoleSpacingY, setHandleHoleSpacingY, drillStartOffsetX, setDrillStartOffsetX, drillEndOffsetX, setDrillEndOffsetX, drillOffsetY, setDrillOffsetY, drillSpacingX, setDrillSpacingX, drillPlaybook, setDrillPlaybook, onUpdate}: ExtendedParametersPanelProps) {
    const [initialValues, setInitialValues] = React.useState({
        frameWidth,
        frameHeight,
        beamThickness,
        sawThickness,
        hasHandle,
        handleSide,
        handleOffset,
        handlePosition,
        handleHoleSpacingX,
        handleHoleSpacingY,
        drillStartOffsetX,
        drillEndOffsetX,
        drillOffsetY,
        drillSpacingX,
        drillPlaybook,
    });

    const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['dimensions']));

    const { control, watch, setValue } = useForm<FrameParameters>({
        defaultValues: {
            frameWidth,
            frameHeight,
            beamThickness,
            sawThickness,
            hasHandle,
            handleSide,
            handleOffset,
            handlePosition,
            handleHoleSpacingX,
            handleHoleSpacingY,
            drillStartOffsetX,
            drillEndOffsetX,
            drillOffsetY,
            drillSpacingX,
            drillPlaybook,
        },
        mode: 'onChange',
    });

    const values = watch();

    const hasChanges = React.useMemo(() => {
        return (
            values.frameWidth !== initialValues.frameWidth ||
            values.frameHeight !== initialValues.frameHeight ||
            values.beamThickness !== initialValues.beamThickness ||
            values.sawThickness !== initialValues.sawThickness ||
            values.hasHandle !== initialValues.hasHandle ||
            values.handleSide !== initialValues.handleSide ||
            values.handleOffset !== initialValues.handleOffset ||
            values.handlePosition !== initialValues.handlePosition ||
            values.handleHoleSpacingX !== initialValues.handleHoleSpacingX ||
            values.handleHoleSpacingY !== initialValues.handleHoleSpacingY ||
            values.drillStartOffsetX !== initialValues.drillStartOffsetX ||
            values.drillEndOffsetX !== initialValues.drillEndOffsetX ||
            values.drillOffsetY !== initialValues.drillOffsetY ||
            values.drillSpacingX !== initialValues.drillSpacingX ||
            values.drillPlaybook !== initialValues.drillPlaybook
        );
    }, [values, initialValues]);

    useEffect(() => {
        setFrameWidth(values.frameWidth);
        setFrameHeight(values.frameHeight);
        setBeamThickness(values.beamThickness);
        setSawThickness(values.sawThickness);
        if (setHasHandle) setHasHandle(values.hasHandle ?? false);
        if (setHandleSide) setHandleSide(values.handleSide);
        if (setHandleOffset) setHandleOffset(values.handleOffset);
        if (setHandlePosition) setHandlePosition(values.handlePosition);
        if (setHandleHoleSpacingX) setHandleHoleSpacingX(values.handleHoleSpacingX ?? 128);
        if (setHandleHoleSpacingY) setHandleHoleSpacingY(values.handleHoleSpacingY ?? 10);
        if (setDrillStartOffsetX) setDrillStartOffsetX(values.drillStartOffsetX ?? 34);
        if (setDrillEndOffsetX) setDrillEndOffsetX(values.drillEndOffsetX ?? 34.15);
        if (setDrillOffsetY) setDrillOffsetY(values.drillOffsetY ?? 11.2);
        if (setDrillSpacingX) setDrillSpacingX(values.drillSpacingX ?? 14);
        if (setDrillPlaybook) setDrillPlaybook(values.drillPlaybook ?? 0.450);
    }, [
        values.frameWidth, setFrameWidth,
        values.frameHeight, setFrameHeight,
        values.beamThickness, setBeamThickness,
        values.sawThickness, setSawThickness,
        values.hasHandle, setHasHandle,
        values.handleSide, setHandleSide,
        values.handleOffset, setHandleOffset,
        values.handlePosition, setHandlePosition,
        values.handleHoleSpacingX, setHandleHoleSpacingX,
        values.handleHoleSpacingY, setHandleHoleSpacingY,
        values.drillStartOffsetX, setDrillStartOffsetX,
        values.drillEndOffsetX, setDrillEndOffsetX,
        values.drillOffsetY, setDrillOffsetY,
        values.drillSpacingX, setDrillSpacingX,
        values.drillPlaybook, setDrillPlaybook,
    ]);

    const handleSideOptions = Object.values(HandleSideEnum).map(side => ({
        label: side,
        value: side
    }));

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const handleUpdate = async () => {
        const errors = [];

        const width = Number(values.frameWidth);
        const height = Number(values.frameHeight);
        const beam = Number(values.beamThickness);
        const saw = Number(values.sawThickness);

        if (!width || isNaN(width)) {
            errors.push('Ширина рамки: введіть значення');
        } else {
            if (width < 100) {
                errors.push('Ширина рамки: мінімум 100 мм');
            }
            if (width > 2000) {
                errors.push('Ширина рамки: максимум 2000 мм');
            }
        }

        if (!height || isNaN(height)) {
            errors.push('Висота рамки: введіть значення');
        } else {
            if (height < 100) {
                errors.push('Висота рамки: мінімум 100 мм');
            }
            if (height > 2000) {
                errors.push('Висота рамки: максимум 2000 мм');
            }
        }

        if (!beam || isNaN(beam)) {
            errors.push('Товщина балки: введіть значення');
        } else {
            if (beam < 5) {
                errors.push('Товщина балки: мінімум 5 мм');
            }
            if (beam > 100) {
                errors.push('Товщина балки: максимум 100 мм');
            }
        }

        if (!saw || isNaN(saw)) {
            errors.push('Товщина пили: введіть значення');
        } else {
            if (saw < 0.1) {
                errors.push('Товщина пили: мінімум 0.1 мм');
            }
            if (saw > 10) {
                errors.push('Товщина пили: максимум 10 мм');
            }

            const sawStr = String(saw);
            const decimalPart = sawStr.split('.')[1];
            if (decimalPart && decimalPart.length > 3) {
                errors.push('Товщина пили: максимум 3 цифри після коми');
            }
        }

        if (values.hasHandle) {
            if (!values.handleSide) {
                errors.push('Сторона ручки: оберіть сторону');
            }

            const offset = Number(values.handleOffset);
            if (offset !== undefined && !isNaN(offset)) {
                if (offset < 0) {
                    errors.push('Ширина ручки: мінімум 0 мм');
                }
                if (offset > 1000) {
                    errors.push('Ширина ручки: максимум 1000 мм');
                }

                const offsetStr = String(offset);
                const decimalPart = offsetStr.split('.')[1];
                if (decimalPart && decimalPart.length > 3) {
                    errors.push('Ширина ручки: максимум 3 цифри після коми');
                }
            }

            const position = Number(values.handlePosition);
            if (position !== undefined && !isNaN(position)) {
                if (position < 0) {
                    errors.push('Позиція ручки: мінімум 0 мм');
                }
                if (position > 2000) {
                    errors.push('Позиція ручки: максимум 2000 мм');
                }

                const positionStr = String(position);
                const decimalPart = positionStr.split('.')[1];
                if (decimalPart && decimalPart.length > 3) {
                    errors.push('Позиція ручки: максимум 3 цифри після коми');
                }
            }

            const holeSpacingX = Number(values.handleHoleSpacingX);
            if (holeSpacingX !== undefined && !isNaN(holeSpacingX)) {
                if (holeSpacingX < 0) {
                    errors.push('Розстояння отворів X: мінімум 0 мм');
                }
                if (holeSpacingX > 1000) {
                    errors.push('Розстояння отворів X: максимум 1000 мм');
                }

                const spacingStr = String(holeSpacingX);
                const decimalPart = spacingStr.split('.')[1];
                if (decimalPart && decimalPart.length > 3) {
                    errors.push('Розстояння отворів X: максимум 3 цифри після коми');
                }
            }

            const holeSpacingY = Number(values.handleHoleSpacingY);
            if (holeSpacingY !== undefined && !isNaN(holeSpacingY)) {
                if (holeSpacingY < 0) {
                    errors.push('Розстояння отворів Y: мінімум 0 мм');
                }
                if (holeSpacingY > 1000) {
                    errors.push('Розстояння отворів Y: максимум 1000 мм');
                }

                const spacingStr = String(holeSpacingY);
                const decimalPart = spacingStr.split('.')[1];
                if (decimalPart && decimalPart.length > 3) {
                    errors.push('Розстояння отворів Y: максимум 3 цифри після коми');
                }
            }
        }

        const drillStartX = Number(values.drillStartOffsetX);
        if (drillStartX !== undefined && !isNaN(drillStartX)) {
            if (drillStartX < 0) {
                errors.push('Начало свердління X: мінімум 0 мм');
            }
            if (drillStartX > 5000) {
                errors.push('Начало свердління X: максимум 5000 мм');
            }

            const startStr = String(drillStartX);
            const decimalPart = startStr.split('.')[1];
            if (decimalPart && decimalPart.length > 3) {
                errors.push('Начало свердління X: максимум 3 цифри після коми');
            }
        }

        const drillEndX = Number(values.drillEndOffsetX);
        if (drillEndX !== undefined && !isNaN(drillEndX)) {
            if (drillEndX < 0) {
                errors.push('Кінець свердління X: мінімум 0 мм');
            }
            if (drillEndX > 5000) {
                errors.push('Кінець свердління X: максимум 5000 мм');
            }

            const endStr = String(drillEndX);
            const decimalPart = endStr.split('.')[1];
            if (decimalPart && decimalPart.length > 3) {
                errors.push('Кінець свердління X: максимум 3 цифри після коми');
            }
        }

        const drillY = Number(values.drillOffsetY);
        if (drillY !== undefined && !isNaN(drillY)) {
            if (drillY < 0) {
                errors.push('Зміщення свердління Y: мінімум 0 мм');
            }
            if (drillY > 5000) {
                errors.push('Зміщення свердління Y: максимум 5000 мм');
            }

            const yStr = String(drillY);
            const decimalPart = yStr.split('.')[1];
            if (decimalPart && decimalPart.length > 3) {
                errors.push('Зміщення свердління Y: максимум 3 цифри після коми');
            }
        }

        const drillSpacing = Number(values.drillSpacingX);
        if (drillSpacing !== undefined && !isNaN(drillSpacing)) {
            if (drillSpacing < 0) {
                errors.push('Розстояння свердління X: мінімум 0 мм');
            }
            if (drillSpacing > 5000) {
                errors.push('Розстояння свердління X: максимум 5000 мм');
            }

            const spacingStr = String(drillSpacing);
            const decimalPart = spacingStr.split('.')[1];
            if (decimalPart && decimalPart.length > 3) {
                errors.push('Розстояння свердління X: максимум 3 цифри після коми');
            }
        }

        const drillPlay = Number(values.drillPlaybook);
        if (drillPlay !== undefined && !isNaN(drillPlay)) {
            if (drillPlay < 0) {
                errors.push('Playbook свердління: мінімум 0 мм');
            }
            if (drillPlay > 100) {
                errors.push('Playbook свердління: максимум 100 мм');
            }

            const playStr = String(drillPlay);
            const decimalPart = playStr.split('.')[1];
            if (decimalPart && decimalPart.length > 3) {
                errors.push('Playbook свердління: максимум 3 цифри після коми');
            }
        }

        console.log('Validation errors:', errors);

        if (errors.length > 0) {
            errors.forEach(error => {
                toast.error(error, {
                    duration: 4000,
                    position: 'top-right',
                });
            });
            return;
        }

        try {
            await onUpdate();
            setInitialValues({
                frameWidth: values.frameWidth,
                frameHeight: values.frameHeight,
                beamThickness: values.beamThickness,
                sawThickness: values.sawThickness,
                hasHandle: values.hasHandle,
                handleSide: values.handleSide,
                handleOffset: values.handleOffset,
                handlePosition: values.handlePosition,
                handleHoleSpacingX: values.handleHoleSpacingX,
                handleHoleSpacingY: values.handleHoleSpacingY,
                drillStartOffsetX: values.drillStartOffsetX,
                drillEndOffsetX: values.drillEndOffsetX,
                drillOffsetY: values.drillOffsetY,
                drillSpacingX: values.drillSpacingX,
                drillPlaybook: values.drillPlaybook,
            });

            toast.success('Зміни успішно застосовані та збережені!', {
                duration: 3000,
                position: 'top-right',
            });
        } catch (error) {
            toast.error('Помилка при збереженні змін', {
                duration: 4000,
                position: 'top-right',
            });
        }
    };

    const validateDecimalPlaces = (value: number) => {
        if (value === undefined || value === null) return true;
        const str = String(value);
        const decimalPart = str.split('.')[1];
        if (decimalPart && decimalPart.length > 3) {
            return 'Максимум 3 цифри після коми';
        }
        return true;
    };

    return (
        <div className="flex flex-col bg-react/400">
            <div className="p-3">
                <h2 className="text-blue-400 z-10 font-bold text-lg mb-2 top-0">
                    Параметри рамки
                </h2>

                {/* ====== РОЗМІРИ РАМКИ ====== */}
                <div className="mb-2">
                    <button
                        onClick={() => toggleSection('dimensions')}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all",
                            expandedSections.has('dimensions')
                                ? "bg-green-400/20 border border-green-400/50 text-green-400"
                                : "bg-gray-700/30 border border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            📐 Розміри рамки
                        </span>
                        <ChevronDown
                            size={18}
                            className={cn(
                                "transition-transform",
                                expandedSections.has('dimensions') ? "rotate-180" : ""
                            )}
                        />
                    </button>

                    {expandedSections.has('dimensions') && (
                        <div className="mt-2 p-3 bg-gray-700/20 rounded-lg border border-gray-600/30 space-y-3">
                            <div>
                                <Input<FrameParameters>
                                    control={control}
                                    name="frameWidth"
                                    type="number"
                                    label="Ширина (мм) (X):"
                                    rules={{
                                        min: { value: 100, message: 'Мінімум 100 мм' },
                                        max: { value: 2000, message: 'Максимум 2000 мм' },
                                        validate: validateDecimalPlaces
                                    }}
                                    placeholder="Введіть ширину"
                                    className="flex-1 z-0"
                                    classNameContainer="mb-0 relative z-0"
                                />
                            </div>

                            <div>
                                <Input<FrameParameters>
                                    control={control}
                                    name="frameHeight"
                                    type="number"
                                    label="Висота (мм) (Y):"
                                    rules={{
                                        min: { value: 100, message: 'Мінімум 100 мм' },
                                        max: { value: 2000, message: 'Максимум 2000 мм' },
                                        validate: validateDecimalPlaces
                                    }}
                                    placeholder="Введіть висоту"
                                    className="flex-1 z-0"
                                    classNameContainer="mb-0 relative z-0"
                                />
                            </div>

                            <div>
                                <Input<FrameParameters>
                                    control={control}
                                    name="beamThickness"
                                    type="number"
                                    label="Товщина балки (мм):"
                                    rules={{
                                        min: { value: 5, message: 'Мінімум 5 мм' },
                                        max: { value: 100, message: 'Максимум 100 мм' },
                                        validate: validateDecimalPlaces
                                    }}
                                    placeholder="Введіть товщину"
                                    className="flex-1 z-0"
                                    classNameContainer="mb-0 relative z-0"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-2">
                    <button
                        onClick={() => toggleSection('cutting')}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all",
                            expandedSections.has('cutting')
                                ? "bg-green-400/20 border border-green-400/50 text-green-400"
                                : "bg-gray-700/30 border border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            🔪 Параметри різання
                        </span>
                        <ChevronDown
                            size={18}
                            className={cn(
                                "transition-transform",
                                expandedSections.has('cutting') ? "rotate-180" : ""
                            )}
                        />
                    </button>

                    {expandedSections.has('cutting') && (
                        <div className="mt-2 p-3 bg-gray-700/20 rounded-lg border border-gray-600/30 space-y-3">
                            <div>
                                <Input<FrameParameters>
                                    control={control}
                                    name="sawThickness"
                                    type="number"
                                    step="0.001"
                                    label="Товщина пили (мм):"
                                    rules={{
                                        min: { value: 0.1, message: 'Мінімум 0.1 мм' },
                                        max: { value: 10, message: 'Максимум 10 мм' },
                                        validate: validateDecimalPlaces
                                    }}
                                    placeholder="Введіть товщину (мм, макс 3 цифри)"
                                    className="flex-1 z-0"
                                    classNameContainer="mb-0 relative z-0"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {hasHandle && (
                    <div className="mb-2">
                        <button
                            onClick={() => toggleSection('handle')}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all",
                                expandedSections.has('handle')
                                    ? "bg-green-400/20 border border-green-400/50 text-green-400"
                                    : "bg-gray-700/30 border border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                🔐 Параметри ручки
                            </span>
                            <ChevronDown
                                size={18}
                                className={cn(
                                    "transition-transform",
                                    expandedSections.has('handle') ? "rotate-180" : ""
                                )}
                            />
                        </button>

                        {expandedSections.has('handle') && (
                            <div className="mt-2 p-3 bg-gray-700/20 rounded-lg border border-gray-600/30 space-y-3">
                                <div>
                                    <p className="text-xs font-semibold pl-4 mb-2">Сторона ручки *</p>
                                    <SelectorSearch
                                        getAndSet={[
                                            values.handleSide || '',
                                            (value) => setValue('handleSide', value as HandleSideEnum)
                                        ]}
                                        options={handleSideOptions}
                                        placeholder={'Оберіть сторону'}
                                        optionValue="value"
                                        optionLabel="label"
                                        isEmptyValueDisable={true}
                                        searchable={true}
                                    />
                                </div>

                                <div className="flex flex-row gap-4">
                                    <div className={'flex-1'}>
                                        <Input<FrameParameters>
                                            control={control}
                                            name="handleOffset"
                                            type="number"
                                            step="0.001"
                                            label="Ширина ручки (мм):"
                                            rules={{
                                                min: { value: 0, message: 'Мінімум 0 мм' },
                                                max: { value: 1000, message: 'Максимум 1000 мм' },
                                                validate: validateDecimalPlaces
                                            }}
                                            placeholder="160"
                                            className="flex-1 z-0"
                                            classNameContainer="mb-0 relative z-0"
                                        />
                                    </div>

                                    <div className={'flex-1'}>
                                        <Input<FrameParameters>
                                            control={control}
                                            name="handlePosition"
                                            type="number"
                                            step="0.001"
                                            label="Позиція ручки (мм):"
                                            rules={{
                                                min: { value: 0, message: 'Мінімум 0 мм' },
                                                max: { value: 2000, message: 'Максимум 2000 мм' },
                                                validate: validateDecimalPlaces
                                            }}
                                            placeholder="0"
                                            className="flex-1 z-0"
                                            classNameContainer="mb-0 relative z-0"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-row gap-4">
                                    <div className={'flex-1'}>
                                        <Input<FrameParameters>
                                            control={control}
                                            name="handleHoleSpacingX"
                                            type="number"
                                            step="0.001"
                                            label="Розстояння отворів X (мм):"
                                            rules={{
                                                min: { value: 0, message: 'Мінімум 0 мм' },
                                                max: { value: 1000, message: 'Максимум 1000 мм' },
                                                validate: validateDecimalPlaces
                                            }}
                                            placeholder="128"
                                            className="flex-1 z-0"
                                            classNameContainer="mb-0 relative z-0"
                                        />
                                    </div>

                                    <div className={'flex-1'}>
                                        <Input<FrameParameters>
                                            control={control}
                                            name="handleHoleSpacingY"
                                            type="number"
                                            step="0.001"
                                            label="Розстояння отворів Y (мм):"
                                            rules={{
                                                min: { value: 0, message: 'Мінімум 0 мм' },
                                                max: { value: 1000, message: 'Максимум 1000 мм' },
                                                validate: validateDecimalPlaces
                                            }}
                                            placeholder="10"
                                            className="flex-1 z-0"
                                            classNameContainer="mb-0 relative z-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mb-2">
                    <button
                        onClick={() => toggleSection('drill')}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all",
                            expandedSections.has('drill')
                                ? "bg-green-400/20 border border-green-400/50 text-green-400"
                                : "bg-gray-700/30 border border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            🔧 Конфігурація свердління
                        </span>
                        <ChevronDown
                            size={18}
                            className={cn(
                                "transition-transform",
                                expandedSections.has('drill') ? "rotate-180" : ""
                            )}
                        />
                    </button>

                    {expandedSections.has('drill') && (
                        <div className="mt-2 p-3 bg-gray-700/20 rounded-lg border border-gray-600/30 space-y-3">
                            <div className="flex flex-row gap-4">
                                <div className={'flex-1'}>
                                    <Input<FrameParameters>
                                        control={control}
                                        name="drillStartOffsetX"
                                        type="number"
                                        step="0.001"
                                        label="Начало свердління X (мм):"
                                        rules={{
                                            min: { value: 0, message: 'Мінімум 0 мм' },
                                            max: { value: 5000, message: 'Максимум 5000 мм' },
                                            validate: validateDecimalPlaces
                                        }}
                                        placeholder="34"
                                        className="flex-1 z-0"
                                        classNameContainer="mb-0 relative z-0"
                                    />
                                </div>

                                <div className={'flex-1'}>
                                    <Input<FrameParameters>
                                        control={control}
                                        name="drillEndOffsetX"
                                        type="number"
                                        step="0.001"
                                        label="Кінець свердління X (мм):"
                                        rules={{
                                            min: { value: 0, message: 'Мінімум 0 мм' },
                                            max: { value: 5000, message: 'Максимум 5000 мм' },
                                            validate: validateDecimalPlaces
                                        }}
                                        placeholder="34.15"
                                        className="flex-1 z-0"
                                        classNameContainer="mb-0 relative z-0"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-row gap-4">
                                <div className={'flex-1'}>
                                    <Input<FrameParameters>
                                        control={control}
                                        name="drillOffsetY"
                                        type="number"
                                        step="0.001"
                                        label="Зміщення свердління Y (мм):"
                                        rules={{
                                            min: { value: 0, message: 'Мінімум 0 мм' },
                                            max: { value: 5000, message: 'Максимум 5000 мм' },
                                            validate: validateDecimalPlaces
                                        }}
                                        placeholder="11.2"
                                        className="flex-1 z-0"
                                        classNameContainer="mb-0 relative z-0"
                                    />
                                </div>

                                <div className={'flex-1'}>
                                    <Input<FrameParameters>
                                        control={control}
                                        name="drillSpacingX"
                                        type="number"
                                        step="0.001"
                                        label="Розстояння свердління X (мм):"
                                        rules={{
                                            min: { value: 0, message: 'Мінімум 0 мм' },
                                            max: { value: 5000, message: 'Максимум 5000 мм' },
                                            validate: validateDecimalPlaces
                                        }}
                                        placeholder="14"
                                        className="flex-1 z-0"
                                        classNameContainer="mb-0 relative z-0"
                                    />
                                </div>
                            </div>

                            <div className={'flex-1'}>
                                <Input<FrameParameters>
                                    control={control}
                                    name="drillPlaybook"
                                    type="number"
                                    step="0.001"
                                    label="Playbook свердління (мм):"
                                    rules={{
                                        min: { value: 0, message: 'Мінімум 0 мм' },
                                        max: { value: 100, message: 'Максимум 100 мм' },
                                        validate: validateDecimalPlaces
                                    }}
                                    placeholder="0.450"
                                    className="flex-1 z-0"
                                    classNameContainer="mb-0 relative z-0"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-none p-3 border-t border-gray-700 bg-react/400 space-y-3">
                {hasChanges && (
                    <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-start gap-2">
                            <div className="flex-1">
                                <p className="text-yellow-500 text-xs font-semibold mb-1">
                                    Є незбережені зміни
                                </p>
                                <p className="text-yellow-400/80 text-[10px]">
                                    Натисніть кнопку нижче, щоб застосувати зміни
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <Button
                    className={"min-h-[38px] text-sm"}
                    color="greenDarkgreen"
                    onClick={handleUpdate}
                    disabled={!hasChanges}
                >
                    {hasChanges ? (
                        'Застосувати зміни та зберегти'
                    ) : (
                        'Всі зміни збережені'
                    )}
                </Button>
            </div>
        </div>
    );
}