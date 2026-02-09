'use client'

import React, { useState } from 'react';
import { GcodeModalProps } from "@/screens/construction/type/editor/three-mesh";

export default function GcodeModal({ gcodeData, onClose }: GcodeModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(gcodeData.gcode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDownload = () => {
        const element = document.createElement('a');
        element.setAttribute(
            'href',
            'data:text/plain;charset=utf-8,' + encodeURIComponent(gcodeData.gcode)
        );
        element.setAttribute(
            'download',
            `${gcodeData.partName}_${gcodeData.beamLength}x${gcodeData.beamThickness}.cnc`
        );
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center overflow-y-auto p-4">
            <div className="bg-gray-900 border-2 border-blue-400 rounded-lg max-w-3xl w-full my-8">
                <div className="border-b border-blue-400 p-6 bg-gray-800">
                    <h2 className="text-blue-400 font-bold text-xl">
                        📋 G-code для: {gcodeData.partName}
                    </h2>
                </div>

                <div className="p-6 bg-blue-900 bg-opacity-30 border-b border-blue-400 m-6 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-blue-400 font-bold">📌 Назва балки:</span>
                            <span className="text-green-400 font-bold">{gcodeData.partName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-blue-400 font-bold">📏 Довжина:</span>
                            <span className="text-green-400 font-bold">{gcodeData.beamLength} мм</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-blue-400 font-bold">📐 Товщина балки:</span>
                            <span className="text-green-400 font-bold">{gcodeData.beamThickness} мм</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-blue-400 font-bold">🔪 Товщина пили:</span>
                            <span className="text-green-400 font-bold">{gcodeData.sawThickness} мм</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-blue-400 font-bold">⚙️ Швидкість обертання:</span>
                            <span className="text-green-400 font-bold">3000 об/хв</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-blue-400 font-bold">📊 Рядків коду:</span>
                            <span className="text-green-400 font-bold">{gcodeData.gcode.split('\n').length}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 max-h-96 overflow-y-auto">
                    <div className="bg-gray-950 border border-blue-400 rounded p-4 font-mono text-xs text-white whitespace-pre-wrap break-words">
                        {gcodeData.gcode}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end p-6 border-t border-blue-400 bg-gray-800">
                    <button
                        onClick={handleCopy}
                        className={`px-4 py-2 rounded font-bold transition-colors flex items-center justify-center gap-2 ${
                            copied
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {copied ? '✓ Скопійовано' : '📋 Копіювати'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        📥 Завантажити файл
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        ✕ Закрити
                    </button>
                </div>
            </div>
        </div>
    );
}