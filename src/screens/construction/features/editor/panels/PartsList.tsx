'use client'

import React from 'react';
import {PartsListProps} from "@/screens/construction/type/editor/three-mesh";

export default function PartsList({meshes, selectedMesh, onSelectMesh, onExportGcode}: PartsListProps): React.ReactElement {
    return (
        <div className="fixed bottom-4 left-4 z-40 bg-black bg-opacity-85 border-2 border-blue-400 p-3 rounded-lg max-w-sm max-h-80 overflow-y-auto text-white">
            <div className="font-bold mb-3 text-sm">📋 Порядок обробки:</div>

            {meshes.length === 0 ? (
                <div className="text-gray-400 text-xs">Клацніть на частину</div>
            ) : (
                meshes.map((mesh, idx) => (
                    <div
                        key={`${mesh.name}-${idx}`}
                        className={`p-2 mb-1 rounded cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                            selectedMesh?.name === mesh.name
                                ? 'bg-blue-400 text-black font-bold'
                                : 'bg-blue-400 bg-opacity-20 hover:bg-opacity-40'
                        }`}
                    >
                        <div className="flex items-center gap-2 flex-1">
                            <div className="w-5 h-5 rounded-full bg-orange-500 text-black flex items-center justify-center font-bold text-xs">
                                {idx + 1}
                            </div>

                            <span
                                className="text-xs flex-1 cursor-pointer"
                                onClick={() => onSelectMesh(mesh)}
                                title={mesh.name}
                            >
                                {mesh.name}
                            </span>
                        </div>

                        <button
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                onExportGcode(mesh);
                            }}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors whitespace-nowrap"
                            title={`Експортувати G-code для ${mesh.name}`}
                        >
                            G-code
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}