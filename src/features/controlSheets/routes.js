export const controlSheetsRoutes = [
    {
        path: '/planillas-de-control-de-servicios',
        name: 'controlSheets.list',
        component: () => import('./views/ControlSheetsListView.vue'),
        meta: {
            title: 'Planillas de Control',
            auth: true,
            layout: 'dashboard',
            permissions: ['control_sheets.index'],
        },
    },
    {
        path: '/planillas-de-control-de-servicios/crear',
        name: 'controlSheets.create',
        component: () => import('./views/ControlSheetsFormView.vue'),
        meta: {
            title: 'Crear Planilla de Control',
            auth: true,
            layout: 'dashboard',
            permissions: ['control_sheets.create'],
        },
    },
    {
        path: '/planillas-de-control-de-servicios/editar/:id',
        name: 'controlSheets.edit',
        component: () => import('./views/ControlSheetsFormView.vue'),
        meta: {
            title: 'Editar Planilla de Control',
            auth: true,
            layout: 'dashboard',
            permissions: ['control_sheets.update'],
        },
    },
];