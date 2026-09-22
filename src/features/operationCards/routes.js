export const operationCardsRoutes = [
    {
        path: '/tarjetas-de-operacion',
        name: 'operationCards.list',
        component: () => import('./views/OperationCardsListView.vue'),
        meta: {
            title: 'Listado',
            auth: true,
            layout: 'dashboard',
            permissions: ['operation_cards.index'],
        },
    },
    {
        path: '/tarjetas-de-operacion/crear',
        name: 'operationCards.create',
        component: () => import('./views/OperationCardsFormView.vue'),
        meta: {
            title: 'Crear',
            auth: true,
            layout: 'dashboard',
            permissions: ['operation_cards.create'],
        },
    },
    {
        path: '/tarjetas-de-operacion/editar/:id',
        name: 'operationCards.edit',
        component: () => import('./views/OperationCardsFormView.vue'),
        meta: {
            title: 'Editar',
            auth: true,
            layout: 'dashboard',
            permissions: ['operation_cards.update'],
        },
    },
];