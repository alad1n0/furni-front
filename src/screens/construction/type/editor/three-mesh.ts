import {IConstruction} from "@/screens/construction/type/construction/IConstruction";

export interface ConstructionMesh {
    name: string;
    geometry: {
        attributes: {
            position: {
                array: Float32Array;
            };
        };
    };
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
    };
    scale: {
        x: number;
        y: number;
        z: number;
    };
    castShadow: boolean;
    receiveShadow: boolean;
    visible: boolean;
    material?: ConstructionMeshMaterial;
}

export interface ConstructionMeshMaterial {
    wireframe?: boolean;
    color?: {
        setHex: (hex: number) => void;
    };
    metalness?: number;
    roughness?: number;
    clone: () => ConstructionMeshMaterial;
}

export interface Canvas3DOptions {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    onMeshesUpdate?: (meshes: ConstructionMesh[], ordered: ConstructionMesh[]) => void;
    onSelectedMeshChange?: (mesh: ConstructionMesh | null) => void;
    onInfoUpdate?: (info: string) => void;
}

export interface Canvas3DInstance {
    updateModel: (params: ModelUpdateParams) => void;
    createModel: () => void;

    generateGcodeForPart: (mesh: ConstructionMesh) => string;
    getBeamLength: (meshName: string) => number;

    selectMesh: (mesh: ConstructionMesh) => void;

    setViewMode: (mode: ViewMode) => void;

    setTransformMode: (mode: TransformMode) => void;

    scaleSelected: (factor: number, axis: Axis) => void;
    moveSelected: (amount: number, axis: Axis) => void;

    dispose: () => void;
}

export interface ModelUpdateParams {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    sawThickness: number;
}

export type ViewMode = 'solid' | 'wireframe' | 'vertices' | 'mixed';
export type TransformMode = 'translate' | 'rotate' | 'scale' | 'none';
export type Axis = 'x' | 'y' | 'z';

export interface GcodeData {
    gcode: string;
    partName: string;
    beamLength: number;
    beamThickness: number;
    sawThickness: number;
}

export interface ConstructionEditorProps {
    construction: IConstruction;
    orderId: number;
    onGoBack: () => void;
}

export interface ParametersPanelProps {
    frameWidth: number;
    setFrameWidth: (value: number) => void;
    frameHeight: number;
    setFrameHeight: (value: number) => void;
    beamThickness: number;
    setBeamThickness: (value: number) => void;
    sawThickness: number;
    setSawThickness: (value: number) => void;
    onUpdate: () => void;
}

export interface PartsListProps {
    meshes: ConstructionMesh[];
    selectedMesh: ConstructionMesh | null;
    onSelectMesh: (mesh: ConstructionMesh) => void;
    onExportGcode: (mesh: ConstructionMesh) => void;
}

export interface ViewControlsProps {
    viewMode: ViewMode;
    transformMode: TransformMode;
    onSetViewMode: (mode: ViewMode) => void;
    onSetTransformMode: (mode: TransformMode) => void;
}

export interface ScaleControlsProps {
    onScale: (factor: number, axis: Axis) => void;
    onMove: (amount: number, axis: Axis) => void;
}

export interface GcodeModalProps {
    gcodeData: GcodeData;
    onClose: () => void;
}

export interface InfoPanelProps {
    text: string;
}

export interface IConstructionStatus {
    id: number;
    title: string;
}

export interface IProfileSystem {
    id: number;
    name: string;
}

export type AsyncFunction<T> = () => Promise<T>;
export type VoidFunction = () => void;
export type Handler<T> = (value: T) => void;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export const VIEW_MODES = {
    SOLID: 'solid' as const,
    WIREFRAME: 'wireframe' as const,
    VERTICES: 'vertices' as const,
    MIXED: 'mixed' as const
} as const;

export const TRANSFORM_MODES = {
    TRANSLATE: 'translate' as const,
    ROTATE: 'rotate' as const,
    SCALE: 'scale' as const,
    NONE: 'none' as const
} as const;

export const AXES = {
    X: 'x' as const,
    Y: 'y' as const,
    Z: 'z' as const
} as const;

export const isValidViewMode = (mode: unknown): mode is ViewMode => {
    return mode === 'solid' || mode === 'wireframe' || mode === 'vertices' || mode === 'mixed';
};

export const isValidTransformMode = (mode: unknown): mode is TransformMode => {
    return mode === 'translate' || mode === 'rotate' || mode === 'scale' || mode === 'none';
};

export const isValidAxis = (axis: unknown): axis is Axis => {
    return axis === 'x' || axis === 'y' || axis === 'z';
};

export const isConstructionMesh = (obj: unknown): obj is ConstructionMesh => {
    if (typeof obj !== 'object' || obj === null) return false;
    return 'name' in obj && 'position' in obj && 'geometry' in obj;
};