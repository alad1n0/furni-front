'use client'

import { useSearchParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import ConstructionEditor from "@/screens/construction/features/editor/ConstructionEditor";
import { useConstruction } from "@/screens/construction/hooks/construction/useConstruction";
import { useOrderDetails } from "@/screens/order/hooks/order/useOrderDetails";

export default function ConstructionEditorPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const constructionId = Number(searchParams.get('id') ?? 0);
    const orderId = Number(searchParams.get('orderId') ?? 0);

    const { data: construction, isLoading, error, refetch } = useConstruction(constructionId);
    const { data: orderDetails, isLoading: isLoadingOrderDetails } = useOrderDetails(orderId);

    const [showEditor, setShowEditor] = useState(false);

    useEffect(() => {
        refetch();
    }, [constructionId, refetch]);

    useEffect(() => {
        if (!isLoading && !isLoadingOrderDetails && construction && orderDetails) {
            const timer = setTimeout(() => {
                setShowEditor(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isLoading, isLoadingOrderDetails, construction, orderDetails]);

    if (isLoading || isLoadingOrderDetails || !showEditor) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-white opacity-75 border-dashed rounded-full animate-spin-slow mx-auto mb-4"></div>
                    <p>Завантаження редактора...</p>
                </div>
            </div>
        );
    }

    if (error || !construction || !orderDetails) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-center">
                    <p className="text-red-500 mb-4">Помилка при завантаженні конструкції</p>
                    <button
                        onClick={() => navigate(`/order/${orderId}`)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
                    >
                        Повернутися до замовлення
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ConstructionEditor
            construction={construction}
            order={orderDetails}
            onGoBack={() => navigate(`/order/${orderId}`)}
        />
    );
}
