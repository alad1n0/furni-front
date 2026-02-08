export const HandleSideEnum = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    TOP: 'TOP',
    BOTTOM: 'BOTTOM'
}

export type HandleSideEnum = typeof HandleSideEnum[keyof typeof HandleSideEnum];

export interface IProfileSystem {
    id: number;
    code: string;
    title: string;
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

export interface IConstruction {
    id: number;
    orderId: number;
    constructionNo: string;
    profileSystemId: number;
    profileSystem: IProfileSystem;
    constructionStatusId: number;
    constructionStatus: IConstructionStatus;
    width: number;
    height: number;
    glassFillId?: number | null;
    glassFill?: IGlassFill | null;
    hasHandle: boolean;
    handleSide?: HandleSideEnum | null;
    handleOffset?: number | null;
    handlePosition?: number | null;
    progress: number;
    createdAt: Date;
    updatedAt: Date;
}