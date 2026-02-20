import React, { FC } from "react";
import {Check, Download} from "lucide-react";
import { cn } from "@/helpers/cn";
import Loading from "@/ui/loading/Loading";
import { ConstructionDetail } from "@/screens/construction/type/construction-details/IConstructionDetail";
import { useConstructionDetails } from "@/screens/construction/hooks/construction-details/useConstructionDetails";
import {DetailType} from "@/screens/construction/type/construction/IConstruction";
import {formatDateTime} from "@/utils/time/formatDateTime";

interface ConstructionDetailsViewProps {
    constructionId: number;
    className?: string;
    onDetailClick?: (detailId: number) => void;
}

const ConstructionDetailsView: FC<ConstructionDetailsViewProps> = ({constructionId, className, onDetailClick}) => {
    const { data: details, isPending, isError, error } = useConstructionDetails(constructionId);

    const getTypeColor = (type: DetailType): string => {
        const colorMap: Record<DetailType, string> = {
            [DetailType.PROFILE]: 'bg-blue/50 text-blue/600 border-blue/200',
            [DetailType.GLASS]:   'bg-emerald/50 text-emerald/600 border-emerald/500',
            [DetailType.HANDLE]:  'bg-green-primary/50 text-green-dark/600 border-green-secondary/600',
            [DetailType.OTHER]:   'bg-gray/100 text-black/500 border-gray/200',
        };
        return colorMap[type];
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
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg p-3">
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
                    const progress = calculateDetailProgress(detail);

                    return (
                        <button
                            key={detail.id}
                            onClick={() => onDetailClick?.(detail.id)}
                            className="w-full bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow p-3 hover:bg-gray-50"
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
                                            <span className={cn("text-xs px-2 py-1 rounded-full border font-medium", getTypeColor(detail.type))}>
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
                                            {detail.type === DetailType.PROFILE && detail.length != null && (
                                                <span className="text-sm font-bold text-gray-900">
                                                    {detail.length} mm
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {detail.operations.length > 0 && (
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
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ConstructionDetailsView;