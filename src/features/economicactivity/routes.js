export const economicActivitiesRoutes = [
    {
        path: '/empresas/actividades-economicas/listas-actividades-economicas',
        name: 'economicActivities.list',
        component: () => import('./views/EconomicActivitiesListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['economic_activities.index'],
        },
    },
    {
        path: '/empresas/actividades-economicas/crear',
        name: 'economicActivities.create',
        component: () => import('./views/EconomicActivitiesFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['economic_activities.create'],
        },
    },
    {
        path: '/empresas/actividades-economicas/editar/:id',
        name: 'economicActivities.edit',
        component: () => import('./views/EconomicActivitiesFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['economic_activities.update'],
        },
    },
    {
        path: '/empresas/actividades-economicas/perfil/:id',
        name: 'economicActivities.profile',
        component: () => import('./views/EconomicActivitiesDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['economic_activities.profile'],
        },
    },
];