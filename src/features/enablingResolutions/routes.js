/**
 * @file routes.js
 * @description Rutas del módulo de Resoluciones de Habilitación.
 * Define las rutas de listado, creación, edición y perfil del módulo.
 * @module enablingResolutions/routes
 */

/**
 * Arreglo de rutas del módulo EnablingResolutions.
 * Cada ruta incluye meta información para autenticación, layout y permisos.
 * @type {Array<Object>}
 */
export const enablingResolutionsRoutes = [
    {
        path: '/empresas/resoluciones-habilitacion',
        name: 'enablingResolutions.list',
        component: () => import('./views/EnablingResolutionsListView.vue'),
        meta: {
            title: 'Listado de Resoluciones de Habilitación',
            auth: true,
            layout: 'dashboard',
            permissions: ['enabling_resolutions.index'],
        },
    },
    {
        path: '/empresas/resoluciones-habilitacion/crear',
        name: 'enablingResolutions.create',
        component: () => import('./views/EnablingResolutionsFormView.vue'),
        meta: {
            title: 'Crear Resolución de Habilitación',
            auth: true,
            layout: 'dashboard',
            permissions: ['enabling_resolutions.create'],
        },
    },
    {
        path: '/empresas/resoluciones-habilitacion/editar/:id',
        name: 'enablingResolutions.edit',
        component: () => import('./views/EnablingResolutionsFormView.vue'),
        meta: {
            title: 'Editar Resolución de Habilitación',
            auth: true,
            layout: 'dashboard',
            permissions: ['enabling_resolutions.update'],
        },
    }
];