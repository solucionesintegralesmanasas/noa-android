// src/hooks/useRealtimeChannel.js
// Canal de refresco único por feature (ARQ-009 / ARQ-010).
//
// Reglas:
// - Ciclo encadenado con setTimeout: la siguiente espera arranca DESPUÉS de la
//   respuesta, nunca hay dos peticiones solapadas.
// - Guarda in-flight: si un tick sigue en curso, se omite y se reprograma.
// - Pausa con pestaña oculta (visibilitychange): cancela la espera y aborta la
//   petición en curso; al volver a visible, refresca de inmediato.
// - Cancelación con AbortController: el `signal` se entrega al `fetcher` para
//   que lo propague a axios. La cancelación propia es silencio.
import { onUnmounted } from 'vue';
import { logger } from '@utils/logger.js';
import { isCancelError } from '@utils/error-handler.js';

export function useRealtimeChannel(fetcher, options = {}) {
    const { intervalMs = 10000 } = options;

    let timer = null;
    let controller = null;
    let running = false;
    let inFlight = false;
    let refreshPending = false;

    const isHidden = () =>
        typeof document !== 'undefined' && document.visibilityState === 'hidden';

    function clearTimer() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }

    function abortInFlight() {
        if (controller) {
            try {
                controller.abort();
            } catch {
                // Abortar dos veces no debe romper el ciclo.
            }
            controller = null;
        }
    }

    async function tick() {
        clearTimer();
        if (!running) return;
        if (isHidden() || inFlight) {
            schedule();
            return;
        }
        inFlight = true;
        controller = new AbortController();
        try {
            await fetcher(controller.signal);
        } catch (err) {
            // Los errores HTTP ya los gestiona el llamador (store/vista);
            // aquí solo se registra lo inesperado, nunca la cancelación propia.
            if (!isCancelError(err)) {
                logger.warn('[realtime] Error en ciclo de refresco:', err?.message || err);
            }
        } finally {
            inFlight = false;
            controller = null;
        }
        if (refreshPending) {
            // Se pidió refrescar mientras el ciclo estaba en vuelo (la pestaña
            // volvió a visible durante el abort): se ejecuta ya, sin esperar el
            // intervalo completo.
            refreshPending = false;
            tick();
            return;
        }
        schedule();
    }

    function schedule() {
        clearTimer();
        if (!running) return;
        timer = setTimeout(tick, intervalMs);
    }

    function onVisibility() {
        if (!running) return;
        if (isHidden()) {
            clearTimer();
            abortInFlight();
        } else if (inFlight) {
            // El abort del ciclo anterior aún se está resolviendo: refrescar en
            // cuanto termine, sin esperar el intervalo completo.
            refreshPending = true;
        } else {
            tick();
        }
    }

    function start() {
        if (running) return;
        running = true;
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', onVisibility);
        }
        tick();
    }

    function stop() {
        running = false;
        refreshPending = false;
        clearTimer();
        abortInFlight();
        if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', onVisibility);
        }
    }

    function refreshNow() {
        if (!running || inFlight) return;
        tick();
    }

    onUnmounted(stop);

    return { start, stop, refreshNow };
}
