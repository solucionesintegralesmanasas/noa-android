<template>
    <div v-if="!project && !isViewLoading" class="text-center py-5">
        <i class="fad fa-briefcase fs-1 text-muted opacity-50 mb-3 d-block" />
        <p class="text-muted mb-0">El proyecto no fue encontrado.</p>
        <button v-if="can('projects.index')" class="btn btn-primary btn-sm mt-3" type="button" @click="goToBack">
            <i class="fal fa-arrow-left me-1" />Volver a proyectos
        </button>
    </div>

    <template v-else>
        <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle" icon="fad fa-briefcase text-primary"
            :breadcrumbs="breadcrumbs" :loading="isViewLoading" :show-back="true" :show-edit="can('projects.update')"
            @back="goToBack" @edit="goToEdit" />

        <!-- SKELETON LOADING -->
        <div v-if="isViewLoading" class="row g-3 mb-3 fade-in-up" style="animation-delay: 0.1s;">
            <div class="col-12 col-lg-8">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body p-4">
                        <div class="d-flex gap-3 align-items-start">
                            <div class="skeleton-icon rounded-3 flex-shrink-0" style="width: 64px; height: 64px;" />
                            <div class="w-100">
                                <div class="row g-2">
                                    <div class="col-12 col-sm-6" v-for="i in 5" :key="i">
                                        <div class="skeleton-text" style="height: 14px; width: 90%;" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-lg-4">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body p-4 text-center">
                        <div class="skeleton-text mx-auto mb-3" style="height: 50px; width: 50px; border-radius: 12px;" />
                        <div class="skeleton-text mx-auto mb-2" style="height: 14px; width: 70%;" />
                        <div class="skeleton-text mx-auto" style="height: 14px; width: 90%;" />
                    </div>
                </div>
            </div>
        </div>

        <!-- CONTENIDO PRINCIPAL -->
        <div v-else class="row g-3 mb-3 fade-in-up" style="animation-delay: 0.1s;">

            <!-- Información del proyecto -->
            <div class="col-12 col-sm-12 col-md-12 col-lg-8">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                        <i class="fad fa-circle-info text-primary" style="font-size: 14px;"></i>
                        <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Información del proyecto</h6>
                    </div>
                    <div class="card-body py-3">
                        <div class="d-flex gap-3 align-items-start">
                            <div
                                class="avatar-placeholder bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center flex-shrink-0">
                                <i class="fad fa-briefcase" style="font-size: 26px;" />
                            </div>
                            <dl class="row mb-0 small g-2 g-md-3 w-100" style="font-size: 0.85rem;">
                                <dt class="col-12 col-sm-4 text-muted fw-medium">Nombre del proyecto:</dt>
                                <dd class="col-12 col-sm-8 text-dark fw-semibold">{{ project?.project_name || '—' }}</dd>

                                <dt class="col-12 col-sm-4 text-muted fw-medium mt-1">Fecha de inicio:</dt>
                                <dd class="col-12 col-sm-8 text-dark mt-1">
                                    <i class="fad fa-calendar-alt me-1 text-muted"></i>{{ formatDateShort(project?.start_date) }}
                                </dd>

                                <dt class="col-12 col-sm-4 text-muted fw-medium mt-1">Fecha de finalización:</dt>
                                <dd class="col-12 col-sm-8 text-dark mt-1">
                                    <i class="fad fa-calendar-check me-1 text-muted"></i>{{ formatDateShort(project?.completion_date) }}
                                </dd>

                                <dt class="col-12 col-sm-4 text-muted fw-medium mt-1">Valor del proyecto:</dt>
                                <dd class="col-12 col-sm-8 text-dark mt-1 fw-medium">{{ formatMoney(project?.project_value) }}</dd>

                                <dt class="col-12 col-sm-4 text-muted fw-medium mt-1">Orden de compra:</dt>
                                <dd class="col-12 col-sm-8 text-dark mt-1">
                                    <div class="d-flex flex-wrap align-items-center gap-2">
                                        <span v-if="project?.purchase_order" class="font-monospace fw-medium">
                                            {{ project.purchase_order }}
                                        </span>
                                        <span v-else>—</span>
                                        <a v-if="project?.purchase_order_url" :href="getMediaUrl(project.purchase_order_url)"
                                            target="_blank" class="btn btn-falcon-default btn-sm py-0 px-2">
                                            <i class="fad fa-file-pdf text-danger me-1" style="font-size: 13px;" />
                                            {{ project.purchase_order_name || 'Ver PDF' }}
                                        </a>
                                    </div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resumen -->
            <div class="col-12 col-sm-12 col-md-12 col-lg-4">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                        <i class="fad fa-chart-simple text-primary" style="font-size: 14px;"></i>
                        <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Resumen</h6>
                    </div>
                    <div class="card-body py-3 d-flex flex-column gap-3">
                        <div class="d-flex align-items-center gap-3 p-3 rounded-3" style="background:#f8f9fa;">
                            <div
                                class="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center"
                                style="width:40px;height:40px;">
                                <i class="fad fa-user" />
                            </div>
                            <div>
                                <div class="h5 mb-0 fw-bold text-dark">{{ activeAssignments.length }}</div>
                                <small class="text-muted">Conductores con vehículo asignado</small>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-3 p-3 rounded-3" style="background:#f8f9fa;">
                            <div
                                class="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center"
                                style="width:40px;height:40px;">
                                <i class="fad fa-truck" />
                            </div>
                            <div>
                                <div class="h5 mb-0 fw-bold text-dark">{{ activeAssignments.length }}</div>
                                <small class="text-muted">Vehículos asignados</small>
                            </div>
                        </div>
                        <p class="small text-muted mb-0">
                            <i class="fad fa-exchange-alt me-1" />
                            Cada conductor tiene su vehículo asignado dentro del proyecto.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Asignaciones conductor → vehículo -->
            <div class="col-12 col-sm-12 col-md-12 col-lg-12">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                        <i class="fad fa-users text-primary" style="font-size: 14px;"></i>
                        <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">
                            Conductores y sus vehículos ({{ activeAssignments.length }})
                            <span v-if="inactiveAssignments.length" class="badge badge-subtle-danger ms-1"
                                style="font-size:0.65rem;">
                                {{ inactiveAssignments.length }} retirado{{ inactiveAssignments.length !== 1 ? 's' : '' }}
                            </span>
                        </h6>
                    </div>
                    <div class="card-body py-2">
                        <div v-if="project.assignments?.length" class="list-group list-group-flush small">
                            <div v-for="assignment in project.assignments" :key="assignment.uuid"
                                class="list-group-item py-2 px-0 border-0 d-flex flex-wrap align-items-center"
                                style="border-bottom: 1px solid #e9ecef !important;">
                                <div class="row w-100 g-2 g-md-3 align-items-center">
                                    <!-- Conductor -->
                                    <div class="col-12 col-md-5 d-flex align-items-center gap-2">
                                        <div
                                            class="avatar-placeholder bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                                            <i class="fad fa-user" style="font-size: 14px;" />
                                        </div>
                                        <div class="min-w-0 flex-grow-1">
                                            <div class="fw-semibold text-dark">{{ driverName(assignment.conductor) }}</div>
                                            <small class="text-muted d-flex align-items-center gap-1">
                                                <i class="fad fa-id-card" style="font-size:11px;" />
                                                {{ assignment.conductor?.document_number || 'Sin documento' }}
                                            </small>
                                        </div>
                                        <span v-if="assignment.is_active" class="badge badge-subtle-success flex-shrink-0"
                                            style="font-size:0.65rem;">
                                            Activo
                                        </span>
                                        <span v-else class="badge badge-subtle-danger flex-shrink-0" style="font-size:0.65rem;">
                                            Retirado
                                        </span>
                                    </div>

                                    <!-- Conexión -->
                                    <div class="col-auto d-none d-lg-flex align-items-center justify-content-center text-muted">
                                        <i class="fad fa-arrow-right" style="font-size: 16px;" />
                                    </div>

                                    <!-- Vehículo del conductor -->
                                    <div class="col-12 col-md d-flex align-items-center gap-2">
                                        <div
                                            class="avatar-placeholder bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center flex-shrink-0">
                                            <i class="fad fa-truck" style="font-size: 14px;" />
                                        </div>
                                        <div class="min-w-0">
                                            <div class="fw-semibold font-monospace text-dark">
                                                {{ assignment.vehicle?.vehicle_license_plate || '—' }}
                                            </div>
                                            <small v-if="assignment.vehicle?.internal_number" class="text-muted d-block">
                                                No. interno: {{ assignment.vehicle.internal_number }}
                                            </small>
                                            <small v-else-if="assignment.vehicle?.model" class="text-muted d-block">
                                                {{ assignment.vehicle.model }}
                                            </small>
                                        </div>
                                    </div>

                                    <!-- Acciones -->
                                    <div v-if="can('projects.update')" class="col-auto ms-auto flex-shrink-0">
                                        <button type="button" class="btn btn-sm btn-falcon-default py-0 px-2"
                                            :disabled="togglingUuid === assignment.uuid"
                                            :title="assignment.is_active ? 'Retirar asignación' : 'Reactivar asignación'"
                                            @click="toggleAssignment(assignment)">
                                            <i v-if="togglingUuid === assignment.uuid" class="fad fa-spinner fa-spin" />
                                            <template v-else>
                                                <i :class="assignment.is_active ? 'fad fa-user-slash text-danger' : 'fad fa-user-check text-success'" />
                                            </template>
                                            {{ assignment.is_active ? 'Retirar' : 'Reactivar' }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p v-else class="text-muted small mb-0 mt-2">
                            <i class="fad fa-info-circle me-1" />Este proyecto aún no tiene conductores con vehículos asignados.
                        </p>
                    </div>
                </div>
            </div>


        </div>
    </template>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectsStore } from '../store/projects.store.js';
import { usePermissionsStore } from '@store';
import { toast } from '@/utils/toast.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import { getMediaUrl } from '@/utils/media.js';

const route = useRoute();
const router = useRouter();
const store = useProjectsStore();
const permissionsStore = usePermissionsStore();
const can = (action) => permissionsStore.can(action);

const project = ref(null);
const isViewLoading = ref(true);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => project.value?.project_name || 'Proyecto');
const pageSubtitle = computed(() => 'Detalle del proyecto');
const breadcrumbs = computed(() => [
    { label: 'Operación' },
    { label: 'Proyectos', to: '/proyectos' },
    { label: 'Detalle' },
]);

const driverName = (conductor) => {
    if (!conductor) return '—';
    const full = `${conductor.first_name || ''} ${conductor.last_name || ''}`.trim();
    return full || conductor.company_name || conductor.document_number || 'Conductor';
};

/** Asignaciones activas (cuentan para el resumen y el encabezado de la lista). */
const activeAssignments = computed(() =>
    (project.value?.assignments || []).filter((a) => a.is_active !== false)
);

/** Asignaciones retiradas (conservadas en historial con is_active=false). */
const inactiveAssignments = computed(() =>
    (project.value?.assignments || []).filter((a) => a.is_active === false)
);

const togglingUuid = ref(null);

/** Retira o reactiva una asignación conductor-vehículo sin borrarla. */
const toggleAssignment = async (assignment) => {
    if (togglingUuid.value) return;
    togglingUuid.value = assignment.uuid;
    try {
        const assignments = (project.value.assignments || []).map((a) => ({
            third_party_uuid: a.third_party_uuid,
            vehicle_uuid: a.vehicle_uuid,
            is_active: a.uuid === assignment.uuid ? !(a.is_active !== false) : a.is_active !== false,
        }));

        await store.updateItem(route.params.id, { assignments });
        project.value = await store.fetchProfileById(route.params.id);
    } catch (err) {
        await toast('Error', 'No se pudo actualizar la asignación', 'error');
    } finally {
        togglingUuid.value = null;
    }
};

const formatDateShort = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return d.toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatMoney = (value) =>
    (value === null || value === undefined)
        ? '-'
        : '$' + Number(value).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const goToBack = () => router.push(can('projects.index') ? '/proyectos' : '/');
const goToEdit = () => router.push(`/proyectos/editar/${route.params.id}`);

onMounted(async () => {
    try {
        project.value = await store.fetchProfileById(route.params.id);
    } finally {
        isViewLoading.value = false;
    }
});
</script>

<style scoped>
/* ===== VARIABLES ===== */
:root {
    --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    --shadow-md: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    --transition: 150ms ease-in-out;
}

/* ===== ANIMACIONES ===== */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in-up {
    animation: fadeInUp 0.35s ease-out forwards;
}

/* ===== CARDS ===== */
.card {
    border-radius: 0.625rem !important;
    transition: box-shadow var(--transition);
}

.card:hover {
    box-shadow: var(--shadow-md) !important;
}

.card-header {
    border-radius: 0.625rem 0.625rem 0 0 !important;
    background: linear-gradient(135deg, #f8f9fa, #fff);
}

/* ===== TIPOGRAFÍA COMPACTA ===== */
.small {
    font-size: 0.85rem !important;
    line-height: 1.4;
}

.fw-medium {
    font-weight: 500 !important;
}

.fw-semibold {
    font-weight: 600 !important;
}

.font-monospace {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* ===== TABLA DE DATOS (DL) ===== */
dl.row {
    margin: 0;
}

dt {
    color: #6c757d !important;
}

dd {
    color: #212529 !important;
    margin-bottom: 0;
}

dt,
dd {
    padding: 0;
}

/* ===== BADGES FALCON ===== */
.badge-subtle-success {
    background: rgba(25, 135, 84, 0.1);
    color: #198754;
    border: 1px solid rgba(25, 135, 84, 0.2);
}

.badge-subtle-danger {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    border: 1px solid rgba(220, 53, 69, 0.2);
}

/* ===== BOTONES ===== */
.btn {
    transition: all var(--transition);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
}

.btn-falcon-default {
    background: #f8f9fa;
    border-color: #e9ecef;
    color: #212529;
}

.btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.bg-opacity-10 {
    --bs-bg-opacity: 0.1;
}

/* ===== AVATAR ===== */
.avatar-placeholder {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    user-select: none;
}

.min-w-0 {
    min-width: 0;
}

/* ===== LISTA DE ASIGNACIONES ===== */
.list-group-item:last-child {
    border-bottom: none !important;
}

.list-group-item:hover {
    background: #f8f9fa;
}

/* Skeleton base */
.skeleton-text,
.skeleton-icon {
    background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 4px;
}

.skeleton-icon {
    border-radius: 6px;
    flex-shrink: 0;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}
</style>