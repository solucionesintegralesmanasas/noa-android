export const employmentContractsRoutes = [
    {
        path: '/recursos-humanos/contratos-laborales/listas',
        name: 'employmentContracts.list',
        component: () => import('./views/EmploymentContractsListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['employmentContracts.index'],
        },
    },
    {
        path: '/recursos-humanos/contratos-laborales/crear',
        name: 'employmentContracts.create',
        component: () => import('./views/EmploymentContractsFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['employmentContracts.create'],
        },
    },
    {
        path: '/recursos-humanos/contratos-laborales/editar/:id',
        name: 'employmentContracts.edit',
        component: () => import('./views/EmploymentContractsFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['employmentContracts.update'],
        },
    },
    {
        path: '/recursos-humanos/contratos-laborales/perfil/:id',
        name: 'employmentContracts.profile',
        component: () => import('./views/EmploymentContractsDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['employmentContracts.profile'],
        },
    },
];