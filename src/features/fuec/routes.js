export const fuecRoutes = [
    {
        path: '/extracto-de-contrato',
        name: 'fuec.list',
        component: () => import('./views/FuecListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['fuec.index'],
        },
    },
    {
        path: '/extracto-de-contrato/crear',
        name: 'fuec.create',
        component: () => import('./views/FuecFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['fuec.create'],
        },
    },
    {
        path: '/extracto-de-contrato/editar/:id',
        name: 'fuec.edit',
        component: () => import('./views/FuecFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['fuec.update'],
        },
    },
    {
        path: '/extracto-de-contrato/perfil/:id',
        name: 'fuec.profile',
        component: () => import('./views/FuecPdf.vue'),
        meta: {
            title: 'Perfil y PDF',
            auth: true,
            layout: 'dashboard',
            permissions: ['fuec.profile'],
        },
    }
];