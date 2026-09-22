export const vehicleDocumentsRoutes = [
    {
        path: '/vehiculos-documentos',
        name: 'vehicleDocuments.list',
        component: () => import('./views/VehicleDocumentsListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['vehicle_documents.index'],
        },
    },
    {
        path: '/vehiculos-documentos/:documentType',
        name: 'vehicleDocuments.typeList',
        component: () => import('./views/VehicleDocumentsListView.vue'),
        meta: {
            auth: true,
            layout: 'dashboard',
            permissions: ['vehicle_documents.index'],
        },
    },

    // RUTAS DE CREACIÓN
    {
        path: '/vehiculos-documentos/crear',
        name: 'vehicleDocuments.create',
        component: () => import('./views/VehicleDocumentsFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['vehicle_documents.create'],
        },
    },
    {
        path: '/vehiculos-documentos/:documentType/crear',
        name: 'vehicleDocuments.typeCreate',
        component: () => import('./views/VehicleDocumentsFormView.vue'),
        meta: {
            auth: true,
            layout: 'dashboard',
            permissions: ['vehicle_documents.create'],
        },
    },

    // RUTAS DE EDICIÓN
    {
        path: '/vehiculos-documentos/editar/:id',
        name: 'vehicleDocuments.edit',
        component: () => import('./views/VehicleDocumentsFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['vehicle_documents.update'],
        },
    },
    {
        path: '/vehiculos-documentos/:documentType/editar/:id',
        name: 'vehicleDocuments.typeEdit',
        component: () => import('./views/VehicleDocumentsFormView.vue'),
        meta: {
            auth: true,
            layout: 'dashboard',
            permissions: ['vehicle_documents.update'],
        },
    },

    // RUTAS DE PERFIL
    {
        path: '/vehiculos-documentos/perfil/:id',
        name: 'vehicleDocuments.profile',
        component: () => import('./views/VehicleDocumentsDetailView.vue'),
        meta: {
            title: 'Perfil',
            auth: true,
            layout: 'dashboard',
            permissions: ['vehicle_documents.profile'],
        },
    },
    {
        path: '/vehiculos-documentos/:documentType/perfil/:id',
        name: 'vehicleDocuments.typeProfile',
        component: () => import('./views/VehicleDocumentsDetailView.vue'),
        meta: {
            auth: true,
            layout: 'dashboard',
            permissions: ['vehicle_documents.profile'],
        },
    },
];