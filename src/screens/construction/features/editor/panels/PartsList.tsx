'use client'

import React, {useState} from 'react';
import {ConstructionMesh, PartsListProps} from "@/screens/construction/type/editor/ThreeMesh";
import LabelModal from "@/screens/construction/features/editor/modals/LabelModal";
import useModal from "@/hooks/useModal";
import {Tag, ChevronDown, Download} from "lucide-react";
import {IConstruction} from "@/screens/construction/type/construction/IConstruction";
import {IOrder} from "@/screens/order/types/order/IOrder";
import {useConstructionDetails} from "@/screens/construction/hooks/construction-details/useConstructionDetails";
import {ConstructionDetail} from "@/screens/construction/type/construction-details/IConstructionDetail";
import toast from "react-hot-toast";
import {useGcode} from "@/screens/construction/hooks/gcode/useGcode";

interface SelectedPart {
    name: string;
    index: number;
}

interface PartsListPropsExtended extends PartsListProps {
    construction: IConstruction;
    order: IOrder;
    onOpenGcodeModal?: (gcode: string, operationId: number, operationTitle: string) => void;
}

export default function PartsList({
                                      meshes,
                                      selectedMesh,
                                      onSelectMesh,
                                      construction,
                                      order,
                                      onOpenGcodeModal
                                  }: PartsListPropsExtended): React.ReactElement {
    const [selectedPart, setSelectedPart] = useState<SelectedPart | null>(null);
    const [expandedDetailId, setExpandedDetailId] = useState<number | null>(null);
    const [loadingOperationId, setLoadingOperationId] = useState<number | null>(null);
    const labelModal = useModal();

    const { data: details = [] as ConstructionDetail[], isLoading: isLoadingDetails } = useConstructionDetails(construction.id);
    const { mutateAsync: downloadGCode } = useGcode();

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

    const handleOpenGcodeInModal = async (operationId: number, operationTitle: string) => {
        try {
            setLoadingOperationId(operationId);
            const gcode = await downloadGCode(operationId);

            if (onOpenGcodeModal) {
                onOpenGcodeModal(gcode, operationId, operationTitle);
            }
        } catch (error) {
            console.error('Error loading G-Code:', error);
        } finally {
            setLoadingOperationId(null);
        }
    };

    if (isLoadingDetails) {
        return (
            <div className="flex-1 flex flex-col bg-react/500 border-t border-gray-700 p-4">
                <h2 className="text-blue-400 font-bold text-sm mb-3">📋 Деталі рамки</h2>
                <div className="text-gray-400 text-xs text-center py-8">
                    Завантаження деталей...
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-react/500 border-t border-gray-700 p-4">
            <h2 className="text-blue-400 font-bold text-sm mb-3">📋 Деталі рамки</h2>

            <div className="flex-1 space-y-2">
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
                                            {detail?.detailNo}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">
                                                {mesh.name}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 flex-shrink-0">
                                        {detail && detail.operations.length > 0 && (
                                            <button
                                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                    e.stopPropagation();
                                                    setExpandedDetailId(isExpanded ? null : detail.id);
                                                }}
                                                className="px-2 py-1 bg-emerald/500 hover:bg-emerald/600 text-white rounded text-xs font-bold transition-colors flex items-center gap-1"
                                                title="Переглянути операції"
                                            >
                                                <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                Операції ({detail.operations.length})
                                            </button>
                                        )}

                                        {detail && detail.requiresLabel && (
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
                                        )}
                                    </div>
                                </div>

                                {detail && isExpanded && detail.operations.length > 0 && (
                                    <div className="rounded-lg border border-gray-700/50 overflow-hidden">
                                        <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 px-3 py-2 border-b border-gray-700/50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                                <span className="text-xs font-semibold text-gray-200">
                                                    Операції ({detail.operations.length})
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-2 space-y-2">
                                            {detail.operations.map((operation) => {
                                                const hasGcode = operation.cncPrograms;
                                                const isLoading = loadingOperationId === operation.id;

                                                return (
                                                    <div
                                                        key={operation.id}
                                                        className="bg-gray-700/30 hover:bg-gray-700/50 rounded-lg p-3 transition-all duration-200 border border-transparent hover:border-gray-600/50"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1.5">
                                                                    <h4 className="text-xs font-semibold text-white truncate">
                                                                        {operation.title}
                                                                    </h4>
                                                                </div>

                                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                                    <span className="text-[10px] text-gray-400">Тип:</span>
                                                                    <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-medium">
                                                                        {operation.type}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {hasGcode && (
                                                                <button
                                                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                                        e.stopPropagation();
                                                                        handleOpenGcodeInModal(operation.id, operation.title);
                                                                    }}
                                                                    disabled={isLoading}
                                                                    className="flex-shrink-0 px-3 py-1.5 bg-emerald/500 hover:bg-emerald/600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1.5"
                                                                    title={`Переглянути G-code для ${operation.title}`}
                                                                >
                                                                    <Download className="w-3 h-3" />
                                                                    {isLoading ? 'Завантаж...' : 'G-code'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
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