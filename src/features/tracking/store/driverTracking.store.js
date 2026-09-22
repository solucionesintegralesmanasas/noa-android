import { defineStore } from 'pinia';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import trackingService from '../services/tracking.service';
import backgroundTracking from '../services/backgroundTracking.service';
import { useUserStore } from '@store';

/**
 * DriverTrackingStore — rastreo GPS global y persistente del conductor.
 *
 * Vive a nivel de DashboardLayout (provider invisible), NO ligado a
 * ConductorDashboardView ni a Control Operativo. Así el watchPosition y la
 * sesión de backend sobreviven a la navegación entre rutas.
 */
export const useDriverTrackingStore = defineStore('driverTracking', {
    state: () => ({
        coords: { latitude: null, longitude: null },
        speed: 0,
        isMoving: false,
        routeHistory: [],
        lastSentAt: null,
        sendError: '',
        permissionState: 'unknown', // granted | prompt | denied | unsupported | unknown
        watchActive: false,
        isTracking: false,
        session: null,
        vehicleUuid: null,
        projectUuid: null,
        errorMsg: '',
        starting: false,
        // Bloqueo por rechazo de validación del servidor (400/422): evita la tormenta
        // de reintentos automáticos. Se limpia al cambiar de vehículo o reintento manual.
        bloqueoSesion: '',
        // Rastreo nativo en segundo plano (sobrevive con app cerrada).
        useBackground: false,
        nativeQueued: 0,
        batteryExempt: true,
    }),

    getters: {
        hasFix: (s) => s.coords.latitude !== null && s.coords.longitude !== null,
    },

    actions: {
        async checkPermission() {
            try {
                if (Capacitor.isNativePlatform()) {
                    const perm = await Geolocation.checkPermissions();
                    this.permissionState = perm.location === 'granted' ? 'granted' : 'prompt';
                    return this.permissionState;
                }
                if (!navigator.geolocation || window.isSecureContext === false) {
                    this.permissionState = 'unsupported';
                    return this.permissionState;
                }
                if (!navigator.permissions?.query) {
                    this.permissionState = 'unknown';
                    return this.permissionState;
                }
                const status = await navigator.permissions.query({ name: 'geolocation' });
                this.permissionState = status.state;
                try {
                    status.onchange = () => { this.permissionState = status.state; };
                } catch { /* navegadores sin onchange */ }
                return this.permissionState;
            } catch {
                this.permissionState = 'unknown';
                return this.permissionState;
            }
        },

        /**
         * Asegura el rastreo activo. Si ya hay watch + sesión, solo actualiza
         * el contexto (vehículo/proyecto) sin crear sesión duplicada.
         */
        async ensureTracking({ vehicleUuid = null, projectUuid = null } = {}) {
            if (vehicleUuid && vehicleUuid !== this.vehicleUuid) {
                // Vehículo distinto: se permite un nuevo intento.
                this.vehicleUuid = vehicleUuid;
                this.bloqueoSesion = '';
            } else if (vehicleUuid) {
                this.vehicleUuid = vehicleUuid;
            }
            if (projectUuid) this.projectUuid = projectUuid;

            // Ya activo: solo refrescar contexto de envío, no duplicar.
            if (this.isTracking && this.watchActive) {
                return this.session;
            }
            if (this.starting) return this.session;
            if (!this.vehicleUuid) return null;
            // Rechazo previo del servidor para este vehículo: no insistir en automático.
            if (this.bloqueoSesion) {
                this.errorMsg = this.bloqueoSesion;
                return null;
            }

            this.starting = true;
            this.errorMsg = '';
            try {
                // Punto exacto de inicio (no bloquea si falla).
                let firstPosition = null;
                try {
                    firstPosition = await this.getCurrentPosition();
                } catch (e) {
                    console.warn('[driverTracking] sin primera posición inmediata:', e?.message);
                }

                // Sesión backend (una sola vez).
                if (!this.isTracking || !this.session) {
                    const userStore = useUserStore();
                    const thirdPartyUuid = userStore.uuid_driver || userStore.third_party_uuid || null;
                    if (!thirdPartyUuid) {
                        this.errorMsg = 'Tu usuario no tiene un conductor vinculado. Contacta al administrador para vincular tu usuario en company_user.';
                        return null;
                    }
                    const payload = { vehicle_uuid: this.vehicleUuid, third_party_uuid: thirdPartyUuid };
                    if (this.projectUuid) payload.project_uuid = this.projectUuid;
                    const res = await trackingService.startSession(payload);
                    this.session = res?.data?.data || res?.data || null;
                    this.isTracking = true;
                }

                if (firstPosition?.coords) {
                    const s = firstPosition.coords.speed || 0;
                    await this.sendImmediate({
                        lat: firstPosition.coords.latitude,
                        lng: firstPosition.coords.longitude,
                        speed: Math.round(s * 3.6),
                        isMoving: s > 0.2,
                        accuracy: firstPosition.coords.accuracy ?? null,
                    });
                }

                await this.startWatch();
                // Elevar a segundo plano nativo: el servicio sigue con app cerrada.
                await this.startBackgroundService();
                return this.session;
            } catch (err) {
                const status = err?.response?.status;
                const backendMsg = err?.response?.data?.message;
                if (status === 400 || status === 422) {
                    // El servidor rechazó los datos (ej: usuario sin conductor vinculado):
                    // se muestra el mensaje real y se bloquean los reintentos automáticos.
                    this.bloqueoSesion = backendMsg || 'El servidor rechazó el inicio de la sesión de rastreo. Verifica el vehículo y tu usuario.';
                    this.errorMsg = this.bloqueoSesion;
                } else {
                    this.errorMsg = backendMsg || err?.message || 'No se pudo iniciar el rastreo GPS.';
                }
                console.error('[driverTracking] ensureTracking:', err);
                return null;
            } finally {
                this.starting = false;
            }
        },

        /** Actualiza vehículo/proyecto sin reiniciar el watch. */
        updateContext({ vehicleUuid = null, projectUuid = null } = {}) {
            if (vehicleUuid && vehicleUuid !== this.vehicleUuid) {
                this.vehicleUuid = vehicleUuid;
                this.bloqueoSesion = '';
            } else if (vehicleUuid) {
                this.vehicleUuid = vehicleUuid;
            }
            if (projectUuid) this.projectUuid = projectUuid;
            // Propagar al servicio nativo sin reiniciarlo (sigue con app cerrada).
            if (this.useBackground && this.session?.uuid) {
                try {
                    const userStore = useUserStore();
                    backgroundTracking.updateContext({
                        sessionUuid: this.session.uuid,
                        vehicleUuid: this.vehicleUuid,
                        projectUuid: this.projectUuid,
                        thirdPartyUuid: userStore.uuid_driver || userStore.third_party_uuid || null,
                    });
                } catch { /* el servicio conserva el último contexto */ }
            }
        },

        async startWatch() {
            if (this.watchActive) return;
            const isNative = Capacitor.isNativePlatform();

            if (isNative) {
                const perm = await Geolocation.requestPermissions();
                if (perm.location === 'denied') {
                    this.permissionState = 'denied';
                    throw new Error('Permiso de ubicación denegado por el usuario.');
                }
                this.permissionState = 'granted';
                const id = await Geolocation.watchPosition(
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
                    (position, err) => {
                        if (err || !position?.coords) {
                            this.errorMsg = err?.message || 'Error al obtener posición GPS.';
                            return;
                        }
                        this.handlePosition(position);
                    }
                );
                this._watchId = id;
                this._isNativeWatch = true;
                this.watchActive = true;
                return;
            }

            if (!navigator.geolocation) {
                this.permissionState = window.isSecureContext === false ? 'unsupported' : 'unknown';
                throw new Error(
                    window.isSecureContext === false
                        ? 'GPS bloqueado por conexión no segura: abra la aplicación por HTTPS o localhost.'
                        : 'Geolocalización no soportada por este navegador.'
                );
            }
            const id = navigator.geolocation.watchPosition(
                (position) => this.handlePosition(position),
                (err) => {
                    this.errorMsg = 'Permiso de ubicación denegado o error de señal GPS.';
                    if (err?.code === 1) this.permissionState = 'denied';
                    console.warn('[driverTracking] watch error:', err);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
            this._watchId = id;
            this._isNativeWatch = false;
            this.watchActive = true;
        },

        handlePosition(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            if (lat === undefined || lng === undefined || lat === null || lng === null) return;
            if (this.coords.latitude === lat && this.coords.longitude === lng) return;

            const rawSpeed = position.coords.speed || 0;
            this.coords = { latitude: lat, longitude: lng };
            this.speed = Math.round(rawSpeed * 3.6);
            this.isMoving = rawSpeed > 0.2;
            this.routeHistory.push([lat, lng]);
            if (this.routeHistory.length > 2000) this.routeHistory.splice(0, 500);

            this.sendLocationToServer({
                lat, lng,
                speed: this.speed,
                isMoving: this.isMoving,
                accuracy: position.coords.accuracy ?? null,
            });
        },

        async sendLocationToServer(data) {
            if (!this.isTracking) return;
            // Si el servicio nativo está activo, él publica al backend
            // (sobrevive con app cerrada). El watch JS solo alimenta la UI
            // para no duplicar POSTs.
            if (this.useBackground) return;
            const now = Date.now();
            if (now - (this._lastSendAt || 0) < 10000) return;
            this._lastSendAt = now;
            try {
                const payload = {
                    location: {
                        latitude: data.lat,
                        longitude: data.lng,
                        speed: data.speed ?? 0,
                        is_moving: data.isMoving ?? false,
                        accuracy: data.accuracy ?? null,
                        recorded_at: new Date().toISOString(),
                    },
                };
                if (this.session?.uuid) payload.session_uuid = this.session.uuid;
                if (this.vehicleUuid) payload.location.vehicle_uuid = this.vehicleUuid;
                if (this.projectUuid) payload.location.project_uuid = this.projectUuid;
                try {
                    const thirdPartyUuid = useUserStore().uuid_driver || useUserStore().third_party_uuid || null;
                    if (thirdPartyUuid) payload.location.third_party_uuid = thirdPartyUuid;
                } catch { /* store no disponible, el backend resuelve por pivot */ }
                await trackingService.sendLocation(payload);
                this.lastSentAt = new Date();
                this.sendError = '';
            } catch (err) {
                const status = err?.response?.status;
                this.sendError = status
                    ? `Error HTTP ${status} al enviar la ubicación`
                    : (err?.message || 'Error de red al enviar la ubicación');
                console.error('[driverTracking] envío:', this.sendError, err?.response?.data || err);
            }
        },

        async sendImmediate(data) {
            if (!this.isTracking) return;
            this._lastSendAt = 0;
            return this.sendLocationToServer(data);
        },

        async getCurrentPosition() {
            if (Capacitor.isNativePlatform()) {
                const perm = await Geolocation.requestPermissions();
                if (perm.location === 'denied') throw new Error('Permiso de ubicación denegado por el usuario.');
                return Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
            }
            if (!navigator.geolocation) {
                throw new Error(
                    window.isSecureContext === false
                        ? 'GPS bloqueado por conexión no segura: abra la aplicación por HTTPS o localhost.'
                        : 'Geolocalización no soportada por este navegador.'
                );
            }
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true, timeout: 10000, maximumAge: 0,
                });
            });
        },

        async stopLocalWatch() {
            this.watchActive = false;
            if (this._watchId !== null && this._watchId !== undefined) {
                try {
                    if (this._isNativeWatch) await Geolocation.clearWatch({ id: this._watchId });
                    else if (navigator.geolocation) navigator.geolocation.clearWatch(this._watchId);
                } catch { /* ignorar */ }
                this._watchId = null;
            }
        },

        /**
         * Cierre ordenado: primero POST /tracking/session/stop con token válido,
         * luego clearWatch + stop del servicio nativo y limpieza local.
         * Llamar ANTES de borrar el token.
         */
        async stopGpsSession() {
            if (this.session?.uuid) {
                try {
                    await trackingService.stopSession(this.session.uuid);
                } catch (err) {
                    console.warn('[driverTracking] stopSession:', err?.message);
                }
            }
            try {
                await backgroundTracking.stop();
            } catch { /* servicio ya detenido */ }
            if (this._nativeTimer) {
                try { clearInterval(this._nativeTimer); } catch { /* nada */ }
                this._nativeTimer = null;
            }
            await this.stopLocalWatch();
            this.session = null;
            this.isTracking = false;
            this.useBackground = false;
            this.nativeQueued = 0;
            this.errorMsg = '';
            this.bloqueoSesion = '';
        },

        /** Reintento manual con gesto del usuario (botón Activar ubicación). */
        async retryFromUserGesture() {
            this.errorMsg = '';
            this.bloqueoSesion = '';
            await this.checkPermission();
            if (this.isTracking && !this.watchActive) {
                await this.startWatch();
                await this.startBackgroundService();
                return;
            }
            if (!this.isTracking && this.vehicleUuid) {
                await this.ensureTracking();
            }
        },

        /**
         * Inicia el ForegroundService nativo (Android). No falla el tracking
         * si el plugin no está: el watch JS sigue como respaldo en web.
         */
        async startBackgroundService() {
            if (!backgroundTracking.available) return;
            if (!this.session?.uuid || !this.vehicleUuid) return;
            try {
                const userStore = useUserStore();
                await backgroundTracking.start({
                    sessionUuid: this.session.uuid,
                    vehicleUuid: this.vehicleUuid,
                    projectUuid: this.projectUuid,
                    thirdPartyUuid: userStore.uuid_driver || userStore.third_party_uuid || null,
                });
                this.useBackground = true;
                this.checkBattery().catch(() => {});
                this.pollNativeStatus();
                // Refrescar token nativo por si cambió tras el login.
                backgroundTracking.refreshToken().catch(() => {});
            } catch (err) {
                console.warn('[driverTracking] servicio background no disponible:', err?.message);
                this.useBackground = false;
            }
        },

        /** Sondea el servicio nativo para reflejarlo en la UI (coords, cola, errores). */
        pollNativeStatus() {
            if (!backgroundTracking.available) return;
            if (this._nativeTimer) return;
            try {
                this._nativeTimer = setInterval(async () => {
                    await this.syncNativeStatus();
                }, 5000);
                this.syncNativeStatus().catch(() => {});
            } catch { /* temporizador opcional */ }
        },

        async syncNativeStatus() {
            if (!backgroundTracking.available || !this.useBackground) return;
            try {
                const st = await backgroundTracking.getStatus();
                if (st?.latitude != null && st?.longitude != null) {
                    this.coords = { latitude: st.latitude, longitude: st.longitude };
                    this.speed = st.speed || 0;
                    this.isMoving = (st.speed || 0) > 1;
                }
                if (st?.lastSentAt) this.lastSentAt = new Date(st.lastSentAt);
                this.nativeQueued = st?.queued || 0;
                if (st?.lastError) this.sendError = st.lastError + (this.nativeQueued ? ` · ${this.nativeQueued} en cola` : '');
                else if (this.nativeQueued) this.sendError = `${this.nativeQueued} puntos en cola sin señal`;
                else this.sendError = '';
            } catch { /* el servicio sigue aunque falle el sondeo */ }
        },

        /** Verifica exención de batería (Xiaomi/Samsung matan el servicio sin esto). */
        async checkBattery() {
            if (!backgroundTracking.available) return true;
            try {
                this.batteryExempt = await backgroundTracking.isBatteryExempt();
                return this.batteryExempt;
            } catch {
                return true;
            }
        },

        async requestBatteryExemption() {
            try {
                await backgroundTracking.requestBatteryExemption();
            } catch { /* indicar ajuste manual */ }
        },
    },
});
