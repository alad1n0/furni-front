'use client'

import React from 'react';
import {InfoPanelProps} from "@/screens/construction/type/editor/three-mesh";

export default function InfoPanel({ text }: InfoPanelProps) {
    return (
        <div className="fixed top-4 left-4 z-30 bg-black bg-opacity-70 text-white p-3 rounded-lg max-h-96 overflow-y-auto font-mono text-xs whitespace-pre-wrap">
            {text}
        </div>
    );
}