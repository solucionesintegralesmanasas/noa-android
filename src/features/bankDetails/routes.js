export const bankDetailsRoutes = [
    {
        path: '/empresas/datos-bancarios',
        name: 'bankDetails.list',
        component: () => import('./views/BankDetailsListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['bank_details.index'],
        },
    },
    {
        path: '/empresas/datos-bancarios/crear',
        name: 'bankDetails.create',
        component: () => import('./views/BankDetailsFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['bank_details.create'],
        },
    },
    {
        path: '/empresas/datos-bancarios/editar/:id',
        name: 'bankDetails.edit',
        component: () => import('./views/BankDetailsFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['bank_details.update'],
        },
    },
    {
        path: '/empresas/datos-bancarios/perfil/:id',
        name: 'bankDetails.profile',
        component: () => import('./views/BankDetailsDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['bank_details.profile'],
        },
    },
];