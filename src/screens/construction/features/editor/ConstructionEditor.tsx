'use client'

import React, {useState, useCallback, useEffect} from 'react';
import { ArrowLeft } from 'lucide-react';
import Canvas3DAdvanced from './canvas/Canvas3DAdvanced';
import ParametersPanel from './panels/ParametersPanel';
import PartsList from './panels/PartsList';
import GcodeModal from './modals/GcodeModal';
import InfoPanel from './panels/InfoPanel';
import Button from "@/ui/button/Button";
import useModal from "@/hooks/useModal";
import {
    ConstructionEditorProps,
    ConstructionMesh,
    GcodeData,
    TransformMode,
    ViewMode
} from "@/screens/construction/type/editor/ThreeMesh";
import {useConstructionUpdateMutation} from "@/screens/construction/hooks/construction/useConstructionUpdateMutation";

export default function ConstructionEditor({construction, order, onGoBack}: ConstructionEditorProps): React.ReactElement {
    const [frameWidth, setFrameWidth] = useState<number>(construction.width || 523);
    const [frameHeight, setFrameHeight] = useState<number>(construction.height || 400);
    const [beamThickness, setBeamThickness] = useState<number>(22);
    const [sawThickness, setSawThickness] = useState<number>(1.344);

    const [selectedMesh, setSelectedMesh] = useState<ConstructionMesh | null>(null);
    const [meshes, setMeshes] = useState<ConstructionMesh[]>([]);
    const [orderedMeshes, setOrderedMeshes] = useState<ConstructionMesh[]>([]);
    const [info, setInfo] = useState<string>('Редактор завантажений');

    const [viewMode, setViewMode] = useState<ViewMode>('solid');
    const [transformMode, setTransformMode] = useState<TransformMode>('none');

    const [gcodeData, setGcodeData] = useState<GcodeData | null>(null);

    const { mutateAsync: updateConstruction, isPending: isUpdating } = useConstructionUpdateMutation();

    const modalGcode = useModal();

    const handleMeshesUpdate = useCallback((updatedMeshes: ConstructionMesh[], ordered: ConstructionMesh[]) => {
        setMeshes(updatedMeshes);
        setOrderedMeshes(ordered);
    }, []);

    const handleBeamClickFromCanvas = useCallback((beamName: string) => {
        const mesh = orderedMeshes.find(m => m.name === beamName);
        if (mesh) {
            setSelectedMesh(mesh);
        }
    }, [orderedMeshes]);

    const generateGcodeForPart = useCallback((meshName: string): string => {
        const dy = sawThickness;
        const beamThick = beamThickness;

        let gcode = '%\n';
        gcode += 'G90\n';
        gcode += 'G55\n';
        gcode += 'G49\n';
        gcode += 'M13 S3000\n\n';

        if (meshName === 'Верхня балка' || meshName === 'Нижня балка') {
            const beamLength = frameWidth;

            const xStart1 = beamThick - dy;
            const yStart1 = dy;
            const xEnd1 = -yStart1;
            const yEnd1 = -xStart1;

            gcode += `G0 X${xStart1.toFixed(3)} Y${yStart1.toFixed(3)} Z60.000 A45\n`;
            gcode += `G0 Z28\n`;
            gcode += `G1 Z-3.000 F600\n`;
            gcode += `G1 X${xEnd1.toFixed(3)} Y${yEnd1.toFixed(3)} F1200\n`;
            gcode += `G0 Z60.000 A45\n\n`;
            gcode += `G0 X0.000 Y0.000 Z80.000 A45\n`;
            gcode += `G0 Z80.000\nX0.000 Y0.000\nA0\n\n`;

            const xStart2 = beamLength - beamThick + dy;
            const yStart2 = dy;
            const xEnd2 = beamLength + dy;
            const yEnd2 = yEnd1;

            gcode += `G0 X${xStart2.toFixed(3)} Y${yStart2.toFixed(3)} Z60.000 A-45\n`;
            gcode += `G0 Z28\n`;
            gcode += `G1 Z-3.000 F600\n`;
            gcode += `G1 X${xEnd2.toFixed(3)} Y${yEnd2.toFixed(3)} F1200\n`;
            gcode += `G0 Z60.000 A-45\n\n`;
            gcode += `G0 X0.000 Y0.000 Z80.000 A-45\n`;
            gcode += `G0 Z80.000\nX0.000 Y0.000\nA0\n\n`;
        } else if (meshName === 'Ліва балка' || meshName === 'Права балка') {
            const beamLength = frameHeight;

            const xStart1 = beamThick - dy;
            const yStart1 = dy;
            const xEnd1 = -xStart1;
            const yEnd1 = -yStart1;

            gcode += `G0 X${xStart1.toFixed(3)} Y${yStart1.toFixed(3)} Z60.000 A45\n`;
            gcode += `G0 Z28\n`;
            gcode += `G1 Z-3.000 F600\n`;
            gcode += `G1 X${yEnd1.toFixed(3)} Y${xEnd1.toFixed(3)} F1200\n`;
            gcode += `G0 Z60.000 A45\n\n`;
            gcode += `G0 X0.000 Y0.000 Z80.000 A45\n`;
            gcode += `G0 Z80.000\nX0.000 Y0.000\nA0\n\n`;

            const xStart2 = beamLength - beamThick + dy;
            const yStart2 = dy;
            const xEnd2 = beamLength + dy;
            const yEnd2 = xEnd1;

            gcode += `G0 X${xStart2.toFixed(3)} Y${yStart2.toFixed(3)} Z60.000 A-45\n`;
            gcode += `G0 Z28\n`;
            gcode += `G1 Z-3.000 F600\n`;
            gcode += `G1 X${xEnd2.toFixed(3)} Y${yEnd2.toFixed(3)} F1200\n`;
            gcode += `G0 Z60.000 A-45\n\n`;
            gcode += `G0 X0.000 Y0.000 Z80.000 A-45\n`;
            gcode += `G0 Z80.000\nX0.000 Y0.000\nA0\n\n`;
        }

        gcode += 'G49\nG54\nM15\nM02\n%\n';
        return gcode;
    }, [frameWidth, frameHeight, beamThickness, sawThickness]);

    const getBeamLength = useCallback((meshName: string): number => {
        if (meshName === 'Верхня балка' || meshName === 'Нижня балка') {
            return frameWidth;
        } else if (meshName === 'Ліва балка' || meshName === 'Права балка') {
            return frameHeight;
        }
        return 0;
    }, [frameWidth, frameHeight]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const key = e.key.toLowerCase();

            if (key === 't') {
                e.preventDefault();
                console.log('🔑 Pressed T - Translate');
                setTransformMode('translate');
            }
            if (key === 'r') {
                e.preventDefault();
                console.log('🔑 Pressed R - Rotate');
                setTransformMode('rotate');
            }
            if (key === 'e') {
                e.preventDefault();
                console.log('🔑 Pressed E - Scale');
                setTransformMode('scale');
            }
            if (key === 'escape') {
                e.preventDefault();
                console.log('🔑 Pressed ESC - None');
                setTransformMode('none');
            }

            if (key === 'w') {
                e.preventDefault();
                console.log('🔑 Pressed W - Wireframe');
                setViewMode('wireframe');
            }
            if (key === 's') {
                e.preventDefault();
                console.log('🔑 Pressed S - Solid');
                setViewMode('solid');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleUpdateModel = useCallback(async (): Promise<void> => {
        try {
            await updateConstruction({
                id: construction.id,
                width: frameWidth,
                height: frameHeight,
                orderId: order?.id
            });

            setInfo(`✓ Модель оновлена успішно!\nРамка: ${frameWidth}×${frameHeight} мм\nБалка: ${beamThickness} мм\nПила: ${sawThickness} мм`);
        } catch (error) {
            console.error('Помилка при оновленні конструкції:', error);
            setInfo(`✗ Помилка при збереженні\nРамка: ${frameWidth}×${frameHeight} мм`);
        }
    }, [frameWidth, frameHeight, beamThickness, sawThickness, construction, updateConstruction, order]);

    const handleExportGcode = useCallback((): void => {
        if (!selectedMesh) {
            alert('Виберіть частину!');
            return;
        }

        const gcode = generateGcodeForPart(selectedMesh.name);
        const beamLength = getBeamLength(selectedMesh.name);

        setGcodeData({
            gcode,
            partName: selectedMesh.name,
            beamLength,
            beamThickness,
            sawThickness
        });

        modalGcode.onOpen();
    }, [selectedMesh, generateGcodeForPart, getBeamLength, beamThickness, sawThickness, modalGcode]);

    const handleExportGcodeFromPartsList = useCallback((mesh: ConstructionMesh): void => {
        const gcode = generateGcodeForPart(mesh.name);
        const beamLength = getBeamLength(mesh.name);

        setGcodeData({
            gcode,
            partName: mesh.name,
            beamLength,
            beamThickness,
            sawThickness
        });
        modalGcode.onOpen();
    }, [generateGcodeForPart, getBeamLength, beamThickness, sawThickness, modalGcode]);

    const handleSelectMesh = useCallback((mesh: ConstructionMesh): void => {
        setSelectedMesh(mesh);
    }, []);

    return (
        <div className="w-full max-w-[1600px] mt-[72px] gap-2 flex flex-col overflow-hidden mx-auto h-[calc(100vh-120px)]">
            <div className="flex w-fit justify-start items-center">
                <Button
                    onClick={onGoBack}
                    className="flex items-center gap-2"
                    color="gray"
                >
                    <ArrowLeft size={20} /> Back to Orders
                </Button>
            </div>

            <div className="flex-1 flex relative overflow-hidden gap-4">
                <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden relative">
                    <Canvas3DAdvanced
                        frameWidth={frameWidth}
                        frameHeight={frameHeight}
                        beamThickness={beamThickness}
                        sawThickness={sawThickness}
                        viewMode={viewMode}
                        transformMode={transformMode}
                        onMeshesUpdate={handleMeshesUpdate}
                        onInfoUpdate={setInfo}
                        onBeamClick={handleBeamClickFromCanvas}
                    />

                    <InfoPanel text={info} />
                </div>

                <div className="w-96 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
                    <ParametersPanel
                        frameWidth={frameWidth}
                        setFrameWidth={setFrameWidth}
                        frameHeight={frameHeight}
                        setFrameHeight={setFrameHeight}
                        beamThickness={beamThickness}
                        setBeamThickness={setBeamThickness}
                        sawThickness={sawThickness}
                        setSawThickness={setSawThickness}
                        onUpdate={handleUpdateModel}
                        isUpdating={isUpdating}
                    />

                    {order && (
                        <PartsList
                            meshes={orderedMeshes}
                            selectedMesh={selectedMesh}
                            onSelectMesh={handleSelectMesh}
                            onExportGcode={handleExportGcodeFromPartsList}
                            construction={construction}
                            order={order}
                        />
                    )}

                    {selectedMesh && (
                        <div className="p-4 border-t border-gray-700">
                            <Button
                                type={'button'}
                                onClick={handleExportGcode}
                                color={'blue'}
                            >
                                Експорт G-code для {selectedMesh.name}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {gcodeData && (
                <GcodeModal
                    {...modalGcode}
                    gcodeData={gcodeData}
                />
            )}
        </div>
    );
}