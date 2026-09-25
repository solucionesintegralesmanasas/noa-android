<template>
    <div
        ref="pullRoot"
        class="conductor-dashboard fade-in"
        @touchstart.passive="onPullStart"
        @touchmove.passive="onPullMove"
        @touchend="onPullEnd"
    >
        <!-- Indicador pull-to-refresh -->
        <div class="pull-indicator" :class="{ 'is-pulling': pulling, 'is-refreshing': isLoading }" aria-hidden="true">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
            <span>{{ isLoading ? 'Actualizando…' : 'Desliza para actualizar' }}</span>
        </div>

        <!-- 1. HEADER COMPACTO CONDUCTOR -->
        <div class="row mb-3">
            <div class="col-12">
                <div class="card border-0 shadow-sm welcome-card overflow-hidden">
                    <div class="card-body welcome-body">
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar welcome-avatar flex-shrink-0" aria-hidden="true">
                                <div class="avatar-name rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center">
                                    <span>{{ driverInitials }}</span>
                                </div>
                            </div>
                            <div class="min-w-0 flex-fill">
                                <div class="d-flex align-items-center gap-1 flex-wrap mb-1">
                                    <span class="badge bg-warning text-dark fw-bold welcome-role">
                                        <i class="fas fa-steering-wheel me-1" aria-hidden="true"></i>CONDUCTOR
                                    </span>
                                    <span v-if="licenseInfo" class="badge bg-subtle-success text-success fw-semibold welcome-license">
                                        <i class="fas fa-id-card me-1" aria-hidden="true"></i>Cat. {{ licenseInfo.category || 'C2' }} · {{ licenseInfo.status || 'ACTIVA' }}
                                    </span>
                                </div>
                                <h1 class="welcome-title text-truncate">
                                    {{ greeting }}, <span class="text-primary">Sr. {{ conductorFirstName }}</span>
                                </h1>
                                <p class="welcome-sub text-truncate">
                                    <span class="fw-semi-bold">{{ companyName }}</span>
                                    <span v-if="conductorDocument" class="text-muted"> · CC {{ conductorDocument }}</span>
                                </p>
                            </div>
                        </div>
                        <div class="welcome-toolbar">
                            <div class="period-picker">
                                <i class="far fa-calendar-alt text-primary" aria-hidden="true"></i>
                                <label class="visually-hidden" for="f-periodo-conductor">Periodo</label>
                                <select id="f-periodo-conductor" v-model="selectedPeriod" @change="loadData">
                                    <option value="7">Últimos 7 días</option>
                                    <option value="15">Últimos 15 días</option>
                                    <option value="30">Últimos 30 días</option>
                                    <option value="90">Últimos 3 meses</option>
                                    <option value="365">Este año</option>
                                </select>
                            </div>
                            <button class="btn btn-primary welcome-refresh" :disabled="isLoading" @click="loadData" aria-label="Actualizar datos del dashboard">
                                <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }" aria-hidden="true"></i>
                                <span>Actualizar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. SERVICIO ACTIVO STICKY (prioridad a 1 toque) -->
        <div class="mb-3">
            <ActiveServiceStickyCard :active-service="activeService" :es-disponibilidad="esDisponibilidadActiva" />
        </div>

        <!-- Skeletons durante primera carga -->
        <div v-if="isLoading && !hasData" class="mb-4">
            <SkeletonLoader type="detail" :cards="2" :items-per-card="4" />
        </div>

        <template v-else>
            <!-- 3. ACCESOS RÁPIDOS 2x2 -->
            <div class="mb-4">
                <QuickActionsGrid :kpis="kpis" />
            </div>

            <!-- 4. VEHÍCULOS EN CARRUSEL -->
            <div class="mb-4">
                <div class="card border-0 shadow-sm">
                    <div class="card-body vehicle-section">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <div class="section-icon-badge bg-warning text-dark flex-shrink-0" aria-hidden="true">
                                <i class="fas fa-tachometer-alt"></i>
                            </div>
                            <div class="min-w-0">
                                <h2 class="section-title">Vehículos y kilometraje</h2>
                                <p class="section-sub">{{ filteredVehicles.length }} vehículo{{ filteredVehicles.length !== 1 ? 's' : '' }} · desliza para ver</p>
                            </div>
                        </div>
                        <div class="vehicle-search">
                            <i class="fas fa-search" aria-hidden="true"></i>
                            <label class="visually-hidden" for="buscar-vehiculo">Buscar vehículo</label>
                            <input id="buscar-vehiculo" v-model="vehicleSearch" type="search" placeholder="Buscar placa o marca…" autocomplete="off" />
                            <button v-if="vehicleSearch" type="button" aria-label="Limpiar búsqueda" @click="vehicleSearch = ''">
                                <i class="fas fa-times" aria-hidden="true"></i>
                            </button>
                        </div>
                        <VehicleCarousel :vehicles="filteredVehicles" />
                        <button v-if="vehicleSearch" class="btn btn-outline-secondary w-100 mt-2 clear-search" @click="vehicleSearch = ''">
                            Limpiar búsqueda
                        </button>
                    </div>
                </div>
            </div>

            <!-- 5. ACTIVIDAD RECIENTE EN TIMELINE -->
            <div class="mb-4">
                <RecentActivityTimeline :inspections="recentInspections" :fuecs="recentFuecs" />
            </div>

            <!-- 6. GPS EN VIVO -->
            <div class="mb-4">
                <DriverSelfMapMobile :vehicles="vehiclesList" :preferred-vehicle-uuid="preferredVehicleUuid" />
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore, useUserStore } from '@store';
import { useDashboardStore } from '../store/dashboard.store';
import SkeletonLoader from '@/components/SkeletonLoader.vue';
import ActiveServiceStickyCard from '../components/ActiveServiceStickyCard.vue';
import QuickActionsGrid from '../components/QuickActionsGrid.vue';
import VehicleCarousel from '../components/VehicleCarousel.vue';
import RecentActivityTimeline from '../components/RecentActivityTimeline.vue';
import DriverSelfMapMobile from '../components/DriverSelfMapMobile.vue';

const authStore = useAuthStore();
const userStore = useUserStore();
const dashboardStore = useDashboardStore();

const selectedPeriod = ref('30');
const vehicleSearch = ref('');
const isLoading = computed(() => dashboardStore.isLoading);

const greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
});

const conductorData = computed(() => dashboardStore.conductorData || {});
const hasData = computed(() => Boolean((conductorData.value.vehicles || []).length || conductorData.value.conductor?.name || conductorData.value.kpis));
const conductorName = computed(() => {
    return conductorData.value.conductor?.name || userStore.fullName || userStore.username || 'Conductor';
});
const conductorFirstName = computed(() => {
    const raw = (conductorData.value.conductor?.name || userStore.fullName || userStore.username || '').trim();
    if (!raw) return 'Conductor';
    const firstWord = raw.split(/\s+/)[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
});
const conductorDocument = computed(() => conductorData.value.conductor?.document || null);
const companyName = computed(() => authStore.currentTenant?.name || userStore.companyName || 'Mi empresa');
const licenseInfo = computed(() => conductorData.value.conductor?.license || null);
const kpis = computed(() => conductorData.value.kpis || {
    total_km: 0,
    vehicles_count: 0,
    inspections_count: 0,
    fuecs_count: 0,
    control_sheets_count: 0,
    service_delivery_count: 0,
});
const vehiclesList = computed(() => conductorData.value.vehicles || []);
const recentInspections = computed(() => conductorData.value.recent_inspections || []);
const recentFuecs = computed(() => conductorData.value.recent_fuecs || []);
const activeService = computed(() => conductorData.value.active_service || null);
const esDisponibilidadActiva = computed(() => {
    if (!activeService.value) return false;
    if (activeService.value.service_mode && activeService.value.service_mode !== 'CON_RECORRIDOS') return true;
    return !activeService.value.routes_count;
});

const preferredVehicleUuid = computed(() => {
    const serviceVehicle = conductorData.value.active_service?.vehicle_uuid;
    if (serviceVehicle) return serviceVehicle;
    const firstVehicle = vehiclesList.value[0];
    return firstVehicle?.uuid || null;
});

const driverInitials = computed(() => {
    const name = conductorName.value;
    if (!name) return 'CO';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
});

const filteredVehicles = computed(() => {
    const list = vehiclesList.value;
    if (!vehicleSearch.value.trim()) return list;
    const query = vehicleSearch.value.toLowerCase().trim();
    return list.filter(v => {
        const plate = (v.plate || '').toLowerCase();
        const brand = (v.brand || '').toLowerCase();
        const line = (v.line || '').toLowerCase();
        const internal = String(v.internal_number || '').toLowerCase();
        return plate.includes(query) || brand.includes(query) || line.includes(query) || internal.includes(query);
    });
});

const loadData = async () => {
    await dashboardStore.fetchConductorDashboardData(Number(selectedPeriod.value));
};

// Pull-to-refresh táctil (umbral 70px desde el tope)
const pullRoot = ref(null);
const pulling = ref(false);
let pullStartY = null;
const onPullStart = (e) => {
    if (window.scrollY > 0) { pullStartY = null; return; }
    pullStartY = e.touches?.[0]?.clientY ?? null;
};
const onPullMove = (e) => {
    if (pullStartY === null || window.scrollY > 0) { pulling.value = false; return; }
    const y = e.touches?.[0]?.clientY ?? pullStartY;
    pulling.value = (y - pullStartY) > 70;
};
const onPullEnd = () => {
    if (pulling.value && !isLoading.value) loadData();
    pulling.value = false;
    pullStartY = null;
};

onMounted(() => {
    loadData();
});
</script>

<style scoped>
.conductor-dashboard { width: 100%; max-width: 100%; }
.pull-indicator {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    font-size: 13px; font-weight: 700; color: #5e6e82;
    max-height: 0; overflow: hidden; opacity: 0; transition: all .2s ease;
}
.pull-indicator.is-pulling, .pull-indicator.is-refreshing { max-height: 40px; opacity: 1; padding: 8px 0; }

/* Header compacto */
.welcome-card { background: linear-gradient(135deg, #ffffff 0%, #f8fafd 100%); border-left: 5px solid var(--noa-primary, #2c7be5) !important; border-radius: 16px !important; }
.dark .welcome-card { background: linear-gradient(135deg, #1b1e22 0%, #15171a 100%); }
.welcome-body { padding: 14px !important; display: flex; flex-direction: column; gap: 12px; }
.welcome-avatar { width: 52px; height: 52px; }
.welcome-avatar .avatar-name { width: 52px; height: 52px; font-size: 18px; }
.welcome-role { font-size: 11px; padding: 5px 9px; }
.welcome-license { font-size: 12px; }
.welcome-title { margin: 0; font-size: 17px; font-weight: 800; color: #001c41; line-height: 1.25; }
.dark .welcome-title { color: #f1f4f9; }
.welcome-sub { margin: 2px 0 0; font-size: 13px; color: #5e6e82; }
.welcome-toolbar { display: flex; gap: 8px; align-items: stretch; }
.period-picker {
    flex: 1 1 auto; display: flex; align-items: center; gap: 8px;
    background: #fff; border: 1px solid #d8e2ef; border-radius: 13px; padding: 0 12px; min-height: 50px;
}
.dark .period-picker { background: #16181b; border-color: #2c3238; }
.period-picker select { flex: 1; border: 0; background: transparent; font-size: 14px; font-weight: 600; min-height: 48px; cursor: pointer; color: inherit; }
.period-picker select:focus-visible { outline: 2px solid #2c7be5; outline-offset: 2px; }
.welcome-refresh { min-height: 50px; border-radius: 13px; font-size: 14px; font-weight: 800; display: inline-flex; align-items: center; gap: 8px; padding: 0 18px; flex-shrink: 0; }

/* Secciones */
.section-icon-badge { width: 38px; height: 38px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 15px; }
.section-title { margin: 0; font-size: 16px; font-weight: 800; color: #001c41; line-height: 1.25; }
.dark .section-title { color: #f1f4f9; }
.section-sub { margin: 0; font-size: 13px; color: #5e6e82; }
.vehicle-section { padding: 14px !important; }
.vehicle-search {
    display: flex; align-items: center; gap: 8px;
    background: #f4f7fb; border: 1px solid #e3e8ef; border-radius: 13px; padding: 0 12px; min-height: 50px; margin-bottom: 10px;
}
.dark .vehicle-search { background: #16181b; border-color: #25282c; }
.vehicle-search i.fa-search { color: #5e6e82; }
.vehicle-search input { flex: 1; border: 0; background: transparent; min-height: 48px; font-size: 14px; color: inherit; }
.vehicle-search input:focus-visible { outline: 2px solid #2c7be5; outline-offset: 2px; border-radius: 8px; }
.vehicle-search button { border: 0; background: transparent; min-width: 44px; min-height: 44px; color: #5e6e82; font-size: 15px; }
.clear-search { min-height: 48px; border-radius: 12px; font-size: 14px; font-weight: 700; }

@media (min-width: 768px) {
    .welcome-body { padding: 18px !important; }
    .welcome-title { font-size: 19px; }
}
@media (prefers-reduced-motion: reduce) {
    .pull-indicator { transition: none; }
}
</style>
