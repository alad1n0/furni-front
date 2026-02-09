'use client'

import React from 'react';
import { ParametersPanelProps } from "@/screens/construction/type/editor/three-mesh";
import Button from "@/ui/button/Button";

export default function ParametersPanel({frameWidth, setFrameWidth, frameHeight, setFrameHeight, beamThickness, setBeamThickness, sawThickness, setSawThickness, onUpdate}: ParametersPanelProps) {
    return (
        <div className="flex-none overflow-y-auto p-4 bg-react/500">
            <div className="mb-4">
                <h2 className="text-blue-400 font-bold text-lg mb-4">⚙️ Параметри рамки</h2>

                <div className="mb-4 pb-4 border-b border-gray-700">
                    <h3 className="text-green-400 font-bold text-sm mb-3">📏 Розміри рамки</h3>

                    <div className="mb-3">
                        <label className="block text-blue-400 font-bold text-xs mb-1">
                            Ширина (X):
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={frameWidth}
                                onChange={(e) => setFrameWidth(parseFloat(e.target.value) || 0)}
                                min="100"
                                max="2000"
                                className="flex-1 px-2 py-2 bg-gray-900 border border-blue-400 text-white rounded text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-30"
                            />
                            <span className="text-gray-400 text-xs whitespace-nowrap">мм</span>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="block text-blue-400 font-bold text-xs mb-1">
                            Висота (Y):
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={frameHeight}
                                onChange={(e) => setFrameHeight(parseFloat(e.target.value) || 0)}
                                min="100"
                                max="2000"
                                className="flex-1 px-2 py-2 bg-gray-900 border border-blue-400 text-white rounded text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-30"
                            />
                            <span className="text-gray-400 text-xs whitespace-nowrap">мм</span>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="block text-blue-400 font-bold text-xs mb-1">
                            Товщина балки:
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={beamThickness}
                                onChange={(e) => setBeamThickness(parseFloat(e.target.value) || 0)}
                                min="5"
                                max="100"
                                className="flex-1 px-2 py-2 bg-gray-900 border border-blue-400 text-white rounded text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-30"
                            />
                            <span className="text-gray-400 text-xs whitespace-nowrap">мм</span>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-green-400 font-bold text-sm mb-3">🔪 Параметри різання</h3>

                    <div className="mb-3">
                        <label className="block text-blue-400 font-bold text-xs mb-1">
                            Товщина пили:
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={sawThickness}
                                onChange={(e) => setSawThickness(parseFloat(e.target.value) || 0)}
                                min="0.1"
                                max="10"
                                step="0.1"
                                className="flex-1 px-2 py-2 bg-gray-900 border border-blue-400 text-white rounded text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-30"
                            />
                            <span className="text-gray-400 text-xs whitespace-nowrap">мм</span>
                        </div>
                    </div>
                </div>

                <Button
                    className={"min-h-[40px]"}
                    color="greenDarkgreen"
                    onClick={onUpdate}
                >
                    Оновити модель
                </Button>
            </div>
        </div>
    );
}