export const taxInformationRoutes = [
    {
        path: '/empresas/informacion-tributaria',
        name: 'taxInformation.list',
        component: () => import('./views/TaxInformationListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['tax_information.index'],
        },
    },
    {
        path: '/empresas/informacion-tributaria/crear',
        name: 'taxInformation.create',
        component: () => import('./views/TaxInformationFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['tax_information.create'],
        },
    },
    {
        path: '/empresas/informacion-tributaria/editar/:id',
        name: 'taxInformation.edit',
        component: () => import('./views/TaxInformationFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['tax_information.update'],
        },
    },
];