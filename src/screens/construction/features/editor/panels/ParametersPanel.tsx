'use client'

import React, {useEffect, useMemo} from 'react';
import { useForm } from 'react-hook-form';
import Button from "@/ui/button/Button";
import Input from "@/ui/input/Input";
import {ParametersPanelProps} from "@/screens/construction/type/editor/ThreeMesh";
import toast from "react-hot-toast";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import { HandleSideEnum, IProfileSystem, OperationType } from "@/screens/construction/type/construction/IConstruction";
import { ChevronDown } from 'lucide-react';
import { cn } from "@/helpers/cn";

interface EdgeParams {
    startOffset: number;
    endOffset: number;
    spacingX?: number;
    offsetY?: number;
    playBook: number;
    countStart: number;
    countEnd: number;
}

interface HandleDrillParams {
    spacingX: number;
    offsetY: number;
}

interface SideMillParams {
    millLength: number;
    millSides?: 'none' | 'start' | 'end' | 'both';
}

interface SideDrillParams {
    edge: EdgeParams;
    handle?: HandleDrillParams;
}

interface FormValues {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    sawThickness: number;
    hasHandle?: boolean;
    handleSide?: HandleSideEnum;
    handleOffset?: number;
    handlePosition?: number;
    drillParams: DrillDefaultParameters;
    millParams: MillDefaultParameters;
}

interface ExtendedParametersPanelProps extends ParametersPanelProps {
    profileSystem: IProfileSystem;
    drillParams?: DrillDefaultParameters;
    setDrillParams?: (params: DrillDefaultParameters) => void;
    millParams?: MillDefaultParameters;
    setMillParams?: (params: MillDefaultParameters) => void;
}

export interface DrillDefaultParameters {
    TOP: SideDrillParams;
    BOTTOM: SideDrillParams;
    RIGHT: SideDrillParams;
    LEFT: SideDrillParams & { handle: HandleDrillParams };
}

export interface MillDefaultParameters {
    TOP: SideMillParams;
    BOTTOM: SideMillParams;
    LEFT: SideMillParams;
    RIGHT: SideMillParams;
}

const FALLBACK_DRILL_PARAMS: DrillDefaultParameters = {
    TOP: {
        edge: { startOffset: 34, endOffset: 34, spacingX: 14, offsetY: 11.2, playBook: 0.450, countStart: 3, countEnd: 2 },
    },
    BOTTOM: {
        edge: { startOffset: 34, endOffset: 34, spacingX: 14, offsetY: 11.2, playBook: 0.450, countStart: 3, countEnd: 2 },
    },
    RIGHT: {
        edge: { startOffset: 34, endOffset: 34, spacingX: 14, offsetY: 11.2, playBook: 0.450, countStart: 1, countEnd: 1 },
    },
    LEFT: {
        handle: { spacingX: 128, offsetY: 10 },
        edge: { startOffset: 34, endOffset: 34, spacingX: 14, offsetY: 11.2, playBook: 0.450, countStart: 2, countEnd: 2 },
    },
};

const FALLBACK_MILL_PARAMS: MillDefaultParameters = {
    TOP:    { millLength: 35 },
    BOTTOM: { millLength: 35 },
    LEFT:   { millLength: 35 },
    RIGHT:  { millLength: 35 },
};

const MILL_SIDE_LABELS: Record<'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT', string> = {
    TOP:    'Верхня балка (TOP)',
    BOTTOM: 'Нижня балка (BOTTOM)',
    LEFT:   'Ліва балка (LEFT)',
    RIGHT:  'Права балка (RIGHT)',
};

function extractDrillParamsFromProfileSystem(profileSystem: IProfileSystem): DrillDefaultParameters {
    const drillOperation = profileSystem.operation?.find(
        op => op.operationType === OperationType.DRILL
    );
    if (!drillOperation?.defaultParameters) return FALLBACK_DRILL_PARAMS;
    try {
        const parsed = typeof drillOperation.defaultParameters === 'string'
            ? JSON.parse(drillOperation.defaultParameters)
            : drillOperation.defaultParameters;
        if (parsed?.TOP?.edge && parsed?.BOTTOM?.edge && parsed?.LEFT?.edge && parsed?.RIGHT?.edge) {
            return parsed as DrillDefaultParameters;
        }
        return FALLBACK_DRILL_PARAMS;
    } catch {
        return FALLBACK_DRILL_PARAMS;
    }
}

function extractMillParamsFromProfileSystem(profileSystem: IProfileSystem): MillDefaultParameters {
    const millOperation = profileSystem.operation?.find(
        op => op.operationType === OperationType.MILL
    );
    if (!millOperation?.defaultParameters) return FALLBACK_MILL_PARAMS;
    try {
        const parsed = typeof millOperation.defaultParameters === 'string'
            ? JSON.parse(millOperation.defaultParameters)
            : millOperation.defaultParameters;
        if (parsed?.TOP && parsed?.BOTTOM && parsed?.LEFT && parsed?.RIGHT) {
            return parsed as MillDefaultParameters;
        }
        return FALLBACK_MILL_PARAMS;
    } catch {
        return FALLBACK_MILL_PARAMS;
    }
}

function analyzeDrillParamsStructure(drillParams: DrillDefaultParameters): Array<{ key: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT'; label: string; hasSpacingX: boolean; hasOffsetY: boolean; hasHandle: boolean; }> {
    const sideConfig = [
        { key: 'TOP' as const,    label: 'Верхня балка (TOP)' },
        { key: 'BOTTOM' as const, label: 'Нижня балка (BOTTOM)' },
        { key: 'LEFT' as const,   label: 'Ліва балка (LEFT)' },
        { key: 'RIGHT' as const,  label: 'Права балка (RIGHT)' },
    ];

    return sideConfig.map(config => {
        const sideData = drillParams[config.key];
        return {
            key: config.key,
            label: config.label,
            hasSpacingX: sideData?.edge?.spacingX !== undefined && sideData.edge.spacingX !== null,
            hasOffsetY:  sideData?.edge?.offsetY  !== undefined && sideData.edge.offsetY  !== null,
            hasHandle:   sideData?.handle         !== undefined && sideData.handle         !== null,
        };
    });
}

export default function ParametersPanel({frameWidth, setFrameWidth, frameHeight, setFrameHeight, beamThickness, setBeamThickness, sawThickness, setSawThickness, hasHandle, setHasHandle, handleSide, setHandleSide, handleOffset, setHandleOffset, handlePosition, setHandlePosition, drillParams: externalDrillParams, setDrillParams: setExternalDrillParams, millParams: externalMillParams, setMillParams: setExternalMillParams, profileSystem, onUpdate}: ExtendedParametersPanelProps) {
    const resolvedInitialDrillParams = useMemo(() => {
        if (externalDrillParams) return externalDrillParams;
        return extractDrillParamsFromProfileSystem(profileSystem);
    }, [externalDrillParams, profileSystem]);

    const resolvedInitialMillParams = useMemo(() => {
        if (externalMillParams) return externalMillParams;
        return extractMillParamsFromProfileSystem(profileSystem);
    }, [externalMillParams, profileSystem]);

    const [initialValues, setInitialValues] = React.useState<FormValues>({
        frameWidth,
        frameHeight,
        beamThickness,
        sawThickness,
        hasHandle,
        handleSide,
        handleOffset,
        handlePosition,
        drillParams: resolvedInitialDrillParams,
        millParams:  resolvedInitialMillParams,
    });

    const [expandedSections,  setExpandedSections]  = React.useState<Set<string>>(new Set(['dimensions']));
    const [expandedDrillSides, setExpandedDrillSides] = React.useState<Set<string>>(new Set(['TOP']));
    const [expandedMillSides,  setExpandedMillSides]  = React.useState<Set<string>>(new Set(['TOP']));

    const { control, watch, setValue } = useForm<FormValues>({
        defaultValues: {
            frameWidth,
            frameHeight,
            beamThickness,
            sawThickness,
            hasHandle,
            handleSide,
            handleOffset,
            handlePosition,
            drillParams: resolvedInitialDrillParams,
            millParams:  resolvedInitialMillParams,
        },
        mode: 'onChange',
    });

    const values = watch();

    const drillSides = useMemo(() => analyzeDrillParamsStructure(values.drillParams), [values.drillParams]);

    const hasChanges = React.useMemo(() => {
        return (
            values.frameWidth     !== initialValues.frameWidth     ||
            values.frameHeight    !== initialValues.frameHeight    ||
            values.beamThickness  !== initialValues.beamThickness  ||
            values.sawThickness   !== initialValues.sawThickness   ||
            values.hasHandle      !== initialValues.hasHandle      ||
            values.handleSide     !== initialValues.handleSide     ||
            values.handleOffset   !== initialValues.handleOffset   ||
            values.handlePosition !== initialValues.handlePosition ||
            JSON.stringify(values.drillParams) !== JSON.stringify(initialValues.drillParams) ||
            JSON.stringify(values.millParams)  !== JSON.stringify(initialValues.millParams)
        );
    }, [values, initialValues]);

    useEffect(() => {
        setFrameWidth(values.frameWidth);
        setFrameHeight(values.frameHeight);
        setBeamThickness(values.beamThickness);
        setSawThickness(values.sawThickness);
        if (setHasHandle)     setHasHandle(values.hasHandle ?? false);
        if (setHandleSide)    setHandleSide(values.handleSide);
        if (setHandleOffset)  setHandleOffset(values.handleOffset);
        if (setHandlePosition) setHandlePosition(values.handlePosition);
        if (setExternalDrillParams) setExternalDrillParams(values.drillParams);
        if (setExternalMillParams)  setExternalMillParams(values.millParams);
    }, [
        values.frameWidth, setFrameWidth,
        values.frameHeight, setFrameHeight,
        values.beamThickness, setBeamThickness,
        values.sawThickness, setSawThickness,
        values.hasHandle, setHasHandle,
        values.handleSide, setHandleSide,
        values.handleOffset, setHandleOffset,
        values.handlePosition, setHandlePosition,
        JSON.stringify(values.drillParams), setExternalDrillParams,
        JSON.stringify(values.millParams),  setExternalMillParams,
    ]);

    const handleSideOptions = Object.values(HandleSideEnum).map(side => ({ label: side, value: side }));

    const toggleSection = (section: string) => {
        const next = new Set(expandedSections);
        next.has(section) ? next.delete(section) : next.add(section);
        setExpandedSections(next);
    };

    const toggleDrillSide = (side: string) => {
        const next = new Set(expandedDrillSides);
        next.has(side) ? next.delete(side) : next.add(side);
        setExpandedDrillSides(next);
    };

    const toggleMillSide = (side: string) => {
        const next = new Set(expandedMillSides);
        next.has(side) ? next.delete(side) : next.add(side);
        setExpandedMillSides(next);
    };

    const handleUpdate = async () => {
        const errors: string[] = [];
        const width  = Number(values.frameWidth);
        const height = Number(values.frameHeight);
        const beam   = Number(values.beamThickness);
        const saw    = Number(values.sawThickness);

        if (!width  || isNaN(width))  errors.push('Ширина рамки: введіть значення');
        else {
            if (width < 100)  errors.push('Ширина рамки: мінімум 100 мм');
            if (width > 3000) errors.push('Ширина рамки: максимум 3000 мм');
        }
        if (!height || isNaN(height)) errors.push('Висота рамки: введіть значення');
        else {
            if (height < 100)  errors.push('Висота рамки: мінімум 100 мм');
            if (height > 3000) errors.push('Висота рамки: максимум 3000 мм');
        }
        if (!beam || isNaN(beam)) errors.push('Товщина балки: введіть значення');
        else {
            if (beam < 5)   errors.push('Товщина балки: мінімум 5 мм');
            if (beam > 100) errors.push('Товщина балки: максимум 100 мм');
        }
        if (!saw || isNaN(saw)) errors.push('Товщина пили: введіть значення');
        else {
            if (saw < 0.1) errors.push('Товщина пили: мінімум 0.1 мм');
            if (saw > 10)  errors.push('Товщина пили: максимум 10 мм');
            const dp = String(saw).split('.')[1];
            if (dp && dp.length > 3) errors.push('Товщина пили: максимум 3 цифри після коми');
        }
        if (values.hasHandle) {
            if (!values.handleSide) errors.push('Сторона ручки: оберіть сторону');
            const offset = Number(values.handleOffset);
            if (!isNaN(offset)) {
                if (offset < 0)    errors.push('Ширина ручки: мінімум 0 мм');
                if (offset > 1000) errors.push('Ширина ручки: максимум 1000 мм');
                const dp = String(offset).split('.')[1];
                if (dp && dp.length > 3) errors.push('Ширина ручки: максимум 3 цифри після коми');
            }
            const position = Number(values.handlePosition);
            if (!isNaN(position)) {
                if (position < 0)    errors.push('Позиція ручки: мінімум 0 мм');
                if (position > 2000) errors.push('Позиція ручки: максимум 2000 мм');
                const dp = String(position).split('.')[1];
                if (dp && dp.length > 3) errors.push('Позиція ручки: максимум 3 цифри після коми');
            }
        }

        if (errors.length > 0) {
            errors.forEach(error => toast.error(error, { duration: 4000, position: 'top-right' }));
            return;
        }

        try {
            await onUpdate();
            setInitialValues({
                frameWidth:    values.frameWidth,
                frameHeight:   values.frameHeight,
                beamThickness: values.beamThickness,
                sawThickness:  values.sawThickness,
                hasHandle:     values.hasHandle,
                handleSide:    values.handleSide,
                handleOffset:  values.handleOffset,
                handlePosition: values.handlePosition,
                drillParams:   values.drillParams,
                millParams:    values.millParams,
            });
            toast.success('Зміни успішно застосовані та збережені!', { duration: 3000, position: 'top-right' });
        } catch (error) {
            console.log(error);
            toast.error('Помилка при збереженні змін', { duration: 4000, position: 'top-right' });
        }
    };

    const validateDecimalPlaces = (value: number) => {
        if (value === undefined || value === null) return true;
        const dp = String(value).split('.')[1];
        if (dp && dp.length > 3) return 'Максимум 3 цифри після коми';
        return true;
    };

    const drillOperationTitle = useMemo(() => {
        return profileSystem.operation?.find(op => op.operationType === OperationType.DRILL)?.title
            ?? 'Параметри свердління';
    }, [profileSystem]);

    const millOperationTitle = useMemo(() => {
        return profileSystem.operation?.find(op => op.operationType === OperationType.MILL)?.title
            ?? 'Параметри фрезерування';
    }, [profileSystem]);

    return (
        <div className="flex flex-col bg-react/400">
            <div className="p-3">
                <h2 className="text-blue-400 z-10 font-bold text-lg mb-2 top-0">
                    Параметри рамки
                </h2>

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
                        <span className="flex items-center gap-2">Розміри рамки</span>
                        <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('dimensions') ? "rotate-180" : "")} />
                    </button>
                    {expandedSections.has('dimensions') && (
                        <div className="mt-2 p-3 bg-gray-700/20 rounded-lg space-y-3">
                            <Input<FormValues> control={control} name="frameWidth" type="number"
                                               label="Ширина (мм) (X):"
                                               rules={{ min: { value: 100, message: 'Мінімум 100 мм' }, max: { value: 3000, message: 'Максимум 3000 мм' }, validate: validateDecimalPlaces }}
                                               placeholder="Введіть ширину" className="flex-1 z-0" classNameContainer="mb-0 relative z-0" />
                            <Input<FormValues> control={control} name="frameHeight" type="number"
                                               label="Висота (мм) (Y):"
                                               rules={{ min: { value: 100, message: 'Мінімум 100 мм' }, max: { value: 3000, message: 'Максимум 3000 мм' }, validate: validateDecimalPlaces }}
                                               placeholder="Введіть висоту" className="flex-1 z-0" classNameContainer="mb-0 relative z-0" />
                            <Input<FormValues> control={control} name="beamThickness" type="number"
                                               label="Товщина балки (мм):"
                                               rules={{ min: { value: 5, message: 'Мінімум 5 мм' }, max: { value: 100, message: 'Максимум 100 мм' }, validate: validateDecimalPlaces }}
                                               placeholder="Введіть товщину" className="flex-1 z-0" classNameContainer="mb-0 relative z-0" />
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
                        <span className="flex items-center gap-2">Параметри різання</span>
                        <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('cutting') ? "rotate-180" : "")} />
                    </button>
                    {expandedSections.has('cutting') && (
                        <div className="mt-2 p-3 bg-gray-700/20 rounded-lg space-y-3">
                            <Input<FormValues> control={control} name="sawThickness" type="number" step="0.001"
                                               label="Товщина пили (мм):"
                                               rules={{ min: { value: 0.1, message: 'Мінімум 0.1 мм' }, max: { value: 10, message: 'Максимум 10 мм' }, validate: validateDecimalPlaces }}
                                               placeholder="Введіть товщину (мм, макс 3 цифри)" className="flex-1 z-0" classNameContainer="mb-0 relative z-0" />
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
                            <span className="flex items-center gap-2">Параметри ручки</span>
                            <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('handle') ? "rotate-180" : "")} />
                        </button>
                        {expandedSections.has('handle') && (
                            <div className="mt-2 p-3 bg-gray-700/20 rounded-lg space-y-3">
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
                                    <div className="flex-1">
                                        <Input<FormValues> control={control} name="handleOffset" type="number" step="0.001"
                                                           label="Ширина ручки (мм):"
                                                           rules={{ min: { value: 0, message: 'Мінімум 0 мм' }, max: { value: 1000, message: 'Максимум 1000 мм' }, validate: validateDecimalPlaces }}
                                                           placeholder="160" className="flex-1 z-0" classNameContainer="mb-0 relative z-0" />
                                    </div>
                                    <div className="flex-1">
                                        <Input<FormValues> control={control} name="handlePosition" type="number" step="0.001"
                                                           label="Позиція ручки (мм):"
                                                           rules={{ min: { value: 0, message: 'Мінімум 0 мм' }, max: { value: 2000, message: 'Максимум 2000 мм' }, validate: validateDecimalPlaces }}
                                                           placeholder="0" className="flex-1 z-0" classNameContainer="mb-0 relative z-0" />
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
                                ? "bg-blue-400/20 border border-blue-400/50 text-blue-400"
                                : "bg-gray-700/30 border border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                        )}
                    >
                        <span className="flex items-center gap-2">{drillOperationTitle}</span>
                        <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('drill') ? "rotate-180" : "")} />
                    </button>

                    {expandedSections.has('drill') && (
                        <div className="mt-2 space-y-2">
                            {drillSides.map(({ key, label, hasSpacingX, hasOffsetY, hasHandle: sideHasHandle }) => (
                                <div key={key} className="rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleDrillSide(key)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2 text-sm font-semibold transition-all",
                                            expandedDrillSides.has(key)
                                                ? "bg-blue-500/10 text-blue-300"
                                                : "bg-gray-700/30 text-gray-400 hover:bg-gray-700/50"
                                        )}
                                    >
                                        <span>{label}</span>
                                        <ChevronDown size={15} className={cn("transition-transform", expandedDrillSides.has(key) ? "rotate-180" : "")} />
                                    </button>

                                    {expandedDrillSides.has(key) && (
                                        <div className="p-3 bg-gray-800/40 space-y-4">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                                                    Edge — крайові отвори
                                                </p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Input<FormValues> control={control}
                                                                       name={`drillParams.${key}.edge.startOffset`}
                                                                       type="number" step="0.001" label="startOffset (мм)"
                                                                       rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                                       className="z-0" classNameContainer="mb-0 relative z-0" />
                                                    <Input<FormValues> control={control}
                                                                       name={`drillParams.${key}.edge.endOffset`}
                                                                       type="number" step="0.001" label="endOffset (мм)"
                                                                       rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                                       className="z-0" classNameContainer="mb-0 relative z-0" />
                                                    {hasSpacingX && (
                                                        <Input<FormValues> control={control}
                                                                           name={`drillParams.${key}.edge.spacingX`}
                                                                           type="number" step="0.001" label="spacingX (мм)"
                                                                           rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                                           className="z-0" classNameContainer="mb-0 relative z-0" />
                                                    )}
                                                    {hasOffsetY && (
                                                        <Input<FormValues> control={control}
                                                                           name={`drillParams.${key}.edge.offsetY`}
                                                                           type="number" step="0.001" label="offsetY (мм)"
                                                                           rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                                           className="z-0" classNameContainer="mb-0 relative z-0" />
                                                    )}
                                                    <Input<FormValues> control={control}
                                                                       name={`drillParams.${key}.edge.playBook`}
                                                                       type="number" step="0.001" label="playBook (мм)"
                                                                       rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                                       className="z-0" classNameContainer="mb-0 relative z-0" />
                                                </div>
                                            </div>

                                            {sideHasHandle && (
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                                                        Handle — отвори під ручку
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Input<FormValues> control={control}
                                                                           name={`drillParams.${key}.handle.spacingX`}
                                                                           type="number" step="0.001" label="spacingX (мм)"
                                                                           rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                                           className="z-0" classNameContainer="mb-0 relative z-0" />
                                                        <Input<FormValues> control={control}
                                                                           name={`drillParams.${key}.handle.offsetY`}
                                                                           type="number" step="0.001" label="offsetY (мм)"
                                                                           rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                                           className="z-0" classNameContainer="mb-0 relative z-0" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-2">
                    <button
                        onClick={() => toggleSection('mill')}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all",
                            expandedSections.has('mill')
                                ? "bg-orange-400/20 border border-orange-400/50 text-orange-400"
                                : "bg-gray-700/30 border border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                        )}
                    >
                        <span className="flex items-center gap-2">{millOperationTitle}</span>
                        <ChevronDown size={18} className={cn("transition-transform", expandedSections.has('mill') ? "rotate-180" : "")} />
                    </button>

                    {expandedSections.has('mill') && (
                        <div className="mt-2 space-y-2">
                            {(['TOP', 'BOTTOM', 'LEFT', 'RIGHT'] as const).map((key) => {
                                if (values.millParams[key]?.millSides === 'none') return null;
                                return (
                                    <div key={key} className="rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => toggleMillSide(key)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 text-sm font-semibold transition-all",
                                                expandedMillSides.has(key)
                                                    ? "bg-orange-500/10 text-orange-300"
                                                    : "bg-gray-700/30 text-gray-400 hover:bg-gray-700/50"
                                            )}
                                        >
                                            <span>{MILL_SIDE_LABELS[key]}</span>
                                            <ChevronDown size={15} className={cn("transition-transform", expandedMillSides.has(key) ? "rotate-180" : "")} />
                                        </button>

                                        {expandedMillSides.has(key) && (
                                            <div className="p-3 bg-gray-800/40">
                                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                                                    Параметри фрезерування
                                                </p>
                                                <Input<FormValues>
                                                    control={control}
                                                    name={`millParams.${key}.millLength`}
                                                    type="number" step="0.001"
                                                    label="millLength (мм)"
                                                    rules={{ min: { value: 0, message: 'Мінімум 0' } }}
                                                    className="z-0" classNameContainer="mb-0 relative z-0"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-none p-3 border-t border-gray-700 bg-react/400 space-y-3">
                {hasChanges && (
                    <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-start gap-2">
                            <div className="flex-1">
                                <p className="text-yellow-500 text-xs font-semibold mb-1">Є незбережені зміни</p>
                                <p className="text-yellow-400/80 text-[10px]">Натисніть кнопку нижче, щоб застосувати зміни</p>
                            </div>
                        </div>
                    </div>
                )}
                <Button
                    className="min-h-[38px] text-sm"
                    color="greenDarkgreen"
                    onClick={handleUpdate}
                    disabled={!hasChanges}
                >
                    {hasChanges ? 'Застосувати зміни та зберегти' : 'Всі зміни збережені'}
                </Button>
            </div>
        </div>
    );
}