<template>
    <Dialog :visible="visible" modal :draggable="false" :closable="true"
        :style="{ width: 'min(1240px, 97vw)' }" :breakpoints="{ '960px': '97vw' }"
        :content-style="{ maxHeight: '78vh', overflowY: 'auto' }"
        class="p-fluid fuel-status-dialog" @update:visible="cerrar">
        <template #header>
            <div class="d-flex align-items-center gap-2">
                <i class="fad fa-gauge-high text-primary fs-4" aria-hidden="true" />
                <div>
                    <h5 class="mb-0">Estado de combustible</h5>
                    <small class="text-muted">
                        Km recorridos desde el último tanqueo, tope estimado y km restantes.
                    </small>
                </div>
            </div>
        </template>

        <div class="fuel-status-toolbar d-flex align-items-center gap-2 mb-3">
            <div class="input-group input-group-sm fuel-status-toolbar__search">
                <span class="input-group-text bg-light border-end-0">
                    <i class="fad fa-search text-muted" aria-hidden="true" />
                </span>
                <input id="fuel-status-search" v-model="statusSearch" type="search" class="form-control form-control-sm border-start-0 shadow-none"
                    placeholder="Placa o número interno"
                    aria-label="Buscar vehículo en el estado de combustible" />
            </div>
            <select id="fuel-status-filter" v-model="statusFilter" class="form-select form-select-sm fuel-status-toolbar__select"
                aria-label="Filtrar vehículos del estado de combustible">
                <option value="todos">Todos los vehículos</option>
                <option value="con_datos">Con tanqueo</option>
                <option value="alertas">Solo alertas</option>
            </select>
            <select id="fuel-status-project" v-model="projectFilter" class="form-select form-select-sm fuel-status-toolbar__select fuel-status-toolbar__select--project"
                aria-label="Filtrar por proyecto">
                <option value="">Todos los proyectos</option>
                <option value="sin_proyecto">Sin proyecto</option>
                <option v-for="proyecto in store.statusProjects" :key="proyecto.uuid" :value="proyecto.uuid">
                    {{ proyecto.name }}
                </option>
            </select>
        </div>

        <div v-if="store.statusSummary.total" class="fuel-summary mb-3">
            <span class="fuel-summary__item text-danger">
                <i class="fad fa-triangle-exclamation" aria-hidden="true" />
                {{ store.statusSummary.excedidos }} excedidos
            </span>
            <span class="fuel-summary__item text-warning">
                <i class="fad fa-clock" aria-hidden="true" />
                {{ store.statusSummary.proximos }} próximos
            </span>
            <span v-if="store.statusSummary.sin_datos" class="fuel-summary__item text-muted">
                <i class="fad fa-circle-question" aria-hidden="true" />
                {{ store.statusSummary.sin_datos }} sin datos
            </span>
            <span class="fuel-summary__item text-muted">
                <i class="fad fa-gas-pump" aria-hidden="true" />
                {{ store.statusSummary.sin_tanqueo }} sin tanqueo
            </span>
        </div>

        <div v-if="store.statusLoading" class="text-muted small py-4 text-center" role="status">
            <i class="fad fa-spinner fa-spin me-2" aria-hidden="true" />Cargando estado de combustible...
        </div>
        <div v-else-if="store.statusError" class="alert alert-warning py-2 mb-0 small" role="alert">
            <i class="fad fa-exclamation-triangle me-1" aria-hidden="true" />
            No se pudo cargar el estado de combustible. Intenta actualizar de nuevo.
        </div>
        <div v-else-if="!store.status.length" class="text-muted small py-4 text-center">
            <i class="fad fa-info-circle me-1" aria-hidden="true" />
            No hay vehículos activos para mostrar.
        </div>
        <template v-else>
            <div v-if="filteredStatus.length" class="row g-3">
                <div v-for="item in visibleStatus" :key="item.vehicle_uuid" class="col-12 col-lg-6">
                    <div class="card h-100 border-0 shadow-sm fuel-status-card"
                        :class="`fuel-status-card--${statusMeta(item.status).color}`">
                        <div class="card-body d-flex flex-column gap-3">
                            <div class="d-flex justify-content-between align-items-start gap-2">
                                <div class="min-w-0">
                                    <h6 class="mb-0 fw-bold text-dark text-truncate">{{ item.vehicle_license_plate }}</h6>
                                    <small v-if="item.internal_number" class="text-muted d-block text-truncate">
                                        <i class="fad fa-hashtag me-1" aria-hidden="true" />
                                        Interno {{ item.internal_number }}
                                    </small>
                                    <small v-else class="text-muted d-block">Sin número interno</small>
                                    <small v-if="item.projects?.length" class="text-muted d-block"
                                        :title="projectNames(item)">
                                        <i class="fad fa-diagram-project me-1" aria-hidden="true" />
                                        {{ projectNames(item) }}
                                    </small>
                                </div>
                                <span class="badge badge-subtle flex-shrink-0"
                                    :class="`badge-subtle-${statusMeta(item.status).color}`">
                                    <i class="fad me-1" :class="statusMeta(item.status).icon" aria-hidden="true" />
                                    {{ statusMeta(item.status).label }}
                                </span>
                            </div>

                            <template v-if="item.status === 'SIN_TANQUEO'">
                                <div class="text-center py-3">
                                    <i class="fad fa-gas-pump fs-2 text-muted mb-2" aria-hidden="true" />
                                    <p class="mb-1 small text-muted">Sin tanqueo registrado.</p>
                                    <p class="mb-2 text-muted" style="font-size: 0.8rem;">
                                        Registra un tanqueo para calcular recorrido, tope y restantes.
                                    </p>
                                    <button type="button" class="btn btn-sm btn-primary" @click="registrarTanqueo">
                                        <i class="fad fa-plus me-1" aria-hidden="true" />Registrar tanqueo
                                    </button>
                                </div>
                            </template>

                            <template v-else-if="item.status === 'SIN_DATOS'">
                                <div class="text-center py-3 text-muted">
                                    <i class="fad fa-circle-question fs-2 mb-2" aria-hidden="true" />
                                    <p class="mb-1 small">Sin lecturas de kilometraje.</p>
                                    <p class="mb-0" style="font-size: 0.8rem;">
                                        Registra el preoperacional para calcular el recorrido.
                                    </p>
                                </div>
                            </template>

                            <template v-else>
                                <div class="d-flex align-items-center gap-3">
                                    <svg class="fuel-gauge" viewBox="0 0 84 84" role="img"
                                        :aria-label="`${Math.round(progressValue(item))}% del alcance estimado consumido`">
                                        <g transform="rotate(-90 42 42)">
                                            <circle cx="42" cy="42" :r="GAUGE_RADIUS" class="fuel-gauge__track" />
                                            <circle cx="42" cy="42" :r="GAUGE_RADIUS" class="fuel-gauge__value"
                                                :class="`fuel-gauge__value--${statusMeta(item.status).color}`"
                                                :stroke-dasharray="GAUGE_CIRCUMFERENCE"
                                                :stroke-dashoffset="gaugeOffset(item)" />
                                        </g>
                                        <text x="42" y="40" text-anchor="middle" class="fuel-gauge__percent">
                                            {{ Math.round(progressValue(item)) }}%
                                        </text>
                                        <text x="42" y="53" text-anchor="middle" class="fuel-gauge__caption">
                                            del alcance
                                        </text>
                                    </svg>
                                    <div class="flex-grow-1 min-w-0">
                                        <div class="fuel-km text-nowrap">
                                            {{ km(item.km_traveled) }} <small class="text-muted">km recorridos</small>
                                        </div>
                                        <small class="text-muted d-block">
                                            de {{ km(item.km_limit) }} km de alcance estimado
                                        </small>
                                        <span class="badge badge-subtle mt-2"
                                            :class="`badge-subtle-${statusMeta(item.status).color}`">
                                            <i class="fad me-1" :class="statusMeta(item.status).icon" aria-hidden="true" />
                                            {{ remainingText(item) }}
                                        </span>
                                    </div>
                                </div>

                                <div class="fuel-stats">
                                    <div class="fuel-stat">
                                        <span class="fuel-stat__label">Alcance estimado</span>
                                        <strong class="fuel-stat__value">{{ km(item.km_limit) }} km</strong>
                                    </div>
                                    <div class="fuel-stat">
                                        <span class="fuel-stat__label">Combustible consumido</span>
                                        <strong class="fuel-stat__value">{{ gallons(item.fuel?.gallons_consumed) }} gal</strong>
                                    </div>
                                    <div class="fuel-stat">
                                        <span class="fuel-stat__label">Combustible surtido</span>
                                        <strong class="fuel-stat__value">{{ gallons(item.fuel?.gallons_pumped) }} gal</strong>
                                    </div>
                                    <div class="fuel-stat">
                                        <span class="fuel-stat__label">Combustible disponible</span>
                                        <strong class="fuel-stat__value" :class="saldoClass(item)">
                                            {{ gallons(item.fuel?.gallons_remaining) }} gal
                                        </strong>
                                    </div>
                                    <div class="fuel-stat">
                                        <span class="fuel-stat__label">Gasto en combustible</span>
                                        <strong class="fuel-stat__value">{{ money(item.fuel?.money_consumed) }}</strong>
                                    </div>
                                    <div class="fuel-stat">
                                        <span class="fuel-stat__label">Valor disponible</span>
                                        <strong class="fuel-stat__value" :class="moneyClass(item)">
                                            {{ money(item.fuel?.money_remaining) }}
                                        </strong>
                                    </div>
                                </div>

                                <div class="border-top pt-2 small text-muted">
                                    <div class="d-flex flex-wrap justify-content-between gap-2">
                                        <span>
                                            <i class="fad fa-gas-pump me-1" aria-hidden="true" />
                                            Último tanqueo: {{ dateUtils.format(item.refuel.date) }}
                                        </span>
                                        <span>Odómetro actual: {{ km(item.current.odometer) }} km</span>
                                    </div>
                                    <div class="mt-1">
                                        <template v-if="item.baseline.source === 'preoperacional'">
                                            <i class="fad fa-info-circle me-1" aria-hidden="true" />
                                            Base estimada con preoperacional
                                            <template v-if="item.baseline.date">del {{ dateUtils.format(item.baseline.date) }}</template>
                                        </template>
                                        <template v-else>
                                            <i class="fad fa-check-circle me-1" aria-hidden="true" />
                                            Base tomada en el tanqueo
                                        </template>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="text-muted small py-4 text-center">
                <i class="fad fa-filter me-1" aria-hidden="true" />
                <template v-if="statusFilter === 'con_datos'">
                    Aún no hay vehículos con tanqueo registrado.
                    <button type="button" class="btn btn-link btn-sm p-0" @click="statusFilter = 'todos'">
                        Ver todos los vehículos
                    </button>
                </template>
                <template v-else>
                    No hay vehículos que coincidan con el filtro.
                </template>
            </div>

            <div v-if="hayMasStatus" class="text-center mt-3">
                <button type="button" class="btn btn-sm btn-falcon-default" @click="statusVisible += 12">
                    <i class="fad fa-chevron-down me-1" aria-hidden="true" />
                    Mostrar más ({{ filteredStatus.length - statusVisible }} restantes)
                </button>
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import { useFuelManagementStore } from '../store/fuelManagement.store.js';
import { filtrarEstado, progresoAlcance, textoRestante } from '../utils/estadoCombustible.js';
import dateUtils from '@/utils/date.js';

const props = defineProps({
    visible: { type: Boolean, default: false },
});

const emit = defineEmits(['update:visible', 'create']);

const store = useFuelManagementStore();

const statusSearch = ref('');
const statusFilter = ref('todos');
const projectFilter = ref('');
const statusVisible = ref(12);

const STATUS_META = {
    EXCEDIDO: { label: 'Excedido', color: 'danger', icon: 'fa-triangle-exclamation' },
    PROXIMO: { label: 'Próximo', color: 'warning', icon: 'fa-clock' },
    OK: { label: 'Dentro del alcance', color: 'success', icon: 'fa-check-circle' },
    SIN_DATOS: { label: 'Sin datos', color: 'secondary', icon: 'fa-circle-question' },
    SIN_TANQUEO: { label: 'Sin tanqueo', color: 'secondary', icon: 'fa-gas-pump' },
};

const statusMeta = (status) => STATUS_META[status] ?? STATUS_META.SIN_DATOS;
const progressValue = progresoAlcance;
const km = (v) => (v === null || v === undefined || v === ''
    ? '—'
    : Number(v).toLocaleString('es-CO', { maximumFractionDigits: 0 }));
const gallons = (v) => (v === null || v === undefined || v === ''
    ? '—'
    : Number(v).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const money = (v) => (v === null || v === undefined || v === ''
    ? '—'
    : Number(v).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }));

const GAUGE_RADIUS = 34;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;
const gaugeOffset = (item) => GAUGE_CIRCUMFERENCE * (1 - progressValue(item) / 100);
const saldoClass = (item) => (Number(item.fuel?.gallons_remaining) < 0 ? 'text-danger' : '');
const moneyClass = (item) => (Number(item.fuel?.money_remaining) < 0 ? 'text-danger' : '');
const projectNames = (item) => (item.projects ?? []).map((p) => p.name).join(', ');

const remainingText = (item) => textoRestante(item, km);

const filteredStatus = computed(() => filtrarEstado(store.status, {
    busqueda: statusSearch.value,
    clasificacion: statusFilter.value,
    proyecto: projectFilter.value,
}));

const visibleStatus = computed(() => filteredStatus.value.slice(0, statusVisible.value));
const hayMasStatus = computed(() => filteredStatus.value.length > statusVisible.value);

watch([statusSearch, statusFilter, projectFilter], () => { statusVisible.value = 12; });

watch(
    () => props.visible,
    (abierto) => {
        if (!abierto) return;
        statusSearch.value = '';
        statusFilter.value = 'todos';
        projectFilter.value = '';
        statusVisible.value = 12;
        store.fetchStatus();
    }
);

const cerrar = (valor) => emit('update:visible', valor);
const registrarTanqueo = () => {
    emit('update:visible', false);
    emit('create');
};
</script>

<style scoped>
:deep(.fuel-status-dialog .p-dialog-content) {
    max-height: 78vh;
    overflow-y: auto;
}

.fuel-status-toolbar {
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 0.15rem;
    scrollbar-width: thin;
}
.fuel-status-toolbar__search {
    flex: 1 1 240px;
    min-width: 220px;
    max-width: 360px;
}
.fuel-status-toolbar__select {
    flex: 0 0 200px;
    width: 200px;
}
.fuel-status-toolbar__select--project {
    flex: 0 0 260px;
    width: 260px;
}

.fuel-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1.25rem;
    font-size: 0.85rem;
    color: #6c757d;
}
.fuel-summary__item {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
}

.fuel-status-card {
    border-left: 4px solid var(--bs-secondary);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    min-width: 0;
}
.fuel-status-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 0.35rem 0.75rem rgba(0, 0, 0, 0.08) !important;
}
.fuel-status-card--danger { border-left-color: var(--bs-danger); }
.fuel-status-card--warning { border-left-color: var(--bs-warning); }
.fuel-status-card--success { border-left-color: var(--bs-success); }
.fuel-status-card--secondary { border-left-color: var(--bs-secondary); }

.fuel-km {
    font-size: 1.9rem;
    font-weight: 700;
    line-height: 1.1;
    color: #212529;
}
.fuel-km small {
    font-size: 0.9rem;
    font-weight: 500;
}

.fuel-gauge {
    width: 96px;
    height: 96px;
    flex: 0 0 96px;
}
.fuel-gauge__track {
    fill: none;
    stroke: #e9ecef;
    stroke-width: 8;
}
.fuel-gauge__value {
    fill: none;
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.35s ease;
}
.fuel-gauge__value--danger { stroke: var(--bs-danger); }
.fuel-gauge__value--warning { stroke: var(--bs-warning); }
.fuel-gauge__value--success { stroke: var(--bs-success); }
.fuel-gauge__value--secondary { stroke: var(--bs-secondary); }
.fuel-gauge__percent {
    font-size: 17px;
    font-weight: 700;
    fill: #212529;
}
.fuel-gauge__caption {
    font-size: 8.5px;
    fill: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.fuel-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;
}
.fuel-stat {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 0.55rem 0.75rem;
    border-radius: 0.5rem;
    background: #f8f9fa;
    border: 1px solid #eef0f3;
}
.fuel-stat__label {
    font-size: 0.75rem;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}
.fuel-stat__value {
    font-size: 1rem;
    color: #212529;
    line-height: 1.35;
    white-space: nowrap;
}

/* Ajustes para teléfonos */
@media (max-width: 575.98px) {
    .fuel-status-toolbar {
        flex-wrap: wrap;
        overflow: visible;
    }
    .fuel-status-toolbar__search,
    .fuel-status-toolbar__select,
    .fuel-status-toolbar__select--project {
        flex: 1 1 100%;
        width: 100%;
        max-width: none;
    }
    .fuel-gauge {
        width: 76px;
        height: 76px;
        flex: 0 0 76px;
    }
    .fuel-km {
        font-size: 1.45rem;
    }
    .fuel-stats {
        grid-template-columns: 1fr;
    }
    .fuel-stat__value {
        white-space: normal;
    }
}
</style>
