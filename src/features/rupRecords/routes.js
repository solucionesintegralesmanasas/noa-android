export const rupRecordsRoutes = [
    {
        path: '/empresas/registro-unico-de-proponentes',
        name: 'rupRecords.list',
        component: () => import('./views/RupRecordsListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['rup_records.index'],
        },
    },
    {
        path: '/empresas/registro-unico-de-proponentes/crear',
        name: 'rupRecords.create',
        component: () => import('./views/RupRecordsFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['rup_records.create'],
        },
    },
    {
        path: '/empresas/registro-unico-de-proponentes/editar/:id',
        name: 'rupRecords.edit',
        component: () => import('./views/RupRecordsFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['rup_records.update'],
        },
    },
    {
        path: '/empresas/registro-unico-de-proponentes/perfil/:id',
        name: 'rupRecords.profile',
        component: () => import('./views/RupRecordsDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['rup_records.profile'],
        },
    },
];