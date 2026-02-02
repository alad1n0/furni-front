export interface ITokenForm {
    email: string;
    password: string;
}

export interface ILogin {
    accessToken: string;
    refreshToken: string;
    token: string;
    user: {
        id: number;
        email: string;
        name: string;
        roles: {
            id: number;
            name: string;
        };
    };
}

export interface IRefresh {
    accessToken: string;
}