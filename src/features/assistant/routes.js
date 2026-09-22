/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-15
 * @module Features.Assistant
 * @resource Chat
 */

export const assistantRoutes = [
    {
        path: '/assistant',
        name: 'assistant.index',
        component: () => import('./views/ChatView.vue'),
        meta: {
            title: 'Asistente Virtual',
            requiresAuth: true,
            layout: 'dashboard'
        }
    }
];
