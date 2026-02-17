'use client'

import {ModalProps} from "@/hooks/useModal/useModal";
import React, { useState } from 'react';
import Modal from "@/ui/Modal/Modal";
import { cn } from "@/helpers/cn";
import Button from "@/ui/button/Button";
import {Copy, Download} from "lucide-react";
import {GcodeData} from "@/screens/construction/type/editor/ThreeMesh";

type GcodeModalProps = ModalProps & {
    gcodeData: GcodeData;
}

export default function GcodeModal({ gcodeData, ...props }: GcodeModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(gcodeData.gcode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDownload = () => {
        const element = document.createElement('a');
        element.setAttribute(
            'href',
            'data:text/plain;charset=utf-8,' + encodeURIComponent(gcodeData.gcode)
        );
        element.setAttribute(
            'download',
            `${gcodeData.partName}_${gcodeData.beamLength}x${gcodeData.beamThickness}.cnc`
        );
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <Modal {...props} className={cn(
            'flex flex-col gap-2.5 max-w-[700px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
        )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                G-code для: {gcodeData.partName}
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4 rounded-xl p-3'}>
                <div className="max-h-96 border border-blue-400 rounded overflow-y-auto">
                    <div className="bg-gray-950 p-4 font-mono text-xs text-white whitespace-pre-wrap break-words">
                        {gcodeData.gcode}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <Button
                        type="button"
                        onClick={handleCopy}
                        color="blue"
                        className="flex-1"
                    >
                        <Copy />  {copied ?  'Скопійовано' : 'Копіювати'}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleDownload}
                        color="greenDarkgreen"
                        className="flex-1"
                    >
                        <Download /> Завантажити файл
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
}