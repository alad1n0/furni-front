export const RouterEnum = {
    MAIN: '/',
    VERSION: '/version',
    USERS: '/users',
    CLIENTS: '/clients',
    ORDER: '/order',
    GLASS_FILL: '/glass-fill'
}

export type RouterEnum = typeof RouterEnum[keyof typeof RouterEnum];