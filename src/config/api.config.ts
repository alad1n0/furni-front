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
export const getOrdersSimpleUrl = () => '/order/all-order-simple'
export const getOrderDetails = (id: number) => `/order/get-order-details/${id}`
export const createOrder = () => '/order/create-order'
export const updateOrder = (id: number) => `/order/update-order/${id}`
export const deleteOrder = (id: number) => `/order/delete-order/${id}`

// Order Status
export const getOrderStatusUrl = () => '/order/all-order-status'
export const getOrderStatusQuery = () => '/order/all-order-status-query'
export const createOrderStatus = () => '/order/create-order-status'
export const updateOrderStatus = (id: number) => `/order/update-order-status/${id}`
export const deleteOrderStatus = (id: number) => `/order/delete-order-status/${id}`

// Glass Fill
export const getGlassFillUrl = () => '/glass-fill/all-glass-fill'
export const getGlassSimpleFillUrl = () => '/glass-fill/all-glass-fill-simple'
export const createGlassFill = () => '/glass-fill/create-glass-fill'
export const updateGlassFill = (id: number) => `/glass-fill/update-glass-fill/${id}`
export const deleteGlassFill = (id: number) => `/glass-fill/delete-glass-fill/${id}`

// Construction
export const getConstruction = () => '/construction/all-construction'
export const getOneConstruction = (id: number) => `/construction/get-construction/${id}`
export const getConstructionByOrder = (orderId: number) => `/construction/get-construction-by-order/${orderId}`
export const createConstruction = () => '/construction/create-construction'
export const updateConstruction = (id: number) => `/construction/update-construction/${id}`
export const deleteConstruction = (id: number) => `/construction/delete-construction/${id}`

// Construction Status
export const getConstructionStatus = () => '/construction/all-construction-status'

// Construction Details
export const getConstructionDetails = (constructionId: number) => `/construction/all-construction-details/${constructionId}`
export const updateConstructionDetailComplete = (detailId: number) => `/construction/update-construction-detail-complete/${detailId}`
export const updateConstructionDetailOperationComplete = (detailId: number, operationId: number) => `/construction/update-construction-detail-operation-complete/${detailId}/${operationId}`

// Profile System
export const getProfileSystemUrl = () => '/profile-system/all-profile-system-simple'

// Gcode Program
export const getGcodeProgramUrl = (id: number) => `/gcode-program/get-gcode-for-operation-and-detail/${id}`