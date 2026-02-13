'use client'

import React, {useState} from 'react';
import {ConstructionMesh, PartsListProps} from "@/screens/construction/type/editor/ThreeMesh";
import LabelModal from "@/screens/construction/features/editor/modals/LabelModal";
import useModal from "@/hooks/useModal";
import {Tag} from "lucide-react";
import {IConstruction} from "@/screens/construction/type/construction/IConstruction";
import {IOrder} from "@/screens/order/types/order/IOrder";

interface SelectedPart {
    name: string;
    index: number;
}

interface PartsListPropsExtended extends PartsListProps {
    construction: IConstruction;
    order: IOrder;
}

export default function PartsList({meshes, selectedMesh, onSelectMesh, onExportGcode, construction, order}: PartsListPropsExtended): React.ReactElement {
    const [selectedPart, setSelectedPart] = useState<SelectedPart | null>(null);
    const labelModal = useModal();

    const getClientName = (): string => {
        return `${order.client.firstName} ${order.client.lastName}`
    }

    const getConstructionSize = (): string => {
        return `${construction.width} × ${construction.height} мм`;
    };

    const openLabelModal = (mesh: ConstructionMesh, index: number) => {
        setSelectedPart({
            name: mesh.name,
            index
        });
        labelModal.onOpen();
    };

    return (
        <div className="flex-1 flex flex-col bg-react/500 overflow-hidden border-t border-gray-700 p-4">
            <h2 className="text-blue-400 font-bold text-sm mb-3">📋 Деталі рамки</h2>

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
                                <div className="w-6 h-6 rounded-full text-black flex items-center justify-center font-bold text-xs flex-shrink-0">
                                    {idx + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                        {mesh.name}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 flex-shrink-0">
                                <button
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.stopPropagation();
                                        openLabelModal(mesh, idx);
                                    }}
                                    className="px-2 py-1 bg-blue/400 hover:bg-blue/600 text-white rounded text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1"
                                    title={`Етикетка для ${mesh.name}`}
                                >
                                    <Tag size={14} />
                                    Етикетка
                                </button>

                                <button
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.stopPropagation();
                                        onExportGcode(mesh);
                                    }}
                                    className="px-2 py-1 bg-emerald/500 hover:bg-emerald/600 text-white rounded text-xs font-bold transition-colors whitespace-nowrap"
                                    title={`Експортувати G-code для ${mesh.name}`}
                                >
                                    G-code
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedPart && (
                <LabelModal
                    {...labelModal}
                    open={labelModal.open}
                    onClose={labelModal.onClose}
                    partName={selectedPart.name}
                    clientName={getClientName()}
                    constructionSize={getConstructionSize()}
                    serialNumber={order.orderNumber}
                    orderNumber={order.orderNumber}
                />
            )}
        </div>
    );
}