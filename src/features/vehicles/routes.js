export const vehiclesRoutes = [
    {
        path: '/vehiculos',
        name: 'vehicles.list',
        component: () => import('./views/VehiclesListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['vehicles.index'],
        },
    },
    {
        path: '/vehiculos/crear',
        name: 'vehicles.create',
        component: () => import('./views/VehiclesFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['vehicles.create'],
        },
    },
    {
        path: '/vehiculos/editar/:id',
        name: 'vehicles.edit',
        component: () => import('./views/VehiclesFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['vehicles.update'],
        },
    },
    {
        path: '/vehiculos/perfil/:id',
        name: 'vehicles.profile',
        component: () => import('./views/VehiclesDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['vehicles.profile'],
        },
    },
];