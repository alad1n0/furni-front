'use client'

import React, {useEffect} from 'react';
import { useForm } from 'react-hook-form';
import Button from "@/ui/button/Button";
import Input from "@/ui/input/Input";
import {ParametersPanelProps} from "@/screens/construction/type/editor/ThreeMesh";
import toast from "react-hot-toast";

interface FrameParameters {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    sawThickness: number;
}

export default function ParametersPanel({frameWidth, setFrameWidth, frameHeight, setFrameHeight, beamThickness, setBeamThickness, sawThickness, setSawThickness, onUpdate}: ParametersPanelProps) {
    const [initialValues, setInitialValues] = React.useState({
        frameWidth,
        frameHeight,
        beamThickness,
        sawThickness,
    });

    const { control, watch } = useForm<FrameParameters>({
        defaultValues: {
            frameWidth,
            frameHeight,
            beamThickness,
            sawThickness,
        },
        mode: 'onChange',
    });

    const values = watch();

    const hasChanges = React.useMemo(() => {
        return (
            values.frameWidth !== initialValues.frameWidth ||
            values.frameHeight !== initialValues.frameHeight ||
            values.beamThickness !== initialValues.beamThickness ||
            values.sawThickness !== initialValues.sawThickness
        );
    }, [values, initialValues]);

    useEffect(() => {
        setFrameWidth(values.frameWidth);
        setFrameHeight(values.frameHeight);
        setBeamThickness(values.beamThickness);
        setSawThickness(values.sawThickness);
    }, [values.frameWidth, setFrameWidth, values.frameHeight, setFrameHeight, values.beamThickness, setBeamThickness, values.sawThickness, setSawThickness]);

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
        <div className="flex-none overflow-y-auto p-4 bg-react/400">
            <div className="mb-4">
                <h2 className="text-blue-400 font-bold text-lg mb-4">Параметри рамки</h2>

                <div className="mb-4 pb-4 border-b border-gray-700">
                    <h3 className="text-green-400 font-bold text-sm mb-3">Розміри рамки</h3>

                    <div className="mb-3">
                        <Input<FrameParameters>
                            control={control}
                            name="frameWidth"
                            type="number"
                            label="Ширина (мм) (X):"
                            rules={{
                                min: { value: 100, message: 'Мінімум 100 мм' },
                                max: { value: 2000, message: 'Максимум 2000 мм' },
                            }}
                            placeholder="Введіть ширину"
                            className="flex-1"
                            classNameContainer="mb-3"
                        />
                    </div>

                    <div className="mb-3">
                        <Input<FrameParameters>
                            control={control}
                            name="frameHeight"
                            type="number"
                            label="Висота (мм) (Y):"
                            rules={{
                                min: { value: 100, message: 'Мінімум 100 мм' },
                                max: { value: 2000, message: 'Максимум 2000 мм' },
                            }}
                            placeholder="Введіть висоту"
                            className="flex-1"
                            classNameContainer="mb-3"
                        />
                    </div>

                    <div className="mb-3">
                        <Input<FrameParameters>
                            control={control}
                            name="beamThickness"
                            type="number"
                            label="Товщина балки (мм):"
                            rules={{
                                min: { value: 5, message: 'Мінімум 5 мм' },
                                max: { value: 100, message: 'Максимум 100 мм' },
                            }}
                            placeholder="Введіть товщину"
                            className="flex-1"
                            classNameContainer="mb-3"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-green-400 font-bold text-sm mb-3">Параметри різання</h3>

                    <div className="mb-3">
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
                            className="flex-1"
                            classNameContainer="mb-3"
                        />
                    </div>
                </div>

                {hasChanges && (
                    <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-start gap-2">
                            <div className="flex-1">
                                <p className="text-yellow-500 text-sm font-semibold mb-1">
                                    Є незбережені зміни
                                </p>
                                <p className="text-yellow-400/80 text-xs">
                                    Натисніть кнопку нижче, щоб застосувати зміни до G-code та зберегти конструкцію
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <Button
                    className={"min-h-[40px]"}
                    color="greenDarkgreen"
                    onClick={handleUpdate}
                    disabled={!hasChanges}
                >
                    {hasChanges ? (
                        <>
                            Застосувати зміни та зберегти
                        </>
                    ) : (
                        <>
                            Всі зміни збережені
                        </>
                    )}
                </Button>

                {!hasChanges && (
                    <p className="text-gray-500 text-xs mt-2 text-center">
                        Змініть параметри вище для активації кнопки
                    </p>
                )}
            </div>
        </div>
    );
}