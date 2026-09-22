export const serviceDeliveryControlSheetRoutes = [
    {
        path: '/planilla-de-control-de-prestacion-servicios',
        name: 'serviceDeliveryControlSheet.list',
        component: () => import('./views/ServiceDeliveryControlSheetListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['service_delivery_control_sheets.index'],
        },
    },
    {
        path: '/planilla-de-control-de-prestacion-servicios/crear',
        name: 'serviceDeliveryControlSheet.create',
        component: () => import('./views/ServiceDeliveryControlSheetFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['service_delivery_control_sheets.create'],
        },
    },
    {
        path: '/planilla-de-control-de-prestacion-servicios/editar/:id',
        name: 'serviceDeliveryControlSheet.edit',
        component: () => import('./views/ServiceDeliveryControlSheetFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['service_delivery_control_sheets.update'],
        },
    },
    {
        path: '/planilla-de-control-de-prestacion-servicios/control-de-servicios',
        name: 'serviceDeliveryControlSheet.internal-control',
        component: () => import('./views/ServiceTemplateView.vue'),
        meta: {
            title: 'Servicio Subcontratado',
            auth: true,
            layout: 'dashboard',
            permissions: ['service_delivery_control_sheets.index'],
        },
    }
];