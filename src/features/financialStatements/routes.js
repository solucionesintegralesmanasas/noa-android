export const financialStatementsRoutes = [
    {
        path: '/empresas/estados-financieros',
        name: 'financialStatements.list',
        component: () => import('./views/FinancialStatementsListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['financial_statements.index'],
        },
    },
    {
        path: '/empresas/estados-financieros/crear',
        name: 'financialStatements.create',
        component: () => import('./views/FinancialStatementsFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['financial_statements.create'],
        },
    },
    {
        path: '/empresas/estados-financieros/editar/:id',
        name: 'financialStatements.edit',
        component: () => import('./views/FinancialStatementsFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['financial_statements.update'],
        },
    },
    {
        path: '/empresas/estados-financieros/perfil/:id',
        name: 'financialStatements.profile',
        component: () => import('./views/FinancialStatementsDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['financial_statements.profile'],
        },
    },
];