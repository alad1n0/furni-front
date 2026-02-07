export const SERVER_URL = import.meta.env.VITE_SERVER_URL
export const API_URL = `${SERVER_URL}/api`

// Auth
export const postLoginUrl = () => '/auth/login'
export const postRefreshTokenUrl = () => '/auth/refresh'

// User
export const getUsersUrl = () => '/user/all-user'
export const deleteUser = (id: number) => `/user/delete-user/${id}`
export const createUser = () => '/user/create-user'
export const updateUser = (id: number) => `/user/update-user/${id}`

// User Role
export const getUserRoles = () => '/user/all-user-role'
export const getUserRolesQuery = () => '/user/all-user-role-query'
export const createUserRole = () => '/user/create-user-role'
export const updateUserRole = (id: number) => `/user/update-user-role/${id}`

// Client
export const getClientsUrl = () => '/client/all-client'
export const getClientsSimpleUrl = () => '/client/all-client-simple'
export const deleteClient = (id: number) => `/client/delete-client/${id}`
export const createClient = () => '/client/create-client'
export const updateClient = (id: number) => `/client/update-client/${id}`

// Order
export const getOrdersUrl = () => '/order/all-order'
export const getOrder = (id: number) => `/order/get-order/${id}`
export const createOrder = () => '/order/create-order'
export const updateOrder = (id: number) => `/order/update-order/${id}`

// Order Status
export const getOrderStatusUrl = () => '/order/all-order-status'

// Glass Fill
export const getGlassFillUrl = () => '/glass-fill/all-glass-fill'
export const createGlassFill = () => '/glass-fill/create-glass-fill'
export const updateGlassFill = (id: number) => `/glass-fill/update-glass-fill/${id}`
export const deleteGlassFill = (id: number) => `/glass-fill/delete-glass-fill/${id}`