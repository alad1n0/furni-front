export interface IOrder {
    id: number;
    name: string;
    orderNumber: string;
    createdAt: string;
    clientId: string;
    client: {
        id: number;
        firstName: string;
        lastName: string;
    };
    statusId: string;
    status: {
        id: number;
        code: string;
        title: string;
    };
}