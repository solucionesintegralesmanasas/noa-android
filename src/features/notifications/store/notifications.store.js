import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import apiClient from '@/services/api/client.js';
import { useUserStore } from '@store/modules/user.js';
import { tokenManager } from '@/services/security/token-manager.js';
import env from '@/utils/env.js';
import { Preferences } from '@capacitor/preferences';

// Tiempo que una alerta permanece visible antes de agruparse junto a la campana.
const EXPIRY_TOAST_VISIBLE_MS = 7000;
// Máximo de alertas visibles al mismo tiempo; el resto se agrupa de inmediato.
const EXPIRY_TOAST_MAX_VISIBLE = 3;

// Duración del resaltado azul sobre las alertas realmente nuevas.
const NOTIFICATION_HIGHLIGHT_MS = 1000;

// Temporizadores por alerta (fuera del estado para no persistirlos en el store).
const expiryToastTimers = new Map();
let notificationHighlightTimeout = null;

function clearExpiryToastTimer(id) {
    const entry = expiryToastTimers.get(id);
    if (!entry) return;
    clearTimeout(entry.timeout);
    expiryToastTimers.delete(id);
}

export const useNotificationsStore = defineStore('notifications', {
    state: () => ({
        notifications: [],
        latestNotifications: [],
        meta: {},
        loading: false,
        pollingInterval: null,
        sseSource: null,
        sseRetryCount: 0,
        sseMaxRetries: 10,
        sseReconnectTimeout: null,
        activeExpiryToasts: [],
        dockedExpiryToasts: [],
        highlightedNotificationUuids: [],
        expiryAlertInterval: null,
    }),

    getters: {
        allNotificationsList: (state) => state.notifications,
        unreadCount: (state) => state.latestNotifications.filter(n => n.status !== 'LEIDA').length,
    },

    actions: {
        async fetchNotifications(page = 1, filters = {}) {
            this.loading = true;
            try {
                const userStore = useUserStore();
                const tenantId = userStore.company_uuid;
                const client = tenantId ? apiClient.forTenant(tenantId) : apiClient.global;
                
                const response = await client.get('/notifications', {
                    params: {
                        page,
                        ...filters
                    }
                });
                
                if (response.data && response.data.success) {
                    const paginator = response.data.data;
                    if (paginator && Array.isArray(paginator.data)) {
                        this.notifications = paginator.data;
                        this.meta = {
                            total: paginator.total,
                            per_page: paginator.per_page,
                            current_page: paginator.current_page,
                            last_page: paginator.last_page
                        };
                    } else if (Array.isArray(paginator)) {
                        this.notifications = paginator;
                        this.meta = {
                            total: paginator.length
                        };
                    } else {
                        this.notifications = [];
                        this.meta = {};
                    }
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                this.loading = false;
            }
        },

        async syncNotifications() {
            this.loading = true;
            try {
                const userStore = useUserStore();
                const tenantId = userStore.company_uuid;
                const client = tenantId ? apiClient.forTenant(tenantId) : apiClient.global;
                
                const response = await client.post('/notifications/sync');
                
                if (response.data && response.data.success) {
                    toast({
                        icon: 'success', title: 'Sincronizado', text: response.data.message || 'Notificaciones sincronizadas con éxito.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    await this.fetchNotifications();
                }
            } catch (error) {
                console.error('Error syncing notifications:', error);
                toast({
                    icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al sincronizar notificaciones.'
                });
            } finally {
                this.loading = false;
            }
        },

        async requestSync() {
            try {
                const userStore = useUserStore();
                const tenantId = userStore.company_uuid;
                const client = tenantId ? apiClient.forTenant(tenantId) : apiClient.global;
                await client.post('/notifications/sync');
                await this.fetchLatestNotifications();
                await this.fetchNotifications();
            } catch (error) {
                console.error('Error in silent notification sync:', error);
            }
        },

        async markAsRead(uuid) {
            try {
                const userStore = useUserStore();
                const tenantId = userStore.company_uuid;
                const client = tenantId ? apiClient.forTenant(tenantId) : apiClient.global;
                
                const response = await client.patch(`/notifications/${uuid}/read`);
                
                if (response.data && response.data.success) {
                    const index = this.notifications.findIndex(n => n.uuid === uuid);
                    if (index !== -1) {
                        this.notifications[index].status = 'LEIDA';
                    }
                    const latestIndex = this.latestNotifications.findIndex(n => n.uuid === uuid);
                    if (latestIndex !== -1) {
                        this.latestNotifications[latestIndex].status = 'LEIDA';
                    }
                }
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        },

        async markAllAsRead() {
            try {
                const userStore = useUserStore();
                const tenantId = userStore.company_uuid;
                const client = tenantId ? apiClient.forTenant(tenantId) : apiClient.global;
                
                const response = await client.post('/notifications/read-all');
                
                if (response.data && response.data.success) {
                    this.notifications.forEach(n => {
                        n.status = 'LEIDA';
                    });
                    this.latestNotifications.forEach(n => {
                        n.status = 'LEIDA';
                    });
                    toast({
                        icon: 'success', title: 'Completado', text: 'Todas las notificaciones marcadas como leídas.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            } catch (error) {
                console.error('Error marking all as read:', error);
            }
        },

        async deleteNotification(uuid) {
            try {
                const userStore = useUserStore();
                const tenantId = userStore.company_uuid;
                const client = tenantId ? apiClient.forTenant(tenantId) : apiClient.global;
                
                const response = await client.delete(`/notifications/${uuid}`);
                
                if (response.data && response.data.success) {
                    this.notifications = this.notifications.filter(n => n.uuid !== uuid);
                }
            } catch (error) {
                console.error('Error deleting notification:', error);
            }
        },

        startPolling(intervalMs = 60000) {
            if (this.pollingInterval) return;
            // Cargar de inmediato
            this.fetchNotifications();
            this.pollingInterval = setInterval(() => {
                this.fetchNotifications();
            }, intervalMs);
        },

        stopPolling() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;
            }
        },

        async fetchLatestNotifications() {
            try {
                const userStore = useUserStore();
                const tenantId = userStore.company_uuid;
                const client = tenantId ? apiClient.forTenant(tenantId) : apiClient.global;
                
                const response = await client.get('/notifications', {
                    params: {
                        page: 1,
                        per_page: 10
                    }
                });
                
                if (response.data && response.data.success) {
                    const paginator = response.data.data;
                    let items = [];
                    if (paginator && Array.isArray(paginator.data)) {
                        items = paginator.data;
                    } else if (Array.isArray(paginator)) {
                        items = paginator;
                    }
                    this.latestNotifications = items.sort((a, b) => {
                        if (a.type === 'SOCIAL_SECURITY_MORA') return -1;
                        if (b.type === 'SOCIAL_SECURITY_MORA') return 1;
                        return 0;
                    });
                }
            } catch (error) {
                console.error('Error fetching latest notifications:', error);
            }
        },

        async connectSSE() {
            // Evita duplicados: si ya hay una conexión abierta o conectando, no crear otra.
            if (this.sseSource && this.sseSource.readyState !== EventSource.CLOSED) return;
            if (this.sseRetryCount >= this.sseMaxRetries) {
                console.warn(`SSE: máximo de reintentos alcanzado (${this.sseMaxRetries})`);
                return;
            }

            // Solo carga inicial por HTTP si no hay datos: el stream ya empuja
            // actualizaciones y evita una petición pesada (~6s) en cada reconexión.
            if (!this.latestNotifications || this.latestNotifications.length === 0) {
                await this.fetchLatestNotifications();
            }

            try {
                const userStore = useUserStore();
                const tenantId = userStore.company_uuid;
                const token = await tokenManager.getAccessToken();

                if (!token) return;

                let baseUrl = env.API_BASE_URL;
                if (baseUrl.endsWith('/')) {
                    baseUrl = baseUrl.slice(0, -1);
                }
                const url = `${baseUrl}/notifications/stream`;
                const params = new URLSearchParams();
                if (tenantId) params.append('company_uuid', tenantId);
                // EventSource no puede enviar headers Authorization, el backend acepta ?token=.
                if (token) params.append('token', token);

                const fullUrl = `${url}?${params.toString()}`;

                this.sseSource = new EventSource(fullUrl);

                this.sseSource.onopen = () => {
                    // Conexión establecida: reinicia el contador de errores.
                    this.sseRetryCount = 0;
                };

                this.sseSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (Array.isArray(data)) {
                            this.latestNotifications = data;
                        }
                    } catch (err) {
                        console.error('Error parsing SSE notifications:', err);
                    }
                };

                // Cierre programado del backend cada ~90s: reconecta sin contar como fallo.
                this.sseSource.addEventListener('timeout', () => {
                    this.closeSSESource();
                    this.sseReconnectTimeout = setTimeout(() => {
                        this.connectSSE();
                    }, 1000);
                });

                this.sseSource.onerror = (err) => {
                    // Si ya se cerró por timeout, el listener anterior gestiona la reconexión.
                    if (!this.sseSource || this.sseSource.readyState === EventSource.CLOSED) {
                        console.warn('SSE: conexión cerrada, reintentando...', err?.type || 'error');
                    } else {
                        console.error('SSE connection error:', err);
                    }
                    this.closeSSESource();
                    this.sseRetryCount++;
                    if (this.sseRetryCount > this.sseMaxRetries) {
                        console.warn(`SSE: máximo de reintentos alcanzado (${this.sseMaxRetries})`);
                        return;
                    }
                    const delay = Math.min(1000 * Math.pow(2, this.sseRetryCount), 30000);
                    console.warn(`SSE: reconexión en ${delay}ms (intento ${this.sseRetryCount}/${this.sseMaxRetries})`);
                    if (this.sseReconnectTimeout) clearTimeout(this.sseReconnectTimeout);
                    this.sseReconnectTimeout = setTimeout(() => {
                        this.connectSSE();
                    }, delay);
                };

            } catch (error) {
                console.error('Error connecting to SSE:', error);
                this.sseRetryCount++;
            }
        },


        closeSSESource() {
            if (this.sseSource) {
                this.sseSource.close();
                this.sseSource = null;
            }
        },

        disconnectSSE() {
            if (this.sseReconnectTimeout) {
                clearTimeout(this.sseReconnectTimeout);
                this.sseReconnectTimeout = null;
            }
            this.closeSSESource();
            this.sseRetryCount = 0;
        },

        startExpiryAlertInterval() {
            if (this.expiryAlertInterval) return;

            // Primer chequeo a los 5 segundos de iniciar la app
            setTimeout(() => {
                this.checkAndTriggerExpiryAlerts();
            }, 5000);

            // Chequeo recurrente cada hora (3600000 ms)
            this.expiryAlertInterval = setInterval(() => {
                this.checkAndTriggerExpiryAlerts();
            }, 3600000);
        },

        stopExpiryAlertInterval() {
            if (this.expiryAlertInterval) {
                clearInterval(this.expiryAlertInterval);
                this.expiryAlertInterval = null;
            }
        },

        async checkAndTriggerExpiryAlerts() {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            const now = Date.now();
            try {
                const { keys } = await Preferences.keys();
                const expiryKeys = keys.filter(k => k.startsWith('expiry_alert_shown_'));
                for (const key of expiryKeys) {
                    const { value } = await Preferences.get({ key });
                    if (value && (now - parseInt(value, 10)) > 86400000) {
                        await Preferences.remove({ key });
                    }
                }
            } catch (e) {
                console.error('Error cleaning up alert storage:', e);
            }

            const expiringToday = this.latestNotifications.filter(n => {
                return n.expiry_date && n.expiry_date.startsWith(todayStr);
            });

            for (const n of expiringToday) {
                await this.triggerExpiryToast(n);
            }
        },

        async triggerExpiryToast(notification) {
            const now = Date.now();
            const storageKey = `expiry_alert_shown_${notification.uuid}`;
            const { value: lastShown } = await Preferences.get({ key: storageKey });

            if (lastShown && (now - parseInt(lastShown, 10)) < 3300000) {
                return;
            }

            if (this.activeExpiryToasts.some(t => t.uuid === notification.uuid)
                || this.dockedExpiryToasts.some(t => t.uuid === notification.uuid)) {
                return;
            }

            const id = Date.now() + Math.random().toString(36).substring(2, 9);
            const timeStr = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

            const newToast = {
                id,
                uuid: notification.uuid,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                created_at: timeStr,
            };

            this.activeExpiryToasts.unshift(newToast);
            await Preferences.set({ key: storageKey, value: now.toString() });

            this.scheduleExpiryToastDock(id);

            // Si hay demasiadas alertas visibles, las más antiguas se agrupan
            // de inmediato para no tapar la pantalla.
            while (this.activeExpiryToasts.length > EXPIRY_TOAST_MAX_VISIBLE) {
                const overflow = this.activeExpiryToasts[this.activeExpiryToasts.length - 1];
                this.dockExpiryToast(overflow.id);
            }
        },

        scheduleExpiryToastDock(id, delay = EXPIRY_TOAST_VISIBLE_MS) {
            clearExpiryToastTimer(id);
            const timeout = setTimeout(() => {
                expiryToastTimers.delete(id);
                this.dockExpiryToast(id);
            }, delay);
            expiryToastTimers.set(id, { timeout, remaining: delay, startedAt: Date.now() });
        },

        pauseExpiryToastTimer(id) {
            const entry = expiryToastTimers.get(id);
            if (!entry) return;
            clearTimeout(entry.timeout);
            entry.remaining = Math.max(0, entry.remaining - (Date.now() - entry.startedAt));
            expiryToastTimers.set(id, entry);
        },

        resumeExpiryToastTimer(id) {
            const entry = expiryToastTimers.get(id);
            if (!entry) return;
            const timeout = setTimeout(() => {
                expiryToastTimers.delete(id);
                this.dockExpiryToast(id);
            }, entry.remaining);
            entry.timeout = timeout;
            entry.startedAt = Date.now();
            expiryToastTimers.set(id, entry);
        },

        // Retira la alerta visible y la acopla al grupo junto a la campana.
        dockExpiryToast(id) {
            clearExpiryToastTimer(id);
            const index = this.activeExpiryToasts.findIndex(t => t.id === id);
            if (index === -1) return;
            const [toast] = this.activeExpiryToasts.splice(index, 1);
            if (!this.dockedExpiryToasts.some(t => t.id === toast.id)) {
                this.dockedExpiryToasts.unshift(toast);
            }
        },

        // Cierra la alerta por completo del área flotante. La notificación
        // sigue disponible en la campana y en el módulo de notificaciones.
        dismissExpiryToast(id) {
            clearExpiryToastTimer(id);
            this.activeExpiryToasts = this.activeExpiryToasts.filter(t => t.id !== id);
            this.dockedExpiryToasts = this.dockedExpiryToasts.filter(t => t.id !== id);
        },

        clearDockedExpiryToasts() {
            this.dockedExpiryToasts.forEach(t => clearExpiryToastTimer(t.id));
            this.dockedExpiryToasts = [];
        },

        // Resalta por un instante las alertas que originaron el clump y lo vacía.
        // Se usa cuando el usuario abre las notificaciones desde el resumen.
        highlightDockedExpiryToasts() {
            const uuids = this.dockedExpiryToasts.map(t => t.uuid);

            if (notificationHighlightTimeout) {
                clearTimeout(notificationHighlightTimeout);
                notificationHighlightTimeout = null;
            }

            this.clearDockedExpiryToasts();
            this.highlightedNotificationUuids = uuids;

            if (uuids.length === 0) return;

            notificationHighlightTimeout = setTimeout(() => {
                this.highlightedNotificationUuids = [];
                notificationHighlightTimeout = null;
            }, NOTIFICATION_HIGHLIGHT_MS);
        }
    }
});
