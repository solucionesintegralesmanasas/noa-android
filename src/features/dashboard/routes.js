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
        // DashboardView decide: móvil compacto solo en Android nativo,
        // vista Falcon actual en web/escritorio/iOS.
        component: () => import("./views/DashboardView.vue"),
        meta: { layout: "dashboard", auth: true, title: "Dashboard Conductor", roles: ["CONDUCTOR"] }
    },
];
