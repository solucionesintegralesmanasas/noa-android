export const affiliateAdminChargesRoutes = [
    {
        path: '/pagos-de-administracion',
        name: 'affiliateAdminCharges.list',
        component: () => import('./views/AffiliateAdminChargesListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['affiliate_admin_charges.index'],
        },
    },
    {
        path: '/pagos-de-administracion/crear',
        name: 'affiliateAdminCharges.create',
        component: () => import('./views/AffiliateAdminChargesFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['affiliate_admin_charges.create'],
        },
    },
    {
        path: '/pagos-de-administracion/editar/:id',
        name: 'affiliateAdminCharges.edit',
        component: () => import('./views/AffiliateAdminChargesFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['affiliate_admin_charges.update'],
        },
    },
    {
        path: '/pagos-de-administracion/perfil/:id',
        name: 'affiliateAdminCharges.profile',
        component: () => import('./views/AffiliateAdminChargesDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['affiliate_admin_charges.profile'],
        },
    },
];