/**
 * Configuración de endpoints (Patrón Singleton/Inmutable)
 */
export const ENDPOINTS = Object.freeze({
    AUTH: {
        LOGIN: "/auth/login",
        LOGOUT: "/logout",
        TWO_FACTOR: "/auth/2fa",
    },
    USER: {
        ME: "/me",
        PROFILE: "/profile",
    },
    TENANT: {
        INFO: (id) => `/tenant/${id}/info`,
    }
});