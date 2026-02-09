export const RouterEnum = {
    MAIN: '/',
    VERSION: '/version',
    USERS: '/users',
    CLIENTS: '/clients',
    CONSTRUCTION_EDITOR: 'construction-editor',
    ORDER: '/order',
    ORDER_DETAILS: '/order/:id',
    GLASS_FILL: '/glass-fill'
}

export type RouterEnum = typeof RouterEnum[keyof typeof RouterEnum];