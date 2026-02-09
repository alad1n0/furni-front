'use client'

import React from 'react';
import { PartsListProps } from "@/screens/construction/type/editor/three-mesh";

export default function PartsList({meshes, selectedMesh, onSelectMesh, onExportGcode}: PartsListProps): React.ReactElement {
    return (
        <div className="flex-1 flex flex-col bg-react/500 overflow-hidden border-t border-gray-700 p-4">
            <h2 className="text-blue-400 font-bold text-sm mb-3">📋 Порядок обробки</h2>

            <div className="flex-1 overflow-y-auto space-y-2">
                {meshes.length === 0 ? (
                    <div className="text-gray-400 text-xs text-center py-8">
                        Клацніть на деталь в 3D сцені
                    </div>
                ) : (
                    meshes.map((mesh, idx) => (
                        <div
                            key={`${mesh.name}-${idx}`}
                            className={`p-3 rounded-[10px] cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                                selectedMesh?.name === mesh.name
                                    ? 'bg-react/400 border hover:border-gray-700 text-white'
                                    : 'text-gray-200 hover:border hover:border-gray-700'
                            }`}
                            onClick={() => onSelectMesh(mesh)}
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-orange-500 text-black flex items-center justify-center font-bold text-xs flex-shrink-0">
                                    {idx + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                        {mesh.name}
                                    </div>
                                    {/*<div className="text-xs text-gray-300">*/}
                                    {/*    {mesh.position?.x.toFixed(1) || 0}x*/}
                                    {/*    {mesh.position?.y.toFixed(1) || 0}x*/}
                                    {/*    {mesh.position?.z.toFixed(1) || 0}*/}
                                    {/*</div>*/}
                                </div>
                            </div>

                            <button
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation();
                                    onExportGcode(mesh);
                                }}
                                className="px-2 py-1 bg-emerald/500 hover:bg-emerald/600 text-white rounded text-xs font-bold transition-colors whitespace-nowrap flex-shrink-0"
                                title={`Експортувати G-code для ${mesh.name}`}
                            >
                                G-code
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}