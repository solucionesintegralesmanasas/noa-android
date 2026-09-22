import { onUnmounted } from 'vue';

/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-15
 * @module Features.Assistant
 * @resource Chat
 */

/**
 * Composable para manejar el polling de nuevas respuestas si fuera necesario.
 * @param {Function} checkFn Función que verifica si hay novedades.
 * @param {number} intervalMs Milisegundos entre chequeos.
 * @returns {Object} { start, stop }
 */
export function useChatPolling(checkFn, intervalMs = 2500) {
    let interval = null;

    const start = () => {
        if (interval) return;
        interval = setInterval(async () => {
            await checkFn();
        }, intervalMs);
    };

    const stop = () => {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    };

    onUnmounted(stop);

    return { start, stop };
}
