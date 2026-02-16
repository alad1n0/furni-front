export interface ConstructionDetail {
    id: number;
    constructionId: number;
    detailNo: string;
    type: string;
    name: string;
    length?: number;
    isCompleted: boolean;
    completedAt?: Date;
    operations: Array<{
        id: number;
        detailId: number;
        type: string;
        title: string;
        isCompleted: boolean;
        completedAt?: Date;
    }>;
}