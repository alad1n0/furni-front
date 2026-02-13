export const HandleSideEnum = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    TOP: 'TOP',
    BOTTOM: 'BOTTOM'
}

export type HandleSideEnum = typeof HandleSideEnum[keyof typeof HandleSideEnum];

export interface IConstructionForm {
    orderId: number;
    profileSystemId: number;
    constructionStatusId: number;
    width: number;
    height: number;
    glassFillId?: number | null;
    hasHandle?: boolean;
    handleSide?: HandleSideEnum | null;
    handleOffset?: number | null;
    handlePosition?: number | null;
}

export interface IConstructionFormUpdate {
    orderId?: number;
    profileSystemId?: number;
    constructionStatusId?: number;
    width?: number;
    height?: number;
    glassFillId?: number | null;
    hasHandle?: boolean;
    handleSide?: HandleSideEnum | null;
    handleOffset?: number | null;
    handlePosition?: number | null;
}