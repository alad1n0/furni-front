export const HandleSideEnum = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    TOP: 'TOP',
    BOTTOM: 'BOTTOM'
}

export type HandleSideEnum = typeof HandleSideEnum[keyof typeof HandleSideEnum];

export enum DetailType {
    PROFILE = 'PROFILE',
    GLASS = 'GLASS',
    HANDLE = 'HANDLE',
    OTHER = 'OTHER',
}

export enum OperationType {
    CUT = 'CUT',
    DRILL = 'DRILL',
    MILL = 'MILL',
    HANDLE_MILL = 'HANDLE_MILL',
    HANDLE_DRILL = 'HANDLE_DRILL',
    ASSEMBLY = 'ASSEMBLY',
    OTHER = 'OTHER',
}

export interface IProfileSystem {
    id: number;
    code: string;
    title: string;
    fileUrl: string;
}

export interface IConstructionStatus {
    id: number;
    code: string;
    title: string;
}

export interface IGlassFill {
    id: number;
    type: string;
    thickness: number;
}

export interface IOrderConstruction {
    id: number;
    orderNumber: string;
}

export interface IDetailsByConstruction {
    id: number;
    constructionId: number;
    detailNo: string;
}

export interface IConstruction {
    id: number;
    orderId: number;
    order: IOrderConstruction;
    constructionNo: string;
    profileSystemId: number;
    profileSystem: IProfileSystem;
    constructionStatusId: number;
    constructionStatus: IConstructionStatus;
    width: number;
    height: number;
    sawThickness: number;
    beamThickness: number;
    glassFillId?: number | null;
    glassFill?: IGlassFill | null;
    hasHandle: boolean;
    handleSide?: HandleSideEnum | null;
    handleOffset?: number | null;
    handlePosition?: number | null;
    handleHoleSpacingX?: number | null;
    handleHoleSpacingY?: number | null;
    drillStartOffsetX?: number | null;
    drillEndOffsetX?: number | null;
    drillOffsetY?: number | null;
    drillSpacingX?: number | null;
    drillPlaybook?: number | null;
    details: IDetailsByConstruction[];
    progress: number;
    createdAt: Date;
    updatedAt: Date;
}