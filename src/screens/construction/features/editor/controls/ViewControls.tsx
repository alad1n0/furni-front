'use client'

import React from 'react';
import { ViewControlsProps, ViewMode, TransformMode } from "@/screens/construction/type/editor/three-mesh";

const VIEW_MODES_LIST = [
    { id: 'solid', label: '🟦 Solid', desc: 'Основний режим' },
    { id: 'wireframe', label: '⬜ Wireframe', desc: 'Видимість ребер' },
] as const;

const TRANSFORM_MODES_LIST = [
    { id: 'translate', label: '↔️ Переміщення', shortcut: '1' },
    { id: 'rotate', label: '🔄 Обертання', shortcut: '2' },
    { id: 'scale', label: '📏 Масштабування', shortcut: '3' },
    { id: 'none', label: '❌ Відключити', shortcut: '0' }
] as const;

export default function ViewControls({viewMode, transformMode, onSetViewMode, onSetTransformMode}: ViewControlsProps): React.ReactElement {
    return (
        <div className="absolute top-20 right-4 z-40 bg-black bg-opacity-90 border-2 border-blue-400 p-4 rounded-lg text-white max-w-xs">
            <div className="mb-4">
                <h3 className="font-bold text-sm mb-3 text-green-400">👁️ Режим перегляду:</h3>
                <div className="space-y-2">
                    {VIEW_MODES_LIST.map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => onSetViewMode(mode.id as ViewMode)}
                            className={`w-full block py-2 px-3 rounded text-xs font-bold transition-colors ${
                                viewMode === mode.id
                                    ? 'bg-green-500 text-black'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                            title={mode.desc}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-blue-400 my-4" />

            <div>
                <h3 className="font-bold text-sm mb-3 text-green-400">✏️ Режим редагування:</h3>
                <div className="space-y-2">
                    {TRANSFORM_MODES_LIST.map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => onSetTransformMode(mode.id as TransformMode)}
                            className={`w-full flex items-center justify-between py-2 px-3 rounded text-xs font-bold transition-colors ${
                                transformMode === mode.id
                                    ? 'bg-green-500 text-black'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                            title={`Натисніть ${mode.shortcut}`}
                        >
                            <span>{mode.label}</span>
                            <span className="text-xs opacity-70 ml-2">[{mode.shortcut}]</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-blue-400 mt-4 pt-3 text-xs text-gray-300">
                <div className="mb-2 font-bold text-green-400">⌨️ Клавіші:</div>
                <div className="space-y-1">
                    <div><span className="text-yellow-400">W</span> - Wireframe</div>
                    <div><span className="text-yellow-400">S</span> - Solid режим</div>
                </div>
            </div>
        </div>
    );
}