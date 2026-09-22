/**
 * Rutas del ERP.
 * Ubicación: src/services/api/config/routes.js
 */

export const ROUTES = Object.freeze({
    HOME: "/",
    LOGIN: "/login",
    DASHBOARD: "/dashboard",
    UNAUTHORIZED: "/401",
    FORBIDDEN: "/403",
    NOT_FOUND: "/404",
    SERVER_ERROR: "/500",
});

export const ROUTE_META = {
    auth: { requiresAuth: true },
    roles: (roles) => ({ roles }),
};