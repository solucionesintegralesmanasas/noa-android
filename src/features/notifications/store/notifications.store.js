import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import apiClient from '@/services/api/client.js';
import { useUserStore } from '@store/modules/user.js';
import { tokenManager } from '@/services/security/token-manager.js';
import { logger } from '@/utils/logger.js';
import env from '@/utils/env.js';
import { Preferences } from '@capacitor/preferences';

// Tiempo que una alerta permanece visible antes de agruparse junto a la campana.
const EXPIRY_TOAST_VISIBLE_MS = 7000;
// Máximo de alertas visibles al mismo tiempo; el resto se agrupa de inmediato.
const EXPIRY_TOAST_MAX_VISIBLE = 3;

// Temporizadores por alerta (fuera del estado para no persistirlos en el store).
const expiryToastTimers = new Map();

// Resaltado de la sección del desplegable que originó el clump pulsado.
let seccionTimeout = null;

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
        // Sección del desplegable a resaltar ('priority' | 'normal' | null).
        seccionResaltada: null,
        // Conteo real de pendientes por prioridad (alimenta los clumps).
        unreadCounts: { total: 0, PRIORITARIA: 0, NORMAL: 0 },
        expiryAlertInterval: null,
    }),

    getters: {
        allNotificationsList: (state) => state.notifications,
        // Total real de pendientes (endpoint de conteos, sin el tope de 10).
        unreadCount: (state) => state.unreadCounts.total,
        unreadCompanyCount: (state) => state.unreadCounts.PRIORITARIA,
        unreadThirdPartyCount: (state) => state.unreadCounts.NORMAL,
        // Alertas prioritarias: vehículos con tarjeta de operación de la empresa propia.
        priorityAlerts: (state) => state.latestNotifications.filter(n => n.priority === 'PRIORITARIA'),
        normalAlerts: (state) => state.latestNotifications.filter(n => n.priority !== 'PRIORITARIA'),
        // El hook consulta el estado, no las tripas de la conexión (ARQ-009).
        sseConnected: (state) => !!state.sseSource
            && typeof EventSource !== 'undefined'
            && state.sseSource.readyState === EventSource.OPEN,
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

        async fetchUnreadCounts() {
            try {
                const token = await tokenManager.getAccessToken();
                if (!token) return;

                const userStore = useUserStore();
                const tenantId = userStore.company_uuid;
                const client = tenantId ? apiClient.forTenant(tenantId) : apiClient.global;

                const response = await client.get('/notifications/counts');

                if (response.data && response.data.success) {
                    const counts = response.data.data || {};
                    this.unreadCounts = {
                        total: Number(counts.total || 0),
                        PRIORITARIA: Number(counts.PRIORITARIA || 0),
                        NORMAL: Number(counts.NORMAL || 0),
                    };
                } else {
                    this.derivarConteosLocales();
                }
            } catch (error) {
                if (error?.response?.status === 401) return;
                logger.error('Error fetching notification counts:', error?.message || error);
                // Sin conteo del servidor los clumps no deben quedar en cero:
                // se derivan de la muestra cargada como respaldo.
                this.derivarConteosLocales();
            }
        },

        derivarConteosLocales() {
            const pendientes = (this.latestNotifications || []).filter(n => n.status !== 'LEIDA');
            const propias = pendientes.filter(n => n.priority === 'PRIORITARIA').length;
            this.unreadCounts = {
                total: pendientes.length,
                PRIORITARIA: propias,
                NORMAL: pendientes.length - propias,
            };
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
                    // Al marcarla como leída deja de saltar: se retira su aviso
                    // (incluido el temporizador) y el clump baja de inmediato.
                    this.activeExpiryToasts
                        .filter(t => t.uuid === uuid)
                        .forEach(t => clearExpiryToastTimer(t.id));
                    this.activeExpiryToasts = this.activeExpiryToasts.filter(t => t.uuid !== uuid);
                    await this.fetchUnreadCounts();
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
                    this.activeExpiryToasts.forEach(t => clearExpiryToastTimer(t.id));
                    this.activeExpiryToasts = [];
                    await this.fetchUnreadCounts();
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
                const token = await tokenManager.getAccessToken();
                if (!token) return;

                const userStore = useUserStore();
                const tenantId = userStore.company_uuid;
                const client = tenantId ? apiClient.forTenant(tenantId) : apiClient.global;
                
                const response = await client.get('/notifications', {
                    params: {
                        page: 1,
                        // Ventana amplia: el desplegable muestra ambos grupos y
                        // se ordena empresa primero en cliente (el listado módulo
                        // conserva su propio orden por fecha).
                        per_page: 20
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
                    this.latestNotifications = items
                        .slice()
                        .sort((a, b) => (a.priority === 'PRIORITARIA' ? 0 : 1) - (b.priority === 'PRIORITARIA' ? 0 : 1));
                }
            } catch (error) {
                if (error?.response?.status === 401) return;
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

            const token = await tokenManager.getAccessToken();
            if (!token) {
                this.closeSSESource();
                return;
            }

            // Solo carga inicial por HTTP si no hay datos: el stream ya empuja
            // actualizaciones y evita una petición pesada (~6s) en cada reconexión.
            if (!this.latestNotifications || this.latestNotifications.length === 0) {
                await this.fetchLatestNotifications();
            }
            await this.fetchUnreadCounts();

            try {
                const userStore = useUserStore();
                const tenantId = userStore.company_uuid;

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
                            this.fetchUnreadCounts();
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

                this.sseSource.onerror = async (err) => {
                    // Si ya se cerró por timeout, el listener anterior gestiona la reconexión.
                    if (!this.sseSource || this.sseSource.readyState === EventSource.CLOSED) {
                        console.warn('SSE: conexión cerrada, reintentando...', err?.type || 'error');
                    } else {
                        console.error('SSE connection error:', err);
                    }
                    this.closeSSESource();

                    // Si ya no hay token activo, detener reintentos
                    const currentToken = await tokenManager.getAccessToken();
                    if (!currentToken) return;

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

            // Las ya leídas no vuelven a saltar: solo se avisa lo pendiente.
            // Mantenimiento es por kilometraje, no por fecha: solo avisa vencido.
            const expiringToday = this.latestNotifications.filter(n => {
                if (n.status === 'LEIDA' || !n.expiry_date || !n.expiry_date.startsWith(todayStr)) {
                    return false;
                }
                if (n.type === 'VEHICLE_MAINTENANCE_ALERT') {
                    return (n.days_left ?? 0) < 0;
                }
                return true;
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

            if (this.activeExpiryToasts.some(t => t.uuid === notification.uuid)) {
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
                priority: notification.priority ?? 'NORMAL',
                created_at: timeStr,
            };

            this.activeExpiryToasts.unshift(newToast);
            await Preferences.set({ key: storageKey, value: now.toString() });

            // Los avisos son transitorios: tras unos segundos desaparecen y su
            // información queda en los clumps y en la campana (ya no se acoplan).
            this.scheduleExpiryToastDismiss(id);

            // Si hay demasiadas alertas visibles, las más antiguas se retiran
            // de inmediato para no tapar la pantalla.
            while (this.activeExpiryToasts.length > EXPIRY_TOAST_MAX_VISIBLE) {
                const overflow = this.activeExpiryToasts[this.activeExpiryToasts.length - 1];
                this.dismissExpiryToast(overflow.id);
            }
        },

        scheduleExpiryToastDismiss(id, delay = EXPIRY_TOAST_VISIBLE_MS) {
            clearExpiryToastTimer(id);
            const timeout = setTimeout(() => {
                expiryToastTimers.delete(id);
                this.dismissExpiryToast(id);
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
                this.dismissExpiryToast(id);
            }, entry.remaining);
            entry.timeout = timeout;
            entry.startedAt = Date.now();
            expiryToastTimers.set(id, entry);
        },

        // Cierra la alerta del área flotante. La notificación sigue disponible
        // en la campana y en el módulo de notificaciones.
        dismissExpiryToast(id) {
            clearExpiryToastTimer(id);
            this.activeExpiryToasts = this.activeExpiryToasts.filter(t => t.id !== id);
        },

        // Marca la sección del desplegable que originó el clump pulsado para
        // guiar la mirada; se apaga sola al poco tiempo.
        resaltarSeccion(origen) {
            this.seccionResaltada = origen;
            if (seccionTimeout) clearTimeout(seccionTimeout);
            seccionTimeout = setTimeout(() => {
                this.seccionResaltada = null;
                seccionTimeout = null;
            }, 1500);
        },
    }
});
