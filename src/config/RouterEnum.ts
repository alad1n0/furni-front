export const RouterEnum = {
    MAIN: '/',
    VERSION: '/version',
    USERS: '/users',
    CLIENTS: '/clients',
}

export type RouterEnum = typeof RouterEnum[keyof typeof RouterEnum];