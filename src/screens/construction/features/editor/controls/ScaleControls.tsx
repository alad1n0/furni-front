'use client'

import React from 'react';
import {ScaleControlsProps} from "@/screens/construction/type/editor/three-mesh";

export default function ScaleControls({ onScale, onMove }: ScaleControlsProps) {
    return (
        <div className="fixed bottom-4 right-4 z-40 bg-black bg-opacity-85 border-2 border-blue-400 p-3 rounded-lg text-white max-h-96 overflow-y-auto">
            <div className="font-bold text-sm mb-2">Масштабування:</div>
            <div className="grid grid-cols-2 gap-1 mb-3">
                <button
                    onClick={() => onScale(0.9, 'x')}
                    className="px-2 py-1 bg-blue-400 hover:bg-blue-500 text-black rounded text-xs font-bold transition-colors"
                >
                    X -10%
                </button>
                <button
                    onClick={() => onScale(1.1, 'x')}
                    className="px-2 py-1 bg-blue-400 hover:bg-blue-500 text-black rounded text-xs font-bold transition-colors"
                >
                    X +10%
                </button>
                <button
                    onClick={() => onScale(0.9, 'y')}
                    className="px-2 py-1 bg-blue-400 hover:bg-blue-500 text-black rounded text-xs font-bold transition-colors"
                >
                    Y -10%
                </button>
                <button
                    onClick={() => onScale(1.1, 'y')}
                    className="px-2 py-1 bg-blue-400 hover:bg-blue-500 text-black rounded text-xs font-bold transition-colors"
                >
                    Y +10%
                </button>
                <button
                    onClick={() => onScale(0.9, 'z')}
                    className="px-2 py-1 bg-blue-400 hover:bg-blue-500 text-black rounded text-xs font-bold transition-colors"
                >
                    Z -10%
                </button>
                <button
                    onClick={() => onScale(1.1, 'z')}
                    className="px-2 py-1 bg-blue-400 hover:bg-blue-500 text-black rounded text-xs font-bold transition-colors"
                >
                    Z +10%
                </button>
            </div>

            <div className="border-t border-blue-400 my-2"></div>

            <div className="font-bold text-sm mb-2">Переміщення:</div>
            <div className="grid grid-cols-2 gap-1">
                <button
                    onClick={() => onMove(-0.2, 'x')}
                    className="px-2 py-1 bg-blue-400 hover:bg-blue-500 text-black rounded text-xs font-bold transition-colors"
                >
                    ← X
                </button>
                <button
                    onClick={() => onMove(0.2, 'x')}
                    className="px-2 py-1 bg-blue-400 hover:bg-blue-500 text-black rounded text-xs font-bold transition-colors"
                >
                    X →
                </button>
                <button
                    onClick={() => onMove(-0.2, 'y')}
                    className="px-2 py-1 bg-blue-400 hover:bg-blue-500 text-black rounded text-xs font-bold transition-colors"
                >
                    ↓ Y
                </button>
                <button
                    onClick={() => onMove(0.2, 'y')}
                    className="px-2 py-1 bg-blue-400 hover:bg-blue-500 text-black rounded text-xs font-bold transition-colors"
                >
                    Y ↑
                </button>
                <button
                    onClick={() => onMove(-0.2, 'z')}
                    className="px-2 py-1 bg-blue-400 hover:bg-blue-500 text-black rounded text-xs font-bold transition-colors"
                >
                    ← Z
                </button>
                <button
                    onClick={() => onMove(0.2, 'z')}
                    className="px-2 py-1 bg-blue-400 hover:bg-blue-500 text-black rounded text-xs font-bold transition-colors"
                >
                    Z →
                </button>
            </div>
        </div>
    );
}