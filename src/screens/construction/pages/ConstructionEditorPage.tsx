'use client'

import { useSearchParams, useNavigate } from 'react-router';
import ConstructionEditor from "@/screens/construction/features/editor/ConstructionEditor";
import {useConstruction} from "@/screens/construction/hooks/construction/useConstruction";

export default function ConstructionEditorPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const constructionId = Number(searchParams.get('id') ?? 0);
    const orderId = Number(searchParams.get('orderId') ?? 0);

    const { data: construction, isLoading, error } = useConstruction(constructionId);

    if (isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p>Завантаження редактора...</p>
                </div>
            </div>
        );
    }

    if (error || !construction) {
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
            orderId={orderId}
            onGoBack={() => navigate(`/order/${orderId}`)}
        />
    );
}