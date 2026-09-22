<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DriverMap from '../components/DriverMap.vue';
import { useTrackingStore } from '../store/tracking.store';
import { useToast } from 'vue-toastification';
import BasePageHeader from '@/components/BasePageHeader.vue';

const store = useTrackingStore();
const toast = useToast();

const showGeofences = ref(true);
const loadingDrivers = ref(false);
const isFullscreen = ref(false);

const mapContainer = ref(null);

const onlineCount = computed(() => store.activeDrivers.length);
const movingCount = computed(() =>
    store.activeDrivers.filter((d) => d.is_moving || d.last_location?.is_moving).length
);

let refreshInterval = null;

function refreshDrivers() {
    loadingDrivers.value = true;
    store.fetchActiveDrivers().finally(() => {
        loadingDrivers.value = false;
    });
}

function refreshGeofences() {
    if (showGeofences.value) {
        store.fetchGeofences();
    }
}

const toggleGeofences = () => {
    showGeofences.value = !showGeofences.value;
    refreshGeofences();
};

const toggleFullscreen = async () => {
    const target = mapContainer.value;
    if (!target) return;

    try {
        if (!document.fullscreenElement) {
            await target.requestFullscreen();
            isFullscreen.value = true;
        } else {
            await document.exitFullscreen();
            isFullscreen.value = false;
        }
        setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
    } catch (err) {
        toast.error('No se pudo alternar pantalla completa');
    }
};

onMounted(() => {
    refreshDrivers();
    refreshGeofences();

    refreshInterval = setInterval(() => {
        refreshDrivers();
        refreshGeofences();
    }, 10000);

    document.addEventListener('fullscreenchange', () => {
        isFullscreen.value = !!document.fullscreenElement;
    });
});

onBeforeUnmount(() => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    document.removeEventListener('fullscreenchange', () => {});
});
</script>

<template>
    <div>
        <BasePageHeader title="Mapa en Vivo" description="Seguimiento de la flota en tiempo real"
            icon="fad fa-map-marked-alt text-primary" :show-bg="true" :compact="true"
            :breadcrumbs="[{ label: 'Geolocalización' }, { label: 'Mapa en Vivo' }]">
            <template #title-after>
                <span class="badge rounded-pill bg-danger text-white ms-2">
                    <span class="pulse-indicator-live bg-white me-1"></span> LIVE
                </span>
                <span class="badge rounded-pill badge-subtle ms-1">
                    <i class="fad fa-satellite me-1" style="font-size:10px;" />
                    {{ onlineCount }} en línea
                </span>
            </template>

            <template #actions>
                <button class="btn btn-falcon-default btn-sm px-2 px-sm-3" type="button" title="Actualizar"
                    @click="refreshDrivers">
                    <i class="fad fa-sync" :class="{ 'fa-spin': loadingDrivers }"></i>
                    <span class="d-none d-sm-inline ms-1">Actualizar</span>
                </button>
                <button class="btn btn-falcon-default btn-sm px-2 px-sm-3" type="button" title="Geoercas"
                    :class="{ 'text-primary': showGeofences }" @click="toggleGeofences">
                    <i class="fad" :class="showGeofences ? 'fa-draw-polygon' : 'fa-eye-slash'"></i>
                    <span class="d-none d-sm-inline ms-1">Geocercas</span>
                </button>
                <button class="btn btn-falcon-default btn-sm px-2 px-sm-3" type="button"
                    :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'"
                    @click="toggleFullscreen">
                    <i class="fad" :class="isFullscreen ? 'fa-compress-alt' : 'fa-expand-alt'"></i>
                    <span class="d-none d-sm-inline ms-1">{{ isFullscreen ? 'Salir' : 'Pantalla' }}</span>
                </button>
            </template>
        </BasePageHeader>

        <div class="row gx-3 fade-in-up" style="animation-delay: 0.1s;">
            <div class="col-12">
                <div ref="mapContainer" class="card border-0 shadow-sm overflow-hidden"
                    :style="{ height: isFullscreen ? '100vh' : 'calc(100vh - 150px)' }">
                    <DriverMap :interactive="true" :show-geofences="showGeofences" />

                    <div class="position-absolute top-0 start-0 p-2 z-2 d-flex align-items-center gap-2">
                        <span class="badge bg-white bg-opacity-90 text-dark shadow-sm px-2 py-1 rounded-pill">
                            <span class="dot-green me-1"></span>
                            <small>En movimiento</small>
                        </span>
                        <span class="badge bg-white bg-opacity-90 text-dark shadow-sm px-2 py-1 rounded-pill">
                            <span class="dot-amber me-1"></span>
                            <small>Detenido</small>
                        </span>
                        <span class="badge bg-white bg-opacity-90 text-dark shadow-sm px-2 py-1 rounded-pill">
                            <i class="fad fa-satellite-dish text-primary me-1"></i>
                            <small>{{ movingCount }} en ruta</small>
                        </span>
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

.badge-subtle {
    background: rgba(13, 110, 253, .1);
    color: #0d6efd;
    border: 1px solid rgba(13, 110, 253, .2);
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

.dot-green {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    display: inline-block;
}

.dot-amber {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #f59e0b;
    display: inline-block;
}
</style>