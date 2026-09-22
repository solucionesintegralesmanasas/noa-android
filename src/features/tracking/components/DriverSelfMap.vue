<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useDriverTrackingStore } from '../store/driverTracking.store';

const props = defineProps({
    vehicles: {
        type: Array,
        default: () => [],
    },
    preferredVehicleUuid: {
        type: String,
        default: null,
    },
});

// Rastreo global persistente: sobrevive a la navegación (Dashboard <-> Control Operativo).
const driverTracking = useDriverTrackingStore();

const selectedVehicleUuid = ref(props.preferredVehicleUuid || props.vehicles[0]?.uuid || null);
const sessionDuration = ref(0);
const errorMsg = ref('');
// Indica si el arranque automático ya intentó pedir el GPS al menos una vez.
const autoAttempted = ref(false);

let autoStarted = false;
let map = null;
let markerInstance = null;
let polylineInstance = null;
let durationTimer = null;

const isTracking = computed(() => driverTracking.isTracking);
const session = computed(() => driverTracking.session);

const hasVehicles = computed(() => props.vehicles && props.vehicles.length > 0);

const formattedDuration = computed(() => {
    const total = sessionDuration.value;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
});

const vehicleLabel = computed(() => {
    if (!selectedVehicleUuid.value) return 'Vehículo no asignado';
    const vehicle = props.vehicles.find((v) => v.uuid === selectedVehicleUuid.value);
    return vehicle ? `${vehicle.plate || 'SIN-PLACA'} · ${vehicle.brand || ''} ${vehicle.line || ''}`.trim() : 'Vehículo';
});

const lastSentLabel = computed(() => {
    const d = driverTracking.lastSentAt;
    if (!d) return 'sin envíos aún';
    return new Intl.DateTimeFormat('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    }).format(d instanceof Date ? d : new Date(d));
});

function loadLeaflet() {
    return new Promise((resolve, reject) => {
        if (window.L) {
            resolve(window.L);
            return;
        }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve(window.L);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function initAutoTracking() {
    if (autoStarted || driverTracking.isTracking) {
        // Si ya hay sesión global, solo sincronizar el vehículo visible.
        if (selectedVehicleUuid.value) driverTracking.updateContext({ vehicleUuid: selectedVehicleUuid.value });
        return;
    }
    if (!selectedVehicleUuid.value) return;

    autoStarted = true;
    autoAttempted.value = true;
    const result = await driverTracking.ensureTracking({ vehicleUuid: selectedVehicleUuid.value });
    if (!result && !driverTracking.isTracking) {
        errorMsg.value = driverTracking.errorMsg
            ? 'Error de GPS: ' + driverTracking.errorMsg
            : 'Error de GPS: no se pudo iniciar el rastreo';
        autoStarted = false;
        return;
    }
    errorMsg.value = driverTracking.errorMsg || '';

    sessionDuration.value = 0;
    if (durationTimer) clearInterval(durationTimer);
    durationTimer = setInterval(() => sessionDuration.value++, 1000);
}

// Reintento manual con gesto del usuario (botón "Activar ubicación").
async function requestLocationAccess() {
    errorMsg.value = '';
    await driverTracking.retryFromUserGesture();
    if (!driverTracking.isTracking && selectedVehicleUuid.value) {
        autoStarted = false;
        await initAutoTracking();
    } else {
        autoAttempted.value = true;
        errorMsg.value = driverTracking.errorMsg || '';
    }
}

async function setupMap() {
    try {
        const L = await loadLeaflet();
        if (!document.getElementById('driverSelfMap')) return;

        map = L.map('driverSelfMap', {
            center: [4.710993, -74.072068],
            zoom: 14,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 300);
    } catch (err) {
        console.error('Error inicializando mapa del conductor:', err);
    }
}

watch(
    () => driverTracking.coords,
    (pos) => {
        if (!map || !pos || pos.latitude === null || pos.longitude === null) return;
        const L = window.L;
        if (!L) return;

        const lat = pos.latitude;
        const lng = pos.longitude;

        if (!markerInstance) {
            markerInstance = L.marker([lat, lng], { zIndexOffset: 1000 }).addTo(map);
            markerInstance.bindPopup('<strong>Tu ubicación en vivo</strong>');
        } else {
            markerInstance.setLatLng([lat, lng]);
        }

        if (polylineInstance) {
            polylineInstance.setLatLngs(driverTracking.routeHistory);
        } else if (driverTracking.routeHistory.length > 1) {
            polylineInstance = L.polyline(driverTracking.routeHistory, {
                color: '#2c7be5',
                weight: 5,
                opacity: 0.7,
            }).addTo(map);
        }

        map.panTo([lat, lng]);
    },
    { deep: true }
);

watch(
    () => [props.vehicles, props.preferredVehicleUuid],
    () => {
        if (!selectedVehicleUuid.value) {
            const fallback = props.preferredVehicleUuid || props.vehicles[0]?.uuid || null;
            if (fallback) selectedVehicleUuid.value = fallback;
        }
        initAutoTracking();
    },
    { immediate: true }
);

watch(
    () => driverTracking.errorMsg,
    (msg) => { if (msg) errorMsg.value = 'Error de GPS: ' + msg; }
);

onMounted(async () => {
    await driverTracking.checkPermission();
    setupMap();
});

onBeforeUnmount(() => {
    // Intencional: NO se detiene el GPS al salir del Dashboard.
    // El rastreo global debe seguir activo en Control Operativo.
    // Solo se libera el mapa y el cronómetro local de esta vista.
    if (durationTimer) clearInterval(durationTimer);
    if (map) {
        map.remove();
        map = null;
    }
    markerInstance = null;
    polylineInstance = null;
});
</script>

<template>
    <div class="card border-0 shadow-sm self-tracking-map overflow-hidden h-100">
        <div class="card-header bg-light d-flex flex-wrap justify-content-between align-items-center gap-2 py-2 px-3">
            <div class="d-flex align-items-center gap-2">
                <h6 class="mb-0 fw-bold text-900 fs-14">Mi Ubicación en Vivo</h6>
                <span class="badge rounded-pill bg-danger text-white d-inline-flex align-items-center gap-1">
                    <span class="pulse-indicator-live bg-white"></span>
                    LIVE
                </span>
                <span v-if="vehicleLabel" class="badge bg-subtle-secondary text-dark fw-semibold">
                    <i class="fas fa-car me-1"></i>{{ vehicleLabel }}
                </span>
            </div>
            <div v-if="isTracking" class="d-flex align-items-center gap-3 fs-11 text-700">
                <span class="d-inline-flex align-items-center gap-1 text-success">
                    <i class="fas fa-satellite"></i>
                    {{ driverTracking.speed }} km/h
                </span>
                <span class="d-inline-flex align-items-center gap-1 text-primary">
                    <i class="far fa-clock"></i>
                    {{ formattedDuration }}
                </span>
                <span class="d-none d-md-inline-flex align-items-center gap-1"
                    :class="driverTracking.lastSentAt ? 'text-success' : 'text-muted'"
                    :title="driverTracking.sendError || 'Último punto guardado en el servidor'">
                    <i class="fas fa-cloud-upload-alt"></i>
                    {{ lastSentLabel }}
                </span>
            </div>
        </div>

        <div v-if="!isTracking && (autoAttempted || !hasVehicles || driverTracking.permissionState === 'denied' || driverTracking.permissionState === 'unsupported')"
            class="px-3 pt-3">
            <div v-if="!hasVehicles" class="alert alert-warning py-2 px-3 fs-11 mb-0 d-flex align-items-center gap-2">
                <i class="fas fa-car-crash"></i>
                <span>No tienes vehículos asignados: el rastreo GPS no puede iniciar. Contacta a tu empresa.</span>
            </div>
            <div v-else-if="driverTracking.permissionState === 'denied'"
                class="alert alert-danger py-2 px-3 fs-11 mb-0">
                <div class="d-flex align-items-center gap-2 mb-1">
                    <i class="fas fa-map-marker-alt-slash"></i>
                    <strong>Ubicación bloqueada en este navegador.</strong>
                </div>
                <div class="mb-2">Permite el acceso para registrar tu ruta: toca el candado de la barra de direcciones → Permisos → Ubicación → Permitir. Luego pulsa reintentar.</div>
                <button class="btn btn-sm btn-danger" type="button" @click="requestLocationAccess">
                    <i class="fas fa-redo me-1"></i>Reintentar
                </button>
            </div>
            <div v-else-if="driverTracking.permissionState === 'unsupported'"
                class="alert alert-warning py-2 px-3 fs-11 mb-0 d-flex align-items-center gap-2">
                <i class="fas fa-shield-alt"></i>
                <span>GPS no disponible: abra la aplicación por HTTPS o localhost. Por HTTP con IP o dominio .local el navegador bloquea la ubicación.</span>
            </div>
            <div v-else class="alert alert-info py-2 px-3 fs-11 mb-0 d-flex align-items-center justify-content-between gap-2">
                <span class="d-flex align-items-center gap-2">
                    <i class="fas fa-satellite-dish"></i>
                    Para registrar tu ruta, permite el acceso a tu ubicación cuando el navegador lo solicite.
                </span>
                <button class="btn btn-sm btn-primary flex-shrink-0" type="button" @click="requestLocationAccess">
                    <i class="fas fa-location-arrow me-1"></i>Activar ubicación
                </button>
            </div>
        </div>

        <div class="card-body p-0 position-relative" style="min-height: 380px;">
            <div id="driverSelfMap" class="w-100" style="height: 380px; z-index: 0;"></div>

            <!-- Overlay informativo -->
            <div class="position-absolute bottom-0 start-0 p-2 w-100 d-flex justify-content-between align-items-end pointer-events-none">
                <div class="bg-white bg-opacity-90 rounded-2 shadow-sm px-2 py-1 fs-11 text-700">
                    <span v-if="driverTracking.coords.latitude !== null" class="d-inline-flex align-items-center gap-1 text-primary">
                        <i class="fas fa-map-marker-alt"></i>
                        {{ Number(driverTracking.coords.latitude).toFixed(6) }}, {{ Number(driverTracking.coords.longitude).toFixed(6) }}
                    </span>
                    <span v-else class="text-muted">
                        <i class="fas fa-spinner fa-spin me-1"></i>Esperando señal GPS…
                    </span>
                </div>
                <div v-if="isTracking" class="bg-white bg-opacity-90 rounded-2 shadow-sm px-2 py-1 fs-11 fw-bold"
                    :class="driverTracking.isMoving ? 'text-warning' : 'text-secondary'">
                    {{ driverTracking.isMoving ? 'En ruta' : 'Detenido' }}
                </div>
            </div>

            <!-- Estado de error -->
            <div v-if="errorMsg" class="position-absolute top-2 start-0 end-0 mx-3">
                <div class="alert alert-danger py-1 px-2 fs-11 mb-0 text-center shadow-sm">
                    <i class="fas fa-exclamation-circle me-1"></i>{{ errorMsg }}
                </div>
            </div>
        </div>

        <div v-if="isTracking && driverTracking.sendError"
            class="card-footer bg-warning bg-opacity-10 py-2 px-3 fs-11 text-warning d-flex align-items-center gap-2">
            <i class="fas fa-exclamation-triangle"></i>
            <span>{{ driverTracking.sendError }}. Reintentando automáticamente cada 10 s…</span>
        </div>

        <div v-if="isTracking && driverTracking.useBackground"
            class="card-footer bg-success bg-opacity-10 py-2 px-3 fs-11 text-success d-flex align-items-center gap-2">
            <i class="fas fa-shield-alt" aria-hidden="true"></i>
            <span>Rastreo en segundo plano activo: sigue transmitiendo aunque cierres la app{{ driverTracking.nativeQueued ? ` · ${driverTracking.nativeQueued} puntos en cola` : '' }}.</span>
        </div>
        <div v-if="isTracking && driverTracking.useBackground && driverTracking.batteryExempt === false"
            class="card-footer bg-white py-2 px-3 fs-11 d-flex align-items-center justify-content-between gap-2">
            <span class="text-warning d-flex align-items-center gap-2">
                <i class="fas fa-battery-quarter" aria-hidden="true"></i>
                <span>El sistema puede detener el GPS al cerrar la app. Toca para permitir sin restricciones.</span>
            </span>
            <button class="btn btn-sm btn-warning flex-shrink-0" type="button" @click="driverTracking.requestBatteryExemption()">
                Permitir siempre
            </button>
        </div>

        <div v-if="!isTracking" class="card-footer bg-white py-2 px-3 fs-11 text-muted d-flex align-items-center justify-content-between">
            <span>
                <i class="fas fa-circle-notch fa-spin text-primary me-1"></i>
                Inicializando rastreo GPS automático…
            </span>
            <button v-if="hasVehicles" class="btn btn-sm btn-link p-0 text-primary fs-11" data-bs-toggle="collapse" data-bs-target="#selfMapVehiclePicker" type="button">
                Cambiar vehículo
            </button>
        </div>
    </div>
</template>

<style scoped>
.self-tracking-map {
    border-left: 5px solid #00d27a !important;
    border-radius: 12px;
}

.pulse-indicator-live {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    display: inline-block;
    animation: pulse-live 1.4s ease-out infinite;
}

@keyframes pulse-live {
    0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
    70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}
</style>
