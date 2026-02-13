'use client'

import { ModalProps } from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import { cn } from "@/helpers/cn";
import React, { FC, useRef } from "react";
import Button from "@/ui/button/Button";
import { Download } from 'lucide-react';
import Barcode from 'react-barcode';

type ILabelModalProps = ModalProps & {
    partName: string;
    clientName: string;
    constructionSize: string;
    serialNumber: string;
    orderNumber?: string;
}

const LabelModal: FC<ILabelModalProps> = ({partName, constructionSize, clientName, serialNumber, orderNumber, ...props}) => {
    const labelRef = useRef<HTMLDivElement>(null);
    const today = new Date().toLocaleDateString('uk-UA');

    const downloadLabel = async () => {
        if (!labelRef.current) return;

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(labelRef.current as HTMLElement, {
                scale: 3,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false
            });

            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `label_${orderNumber || 'order'}_${partName.replace(/\s+/g, '_')}_${serialNumber}.png`;
            link.click();
        } catch (error) {
            console.error('Помилка при скачуванні етикетки:', error);
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
                                        <span className="font-bold text-black/500">Система:</span>
                                        <span className="text-black/500"> SlimLine</span>
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

                            <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                <div
                                    className="flex items-center justify-center bg-white p-3"
                                    style={{
                                        minHeight: '140px',
                                        minWidth: '220px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Barcode
                                        value={serialNumber}
                                        format="CODE128"
                                        width={2}
                                        height={80}
                                        displayValue={true}
                                        fontSize={14}
                                        margin={8}
                                        lineColor="#000000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        type="button"
                        onClick={props.onClose}
                        color="red"
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        Закрити
                    </Button>

                    <Button
                        type="button"
                        onClick={downloadLabel}
                        color="greenDarkgreen"
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        Скачати PNG
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default LabelModal;