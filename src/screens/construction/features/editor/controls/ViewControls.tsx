'use client'

import React from 'react';
import {TransformMode, ViewControlsProps, ViewMode} from "@/screens/construction/type/editor/three-mesh";

const VIEW_MODES_LIST = [
    { id: 'solid', label: 'Solid' },
    { id: 'wireframe', label: 'Wireframe' },
    { id: 'vertices', label: 'Вершини' },
    { id: 'mixed', label: 'Solid+Вершини' }
] as const;

const TRANSFORM_MODES_LIST = [
    { id: 'translate', label: 'Переміщення', color: 'bg-red-600 hover:bg-red-700' },
    { id: 'rotate', label: 'Обертання', color: 'bg-red-600 hover:bg-red-700' },
    { id: 'scale', label: 'Масштабування', color: 'bg-red-600 hover:bg-red-700' },
    { id: 'none', label: 'Відключити', color: 'bg-red-600 hover:bg-red-700' }
] as const;

export default function ViewControls({viewMode, transformMode, onSetViewMode, onSetTransformMode}: ViewControlsProps): React.ReactElement {
    return (
        <div className="fixed top-56 right-4 z-40 bg-black bg-opacity-85 border-2 border-blue-400 p-3 rounded-lg text-white max-w-xs">
            <div>
                <div className="font-bold text-sm mb-2">Режим перегляду:</div>
                {VIEW_MODES_LIST.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => onSetViewMode(mode.id as ViewMode)}
                        className={`w-full block py-1.5 px-2 mb-1 rounded text-xs font-bold transition-colors ${
                            viewMode === mode.id
                                ? 'bg-green-400 text-black'
                                : 'bg-blue-400 hover:bg-blue-500 text-black'
                        }`}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>

            <div className="border-t border-blue-400 my-3" />

            <div>
                <div className="font-bold text-sm mb-2">Режим редагування:</div>
                {TRANSFORM_MODES_LIST.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => onSetTransformMode(mode.id as TransformMode)}
                        className={`w-full block py-1.5 px-2 mb-1 rounded text-xs font-bold transition-colors ${
                            transformMode === mode.id
                                ? 'bg-green-400 text-black'
                                : mode.color || 'bg-blue-400 hover:bg-blue-500 text-black'
                        }`}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>
        </div>
    );
}