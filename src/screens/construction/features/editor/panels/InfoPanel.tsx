'use client'

import React from 'react';
import { InfoPanelProps } from "@/screens/construction/type/editor/three-mesh";

export default function InfoPanel({ text }: InfoPanelProps) {
    return (
        <div className="absolute top-4 left-4 z-30 bg-black bg-opacity-80 text-white p-4 rounded-lg max-h-64 overflow-y-auto font-mono text-xs whitespace-pre-wrap border border-blue-400">
            {text}
        </div>
    );
}