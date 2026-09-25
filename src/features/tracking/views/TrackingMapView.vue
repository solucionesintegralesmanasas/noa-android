<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import BasePageHeader from '@/components/BasePageHeader.vue';
import DriverMap from '../components/DriverMap.vue';
import DriverMarker from '../components/DriverMarker.vue';
import { useTrackingStore } from '../store/tracking.store';
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel.js';
import { usePermissionsStore } from '@/store/modules/permissions';
import { useToast } from 'vue-toastification';

const router = useRouter();
const store = useTrackingStore();
const permissions = usePermissionsStore();
const toast = useToast();

const canViewHistory = ref(false);
const canViewGeofences = ref(false);

const searchTerm = ref('');
const loadingDrivers = ref(false);

const filteredDrivers = computed(() => {
    if (!searchTerm.value.trim()) return store.activeDrivers;
    const term = searchTerm.value.toLowerCase();
    return store.activeDrivers.filter((d) => {
        const name = `${d.driver?.first_name || ''} ${d.driver?.last_name || ''}`.toLowerCase();
        const plate = d.vehicle?.vehicle_license_plate || '';
        const doc = d.driver?.document_number || '';
        const project = (d.project?.project_name || d.planilla_dia?.project_name || '').toLowerCase();
        const routesText = (d.planilla_dia?.routes || [])
            .map((r) => `${r.origin || ''} ${r.destination || ''} ${r.funcionario_nombre || ''} ${r.funcionario_cc || ''}`)
            .join(' ')
            .toLowerCase();
        return name.includes(term) || plate.includes(term) || doc.includes(term) || project.includes(term) || routesText.includes(term);
    });
});

const stats = computed(() => ({
    active: store.activeDrivers.filter((d) => d.is_moving || d.last_location?.is_moving).length,
    stopped: store.activeDrivers.filter((d) => !d.is_moving && !(d.last_location?.is_moving)).length,
    total: store.activeDrivers.length,
    alerts: store.alerts.filter((a) => !a.is_read).length,
}));

let channel = null;

function refreshDrivers() {
    channel?.refreshNow();
}

function openHistory(driver) {
    const uuid = driver.third_party_uuid || driver.driver?.uuid;
    if (uuid) {
        router.push({ name: 'tracking.history', params: { uuid } });
    }
}

function showLocation(driver) {
    store.selectDriver(driver);
}

function goToGeofences() {
    router.push({ name: 'tracking.geofences.list' });
}

function markAllRead() {
    store.alerts.filter((a) => !a.is_read).forEach((a) => store.markAlertRead(a.uuid));
    toast.success('Alertas marcadas como leídas');
}

onMounted(async () => {
    canViewHistory.value = permissions.can('locations.history');
    canViewGeofences.value = permissions.can('locations.geofences');

    // Canal único de refresco (ARQ-009/ARQ-010): ciclo encadenado sin
    // solapamiento, pausa con pestaña oculta y cancelación al desmontar.
    channel = useRealtimeChannel(async (signal) => {
        loadingDrivers.value = true;
        try {
            await store.fetchActiveDrivers(signal);
        } finally {
            loadingDrivers.value = false;
        }
    }, { intervalMs: 10000 });
    channel.start();

    store.fetchAlerts({ only_unread: true, per_page: 20 });
    store.fetchGeofences();
});

onBeforeUnmount(() => {
    channel?.stop();
});
</script>

<template>
    <div>
        <BasePageHeader title="Rastreo de Conductores" description="Monitoreo en tiempo real de la flota"
            icon="fad fa-satellite-dish text-primary" :show-bg="true" :compact="true"
            :breadcrumbs="[{ label: 'Geolocalización' }, { label: 'Rastreo de Conductores' }]">
            <template #actions>
                <button v-if="canViewGeofences" class="btn btn-falcon-default btn-sm px-2 px-sm-3" type="button"
                    title="Geocercas" @click="goToGeofences">
                    <i class="fad fa-draw-polygon"></i>
                    <span class="d-none d-sm-inline ms-1">Geocercas</span>
                </button>
                <button class="btn btn-falcon-default btn-sm px-2 px-sm-3" type="button" title="Actualizar"
                    @click="refreshDrivers">
                    <i class="fad fa-sync" :class="{ 'fa-spin': loadingDrivers }"></i>
                    <span class="d-none d-sm-inline ms-1">Actualizar</span>
                </button>
            </template>
        </BasePageHeader>

        <div class="row g-2 g-md-3 mb-3 fade-in-up" style="animation-delay: 0.1s;">
            <div class="col-6 col-xl-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body py-3 d-flex align-items-center gap-3">
                        <span class="avatar avatar-sm bg-primary bg-opacity-10 text-primary rounded-3">
                            <i class="fad fa-satellite-dish fs-7"></i>
                        </span>
                        <div>
                            <div class="fs-3 fw-bold text-dark">{{ stats.total }}</div>
                            <div class="text-muted fs--2">Conductores en línea</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-xl-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body py-3 d-flex align-items-center gap-3">
                        <span class="avatar avatar-sm bg-success bg-opacity-10 text-success rounded-3">
                            <i class="fad fa-tachometer-fast fs-7"></i>
                        </span>
                        <div>
                            <div class="fs-3 fw-bold text-success">{{ stats.active }}</div>
                            <div class="text-muted fs--2">En movimiento</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-xl-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body py-3 d-flex align-items-center gap-3">
                        <span class="avatar avatar-sm bg-warning bg-opacity-10 text-warning rounded-3">
                            <i class="fad fa-pause-circle fs-7"></i>
                        </span>
                        <div>
                            <div class="fs-3 fw-bold text-warning">{{ stats.stopped }}</div>
                            <div class="text-muted fs--2">Detenidos</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-xl-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body py-3 d-flex align-items-center gap-3">
                        <span class="avatar avatar-sm bg-danger bg-opacity-10 text-danger rounded-3">
                            <i class="fad fa-bell-exclamation fs-7"></i>
                        </span>
                        <div>
                            <div class="fs-3 fw-bold text-primary">{{ stats.alerts }}</div>
                            <div class="text-muted fs--2">Alertas sin leer</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row gx-3 fade-in-up" style="animation-delay: 0.2s;">
            <div class="col-12 col-lg-4 col-xl-3 mb-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-header bg-light py-2 px-3 border-bottom">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fad fa-users text-primary"></i>
                            <h6 class="mb-0 fw-medium fs--1">Conductores Activos</h6>
                            <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary ms-auto">
                                {{ filteredDrivers.length }}
                            </span>
                        </div>
                    </div>
                    <div class="card-body p-2">
                        <div class="input-group input-group-sm mb-2">
                            <span class="input-group-text bg-light border-end-0">
                                <i class="fad fa-search text-muted" />
                            </span>
                            <input v-model="searchTerm" class="form-control border-start-0 shadow-none"
                                type="search" placeholder="Buscar conductor, placa, proyecto, funcionario, ruta..." />
                        </div>
                        <div class="scrollbar" style="max-height: 620px; overflow-y: auto;">
                            <DriverMarker v-for="driver in filteredDrivers" :key="driver.third_party_uuid"
                                :driver="driver" @open-history="openHistory" @show-location="showLocation" />

                            <div v-if="!filteredDrivers.length && !loadingDrivers"
                                class="text-center py-5 text-muted">
                                <i class="fad fa-satellite-dish fs-2 d-block mb-2 opacity-50"></i>
                                <small>No hay conductores reportando ubicación</small>
                            </div>

                            <div v-if="loadingDrivers" class="text-center py-5 text-muted">
                                <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                                <small class="d-block">Actualizando conductores...</small>
                            </div>
                        </div>

                        <div v-if="store.alerts.length" class="border-top pt-2 mt-2">
                            <div class="d-flex align-items-center justify-content-between mb-1">
                                <small class="fw-semibold text-muted fs--2">
                                    <i class="fad fa-bell-exclamation me-1 text-danger"></i> Últimas alertas
                                </small>
                                <button class="btn btn-link btn-sm p-0 text-primary fs--2" @click="markAllRead">
                                    marcar todas
                                </button>
                            </div>
                            <div class="scrollbar" style="max-height: 160px; overflow-y: auto;">
                                <div v-for="alert in store.alerts.slice(0, 5)" :key="alert.uuid"
                                    class="d-flex align-items-center justify-content-between gap-2 py-1">
                                    <span class="badge rounded-pill badge-subtle fs--2"
                                        :class="{
                                            'badge-subtle-danger': alert.alert_type.includes('speed') || alert.alert_type.includes('exit'),
                                            'badge-subtle-success': alert.alert_type === 'geofence_enter',
                                            'badge-subtle-warning': alert.alert_type === 'idle',
                                        }">
                                        {{ alert.alert_type }}
                                    </span>
                                    <small class="text-muted flex-grow-1 text-truncate">{{ alert.message }}</small>
                                    <button class="btn btn-sm btn-falcon-default p-0 px-1" title="Marcar leída"
                                        @click="store.markAlertRead(alert.uuid)">
                                        <i class="fad fa-check text-primary" style="font-size:11px;" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-12 col-lg-8 col-xl-9 mb-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="bg-holder d-none d-lg-block bg-card"
                        style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />
                    <div class="card-body p-0 position-relative" style="min-height: 560px;">
                        <DriverMap @driver-selected="showLocation" />
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

.fs-7 {
    font-size: 1.1rem !important;
}

.fs--2 {
    font-size: 0.8rem !important;
}

.fs--1 {
    font-size: 0.85rem !important;
}

.badge-subtle-success {
    background: rgba(25, 135, 84, .1);
    color: #198754;
    border: 1px solid rgba(25, 135, 84, .2);
}

.badge-subtle-danger {
    background: rgba(220, 53, 69, .1);
    color: #dc3545;
    border: 1px solid rgba(220, 53, 69, .2);
}

.badge-subtle-warning {
    background: rgba(255, 193, 7, .1);
    color: #c07f00;
    border: 1px solid rgba(255, 193, 7, .3);
}

:deep(.btn-falcon-default) {
    background: #f8f9fa;
    border-color: #e9ecef;
    color: #212529;
}
</style>