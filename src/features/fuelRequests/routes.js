export const fuelRequestsRoutes = [
    {
        path: '/solicitudes-tanqueo',
        name: 'fuelRequests.list',
        component: () => import('./views/FuelRequestsView.vue'),
        meta: {
            layout: 'dashboard',
            auth: true,
            title: 'Solicitudes de tanqueo',
            permissions: ['fuel_requests.index'],
        },
    },
];
