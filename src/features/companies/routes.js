// src/features/business/routes.js

export const companyRoutes = [
    {
        path: `/empresa/listas-empresa`,
        name: 'companies.list',
        component: () => import("./views/CompaniesListView.vue"),
        meta: {
            title: 'Empresas',
            auth: true,
            layout: 'dashboard',
            permissions: ['companies.index'],
        },
    },
    {
        path: `/empresa/crear`,
        name: 'companies.create',
        component: () => import("./views/CompaniesFormView.vue"),
        meta: {
            title: 'Crear Empresa',
            auth: true,
            layout: 'dashboard',
            permissions: ['companies.create'],
        },
    },
    {
        path: `/empresa/editar/:id`,
        name: 'companies.edit',
        component: () => import("./views/CompaniesFormView.vue"),
        meta: {
            title: 'Editar Empresa',
            auth: true,
            layout: 'dashboard',
            permissions: ['companies.update'],
        },
    },
    {
        path: `/empresa/perfil/:id`,
        name: 'companies.profile',
        component: () => import("./views/CompaniesDetailView.vue"),
        meta: {
            title: 'Perfil de la Empresa',
            auth: true,
            layout: 'dashboard',
            permissions: ['companies.profile'],
        },
    },
];
