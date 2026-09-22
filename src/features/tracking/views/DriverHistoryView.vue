<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import BasePageHeader from '@/components/BasePageHeader.vue';
import { useTrackingStore } from '../store/tracking.store';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const store = useTrackingStore();
const { loadLeaflet } = useGeolocation();
const toast = useToast();

const driverUuid = route.params.uuid;
const startDate = ref(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
const endDate = ref(dayjs().format('YYYY-MM-DD'));

const loading = ref(false);
const capturingMap = ref(false);
let map = null;
let polylineLayer = null;
let startMarker = null;
let endMarker = null;

const totalDistance = computed(() => {
    const history = store.driverHistory;
    if (history.length < 2) return 0;
    let distance = 0;
    for (let i = 1; i < history.length; i++) {
        distance += haversine(
            parseFloat(history[i - 1].latitude),
            parseFloat(history[i - 1].longitude),
            parseFloat(history[i].latitude),
            parseFloat(history[i].longitude)
        );
    }
    return (distance / 1000).toFixed(2);
});

const totalPoints = computed(() => store.driverHistory.length);

const duration = computed(() => {
    const history = store.driverHistory;
    if (!history.length) return '—';
    const first = dayjs(history[0].recorded_at);
    const last = dayjs(history[history.length - 1].recorded_at);
    const minutes = last.diff(first, 'minute');
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
});

const avgSpeed = computed(() => {
    const moving = store.driverHistory.filter((p) => parseFloat(p.speed) > 0);
    if (!moving.length) return 0;
    return (moving.reduce((a, p) => a + parseFloat(p.speed), 0) / moving.length).toFixed(1);
});

const maxSpeed = computed(() => {
    if (!store.driverHistory.length) return 0;
    return Math.max(...store.driverHistory.map((p) => parseFloat(p.speed))).toFixed(1);
});

function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function loadHistory() {
    loading.value = true;
    await store.fetchDriverHistory(driverUuid, startDate.value, endDate.value);
    await store.fetchDriverStats(driverUuid);
    drawRoute();
    loading.value = false;
}

async function drawRoute() {
    if (!map) return;
    const L = window.L;
    if (!L) return;

    if (polylineLayer) map.removeLayer(polylineLayer);
    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);

    const history = store.driverHistory;
    if (history.length < 2) return;

    const points = history.map((p) => [parseFloat(p.latitude), parseFloat(p.longitude)]);

    polylineLayer = L.polyline(points, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.8,
    }).addTo(map);

    startMarker = L.circleMarker(points[0], { radius: 8, color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1 }).addTo(map);
    endMarker = L.circleMarker(points[points.length - 1], { radius: 8, color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1 }).addTo(map);

    map.fitBounds(L.latLngBounds(points).pad(0.1));
}

function goBack() {
    router.push({ name: 'tracking.map' });
}

async function captureAndAttachMap() {
    if (capturingMap.value) return;
    if (!store.driverHistory.length) {
        toast.error('No hay recorrido dibujado para capturar');
        return;
    }
    capturingMap.value = true;
    try {
        const { default: html2canvas } = await import('html2canvas');
        const mapEl = document.getElementById('historyMap');
        if (!mapEl) {
            toast.error('El mapa aún no está listo');
            return;
        }
        const canvas = await html2canvas(mapEl, {
            useCORS: true,
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
        });
        const dataUrl = canvas.toDataURL('image/png');
        await store.attachRouteMap(driverUuid, startDate.value, dataUrl);
        toast.success(`Captura pegada en la planilla del ${startDate.value}`);
    } catch (err) {
        toast.error('No se pudo capturar el mapa. Intenta de nuevo.');
    } finally {
        capturingMap.value = false;
    }
}

watch([startDate, endDate], () => {
    if (startDate.value > endDate.value) {
        toast.error('La fecha de inicio no puede ser mayor que la de fin');
        return;
    }
    loadHistory();
});

onMounted(async () => {
    try {
        const L = await loadLeaflet();
        map = L.map('historyMap', { center: [4.710993, -74.072068], zoom: 13 });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        await loadHistory();

        setTimeout(() => map?.invalidateSize(), 300);
    } catch (err) {
        console.error('Error inicializando mapa de historial:', err);
    }
});
</script>

<template>
    <div>
        <BasePageHeader title="Historial de Ruta" description="Recorrido y estadísticas del conductor"
            icon="fad fa-route text-primary" :show-back="true" :show-bg="true" :compact="true"
            :breadcrumbs="[{ label: 'Geolocalización' }, { label: 'Rastreo de Conductores', to: { name: 'tracking.map' } }, { label: 'Historial' }]"
            @back="goBack">
            <template #subtitle>
                <small v-if="store.stats?.active_session" class="text-muted" style="font-size: 0.85rem;">
                    Sesión activa iniciada: {{ dayjs(store.stats.active_session.started_at).format('DD/MM/YYYY HH:mm') }}
                </small>
                <small v-else class="text-muted" style="font-size: 0.85rem;">
                    {{ totalPoints }} puntos GPS registrados en el rango seleccionado
                </small>
            </template>
        </BasePageHeader>

        <div class="card border-0 shadow-sm mb-3 fade-in-up" style="animation-delay: 0.1s;">
            <div class="bg-holder d-none d-lg-block bg-card"
                style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />
            <div class="card-body position-relative py-2">
                <div class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                    <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
                        <span class="fw-medium fs--1">Periodo:</span>
                        <div class="d-flex flex-wrap align-items-center gap-2">
                            <div class="input-group input-group-sm" style="max-width: 220px;">
                                <span class="input-group-text bg-light border-end-0"><i class="fad fa-calendar-alt text-muted" /></span>
                                <input type="date" v-model="startDate" class="form-control border-start-0 shadow-none" />
                            </div>
                            <span class="text-muted fs--2">a</span>
                            <div class="input-group input-group-sm" style="max-width: 220px;">
                                <span class="input-group-text bg-light border-end-0"><i class="fad fa-calendar-check text-muted" /></span>
                                <input type="date" v-model="endDate" class="form-control border-start-0 shadow-none" />
                            </div>
                        </div>
                    </div>

                    <div class="d-flex align-items-center gap-3 flex-wrap">
                        <div class="text-center">
                            <div class="fs-3 fw-bold text-dark">{{ totalDistance }}</div>
                            <div class="text-muted fs--2">km recorridos</div>
                        </div>
                        <div class="text-center">
                            <div class="fs-3 fw-bold text-dark">{{ duration }}</div>
                            <div class="text-muted fs--2">duración</div>
                        </div>
                        <div class="text-center">
                            <div class="fs-3 fw-bold text-primary">{{ avgSpeed }}</div>
                            <div class="text-muted fs--2">km/h promedio</div>
                        </div>
                        <div class="text-center">
                            <div class="fs-3 fw-bold text-warning">{{ maxSpeed }}</div>
                            <div class="text-muted fs--2">km/h máx</div>
                        </div>
                        <div class="text-center">
                            <div class="fs-3 fw-bold text-success">{{ totalPoints }}</div>
                            <div class="text-muted fs--2">puntos GPS</div>
                        </div>
                        <button type="button" class="btn btn-falcon-default btn-sm"
                            :disabled="capturingMap || !store.driverHistory.length"
                            title="Captura el mapa visible y lo pega en la planilla del día de inicio"
                            aria-label="Capturar mapa y pegarlo en la planilla del día"
                            @click="captureAndAttachMap">
                            <span v-if="capturingMap" class="spinner-border spinner-border-sm me-1" role="status"></span>
                            <i v-else class="fad fa-camera me-1" aria-hidden="true"></i>
                            {{ capturingMap ? 'Pegando...' : 'Pegar mapa en planilla' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="row gx-3 fade-in-up" style="animation-delay: 0.2s;">
            <div class="col-12">
                <div class="card border-0 shadow-sm">
                    <div class="bg-holder d-none d-lg-block bg-card"
                        style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />
                    <div class="card-body p-0 position-relative" style="min-height: 560px;">
                        <div id="historyMap" class="w-100" style="height: 600px; border-radius: 0 0 0.75rem 0.75rem;"></div>

                        <div v-if="loading" class="position-absolute top-0 start-0 end-0 bottom-0 bg-white bg-opacity-80 d-flex flex-column align-items-center justify-content-center z-3 rounded-bottom">
                            <div class="spinner-border text-primary mb-2" role="status"></div>
                            <span class="text-muted small">Cargando historial...</span>
                        </div>

                        <div v-if="!loading && !store.driverHistory.length"
                            class="position-absolute top-0 start-0 end-0 bottom-0 bg-white bg-opacity-80 d-flex flex-column align-items-center justify-content-center z-3 rounded-bottom">
                            <i class="fad fa-map-marker-alt-slash fs-1 text-muted opacity-50 mb-3"></i>
                            <span class="text-muted fw-medium">Sin puntos de ubicación en el rango seleccionado</span>
                        </div>

                        <div class="position-absolute top-0 start-0 p-2 z-2 d-flex align-items-center gap-2">
                            <span class="badge bg-white bg-opacity-90 text-dark shadow-sm px-2 py-1 rounded-pill">
                                <span class="dot-green me-1"></span><small>Inicio</small>
                            </span>
                            <span class="badge bg-white bg-opacity-90 text-dark shadow-sm px-2 py-1 rounded-pill">
                                <span class="dot-red me-1"></span><small>Fin</small>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fs-3 {
    font-size: 1.4rem !important;
}

.fs--1 {
    font-size: 0.9rem !important;
}

.fs--2 {
    font-size: 0.8rem !important;
}

.dot-green {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    display: inline-block;
}

.dot-red {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ef4444;
    display: inline-block;
}
</style>