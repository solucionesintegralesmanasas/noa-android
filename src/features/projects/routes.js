export const projectsRoutes = [
    {
        path: '/proyectos',
        name: 'projects.list',
        component: () => import('./views/ProjectsListView.vue'),
        meta: {
            title: 'Proyectos',
            auth: true,
            layout: 'dashboard',
            permissions: ['projects.index'],
        },
    },
    {
        path: '/proyectos/crear',
        name: 'projects.create',
        component: () => import('./views/ProjectsFormView.vue'),
        meta: {
            title: 'Crear Proyecto',
            auth: true,
            layout: 'dashboard',
            permissions: ['projects.create'],
        },
    },
    {
        path: '/proyectos/editar/:id',
        name: 'projects.edit',
        component: () => import('./views/ProjectsFormView.vue'),
        meta: {
            title: 'Editar Proyecto',
            auth: true,
            layout: 'dashboard',
            permissions: ['projects.update'],
        },
    },
    {
        path: '/proyectos/perfil/:id',
        name: 'projects.profile',
        component: () => import('./views/ProjectsDetailView.vue'),
        meta: {
            title: 'Perfil del Proyecto',
            auth: true,
            layout: 'dashboard',
            permissions: ['projects.profile'],
        },
    },
];