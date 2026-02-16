import React, { FC } from "react";
import { Check, ChevronDown, ChevronUp, Download, Barcode, FileCode } from "lucide-react";
import { useState } from "react";
import { cn } from "@/helpers/cn";
import Loading from "@/ui/loading/Loading";
import { ConstructionDetail } from "@/screens/construction/type/construction-details/IConstructionDetail";
import { formatDateTime } from "@/utils/time/formatDateTime";
import { useConstructionDetails } from "@/screens/construction/hooks/construction-details/useConstructionDetails";

interface ConstructionDetailsViewProps {
    constructionId: number;
    className?: string;
    onOperationComplete?: (operationId: number, detailId: number) => Promise<void>;
    onDetailComplete?: (detailId: number) => Promise<void>;
    onDownloadBarcode?: (detailId: number) => Promise<void>;
    onDownloadGCode?: (operationId: number, detailId: number) => Promise<void>;
    onDownloadAllGCode?: (detailId: number) => Promise<void>;
}

const ConstructionDetailsView: FC<ConstructionDetailsViewProps> = ({constructionId, className, onOperationComplete, onDetailComplete, onDownloadBarcode, onDownloadGCode, onDownloadAllGCode,}) => {
    const { data: details, isPending, isError, error } = useConstructionDetails(constructionId);
    const [expandedDetails, setExpandedDetails] = useState<Set<number>>(new Set());
    const [loadingOperations, setLoadingOperations] = useState<Set<number>>(new Set());
    const [loadingDetails, setLoadingDetails] = useState<Set<number>>(new Set());

    const toggleDetail = (detailId: number) => {
        const newExpanded = new Set(expandedDetails);
        if (newExpanded.has(detailId)) {
            newExpanded.delete(detailId);
        } else {
            newExpanded.add(detailId);
        }
        setExpandedDetails(newExpanded);
    };

    const getTypeColor = (type: string) => {
        const colorMap: Record<string, string> = {
            profile: 'bg-blue/50 text-blue/600 border-blue/200',
            glass: 'bg-emerald/50 text-emerald/600 border-emerald/500',
            handle: 'bg-green-primary/50 text-green-dark/600 border-green-secondary/600',
        };

        return colorMap[type.toLowerCase()]
            || 'bg-gray/100 text-black/500 border-gray/200';
    };

    const getOperationTypeColor = (type: string) => {
        const colorMap: Record<string, string> = {
            cutting: 'bg-red-error/50 border-red/500 text-red-dark/600',
            drilling: 'bg-yellow-attentiom/50 border-yellow/700 text-yellow/800',
            mill: 'bg-emerald/50 border-emerald/600 text-emerald/600',
        };

        return colorMap[type.toLowerCase()]
            || 'bg-gray/100 border-gray/300 text-black/500';
    };

    const calculateDetailProgress = (detail: ConstructionDetail): number => {
        if (detail.operations.length === 0) return 0;
        const completedOps = detail.operations.filter(op => op.isCompleted).length;
        return Math.round((completedOps / detail.operations.length) * 100);
    };

    const getProgressColor = (progress: number) => {
        if (progress === 0) return 'bg-gray-400';
        if (progress < 33) return 'bg-red/500';
        if (progress < 66) return 'bg-yellow-attentiom/50';
        if (progress < 100) return 'bg-blue/400';
        return 'bg-emerald/500';
    };

    const handleOperationComplete = async (operationId: number, detailId: number) => {
        if (!onOperationComplete) return;

        setLoadingOperations(prev => new Set([...prev, operationId]));
        try {
            await onOperationComplete(operationId, detailId);
        } catch (error) {
            console.error('Error completing operation:', error);
        } finally {
            setLoadingOperations(prev => {
                const newSet = new Set(prev);
                newSet.delete(operationId);
                return newSet;
            });
        }
    };

    const handleDetailComplete = async (detailId: number) => {
        if (!onDetailComplete) return;

        setLoadingDetails(prev => new Set([...prev, detailId]));
        try {
            await onDetailComplete(detailId);
        } catch (error) {
            console.error('Error completing detail:', error);
        } finally {
            setLoadingDetails(prev => {
                const newSet = new Set(prev);
                newSet.delete(detailId);
                return newSet;
            });
        }
    };

    const handleDownloadBarcode = async (detailId: number) => {
        if (!onDownloadBarcode) return;

        try {
            await onDownloadBarcode(detailId);
        } catch (error) {
            console.error('Error downloading barcode:', error);
        }
    };

    const handleDownloadGCode = async (operationId: number, detailId: number) => {
        if (!onDownloadGCode) return;

        try {
            await onDownloadGCode(operationId, detailId);
        } catch (error) {
            console.error('Error downloading G-Code:', error);
        }
    };

    const handleDownloadAllGCode = async (detailId: number) => {
        if (!onDownloadAllGCode) return;

        try {
            await onDownloadAllGCode(detailId);
        } catch (error) {
            console.error('Error downloading all G-Code:', error);
        }
    };

    if (isPending) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loading />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Error loading construction details</p>
                <p className="text-sm text-red-600 mt-1">{error?.message}</p>
            </div>
        );
    }

    if (!details || details.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">No construction details found</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("space-y-3", className)}>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900">
                    Construction Details ({details.length} items)
                </h3>
            </div>

            {details.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br flex items-center justify-between from-emerald-50 to-emerald-100/50 rounded-lg p-3 border border-emerald-200">
                        <p className="text-xs text-gray-600 font-medium">Completed Details</p>
                        <p className="text-xl font-bold text-emerald-700">
                            {details.filter(d => d.isCompleted).length}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br flex items-center justify-between from-blue-50 to-blue-100/50 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-gray-600 font-medium">Total Operations</p>
                        <p className="text-xl font-bold text-blue-700">
                            {details.reduce((sum, d) => sum + d.operations.length, 0)}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br flex items-center justify-between from-purple-50 to-purple-100/50 rounded-lg p-3 border border-purple-200">
                        <p className="text-xs text-gray-600 font-medium">Overall Progress</p>
                        <p className="text-xl font-bold text-purple-700">
                            {Math.round(
                                (details.filter(d => d.isCompleted).length / details.length) * 100
                            )}%
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {details.map((detail) => {
                    const isExpanded = expandedDetails.has(detail.id);
                    const progress = calculateDetailProgress(detail);
                    const isDetailLoading = loadingDetails.has(detail.id);

                    return (
                        <div
                            key={detail.id}
                            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <button
                                onClick={() => toggleDetail(detail.id)}
                                className="w-full p-3 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                            >
                                <div className="flex gap-2 flex-1 min-w-0">
                                    <div
                                        className={cn(
                                            "flex-shrink-0 w-[26px] h-[26px] rounded-full flex items-center justify-center border-2 transition-colors",
                                            detail.isCompleted
                                                ? 'bg-emerald/500 border-emerald/600'
                                                : 'bg-gray/200 opacity-20 border-gray/300'
                                        )}
                                    >
                                        {detail.isCompleted && (
                                            <Check size={16} className="text-white/600" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        "text-xs px-2 py-1 rounded-full border font-medium",
                                                        getTypeColor(detail.type)
                                                    )}
                                                >
                                                    {detail.type}
                                                </span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    Detail Number {detail.detailNo}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-600">
                                                    {detail.name}
                                                </span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {detail.length} mm
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex-1 bg-react/400 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-300",
                                                        getProgressColor(progress)
                                                    )}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                                                {progress}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-shrink-0 ml-4">
                                    {isExpanded ? (
                                        <ChevronUp size={20} />
                                    ) : (
                                        <ChevronDown size={20} />
                                    )}
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="border-t border-gray-200 p-4 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex gap-2 flex-wrap">
                                            {onDownloadBarcode && (
                                                <button
                                                    onClick={() => handleDownloadBarcode(detail.id)}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                        "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                                                    )}
                                                >
                                                    <Barcode size={16} />
                                                    Download Barcode
                                                </button>
                                            )}

                                            {onDownloadAllGCode && detail.operations.length > 0 && (
                                                <button
                                                    onClick={() => handleDownloadAllGCode(detail.id)}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                        "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                                                    )}
                                                >
                                                    <FileCode size={16} />
                                                    All G-Code ({detail.operations.length})
                                                </button>
                                            )}

                                            {onDetailComplete && !detail.isCompleted && (
                                                <button
                                                    onClick={() => handleDetailComplete(detail.id)}
                                                    disabled={isDetailLoading}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                        "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
                                                        isDetailLoading && "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    <Check size={16} />
                                                    Mark Detail Complete
                                                </button>
                                            )}
                                        </div>
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
                                                                    {onDownloadGCode && (
                                                                        <button
                                                                            onClick={() => handleDownloadGCode(operation.id, detail.id)}
                                                                            className={cn(
                                                                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
                                                                                "bg-white/20 hover:bg-white/30 text-gray-900"
                                                                            )}
                                                                        >
                                                                            <Download size={14} />
                                                                            G-Code
                                                                        </button>
                                                                    )}

                                                                    {onOperationComplete && !operation.isCompleted && (
                                                                        <button
                                                                            onClick={() => handleOperationComplete(operation.id, detail.id)}
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
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ConstructionDetailsView;