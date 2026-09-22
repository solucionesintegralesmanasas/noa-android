<template>
    <BasePageHeader title="Proyectos" subtitle="Gestiona los proyectos y los conductores con sus vehículos asignados"
        icon="fad fa-briefcase text-primary" :show-refresh="true" :show-create="true" :show-bg="true"
        :loading="isViewLoading || store.loading" :compact="true" :canCreate="can('projects.create')"
        :breadcrumbs="[{ label: 'Operación' }, { label: 'Proyectos' }]" @refresh="refreshTable" @create="goToCreate" />

    <!-- BARRA DE BÚSQUEDA -->
    <div class="card border-0 shadow-sm mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <div class="bg-holder d-none d-lg-block bg-card"
            style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />
        <div class="card-body position-relative py-2">
            <div class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 g-2 g-md-3">

                <!-- Izquierda: título + input -->
                <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 flex-grow-1 g-2 g-md-3">
                    <h6 class="mb-0 fw-medium text-nowrap">Búsqueda</h6>
                    <div class="input-group input-group-sm w-100" style="max-width: 420px;">
                        <span class="input-group-text bg-light border-end-0">
                            <i class="fad fa-search text-muted" />
                        </span>
                        <input v-model="searchQuery" class="form-control form-control-sm border-start-0 shadow-none"
                            type="search" placeholder="Buscar por nombre del proyecto..."
                            aria-label="Buscar proyecto" @input="debouncedSearch" />
                        <button v-if="searchQuery" class="btn btn-outline-secondary border-start-0" type="button"
                            title="Limpiar búsqueda" @click="clearSearch">
                            <i class="fad fa-times" />
                        </button>
                    </div>
                    <span v-if="store.thirdPartyFilter" class="badge badge-subtle-info small d-inline-flex align-items-center gap-1">
                        <i class="fad fa-user" /> Filtro por conductor
                    </span>
                </div>

                <!-- Derecha: contador -->
                <div v-if="!isViewLoading && !store.loading" class="text-muted text-lg-end text-nowrap">
                    <small>
                        <i class="fad fa-filter me-1" />
                        {{ store.pagination.totalItems }} resultado{{ store.pagination.totalItems !== 1 ? 's' : '' }}
                        <span v-if="store.search"> para "{{ store.search }}"</span>
                    </small>
                </div>

            </div>
        </div>
    </div>

    <!-- TABLA -->
    <div class="row gx-3 fade-in-up" style="animation-delay: 0.2s;">
        <div class="col-12 col-xxl-12">
            <div class="card border-0 shadow-sm">
                <div class="bg-holder d-none d-lg-block bg-card"
                    style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />

                <!-- SKELETON -->
                <div v-if="isViewLoading" class="card-body p-0">
                    <div class="table-responsive scrollbar">
                        <table class="table table-sm mb-0">
                            <thead>
                                <tr>
                                    <th v-for="w in ['45%', '25%', '30%']" :key="w" style="padding:12px 8px">
                                        <div class="skeleton-text" :style="`height:16px;width:${w}`" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="n in store.pagination.itemsPerPage" :key="`sk-${n}`">
                                    <td>
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="skeleton-icon" style="height:32px;width:32px;" />
                                            <div class="flex-grow-1">
                                                <div class="skeleton-text mb-1" style="height:18px;width:60%;" />
                                                <div class="skeleton-text" style="height:12px;width:80%;" />
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="skeleton-badge mx-auto" style="height:24px;width:60px;" />
                                    </td>
                                    <td>
                                        <div class="d-flex justify-content-center gap-1">
                                            <div v-for="j in 3" :key="j" class="skeleton-icon"
                                                style="height:28px;width:28px;" />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- DATATABLE (Paginación Server-Side) -->
                <div v-else class="card-body p-0">
                    <div class="table-responsive scrollbar">
                        <DataTable :value="store.items" lazy :paginator="true" :rows="store.pagination.itemsPerPage"
                            :totalRecords="store.pagination.totalItems"
                            :first="(store.pagination.currentPage - 1) * store.pagination.itemsPerPage"
                            :loading="store.loading" :rowsPerPageOptions="[10, 25, 50, 100]" responsiveLayout="scroll"
                            tableStyle="min-width: 40rem" class="table table-sm mb-0 professional-table"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                            emptyMessage="No se encontraron registros" @page="onPageChange">

                            <!-- Proyecto -->
                            <Column field="project_name" header="Proyecto" sortable>
                                <template #body="{ data }">
                                    <div class="d-flex align-items-center gap-2">
                                        <div
                                            class="avatar-placeholder bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                                            <i class="fad fa-briefcase" style="font-size: 15px;" />
                                        </div>
                                        <div class="min-w-0">
                                            <span class="text-dark d-block fw-medium text-truncate" style="font-size:0.875rem; max-width: 380px;">
                                                {{ data.project_name || '—' }}
                                            </span>
                                            <small class="text-muted d-block mt-1" style="font-size: 0.75rem;">
                                                <i v-if="data.has_purchase_order" class="fad fa-file-pdf me-1 text-danger" style="font-size: 10px;"></i>
                                                <span v-if="data.purchase_order">{{ data.purchase_order }}</span>
                                                <span v-else-if="data.has_purchase_order">Orden de compra adjunta</span>
                                                <span v-else>Sin orden de compra</span>
                                            </small>
                                        </div>
                                    </div>
                                </template>
                            </Column>

                            <!-- Conductores con vehículo -->
                            <Column field="assignments_count" header="Conductores" sortable
                                class="text-center" style="width: 160px;">
                                <template #body="{ data }">
                                    <span class="badge rounded-pill badge-subtle-info"
                                        style="font-size:0.8rem;padding:0.4em 0.75em;">
                                        <i class="fad fa-users me-1" style="font-size:10px;" />
                                        {{ data.assignments_count ?? 0 }} con vehículo
                                    </span>
                                </template>
                            </Column>

                            <!-- Acciones -->
                            <Column header="Acciones" class="text-center" style="min-width:140px; width: 140px;"
                                v-if="can('projects.index') || can('projects.update') || can('projects.delete')">
                                <template #body="{ data }">
                                    <div class="btn-group btn-group-sm" role="group">
                                        <button v-if="can('projects.index')" class="btn btn-falcon-default" type="button"
                                            title="Ver detalle" :aria-label="`Ver ${data.project_name}`" @click="goToDetail(data.uuid)">
                                            <i class="fad fa-eye text-primary" style="font-size:14px;" />
                                        </button>
                                        <button v-if="can('projects.update')" class="btn btn-falcon-default" type="button"
                                            title="Editar" :aria-label="`Editar ${data.project_name}`" @click="goToEdit(data.uuid)">
                                            <i class="fad fa-edit text-warning" style="font-size:14px;" />
                                        </button>
                                        <button v-if="can('projects.delete')" class="btn btn-falcon-default" type="button"
                                            title="Eliminar" :aria-label="`Eliminar ${data.project_name}`" @click="handleDelete(data)">
                                            <i class="fad fa-trash text-danger" style="font-size:14px;" />
                                        </button>
                                    </div>
                                </template>
                            </Column>

                            <!-- Empty state -->
                            <template #empty>
                                <div class="text-center py-5">
                                    <i class="fad fa-briefcase fs-1 text-muted opacity-50 mb-3 d-block" />
                                    <h6 class="text-muted mb-1 fw-medium">No hay proyectos registrados</h6>
                                    <p class="text-muted small mb-3">
                                        {{ store.thirdPartyFilter ? 'Este conductor no tiene proyectos asignados aún.' : 'Comienza creando tu primer proyecto.' }}
                                    </p>
                                    <button v-if="can('projects.create')" class="btn btn-primary btn-sm" @click="goToCreate">
                                        <i class="fad fa-plus me-1" />Nuevo proyecto
                                    </button>
                                </div>
                            </template>

                            <!-- Loading state -->
                            <template #loading>
                                <NoaTableSpinner message="Cargando proyectos..." />
                            </template>

                            <!-- Footer -->
                            <template #footer>
                                <div
                                    class="d-flex flex-wrap justify-content-between align-items-center gap-2 py-2 px-3 bg-light rounded-bottom">
                                    <small class="text-muted" style="font-size:0.85rem;">
                                        <i class="fad fa-list me-1" />
                                        Mostrando <strong>{{ store.items.length }}</strong> de
                                        <strong>{{ store.pagination.totalItems }}</strong> registros
                                    </small>
                                    <small class="text-muted" style="font-size:0.85rem;">
                                        <i class="fad fa-pages me-1" />
                                        Página <strong>{{ store.pagination.currentPage }}</strong> de
                                        <strong>{{ store.pagination.totalPages }}</strong>
                                    </small>
                                </div>
                            </template>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectsStore } from '../store/projects.store.js';
import { usePermissionsStore } from '@store';
import { useTable } from '@/hooks/useTable.js';
import { useTableActions } from '@/hooks/useTableActions.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import NoaTableSpinner from '@/components/NoaTableSpinner.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const route = useRoute();
const router = useRouter();
const store = useProjectsStore();
const permissionsStore = usePermissionsStore();

// ─── Estado local ────────────────────────────────────────────────────────────
const isViewLoading = ref(true);
const searchQuery = ref('');

// ─── Hooks ───────────────────────────────────────────────────────────────────
const { debouncedSearch } = useTable({}, () => store.setGlobalFilter(searchQuery.value));
const { confirmDelete, initTooltips, destroyTooltips } = useTableActions(store, router);

// ─── Utilidades ──────────────────────────────────────────────────────────────
const can = (action) => permissionsStore.can(action);

// ─── Búsqueda ─────────────────────────────────────────────────────────────────
const clearSearch = async () => {
    searchQuery.value = '';
    await store.clearFilters();
};

// ─── Paginación server-side (PrimeVue lazy emite { first, rows }) ─────────────
const onPageChange = async ({ first, rows }) => {
    await store.setPage(Math.floor(first / rows) + 1);
};

// ─── Navegación ──────────────────────────────────────────────────────────────
const goToCreate = () => router.push('/proyectos/crear');
const goToEdit = (uuid) => uuid && router.push(`/proyectos/editar/${uuid}`);
const goToDetail = (uuid) => uuid && router.push(`/proyectos/perfil/${uuid}`);
const refreshTable = () => store.fetchItems();

// ─── Eliminar (delegado al hook con opciones propias del módulo) ──────────────
const handleDelete = (project) => confirmDelete(project, {
    nameField: 'project_name',
    title: '¿Eliminar proyecto?',
    html: `
        <p class="mb-2">¿Estás seguro de eliminar el proyecto <strong>"${project.project_name}"</strong>?</p>
        <div class="alert alert-warning small mb-0 mt-2">
            <i class="fad fa-exclamation-triangle me-1"></i>
            Esta acción eliminará también las asignaciones de conductores y vehículos.
        </div>`,
});

// ─── Ciclo de vida ────────────────────────────────────────────────────────────
onMounted(async () => {
    try {
        searchQuery.value = store.search;
        store.thirdPartyFilter = route.query.third_party_uuid || '';
        await store.fetchItems();
    } finally {
        setTimeout(() => {
            isViewLoading.value = false;
            initTooltips();
        }, 300);
    }
});

onUnmounted(() => destroyTooltips());
</script>

<style scoped>
:root {
    --table-header-bg: #f8f9fa;
    --table-hover-bg: #f8f9fa;
    --table-border: #e9ecef;
    --transition-fast: 150ms ease-in-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(16px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
}

.card {
    border-radius: 0.75rem !important;
    transition: box-shadow var(--transition-fast);
}

.card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, .15) !important;
}

/* Avatar */
.avatar-placeholder {
    width: 36px;
    height: 36px;
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;
    user-select: none;
    transition: transform var(--transition-fast);
}

.min-w-0 {
    min-width: 0;
}

:deep(.professional-table .p-datatable-tbody > tr:hover) .avatar-placeholder {
    transform: scale(1.05);
}

/* Tabla */
:deep(.professional-table .p-datatable-thead > tr > th) {
    padding: 0.625rem 0.75rem !important;
    font-size: 0.75rem !important;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #495057;
    border-bottom: 2px solid var(--table-border) !important;
    background: var(--table-header-bg);
}

:deep(.professional-table .p-datatable-tbody > tr > td) {
    padding: 0.625rem 0.75rem !important;
    vertical-align: middle;
    border-bottom: 1px solid var(--table-border);
    font-size: 0.825rem !important;
    color: #212529;
    transition: background-color var(--transition-fast);
}

:deep(.professional-table .p-datatable-tbody > tr:hover) {
    background: var(--table-hover-bg) !important;
}

:deep(.professional-table .p-datatable-tbody > tr:last-child > td) {
    border-bottom: none;
}

/* Badges */
.badge-subtle {
    font-weight: 500;
    transition: all var(--transition-fast);
    white-space: nowrap;
}

.badge-subtle-info {
    background: rgba(13, 202, 240, .1);
    color: #0dcaf0;
    border: 1px solid rgba(13, 202, 240, .2);
}

.badge-subtle:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, .1);
}

/* Botones */
:deep(.btn-group .btn) {
    padding: 0.3rem 0.5rem;
    transition: all var(--transition-fast);
}

:deep(.btn-group .btn:hover) {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, .12);
    z-index: 1;
}

:deep(.btn-group .btn + .btn) {
    margin-left: -1px;
}

/* Skeleton */
@keyframes skeleton-loading {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

/* Paginador */
:deep(.p-paginator) {
    padding: 0.5rem 1rem !important;
    background: var(--table-header-bg) !important;
    border-top: 1px solid var(--table-border) !important;
    border-radius: 0 0 0.75rem 0.75rem !important;
}

:deep(.p-paginator .p-paginator-page) {
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 0.25rem !important;
    margin: 0 0.125rem;
    font-size: 0.8rem;
    transition: all var(--transition-fast);
}

:deep(.p-paginator .p-paginator-page.p-highlight) {
    background: #0d6efd !important;
    border-color: #0d6efd !important;
    color: #fff !important;
}

:deep(.p-paginator .p-paginator-page:not(.p-highlight):hover) {
    background: #e9ecef !important;
}

:deep(.p-paginator .p-paginator-current) {
    font-size: 0.8rem;
    color: #6c757d;
}

:deep(.p-paginator .p-dropdown) {
    min-height: auto !important;
    height: 28px !important;
    font-size: 0.75rem !important;
}

:deep(.p-paginator .p-dropdown .p-dropdown-label) {
    font-size: 0.75rem !important;
    padding: 0 0.25rem !important;
}

:deep(.p-paginator .p-dropdown .p-dropdown-trigger) {
    width: 20px !important;
}

:deep(.p-paginator .p-dropdown-panel .p-dropdown-items li) {
    font-size: 0.8rem !important;
    padding: 0.25rem 0.75rem !important;
}

/* Input búsqueda */
.input-group:focus-within {
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, .15);
    border-radius: 0.25rem;
}

.input-group .form-control:focus {
    box-shadow: none;
}

.font-monospace {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.bg-opacity-10 {
    --bs-bg-opacity: 0.1;
}

/* Scrollbar */
.scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.scrollbar::-webkit-scrollbar-track {
    background: #f1f3f5;
    border-radius: 3px;
}

.scrollbar::-webkit-scrollbar-thumb {
    background: #adb5bd;
    border-radius: 3px;
}

.scrollbar::-webkit-scrollbar-thumb:hover {
    background: #6c757d;
}

/* Accesibilidad */
:focus-visible {
    outline: 2px solid #0d6efd !important;
    outline-offset: 2px !important;
}

/* Responsive */
@media (max-width: 992px) {

    :deep(.professional-table .p-datatable-thead > tr > th),
    :deep(.professional-table .p-datatable-tbody > tr > td) {
        padding: 0.75rem 0.5rem !important;
        font-size: 0.85rem !important;
    }

    .avatar-placeholder {
        width: 32px !important;
        height: 32px !important;
        font-size: 12px !important;
    }
}

@media (max-width: 768px) {
    :deep(.professional-table .p-datatable-tbody > tr > td) {
        font-size: 0.8rem !important;
    }
}
</style>