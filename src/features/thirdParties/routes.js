export const thirdPartiesRoutes = [
    {
        path: '/terceros',
        name: 'thirdParties.list',
        component: () => import('./views/ThirdPartiesListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['third_parties.index'],
        },
    },
    {
        path: '/terceros/afiliados',
        name: 'thirdParties.affiliates',
        component: () => import('./views/ThirdPartiesListView.vue'),
        meta: {
            title: 'Afiliados',
            auth: true,
            layout: 'dashboard',
            permissions: ['affiliate.index'],
        },
    },
    {
        path: '/terceros/clientes',
        name: 'thirdParties.customers',
        component: () => import('./views/ThirdPartiesListView.vue'),
        meta: {
            title: 'Clientes',
            auth: true,
            layout: 'dashboard',
            permissions: ['customer.index'],
        },
    },
    {
        path: '/terceros/proveedores',
        name: 'thirdParties.suppliers',
        component: () => import('./views/ThirdPartiesListView.vue'),
        meta: {
            title: 'Proveedores',
            auth: true,
            layout: 'dashboard',
            permissions: ['supplier.index'],
        },
    },
    {
        path: '/terceros/empleados',
        name: 'thirdParties.employees',
        component: () => import('./views/ThirdPartiesListView.vue'),
        meta: {
            title: 'Empleados',
            auth: true,
            layout: 'dashboard',
            permissions: ['employee.index'],
        },
    },
    {
        path: '/terceros/conductores',
        name: 'thirdParties.drivers',
        component: () => import('./views/ThirdPartiesListView.vue'),
        meta: {
            title: 'Conductores',
            auth: true,
            layout: 'dashboard',
            permissions: ['driver.index'],
        },
    },
    {
        path: '/terceros/otros',
        name: 'thirdParties.others',
        component: () => import('./views/ThirdPartiesListView.vue'),
        meta: {
            title: 'Otros',
            auth: true,
            layout: 'dashboard',
            permissions: ['third_parties.index'],
        },
    },


    {
        path: '/terceros/cliente/crear',
        name: 'thirdParties.customers.create',
        component: () => import('./views/ThirdPartiesFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['customer.create'],
        },
    },
    {
        path: '/terceros/proveedor/crear',
        name: 'thirdParties.suppliers.create',
        component: () => import('./views/ThirdPartiesFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['supplier.create'],
        },
    },
    {
        path: '/terceros/empleado/crear',
        name: 'thirdParties.employees.create',
        component: () => import('./views/ThirdPartiesFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['employee.create'],
        },
    },
    {
        path: '/terceros/afiliado/crear',
        name: 'thirdParties.affiliates.create',
        component: () => import('./views/ThirdPartiesFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['affiliate.create'],
        },
    },
    {
        path: '/terceros/conductor/crear',
        name: 'thirdParties.drivers.create',
        component: () => import('./views/ThirdPartiesFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['driver.create'],
        },
    },
    {
        path: '/terceros/crear',
        name: 'thirdParties.create',
        component: () => import('./views/ThirdPartiesFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['third_parties.create'],
        },
    },

    // === RUTAS ESPECÍFICAS DE EDICIÓN ===
    {
        path: '/terceros/cliente/editar/:id',
        name: 'thirdParties.customers.edit',
        component: () => import('./views/ThirdPartiesFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['customer.update'],
        },
    },
    {
        path: '/terceros/proveedor/editar/:id',
        name: 'thirdParties.suppliers.edit',
        component: () => import('./views/ThirdPartiesFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['supplier.update'],
        },
    },
    {
        path: '/terceros/empleado/editar/:id',
        name: 'thirdParties.employees.edit',
        component: () => import('./views/ThirdPartiesFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['employee.update'],
        },
    },
    {
        path: '/terceros/afiliado/editar/:id',
        name: 'thirdParties.affiliates.edit',
        component: () => import('./views/ThirdPartiesFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['affiliate.update'],
        },
    },
    {
        path: '/terceros/conductor/editar/:id',
        name: 'thirdParties.drivers.edit',
        component: () => import('./views/ThirdPartiesFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['driver.update'],
        },
    },

    // === RUTAS ESPECÍFICAS DE PERFIL ===
    {
        path: '/terceros/cliente/perfil/:id',
        name: 'thirdParties.customers.profile',
        component: () => import('./views/ThirdPartiesDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['customer.profile'],
        },
    },
    {
        path: '/terceros/proveedor/perfil/:id',
        name: 'thirdParties.suppliers.profile',
        component: () => import('./views/ThirdPartiesDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['supplier.profile'],
        },
    },
    {
        path: '/terceros/empleado/perfil/:id',
        name: 'thirdParties.employees.profile',
        component: () => import('./views/ThirdPartiesDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['employee.profile'],
        },
    },
    {
        path: '/terceros/afiliado/perfil/:id',
        name: 'thirdParties.affiliates.profile',
        component: () => import('./views/ThirdPartiesDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['affiliate.profile'],
        },
    },
    {
        path: '/terceros/conductor/perfil/:id',
        name: 'thirdParties.drivers.profile',
        component: () => import('./views/ThirdPartiesDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['driver.profile'],
        },
    },

    {
        path: '/terceros/editar/:id',
        name: 'thirdParties.edit',
        component: () => import('./views/ThirdPartiesFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['third_parties.update'],
        },
    },
    {
        path: '/terceros/perfil/:id',
        name: 'thirdParties.profile',
        component: () => import('./views/ThirdPartiesDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['third_parties.profile'],
        },
    },
];