/**
 * @fileoverview Rutas para el módulo de Declaraciones de Renta.
 * @module routes/taxDeclarations
 */

export const taxDeclarationsRoutes = [
    {
        path: '/empresas/declaraciones-de-renta',
        name: 'taxDeclarations.list',
        component: () => import('./views/TaxDeclarationsListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['tax_declarations.index'],
        },
    },
    {
        path: '/empresas/declaraciones-de-renta/crear',
        name: 'taxDeclarations.create',
        component: () => import('./views/TaxDeclarationsFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['tax_declarations.create'],
        },
    },
    {
        path: '/empresas/declaraciones-de-renta/editar/:id',
        name: 'taxDeclarations.edit',
        component: () => import('./views/TaxDeclarationsFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['tax_declarations.update'],
        },
    },
    {
        path: '/empresas/declaraciones-de-renta/perfil/:id',
        name: 'taxDeclarations.profile',
        component: () => import('./views/TaxDeclarationsDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['tax_declarations.profile'],
        },
    },
];