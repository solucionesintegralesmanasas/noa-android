export const trackingRoutes = [
    {
        path: '/rastreo/mapa-en-vivo',
        name: 'tracking.live-map',
        component: () => import('./views/LiveMapView.vue'),
        meta: { title: 'Mapa en Vivo', auth: true, layout: 'dashboard', permissions: ['locations.view'] },
    },
    {
        path: '/rastreo',
        name: 'tracking.map',
        component: () => import('./views/TrackingMapView.vue'),
        meta: { title: 'Rastreo en Tiempo Real', auth: true, layout: 'dashboard', permissions: ['locations.view'] },
    },
    {
        path: '/rastreo/historial/:uuid',
        name: 'tracking.history',
        component: () => import('./views/DriverHistoryView.vue'),
        meta: { title: 'Historial de Ruta', auth: true, layout: 'dashboard', permissions: ['locations.history'] },
    },
    {
        path: '/rastreo/geocercas',
        name: 'tracking.geofences.list',
        component: () => import('./views/GeofenceListView.vue'),
        meta: { title: 'Geocercas', auth: true, layout: 'dashboard', permissions: ['locations.geofences'] },
    },
    {
        path: '/rastreo/geocercas/crear',
        name: 'tracking.geofences.create',
        component: () => import('./views/GeofenceFormView.vue'),
        meta: { title: 'Crear Geocerca', auth: true, layout: 'dashboard', permissions: ['locations.geofences'] },
    },
    {
        path: '/rastreo/geocercas/editar/:id',
        name: 'tracking.geofences.edit',
        component: () => import('./views/GeofenceFormView.vue'),
        meta: { title: 'Editar Geocerca', auth: true, layout: 'dashboard', permissions: ['locations.geofences'] },
    },
];
