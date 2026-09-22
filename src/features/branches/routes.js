export const branchesRoutes = [
    {
        path: '/empresas/sucursales/listas-sucursal',
        name: 'branches.list',
        component: () => import('./views/BranchesListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['branches.index'],
        },
    },
    {
        path: '/empresas/sucursales/crear',
        name: 'branches.create',
        component: () => import('./views/BranchesFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['branches.create'],
        },
    },
    {
        path: '/empresas/sucursales/editar/:id',
        name: 'branches.edit',
        component: () => import('./views/BranchesFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['branches.update'],
        },
    },
    {
        path: '/empresas/sucursales/perfil/:id',
        name: 'branches.profile',
        component: () => import('./views/BranchesDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['branches.profile'],
        },
    },
];