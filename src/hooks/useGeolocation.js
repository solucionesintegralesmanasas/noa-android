// src/hooks/useGeolocation.js
import { ref, onUnmounted } from 'vue';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

let leafletPromise = null;

export function useGeolocation(options = {}) {
    const {
        sendToServer = false,
        intervalMs = 10000,
        sessionUuid = null,
        vehicleUuid = null,
        projectUuid = null,
        onAfterSend = null,
    } = options;

    // Contexto de envío reactivo: permite asignar el UUID de la sesión
    // una vez que esta se crea (después de montar el componente).
    const sendToServerRef = ref(sendToServer);
    const sessionUuidRef = ref(sessionUuid);
    const vehicleUuidRef = ref(vehicleUuid);
    const projectUuidRef = ref(projectUuid);

    const coords = ref({ latitude: null, longitude: null });
    const speed = ref(0);
    const isMoving = ref(false);
    const routeHistory = ref([]);
    const loading = ref(false);
    const error = ref(false);
    const errorMsg = ref('');
    // Diagnóstico de envío al servidor: hora del último POST exitoso
    // y descripción del último error HTTP (visible en la UI del conductor).
    const lastSentAt = ref(null);
    const sendError = ref('');
    // Estado del permiso de ubicación: granted | prompt | denied | unsupported | unknown.
    // Permite mostrar al conductor el botón "Activar ubicación" o las
    // instrucciones para desbloquear el permiso cuando el navegador
    // ya no vuelve a preguntar automáticamente.
    const permissionState = ref('unknown');
    // Indica si hay un watchPosition activo (evita duplicados al reintentar).
    const watchActive = ref(false);

    let watchId = null;
    let lastSendAt = 0;

    // Lee el estado del permiso SIN mostrar el diálogo del navegador.
    // En iOS la Permissions API no existe: devuelve 'unknown'.
    async function checkPermission() {
        try {
            if (Capacitor.isNativePlatform()) {
                const perm = await Geolocation.checkPermissions();
                permissionState.value = perm.location === 'granted' ? 'granted' : 'prompt';
                return permissionState.value;
            }
            if (!navigator.geolocation || window.isSecureContext === false) {
                permissionState.value = 'unsupported';
                return permissionState.value;
            }
            if (!navigator.permissions?.query) {
                permissionState.value = 'unknown';
                return permissionState.value;
            }
            const status = await navigator.permissions.query({ name: 'geolocation' });
            permissionState.value = status.state;
            try {
                status.onchange = () => { permissionState.value = status.state; };
            } catch {
                // Algunos navegadores no permiten reasignar onchange
            }
            return permissionState.value;
        } catch {
            permissionState.value = 'unknown';
            return permissionState.value;
        }
    }

    // Función para cargar dinámicamente Leaflet en demanda
    function loadLeaflet() {
        if (leafletPromise) {
            return leafletPromise;
        }

        leafletPromise = new Promise((resolve, reject) => {
            if (window.L) {
                resolve(window.L);
                return;
            }

            // Cargar CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);

            // Cargar JS
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => resolve(window.L);
            script.onerror = (err) => {
                leafletPromise = null; // Permitir reintento si falla
                reject(err);
            };
            document.head.appendChild(script);
        });

        return leafletPromise;
    }

    async function startTracking(onUpdateCallback, onErrorCallback) {
        loading.value = true;
        error.value = false;

        // Limpiar cualquier watch previo para no duplicar listeners al reintentar.
        await stopTracking();

        const isNative = Capacitor.isNativePlatform();

        if (isNative) {
            try {
                // Solicitar permisos de GPS a nivel de sistema operativo nativo (Android / iOS)
                const permResult = await Geolocation.requestPermissions();
                if (permResult.location === 'denied') {
                    throw new Error('Permiso de ubicación denegado por el usuario.');
                }

                watchId = await Geolocation.watchPosition(
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    },
                    (position, err) => {
                        if (err) {
                            error.value = true;
                            errorMsg.value = err.message || 'Error al obtener posición GPS.';
                            loading.value = false;
                            if (onErrorCallback) onErrorCallback(err);
                            return;
                        }
                        handlePositionUpdate(position, onUpdateCallback);
                    }
                );
                watchActive.value = true;
            } catch (err) {
                error.value = true;
                errorMsg.value = err.message || 'No se pudo iniciar el servicio de ubicación nativo.';
                loading.value = false;
                if (onErrorCallback) onErrorCallback(err);
            }
        } else {
            if (!navigator.geolocation) {
                error.value = true;
                // Causa más común: la app se abrió por HTTP no seguro
                // (IP o dominio .local). Chrome bloquea el GPS ahí.
                errorMsg.value = window.isSecureContext === false
                    ? 'GPS bloqueado por conexión no segura: abra la aplicación por HTTPS o localhost para permitir la ubicación.'
                    : 'Geolocalización no soportada por este navegador.';
                loading.value = false;
                if (onErrorCallback) onErrorCallback(new Error(errorMsg.value));
                return;
            }

            watchId = navigator.geolocation.watchPosition(
                (position) => handlePositionUpdate(position, onUpdateCallback),
                (err) => {
                    error.value = true;
                    errorMsg.value = 'Permiso de ubicación denegado o error de señal GPS.';
                    loading.value = false;
                    if (onErrorCallback) onErrorCallback(err);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
            watchActive.value = true;
        }
    }

    function handlePositionUpdate(position, onUpdateCallback) {
        if (!position || !position.coords) return;

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Evitar duplicados idénticos
        if (coords.value.latitude === lat && coords.value.longitude === lng) {
            loading.value = false;
            return;
        }

        const currentSpeed = position.coords.speed || 0; // m/s

        coords.value.latitude = lat;
        coords.value.longitude = lng;
        speed.value = Math.round(currentSpeed * 3.6); // km/h
        isMoving.value = currentSpeed > 0.2;

        routeHistory.value.push([lat, lng]);
        loading.value = false;

        if (onUpdateCallback) {
            onUpdateCallback({ lat, lng, speed: speed.value, isMoving: isMoving.value });
        }

        sendLocationToServer({ lat, lng, speed: speed.value, isMoving: isMoving.value, accuracy: position.coords.accuracy ?? null });
    }

    // Envía la ubicación al backend respetando el intervalo configurado
    async function sendLocationToServer(data) {
        if (!sendToServerRef.value) return;

        const now = Date.now();
        if (now - lastSendAt < intervalMs) return;
        lastSendAt = now;

        try {
            const { default: trackingService } = await import('@features/tracking/services/tracking.service');
            const payload = {
                location: {
                    latitude: data.lat,
                    longitude: data.lng,
                    speed: data.speed !== null && data.speed !== undefined ? data.speed : 0,
                    is_moving: data.isMoving ?? false,
                    accuracy: data.accuracy ?? null,
                    recorded_at: new Date().toISOString(),
                },
            };
            if (sessionUuidRef.value) payload.session_uuid = sessionUuidRef.value;
            if (vehicleUuidRef.value) payload.location.vehicle_uuid = vehicleUuidRef.value;
            if (projectUuidRef.value) payload.location.project_uuid = projectUuidRef.value;

            const response = await trackingService.sendLocation(payload);

            lastSentAt.value = new Date();
            sendError.value = '';

            if (onAfterSend && typeof onAfterSend === 'function') {
                onAfterSend(response.data, data);
            }
        } catch (err) {
            // No bloquear el tracking por un error de red, pero dejarlo
            // visible para diagnóstico (antes este catch vacío ocultaba
            // por completo los fallos de envío al servidor).
            const status = err?.response?.status;
            sendError.value = status
                ? `Error HTTP ${status} al enviar la ubicación`
                : (err?.message || 'Error de red al enviar la ubicación');
            console.error('[tracking] No se pudo enviar la ubicación:', sendError.value, err?.response?.data || err);
        }
    }

    // Obtiene la primera posición GPS de forma puntual
    // (se usa para registrar el punto exacto donde el conductor inició sesión).
    async function getCurrentPosition() {
        const isNative = Capacitor.isNativePlatform();

        if (isNative) {
            const permResult = await Geolocation.requestPermissions();
            if (permResult.location === 'denied') {
                throw new Error('Permiso de ubicación denegado por el usuario.');
            }
            return await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });
        }

        if (!navigator.geolocation) {
            throw new Error(window.isSecureContext === false
                ? 'GPS bloqueado por conexión no segura: abra la aplicación por HTTPS o localhost para permitir la ubicación.'
                : 'Geolocalización no soportada por este navegador.');
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });
        });
    }

    // Envía una ubicación de inmediato, sin esperar el intervalo configurado.
    function sendImmediate(data) {
        if (!sendToServerRef.value) return Promise.resolve();
        lastSendAt = 0;
        return sendLocationToServer(data);
    }

    // Actualiza dinámicamente el contexto de envío al servidor
    // (por ejemplo, cuando la sesión de tracking recién se crea).
    function setTrackingContext(context = {}) {
        if (typeof context.sendToServer === 'boolean') sendToServerRef.value = context.sendToServer;
        if (context.sessionUuid) sessionUuidRef.value = context.sessionUuid;
        if (context.vehicleUuid) vehicleUuidRef.value = context.vehicleUuid;
        if (context.projectUuid) projectUuidRef.value = context.projectUuid;
    }

    async function stopTracking() {
        watchActive.value = false;
        if (watchId !== null) {
            if (Capacitor.isNativePlatform()) {
                try {
                    await Geolocation.clearWatch({ id: watchId });
                } catch (e) {
                    // Ignore clearWatch errors
                }
            } else {
                navigator.geolocation.clearWatch(watchId);
            }
            watchId = null;
        }
    }

    // Limpieza automática
    onUnmounted(() => {
        stopTracking();
    });

    return {
        coords,
        speed,
        isMoving,
        routeHistory,
        loading,
        error,
        errorMsg,
        lastSentAt,
        sendError,
        permissionState,
        watchActive,
        loadLeaflet,
        startTracking,
        stopTracking,
        setTrackingContext,
        getCurrentPosition,
        sendImmediate,
        checkPermission,
    };
}
