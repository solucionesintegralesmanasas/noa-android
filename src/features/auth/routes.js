/**
 * Rutas del módulo de Autenticación
 * Ubicación: src/features/auth/routes.js
 */

export const authRoutes = [
    {
        path: "/login",
        name: "login",
        component: () => import("./views/LoginView.vue"),
        meta: { layout: "auth", public: true, guestOnly: true, title: "Iniciar Sesión" }
    },
    {
        path: "/two-factor",
        name: "two-factor",
        component: () => import("./views/TwoFactorView.vue"),
        meta: { layout: "auth", auth: true, requires2FA: true, title: "Verificación 2FA" }
    },
    {
        path: '/profile',
        name: 'user-profile',
        component: () => import('./views/UserProfileView.vue'),
        meta: { layout: 'dashboard', title: 'Perfil de Usuario', requiresAuth: true }
    },
    {
        path: '/roles-permissions',
        name: 'roles-permissions',
        component: () => import('./views/Rolepermissionsform.vue'),
        meta: { layout: 'dashboard', title: 'Permisos', requiresAuth: true }
    },
    {
        path: '/usuarios',
        name: 'users-list',
        component: () => import('./views/UsersListView.vue'),
        meta: { layout: 'dashboard', title: 'Usuarios', requiresAuth: true }
    },
    {
        path: '/auth/google/callback',
        name: 'google-oauth-callback',
        component: () => import('./views/GoogleCallbackView.vue'),
        meta: { layout: 'auth', title: 'Vinculando Google Drive', requiresAuth: true }
    },
];
