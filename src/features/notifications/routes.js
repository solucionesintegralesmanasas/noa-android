/**
 * Rutas del módulo de Notificaciones
 * Ubicación: src/features/notifications/routes.js
 */

export const notificationsRoutes = [
    {
        path: "/notificaciones",
        name: "notifications.list",
        component: () => import("./views/NotificationsListView.vue"),
        meta: { layout: "dashboard", auth: true, title: "Notificaciones" }
    }
];
