/**
 * @file routes.js
 * @description Rutas del módulo de Capacidad de Transporte.
 * Define las rutas de listado, creación y edición del módulo.
 * Nota: La vista de detalle (perfil) se omite según la variable permission-view = N/A.
 * @module conveyorCapacity/routes
 */

/**
 * Arreglo de rutas del módulo ConveyorCapacity.
 * Cada ruta incluye meta información para autenticación, layout y permisos.
 * @type {Array<Object>}
 */
export const conveyorCapacityRoutes = [
    {
        path: '/empresas/capacidad-transportadora',
        name: 'conveyorCapacity.list',
        component: () => import('./views/ConveyorCapacityListView.vue'),
        meta: {
            title: 'Listado de Capacidad de Transporte',
            auth: true,
            layout: 'dashboard',
            permissions: ['conveyor_capacities.index'],
        },
    },
    {
        path: '/empresas/capacidad-transportadora/crear',
        name: 'conveyorCapacity.create',
        component: () => import('./views/ConveyorCapacityFormView.vue'),
        meta: {
            title: 'Registrar Capacidad de Transporte',
            auth: true,
            layout: 'dashboard',
            permissions: ['conveyor_capacities.create'],
        },
    },
    {
        path: '/empresas/capacidad-transportadora/editar/:id',
        name: 'conveyorCapacity.edit',
        component: () => import('./views/ConveyorCapacityFormView.vue'),
        meta: {
            title: 'Editar Capacidad de Transporte',
            auth: true,
            layout: 'dashboard',
            permissions: ['conveyor_capacities.update'],
        },
    },
];