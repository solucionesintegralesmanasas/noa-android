// src/hooks/useNotifications.js
// Un único canal por feature (ARQ-009): SSE como canal principal y polling
// ligero SOLO como respaldo cuando el SSE no está abierto. Nunca ambos a la vez.
import { computed, onMounted, onUnmounted } from 'vue';
import { useNotificationsStore } from '@/features/notifications/store/notifications.store.js';
import { toast } from '@/utils/toast.js';

// Respaldo lento: solo dispara si el SSE está caído. El stream ya empuja
// actualizaciones en tiempo real cuando la conexión está sana.
const FALLBACK_POLL_MS = 120000;

export function useNotifications() {
    const store = useNotificationsStore();
    let fallbackTimer = null;

    const tickRespaldo = async () => {
        if (store.sseConnected) return;
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
        await store.fetchLatestNotifications();
    };

    const programarRespaldo = () => {
        detenerRespaldo();
        fallbackTimer = setTimeout(async () => {
            try {
                await tickRespaldo();
            } finally {
                // Encadenado tras la respuesta: sin solapamiento (ARQ-010).
                programarRespaldo();
            }
        }, FALLBACK_POLL_MS);
    };

    const detenerRespaldo = () => {
        if (fallbackTimer) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
        }
    };

    // Canal principal SSE (el store evita duplicados); el polling queda
    // como respaldo y no se toca la conexión global al desmontar.
    onMounted(() => {
        store.connectSSE && store.connectSSE();
        programarRespaldo();
    });
    onUnmounted(() => detenerRespaldo());

    return {
        list: computed(() => store.allNotificationsList || []),
        count: computed(() => store.unreadCount || 0),
        format: (n) => {
            let msg = n.message || '';
            msg = msg.replace(/VENCIDO|VENCIDA/g, '<strong>$&</strong>');
            msg = msg.replace(/por VENCER/g, '<strong>$&</strong>');
            return msg;
        },
        // GoogleCallbackView los consume: existían como undefined y rompían el flujo.
        showSuccessToast: (msg) => toast('', msg, 'success'),
        showErrorToast: (msg) => toast('', msg, 'error'),
    };
}
