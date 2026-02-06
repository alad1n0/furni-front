export const RoleEnum = {
    ROOT_ADMIN: 'ROOT_ADMIN',
}

export type RoleEnum = typeof RoleEnum[keyof typeof RoleEnum];