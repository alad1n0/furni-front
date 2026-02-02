export const SERVER_URL = import.meta.env.VITE_SERVER_URL
export const API_URL = `${SERVER_URL}/api`

// Auth
export const postLoginUrl = () => '/auth/login'
export const postRefreshTokenUrl = () => '/auth/refresh'

// User
export const getUsersUrl = () => '/user/all-user'
export const deleteUser = (id: number) => `/user/delete-user/${id}`
export const createUser = () => '/user/create-user'
export const getUserRoles = () => '/user/all-user-role'
export const updateUser = (id: number) => `/user/update-user/${id}`

// Client
export const getClientsUrl = () => '/client/all-client'
export const deleteClient = (id: number) => `/client/delete-client/${id}`
export const createClient = () => '/client/create-client'
export const updateClient = (id: number) => `/client/update-client/${id}`