'use client'

import React from 'react';

export default function ScaleControls() {
    return (
        <div className="absolute bottom-4 right-4 z-40 bg-black bg-opacity-90 border-2 border-blue-400 p-4 rounded-lg text-white max-w-xs hidden md:block">
            <div className="text-xs font-bold mb-3 text-green-400">⚡ Поради:</div>

            <div className="space-y-2 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold">[1]</span>
                    <span>Активирует режим переміщення</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold">[2]</span>
                    <span>Активирует режим обертання</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold">[3]</span>
                    <span>Активирует режим масштабування</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold">[0]</span>
                    <span>Вимикає редагування</span>
                </div>
            </div>

            <div className="border-t border-blue-400 my-3" />

            <div className="text-xs text-gray-300">
                <div className="font-bold text-green-400 mb-2">🖱️ Миш:</div>
                <div className="space-y-1">
                    <div><span className="text-yellow-400">Середня кнопка</span> - Обертання камери</div>
                    <div><span className="text-yellow-400">Праве кл. + Драг</span> - Панування</div>
                    <div><span className="text-yellow-400">Скролл</span> - Масштабування сцени</div>
                </div>
            </div>

            <div className="border-t border-blue-400 my-3" />

            <div className="text-xs text-gray-300">
                <div className="font-bold text-green-400 mb-2">⚙️ Трансформація:</div>
                <div className="space-y-1">
                    <div>1. Вибирить режим редагування</div>
                    <div>2. Виберіть деталь в сцені</div>
                    <div>3. Використовуйте осі/стрілки миші</div>
                </div>
            </div>
        </div>
    );
}