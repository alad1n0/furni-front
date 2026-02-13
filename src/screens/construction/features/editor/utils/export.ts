import * as THREE from 'three';
import React from "react";

export const exportToGLB = async (groupRef: React.MutableRefObject<THREE.Group | null>, filename: string = 'model.glb') => {
    if (!groupRef.current) {
        console.error('❌ Group is empty');
        return;
    }

    try {
        const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
        const exporter = new GLTFExporter();

        exporter.parse(
            groupRef.current,
            (result: ArrayBuffer | object) => {
                if (result instanceof ArrayBuffer) {
                    const blob = new Blob([result], { type: 'application/octet-stream' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;

                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    URL.revokeObjectURL(url);
                    console.log(`✅ "${filename}" завантажено успішно!`);
                } else {
                    console.error('❌ Очікував ArrayBuffer, але отримав JSON');
                }
            },
            (error: unknown) => {
                console.error('❌ Помилка:', error);
            },
            { binary: true }
        );
    } catch (error) {
        console.error('❌ Помилка при завантаженні exporter:', error);
    }
};

export const exportToGLTF = async (groupRef: React.MutableRefObject<THREE.Group | null>, filename: string = 'model.gltf') => {
    if (!groupRef.current) {
        console.error('❌ Group is empty');
        return;
    }

    try {
        const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
        const exporter = new GLTFExporter();

        exporter.parse(
            groupRef.current,
            (result: object) => {
                const blob = new Blob([JSON.stringify(result)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);
                console.log(`✅ "${filename}" завантажено успішно!`);
            },
            (error: unknown) => {
                console.error('❌ Помилка:', error);
            },
        );
    } catch (error) {
        console.error('❌ Помилка при завантаженні exporter:', error);
    }
};

export const exportToOBJ = async (groupRef: React.MutableRefObject<THREE.Group | null>, filename: string = 'model.obj') => {
    if (!groupRef.current) {
        console.error('❌ Group is empty');
        return;
    }

    try {
        const { OBJExporter } = await import('three/examples/jsm/exporters/OBJExporter.js');
        const exporter = new OBJExporter();
        const objString = exporter.parse(groupRef.current);

        const blob = new Blob([objString], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        console.log(`✅ "${filename}" завантажено успішно!`);
    } catch (error) {
        console.error('❌ Помилка при завантаженні exporter:', error);
    }
};

export const exportToSTL = async (groupRef: React.MutableRefObject<THREE.Group | null>, filename: string = 'model.stl') => {
    if (!groupRef.current) {
        console.error('❌ Group is empty');
        return;
    }

    try {
        const { STLExporter } = await import('three/examples/jsm/exporters/STLExporter.js');
        const exporter = new STLExporter();
        const stlString = exporter.parse(groupRef.current);

        const blob = new Blob([stlString], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        console.log(`✅ "${filename}" завантажено успішно!`);
    } catch (error) {
        console.error('❌ Помилка при завантаженні exporter:', error);
    }
};