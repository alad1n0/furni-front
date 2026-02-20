'use client'

import { ModalProps } from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import { cn } from "@/helpers/cn";
import React, { FC, useState } from "react";
import { Check, Download, Barcode, FileCode } from "lucide-react";
import Loading from "@/ui/loading/Loading";
import { formatDateTime } from "@/utils/time/formatDateTime";
import { useConstructionDetails } from "@/screens/construction/hooks/construction-details/useConstructionDetails";
import {DetailType, OperationType} from "@/screens/construction/type/construction/IConstruction";

type IConstructionDetailModal = ModalProps & {
    constructionId: number | null;
    detailId: number | null;
    onOperationComplete: (operationId: number, detailId: number) => Promise<void>;
    onDetailComplete: (detailId: number) => Promise<void>;
    onDownloadLabelByDetails: (detailId: number) => Promise<void>;
    onDownloadBarcode: (detailId: number) => Promise<void>;
    onDownloadGCode: (operationId: number) => Promise<void>;
    onDownloadAllGCode: (detailId: number) => Promise<void>;
}

const ConstructionDetailModal: FC<IConstructionDetailModal> = ({constructionId, detailId, onOperationComplete, onDetailComplete, onDownloadBarcode, onDownloadGCode, onDownloadLabelByDetails, onDownloadAllGCode, ...props}) => {
    const { data: details, isPending } = useConstructionDetails(constructionId || 0);
    const [loadingOperations, setLoadingOperations] = useState<Set<number>>(new Set());
    const [loadingDetail, setLoadingDetail] = useState(false);

    const detail = details?.find(d => d.id === detailId);

    const getTypeColor = (type: DetailType): string => {
        const colorMap: Record<DetailType, string> = {
            [DetailType.PROFILE]: 'bg-blue/50 text-blue/600 border-blue/200',
            [DetailType.GLASS]:   'bg-emerald/50 text-emerald/600 border-emerald/500',
            [DetailType.HANDLE]:  'bg-green-primary/50 text-green-dark/600 border-green-secondary/600',
            [DetailType.OTHER]:   'bg-gray/100 text-black/500 border-gray/200',
        };
        return colorMap[type];
    };

    const getOperationTypeColor = (type: OperationType): string => {
        const colorMap: Record<OperationType, string> = {
            [OperationType.CUT]:          'bg-red-error/50 border-red/500 text-black/600',
            [OperationType.DRILL]:        'bg-yellow-attentiom/50 border-yellow/700 text-black/600',
            [OperationType.MILL]:         'bg-emerald/50 border-emerald/600 text-black/600',
            [OperationType.HANDLE_MILL]:  'bg-green-primary/50 border-green-secondary/600 text-black/600',
            [OperationType.HANDLE_DRILL]: 'bg-yellow-attentiom/50 border-yellow/700 text-black/600',
            [OperationType.ASSEMBLY]:     'bg-blue/50 border-blue/400 text-black/600',
            [OperationType.OTHER]:        'bg-gray/100 border-gray/300 text-black/600',
        };
        return colorMap[type];
    };

    const handleOperationComplete = async (operationId: number) => {
        if (!detailId) return;
        setLoadingOperations(prev => new Set([...prev, operationId]));
        try {
            await onOperationComplete(operationId, detailId);
        } finally {
            setLoadingOperations(prev => {
                const newSet = new Set(prev);
                newSet.delete(operationId);
                return newSet;
            });
        }
    };

    const handleDetailComplete = async () => {
        if (!detailId) return;
        setLoadingDetail(true);
        try {
            await onDetailComplete(detailId);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleLabelByDetailDownload = async () => {
        if (!detailId) return;
        setLoadingDetail(true);
        try {
            await onDownloadLabelByDetails(detailId);
        } finally {
            setLoadingDetail(false);
        }
    };

    if (!constructionId || !detailId) return null;

    return (
        <Modal
            {...props}
            className={cn(
                'flex flex-col gap-2.5 max-w-[900px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
            )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                Detail Information
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4 rounded-xl p-3'}>
                {isPending ? (
                    <div className="flex justify-center items-center h-48">
                        <Loading />
                    </div>
                ) : detail ? (
                    <div className="space-y-4">
                        <div className="rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <span
                                    className={cn(
                                        "text-xs px-3 py-1.5 rounded-full border font-medium",
                                        getTypeColor(detail.type)
                                    )}
                                >
                                    {detail.type}
                                </span>
                                <span className="text-lg font-bold text-gray-900">
                                    Detail Number {detail.detailNo}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold text-gray-700">
                                    {detail.name}
                                </span>
                                {detail.type === DetailType.PROFILE && detail.length != null && (
                                    <span className="text-sm font-bold text-gray-900">
                                        {detail.length} mm
                                    </span>
                                )}
                                {detail.type === DetailType.GLASS && detail.area != null && (
                                    <span className="text-sm font-bold text-gray-900">
                                        {detail.area} m²
                                    </span>
                                )}
                                {detail.type === DetailType.HANDLE && detail.handleOffset != null && (
                                    <span className="text-sm font-bold text-gray-900">
                                        {detail.handleOffset} mm
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {detail.requiresLabel && (
                                <button
                                    onClick={() => onDownloadBarcode(detail.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                                    )}
                                >
                                    <Barcode size={16} />
                                    Download Barcode
                                </button>
                            )}

                            {detail.operations.length > 0 && (
                                <button
                                    onClick={() => onDownloadAllGCode(detail.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                                    )}
                                >
                                    <FileCode size={16} />
                                    All G-Code ({detail.operations.length})
                                </button>
                            )}

                            <button
                                onClick={handleDetailComplete}
                                disabled={loadingDetail || detail.isCompleted}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    detail.isCompleted
                                        ? "bg-emerald/500 text-emerald/50 border border-emerald/600 hover:bg-emerald/500 opacity-75 cursor-default"
                                        : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
                                    (loadingDetail && !detail.isCompleted) && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <Check size={16} />
                                {detail.isCompleted ? 'Detail Completed' : 'Mark Detail Complete'}
                            </button>

                            {detail.requiresLabel && (
                                <button
                                    onClick={handleLabelByDetailDownload}
                                    disabled={loadingDetail || detail.isDownloadLabel}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        detail.isDownloadLabel
                                            ? "bg-emerald/500 text-emerald/50 border border-emerald/600 hover:bg-emerald/500 opacity-75 cursor-default"
                                            : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
                                        (loadingDetail && !detail.isDownloadLabel) && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <Check size={16} />
                                    {detail.isDownloadLabel ? 'Label Downloaded' : 'Download Label'}
                                </button>
                            )}
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                Operations ({detail.operations.length})
                            </p>
                            {detail.operations.length > 0 ? (
                                <div className="space-y-2">
                                    {detail.operations.map((operation) => {
                                        const isOperationLoading = loadingOperations.has(operation.id);

                                        return (
                                            <div
                                                key={operation.id}
                                                className={cn(
                                                    "p-3 rounded-lg border transition-all",
                                                    getOperationTypeColor(operation.type),
                                                    operation.isCompleted && 'opacity-75'
                                                )}
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                {operation.isCompleted && (
                                                                    <Check size={14} className="text-green-600 flex-shrink-0" />
                                                                )}
                                                                <span className="text-xs font-bold text-gray-900">
                                                                    {operation.type}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-800 mt-1">
                                                                {operation.title}
                                                            </p>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            {operation.isCompleted && operation.completedAt && (
                                                                <p className="text-xs text-gray-600">
                                                                    {formatDateTime(operation.completedAt)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 flex-wrap pt-2 border-t border-white/20">
                                                        <button
                                                            onClick={() => onDownloadGCode(operation.id)}
                                                            className={cn(
                                                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
                                                                "bg-white/20 hover:bg-white/30 text-gray-900"
                                                            )}
                                                        >
                                                            <Download size={14} />
                                                            G-Code
                                                        </button>

                                                        {!operation.isCompleted && (
                                                            <button
                                                                onClick={() => handleOperationComplete(operation.id)}
                                                                disabled={isOperationLoading}
                                                                className={cn(
                                                                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
                                                                    "bg-white/20 hover:bg-white/30 text-gray-900",
                                                                    isOperationLoading && "opacity-50 cursor-not-allowed"
                                                                )}
                                                            >
                                                                <Check size={14} />
                                                                {isOperationLoading ? 'Saving...' : 'Done'}
                                                            </button>
                                                        )}

                                                        {operation.isCompleted && (
                                                            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-green-100/50 text-green-700">
                                                                <Check size={14} />
                                                                Completed
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No operations assigned</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Detail not found</p>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ConstructionDetailModal;