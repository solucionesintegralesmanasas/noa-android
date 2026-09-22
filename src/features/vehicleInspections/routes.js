export const vehicleInspectionsRoutes = [
    {
        path: '/inspeccion-vehiculos',
        name: 'vehicleInspections.list',
        component: () => import('./views/VehicleInspectionListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['vehicle_inspections.index'],
        },
    },
    {
        path: '/inspeccion-vehiculos/crear',
        name: 'vehicleInspections.create',
        component: () => import('./views/VehicleInspectionFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['vehicle_inspections.create'],
        },
    },
    {
        path: '/inspeccion-vehiculos/editar/:id',
        name: 'vehicleInspections.edit',
        component: () => import('./views/VehicleInspectionFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['vehicle_inspections.update'],
        },
    },
];