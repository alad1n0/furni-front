'use client'

import { ModalProps } from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import { cn } from "@/helpers/cn";
import React, { FC, useRef, useState } from "react";
import Button from "@/ui/button/Button";
import { Download, Printer } from 'lucide-react';
import Barcode from 'react-barcode';
import {
    downloadSingleLabel,
    generateLabelFileName,
    LabelData, printSingleLabel
} from "@/screens/construction/features/editor/utils/labelGenerator";
import toast from "react-hot-toast";
import {QRCodeSVG} from "qrcode.react";

type ILabelModalProps = ModalProps & {
    partName: string;
    clientName: string;
    constructionSize: string;
    serialNumber: string;
    orderNumber: string;
    detailNo: string;
}

const LabelModal: FC<ILabelModalProps> = ({partName, constructionSize, clientName, serialNumber, detailNo, orderNumber, ...props}) => {
    const labelRef = useRef<HTMLDivElement>(null);
    const [isDownloadingLabel, setIsDownloadingLabel] = useState(false);
    const [isPrintingLabel, setIsPrintingLabel] = useState(false);
    const today = new Date().toLocaleDateString('uk-UA');

    const buildLabelData = (): LabelData | null => {
        return {
            clientName: `${clientName}`,
            constructionSize: `${constructionSize}`,
            detailName: partName,
            serialNumber: `${serialNumber}`,
            detailNumber: detailNo,
            orderNumber: orderNumber
        };
    };

    const downloadLabel = async () => {
        const labelData = buildLabelData();
        if (!labelData) return;

        setIsDownloadingLabel(true);
        try {
            const fileName = generateLabelFileName(
                orderNumber,
                partName,
                detailNo,
                partName
            );

            await downloadSingleLabel(labelData, fileName);

            toast.success('Етикетка завантажена', {
                duration: 3000,
                position: 'top-right',
            });
        } catch (error) {
            console.error('Помилка при завантаженні етикетки:', error);
            toast.error('Помилка при завантаженні етикетки', {
                duration: 4000,
                position: 'top-right',
            });
        } finally {
            setIsDownloadingLabel(false);
        }
    };

    const handlePrintLabel = () => {
        const labelData = buildLabelData();
        if (!labelData) return;

        setIsPrintingLabel(true);
        try {
            printSingleLabel(labelData);
        } catch (error) {
            console.error('Помилка при друці етикетки:', error);
            toast.error('Помилка при друці етикетки', {
                duration: 4000,
                position: 'top-right',
            });
        } finally {
            setIsPrintingLabel(false);
        }
    };

    return (
        <Modal
            {...props}
            className={cn(
                'flex flex-col gap-2.5 max-w-[900px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
            )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                Етикетка деталі
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4 rounded-xl p-3'}>
                <div className="flex justify-center mb-4">
                    <div
                        ref={labelRef}
                        className="bg-white/600 rounded-[20px] p-8 shadow-lg"
                        style={{ width: '210mm', height: 'auto' }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-bold text-black/500">{clientName}</span>
                                    </div>

                                    <div>
                                        <span className="font-bold text-black/500">Номер Замовлення:</span>
                                        <span className="text-black/500"> {orderNumber}</span>
                                    </div>

                                    <div>
                                        <span className="font-bold text-black/500">Номер Деталі:</span>
                                        <span className="text-black/500"> {detailNo}</span>
                                    </div>

                                    <div>
                                        <span className="font-bold text-black/500">Деталь:</span>
                                        <span className="text-black/500"> {partName}</span>
                                    </div>

                                    <div>
                                        <span className="font-bold text-black/500">Розмір:</span>
                                        <span className="text-black/500"> {constructionSize}</span>
                                    </div>

                                    <div>
                                        <span className="font-bold text-black/500">Дата:</span>
                                        <span className="text-black/500"> {today}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center bg-white p-3"
                                style={{
                                    minHeight: '120px',
                                    minWidth: '220px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <QRCodeSVG
                                    value={`http://localhost:5173/order/${orderNumber}`}
                                    size={120}
                                    level="M"
                                />

                                <div className="text-black/500"> {serialNumber}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        type="button"
                        onClick={handlePrintLabel}
                        disabled={isPrintingLabel}
                        color="blue"
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        <Printer size={18} />
                        {isPrintingLabel ? 'Друкування...' : 'Роздрукувати'}
                    </Button>

                    <Button
                        type="button"
                        onClick={downloadLabel}
                        disabled={isDownloadingLabel}
                        color="greenDarkgreen"
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        {isDownloadingLabel ? 'Завантаження...' : 'Скачати PNG'}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default LabelModal;