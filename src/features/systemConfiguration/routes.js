/** @author Darwin Montes @version 1.0.0 @created_at 2026-06-13 @module {systemConfiguration} @resource {systemConfiguration} */
export const systemConfigurationRoutes = [
    {
        path: '/settings/system-configuration',
        name: 'settings.systemConfiguration',
        component: () => import('./views/SystemConfigurationView.vue'),
        meta: {
            title: 'Configuración de Sistema',
            auth: true,
            layout: 'dashboard',
            permissions: ['system_configurations.index'],
        },
    },
    {
        path: '/settings/platform-fees',
        name: 'settings.platformFees',
        component: () => import('./views/PlatformFeesView.vue'),
        meta: {
            title: 'Tarifas de Plataforma',
            auth: true,
            layout: 'dashboard',
            permissions: ['system_configurations.index'],
        },
    },
];
