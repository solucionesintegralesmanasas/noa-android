/**
 * @file routes.js
 * @description Rutas del módulo de Experiencias y Contratos.
 * Define las rutas de listado, creación y edición del módulo.
 * @module experiences/routes
 */

/**
 * Arreglo de rutas del módulo Experiences.
 * Cada ruta incluye meta información para autenticación, layout y permisos.
 * @type {Array<Object>}
 */
export const experiencesRoutes = [
    {
        path: '/empresas/experiencias',
        name: 'experiences.list',
        component: () => import('./views/ExperiencesListView.vue'),
        meta: {
            title: 'Listado de Experiencias',
            auth: true,
            layout: 'dashboard',
            permissions: ['experiences.index'],
        },
    },
    {
        path: '/empresas/experiencias/crear',
        name: 'experiences.create',
        component: () => import('./views/ExperiencesFormView.vue'),
        meta: {
            title: 'Registrar Experiencia',
            auth: true,
            layout: 'dashboard',
            permissions: ['experiences.create'],
        },
    },
    {
        path: '/empresas/experiencias/editar/:id',
        name: 'experiences.edit',
        component: () => import('./views/ExperiencesFormView.vue'),
        meta: {
            title: 'Editar Experiencia',
            auth: true,
            layout: 'dashboard',
            permissions: ['experiences.update'],
        },
    },
];