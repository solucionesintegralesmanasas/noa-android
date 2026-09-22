export const businessCollaborationAgreementsRoutes = [
    {
        path: '/convenios-colaboracion',
        name: 'businessCollaborationAgreements.list',
        component: () => import('./views/BusinessCollaborationAgreementsListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['business_collaboration_agreements.index'],
        },
    },
    {
        path: '/convenios-colaboracion/crear',
        name: 'businessCollaborationAgreements.create',
        component: () => import('./views/BusinessCollaborationAgreementsFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['business_collaboration_agreements.create'],
        },
    },
    {
        path: '/convenios-colaboracion/editar/:id',
        name: 'businessCollaborationAgreements.edit',
        component: () => import('./views/BusinessCollaborationAgreementsFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['business_collaboration_agreements.update'],
        },
    },
];