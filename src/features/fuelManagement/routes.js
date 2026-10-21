export const fuelManagementRoutes = [
    {
        path: '/combustible',
        name: 'fuelManagement.list',
        component: () => import('./views/FuelLogListView.vue'),
        meta: {
            title: 'Control de Combustible',
            auth: true,
            layout: 'dashboard',
            permissions: ['fuel_logs.index'],
        },
    },
    {
        path: '/combustible/crear',
        name: 'fuelManagement.create',
        component: () => import('./views/FuelLogFormView.vue'),
        meta: {
            title: 'Nuevo Registro de Combustible',
            auth: true,
            layout: 'dashboard',
            permissions: ['fuel_logs.create'],
        },
    },
    {
        path: '/combustible/editar/:id',
        name: 'fuelManagement.edit',
        component: () => import('./views/FuelLogFormView.vue'),
        meta: {
            title: 'Editar Registro de Combustible',
            auth: true,
            layout: 'dashboard',
            permissions: ['fuel_logs.update'],
        },
    },
];
