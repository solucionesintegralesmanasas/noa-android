// Plugin básico de logging para Pinia
// Silencia acciones ruidosas (can, hasRole) para no saturar la consola
const NOISY_ACTIONS = new Set(['can', 'hasRole']);

export const createLoggerPlugin = (options = {}) => {
    return (context) => {
        context.store.$onAction(({ name, store, args, after, onError }) => {
            if (import.meta.env.DEV && options.logLevel === 'debug' && !NOISY_ACTIONS.has(name)) {
                console.log(`[Store: ${store.$id}] Action: ${name}`);
            }
        });
    };
};
