/**
 * Rutas del módulo de Autenticación
 * Ubicación: src/features/auth/routes.js
 */

export const dashboardRoutes = [
    {
        path: "/dashboard",
        name: "dashboard",
        component: () => import("./views/DashboardView.vue"),
        meta: { layout: "dashboard", auth: true, title: "Dashboard" }
    },
    {
        path: "/dashboard/conductor",
        name: "dashboard.conductor",
        component: () => import("./views/ConductorDashboardView.vue"),
        meta: { layout: "dashboard", auth: true, title: "Dashboard Conductor", roles: ["CONDUCTOR"] }
    },
];
