'use client'

import React from 'react';
import {ParametersPanelProps} from "@/screens/construction/type/editor/three-mesh";

export default function ParametersPanel({ frameWidth, setFrameWidth, frameHeight, setFrameHeight, beamThickness, setBeamThickness, sawThickness, setSawThickness, onUpdate }: ParametersPanelProps) {
    return (
        <div className="fixed top-1/4 left-4 z-40 bg-black bg-opacity-90 border-2 border-blue-400 p-4 rounded-lg min-w-96 text-white">
            <div className="mb-3 text-green-400 font-bold text-sm">⚙️ Параметри рамки</div>

            <div className="border-b border-blue-400 pb-2 mb-3">
                <div className="text-green-400 font-bold text-xs mb-2">Розміри рамки</div>

                <div className="flex items-center gap-2 mb-2">
                    <label className="min-w-40 font-bold text-blue-400 text-xs">Ширина (X):</label>
                    <input
                        type="number"
                        value={frameWidth}
                        onChange={(e) => setFrameWidth(parseFloat(e.target.value))}
                        min="100"
                        max="2000"
                        className="px-2 py-1 bg-gray-900 border border-blue-400 text-white rounded text-xs w-20 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-30"
                    />
                    <span className="text-gray-500 text-xs min-w-8">мм</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <label className="min-w-40 font-bold text-blue-400 text-xs">Висота (Y):</label>
                    <input
                        type="number"
                        value={frameHeight}
                        onChange={(e) => setFrameHeight(parseFloat(e.target.value))}
                        min="100"
                        max="2000"
                        className="px-2 py-1 bg-gray-900 border border-blue-400 text-white rounded text-xs w-20 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-30"
                    />
                    <span className="text-gray-500 text-xs min-w-8">мм</span>
                </div>

                <div className="flex items-center gap-2">
                    <label className="min-w-40 font-bold text-blue-400 text-xs">Товщина балки:</label>
                    <input
                        type="number"
                        value={beamThickness}
                        onChange={(e) => setBeamThickness(parseFloat(e.target.value))}
                        min="5"
                        max="100"
                        className="px-2 py-1 bg-gray-900 border border-blue-400 text-white rounded text-xs w-20 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-30"
                    />
                    <span className="text-gray-500 text-xs min-w-8">мм</span>
                </div>
            </div>

            <div className="mb-3">
                <div className="text-green-400 font-bold text-xs mb-2">Параметри різання</div>

                <div className="flex items-center gap-2">
                    <label className="min-w-40 font-bold text-blue-400 text-xs">Товщина пили:</label>
                    <input
                        type="number"
                        value={sawThickness}
                        onChange={(e) => setSawThickness(parseFloat(e.target.value))}
                        min="0.1"
                        max="10"
                        step="0.001"
                        className="px-2 py-1 bg-gray-900 border border-blue-400 text-white rounded text-xs w-20 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-30"
                    />
                    <span className="text-gray-500 text-xs min-w-8">мм</span>
                </div>
            </div>

            <button
                onClick={onUpdate}
                className="w-full py-2 bg-green-400 hover:bg-green-500 text-black font-bold rounded text-sm transition-colors"
            >
                Оновити модель
            </button>
        </div>
    );
}