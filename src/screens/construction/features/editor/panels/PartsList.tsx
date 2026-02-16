'use client'

import React, {useState} from 'react';
import {ConstructionMesh, PartsListProps} from "@/screens/construction/type/editor/ThreeMesh";
import LabelModal from "@/screens/construction/features/editor/modals/LabelModal";
import useModal from "@/hooks/useModal";
import {Tag, ChevronDown} from "lucide-react";
import {IConstruction} from "@/screens/construction/type/construction/IConstruction";
import {IOrder} from "@/screens/order/types/order/IOrder";
import {useConstructionDetails} from "@/screens/construction/hooks/construction-details/useConstructionDetails";
import {ConstructionDetail} from "@/screens/construction/type/construction-details/IConstructionDetail";

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
    const [expandedDetailId, setExpandedDetailId] = useState<number | null>(null);
    const labelModal = useModal();

    const { data: details = [] as ConstructionDetail[], isLoading: isLoadingDetails } = useConstructionDetails(construction.id);

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

    const getDetailByMeshName = (meshName: string): ConstructionDetail | undefined => {
        return details.find(detail => detail.name === meshName);
    };

    // const handleExportOperationGcode = (detail: ConstructionDetail, operation: any) => {
    //     const mesh = meshes.find(m => m.name === detail.name);
    //     if (mesh) {
    //         onExportGcode(mesh);
    //     }
    // };

    if (isLoadingDetails) {
        return (
            <div className="flex-1 flex flex-col bg-react/500 overflow-hidden border-t border-gray-700 p-4">
                <h2 className="text-blue-400 font-bold text-sm mb-3">📋 Деталі рамки</h2>
                <div className="text-gray-400 text-xs text-center py-8">
                    Завантаження деталей...
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-react/500 overflow-hidden border-t border-gray-700 p-4">
            <h2 className="text-blue-400 font-bold text-sm mb-3">📋 Деталі рамки</h2>

            <div className="flex-1 overflow-y-auto space-y-2">
                {meshes.length === 0 ? (
                    <div className="text-gray-400 text-xs text-center py-8">
                        Клацніть на деталь в 3D сцені
                    </div>
                ) : (
                    meshes.map((mesh, idx) => {
                        const detail = getDetailByMeshName(mesh.name);
                        const isExpanded = expandedDetailId === detail?.id;

                        return (
                            <div key={`${mesh.name}-${idx}`} className="space-y-1">
                                <div
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
                                                {mesh.name} {detail?.detailNo}
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

                                        {/*{detail && detail.operations.length > 0 && (*/}
                                        {/*    <button*/}
                                        {/*        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {*/}
                                        {/*            e.stopPropagation();*/}
                                        {/*            setExpandedDetailId(isExpanded ? null : detail.id);*/}
                                        {/*        }}*/}
                                        {/*        className="px-2 py-1 bg-purple/500 hover:bg-purple/600 text-white rounded text-xs font-bold transition-colors flex items-center gap-1"*/}
                                        {/*        title="Переглянути операції"*/}
                                        {/*    >*/}
                                        {/*        <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />*/}
                                        {/*        Операції ({detail.operations.length})*/}
                                        {/*    </button>*/}
                                        {/*)}*/}

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

                                {detail && isExpanded && detail.operations.length > 0 && (
                                    <div className="ml-4 space-y-1 bg-gray-700/30 rounded-lg p-2">
                                        <div className="text-xs font-semibold text-gray-300 mb-2 px-2">
                                            Операції:
                                        </div>
                                        {detail.operations.map((operation, opIdx) => (
                                            <div
                                                key={operation.id}
                                                className="bg-gray-700/50 hover:bg-gray-700 rounded p-2 transition-colors flex items-center justify-between gap-2"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-medium text-white">
                                                        {opIdx + 1}. {operation.title}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Тип: {operation.type}
                                                    </div>
                                                    {operation.isCompleted && (
                                                        <div className="text-xs text-green-400">
                                                            ✓ Виконано
                                                        </div>
                                                    )}
                                                </div>

                                                {/*{operation.cncPrograms.length > 0 && (*/}
                                                {/*    <button*/}
                                                {/*        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {*/}
                                                {/*            e.stopPropagation();*/}
                                                {/*            onExportGcode(mesh);*/}
                                                {/*        }}*/}
                                                {/*        className="px-2 py-1 bg-blue/500 hover:bg-blue/600 text-white rounded text-xs whitespace-nowrap flex-shrink-0"*/}
                                                {/*        title={`G-code для операції ${operation.title}`}*/}
                                                {/*    >*/}
                                                {/*        G-code ({operation.cncPrograms.length})*/}
                                                {/*    </button>*/}
                                                {/*)}*/}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
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