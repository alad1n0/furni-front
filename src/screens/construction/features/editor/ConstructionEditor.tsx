'use client'

import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Canvas3D from './canvas/Canvas3D';
import ParametersPanel from './panels/ParametersPanel';
import PartsList from './panels/PartsList';
import ViewControls from './controls/ViewControls';
import ScaleControls from './controls/ScaleControls';
import GcodeModal from './modals/GcodeModal';
import InfoPanel from './panels/InfoPanel';
import {Axis, Canvas3DInstance, ConstructionEditorProps, ConstructionMesh, GcodeData, TransformMode, ViewMode} from "@/screens/construction/type/editor/three-mesh";

export default function ConstructionEditor({construction, orderId, onGoBack}: ConstructionEditorProps): React.ReactElement {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [frameWidth, setFrameWidth] = useState<number>(construction.width || 523);
    const [frameHeight, setFrameHeight] = useState<number>(construction.height || 400);
    const [beamThickness, setBeamThickness] = useState<number>(22);
    const [sawThickness, setSawThickness] = useState<number>(1.344);

    const [selectedMesh, setSelectedMesh] = useState<ConstructionMesh | null>(null);
    const [meshes, setMeshes] = useState<ConstructionMesh[]>([]);
    const [orderedMeshes, setOrderedMeshes] = useState<ConstructionMesh[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('solid');
    const [transformMode, setTransformMode] = useState<TransformMode>('none');
    const [showViewControls, setShowViewControls] = useState<boolean>(false);
    const [showGcodeModal, setShowGcodeModal] = useState<boolean>(false);
    const [gcodeData, setGcodeData] = useState<GcodeData | null>(null);
    const [info, setInfo] = useState<string>('Редактор завантажений');

    const canvas3DRef = useRef<Canvas3DInstance | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        canvas3DRef.current = new Canvas3D(canvasRef.current, {
            frameWidth,
            frameHeight,
            beamThickness,
            onMeshesUpdate: (updatedMeshes: ConstructionMesh[], ordered: ConstructionMesh[]) => {
                setMeshes(updatedMeshes);
                setOrderedMeshes(ordered);
            },
            onSelectedMeshChange: (mesh: ConstructionMesh | null) => {
                setSelectedMesh(mesh);
            },
            onInfoUpdate: (newInfo: string) => {
                setInfo(newInfo);
            }
        }) as unknown as Canvas3DInstance;

        return () => {
            canvas3DRef.current?.dispose();
        };
    }, []);

    const handleUpdateModel = (): void => {
        if (!canvas3DRef.current) return;

        canvas3DRef.current.updateModel({
            frameWidth,
            frameHeight,
            beamThickness,
            sawThickness
        });

        setInfo(`✓ Модель оновлена!\nРамка: ${frameWidth}×${frameHeight}мм\nБалка: ${beamThickness}мм\nПила: ${sawThickness}мм`);
    };

    const handleExportGcode = (): void => {
        if (!selectedMesh || !canvas3DRef.current) {
            alert('Виберіть частину!');
            return;
        }

        const gcode = canvas3DRef.current.generateGcodeForPart(selectedMesh);
        const beamLength = canvas3DRef.current.getBeamLength(selectedMesh.name);

        setGcodeData({
            gcode,
            partName: selectedMesh.name,
            beamLength,
            beamThickness,
            sawThickness
        });
        setShowGcodeModal(true);
    };

    const handleSetViewMode = (mode: ViewMode): void => {
        setViewMode(mode);
        canvas3DRef.current?.setViewMode(mode);
    };

    const handleSetTransformMode = (mode: TransformMode): void => {
        setTransformMode(mode);
        canvas3DRef.current?.setTransformMode(mode);
    };

    // const handleScaleSelected = (factor: number, axis: Axis): void => {
    //     if (!canvas3DRef.current || !selectedMesh) return;
    //     canvas3DRef.current.scaleSelected(factor, axis);
    // };
    //
    // const handleMoveSelected = (amount: number, axis: Axis): void => {
    //     if (!canvas3DRef.current || !selectedMesh) return;
    //     canvas3DRef.current.moveSelected(amount, axis);
    // };

    const handleSelectMesh = (mesh: ConstructionMesh): void => {
        setSelectedMesh(mesh);
        canvas3DRef.current?.selectMesh(mesh);
    };

    const handleExportGcodeFromPartsList = (mesh: ConstructionMesh): void => {
        if (!canvas3DRef.current) return;

        setSelectedMesh(mesh);
        const gcode = canvas3DRef.current.generateGcodeForPart(mesh);
        const beamLength = canvas3DRef.current.getBeamLength(mesh.name);

        setGcodeData({
            gcode,
            partName: mesh.name,
            beamLength,
            beamThickness,
            sawThickness
        });
        setShowGcodeModal(true);
    };

    return (
        <div className="w-full max-w-[1600px] mt-16 flex flex-col overflow-hidden mx-auto">
            <button
                onClick={onGoBack}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-bold transition-colors"
                title={`Повернутися до замовлення #${orderId}`}
            >
                <ArrowLeft size={20} />
                Замовлення #{orderId}
            </button>

            <div className="flex-1 flex relative overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="flex-1"
                />

                {/*<InfoPanel text={info} />*/}

                {/*<ParametersPanel*/}
                {/*    frameWidth={frameWidth}*/}
                {/*    setFrameWidth={setFrameWidth}*/}
                {/*    frameHeight={frameHeight}*/}
                {/*    setFrameHeight={setFrameHeight}*/}
                {/*    beamThickness={beamThickness}*/}
                {/*    setBeamThickness={setBeamThickness}*/}
                {/*    sawThickness={sawThickness}*/}
                {/*    setSawThickness={setSawThickness}*/}
                {/*    onUpdate={handleUpdateModel}*/}
                {/*/>*/}

                {/*<PartsList*/}
                {/*    meshes={orderedMeshes}*/}
                {/*    selectedMesh={selectedMesh}*/}
                {/*    onSelectMesh={handleSelectMesh}*/}
                {/*    onExportGcode={handleExportGcodeFromPartsList}*/}
                {/*/>*/}

                {/*<div className="absolute top-4 right-4 z-40 flex flex-col gap-3">*/}
                {/*    <button*/}
                {/*        onClick={handleExportGcode}*/}
                {/*        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors"*/}
                {/*    >*/}
                {/*        Експорт G-code*/}
                {/*    </button>*/}
                {/*    <button*/}
                {/*        onClick={() => setShowViewControls(!showViewControls)}*/}
                {/*        className={`px-4 py-2 rounded-lg font-bold transition-colors ${*/}
                {/*            showViewControls*/}
                {/*                ? 'bg-red-600 hover:bg-red-700 text-white'*/}
                {/*                : 'bg-green-600 hover:bg-green-700 text-white'*/}
                {/*        }`}*/}
                {/*    >*/}
                {/*        {showViewControls ? 'Приховати меню' : 'Показати меню'}*/}
                {/*    </button>*/}
                {/*</div>*/}

                {/*{showViewControls && (*/}
                {/*    <ViewControls*/}
                {/*        viewMode={viewMode}*/}
                {/*        transformMode={transformMode}*/}
                {/*        onSetViewMode={handleSetViewMode}*/}
                {/*        onSetTransformMode={handleSetTransformMode}*/}
                {/*    />*/}
                {/*)}*/}

                {/*<ScaleControls*/}
                {/*    onScale={handleScaleSelected}*/}
                {/*    onMove={handleMoveSelected}*/}
                {/*/>*/}
            </div>

            {showGcodeModal && gcodeData && (
                <GcodeModal
                    gcodeData={gcodeData}
                    onClose={() => setShowGcodeModal(false)}
                />
            )}
        </div>
    );
}