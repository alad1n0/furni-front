export const RouterEnum = {
    MAIN: '/',
    VERSION: '/version',
    USERS: '/users',
}

export type RouterEnum = typeof RouterEnum[keyof typeof RouterEnum];