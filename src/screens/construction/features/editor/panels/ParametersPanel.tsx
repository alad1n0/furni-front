'use client'

import React, {useEffect} from 'react';
import { useForm } from 'react-hook-form';
import { ParametersPanelProps } from "@/screens/construction/type/editor/three-mesh";
import Button from "@/ui/button/Button";
import Input from "@/ui/input/Input";

interface FrameParameters {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    sawThickness: number;
}

export default function ParametersPanel({frameWidth, setFrameWidth, frameHeight, setFrameHeight, beamThickness, setBeamThickness, sawThickness, setSawThickness, onUpdate}: ParametersPanelProps) {
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

    useEffect(() => {
        setFrameWidth(values.frameWidth);
        setFrameHeight(values.frameHeight);
        setBeamThickness(values.beamThickness);
        setSawThickness(values.sawThickness);
    }, [values.frameWidth, setFrameWidth, values.frameHeight, setFrameHeight, values.beamThickness, setBeamThickness, values.sawThickness, setSawThickness]);

    const handleUpdate = () => {
        onUpdate();
    };

    return (
        <div className="flex-none overflow-y-auto p-4 bg-react/400">
            <div className="mb-4">
                <h2 className="text-blue-400 font-bold text-lg mb-4">⚙️ Параметри рамки</h2>

                <div className="mb-4 pb-4 border-b border-gray-700">
                    <h3 className="text-green-400 font-bold text-sm mb-3">📏 Розміри рамки</h3>

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
                    <h3 className="text-green-400 font-bold text-sm mb-3">🔪 Параметри різання</h3>

                    <div className="mb-3">
                        <Input<FrameParameters>
                            control={control}
                            name="sawThickness"
                            type="number"
                            label="Товщина пили (мм):"
                            rules={{
                                min: { value: 0.1, message: 'Мінімум 0.1 мм' },
                                max: { value: 10, message: 'Максимум 10 мм' },
                            }}
                            placeholder="Введіть товщину"
                            className="flex-1"
                            classNameContainer="mb-3"
                        />
                    </div>
                </div>

                <Button
                    className={"min-h-[40px]"}
                    color="greenDarkgreen"
                    onClick={handleUpdate}
                >
                    Оновити модель
                </Button>
            </div>
        </div>
    );
}