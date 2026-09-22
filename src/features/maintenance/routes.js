export const maintenanceRoutes = [
    {
        path: '/mantenimiento',
        name: 'maintenance.list',
        component: () => import('./views/MaintenanceListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['maintenance.index'],
        },
    },
    {
        path: '/mantenimiento/crear',
        name: 'maintenance.create',
        component: () => import('./views/MaintenanceFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['maintenance.create'],
        },
    },
    {
        path: '/mantenimiento/editar/:id',
        name: 'maintenance.edit',
        component: () => import('./views/MaintenanceFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['maintenance.update'],
        },
    },
    {
        path: '/mantenimiento/proyeccion',
        name: 'maintenance.forecast',
        component: () => import('./views/MaintenanceForecastView.vue'),
        meta: {
            title: 'Proyección Preventiva',
            auth: true,
            layout: 'dashboard',
            permissions: ['maintenance.forecast'],
        },
    },
];