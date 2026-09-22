<template>
    <BasePageHeader :title="'Listado de ' + 'Resoluciones de Habilitación'"
        description="Gestión de las resoluciones de habilitación para la emisión de FUECs en el sistema."
        icon="fad fa-file-certificate text-primary" :show-refresh="true" :show-create="true" :show-bg="true"
        :loading="isViewLoading || store.loading" :compact="true"
        :breadcrumbs="[{ label: 'Resoluciones de Habilitación' }, { label: 'Listado' }]" @refresh="refreshTable"
        @create="goToCreate" />

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
                            type="search"
                            placeholder="Buscar por número de resolución, FUEC o código territorial..."
                            aria-label="Buscar resolución habilitante" @input="debouncedSearch" />
                        <button v-if="searchQuery" class="btn btn-outline-secondary border-start-0" type="button"
                            title="Limpiar búsqueda" @click="clearSearch">
                            <i class="fad fa-times" />
                        </button>
                    </div>
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
                                    <th v-for="w in ['18%', '14%', '14%', '14%', '12%', '10%', '8%']" :key="w"
                                        style="padding:12px 8px">
                                        <div class="skeleton-text" :style="`height:16px;width:${w}`" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="n in store.pagination.itemsPerPage" :key="`sk-${n}`">
                                    <td v-for="i in 6" :key="i">
                                        <div class="skeleton-text" style="height:18px;width:75%;" />
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
                            :totalRecords="store.pagination.totalItems" :first="(store.pagination.currentPage - 1) *
                                store.pagination.itemsPerPage
                                " :loading="store.loading" :rowsPerPageOptions="[10, 25, 50, 100]" responsiveLayout="scroll"
                            tableStyle="min-width: 60rem" class="table table-sm mb-0 professional-table"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                            emptyMessage="No se encontraron resoluciones de habilitación" @page="onPageChange">
                            <!-- Columna: Empresa -->
                            <Column field="company.business_name" header="Empresa" sortable style="min-width: 180px;">
                                <template #body="{ data }">
                                    <span class="text-dark fw-medium">
                                        {{ data.company?.business_name || '—' }}
                                    </span>
                                </template>
                            </Column>

                            <!-- Columna: Número de Resolución -->
                            <Column field="resolution_number" header="N° Resolución" sortable style="min-width: 140px;">
                                <template #body="{ data }">
                                    <span class="text-dark fw-semibold">
                                        {{ data.resolution_number || '—' }}
                                    </span>
                                </template>
                            </Column>

                            <!-- Columna: Número FUEC -->
                            <Column field="number_fuec" header="N° FUEC" sortable style="min-width: 140px;">
                                <template #body="{ data }">
                                    <span class="text-dark">
                                        {{ data.number_fuec || '—' }}
                                    </span>
                                </template>
                            </Column>

                            <!-- Columna: Código Territorial -->
                            <Column field="territorial_code" header="Cód. Territorial" sortable
                                style="min-width: 130px;">
                                <template #body="{ data }">
                                    <span class="badge bg-light text-dark border">
                                        {{ data.territorial_code || '—' }}
                                    </span>
                                </template>
                            </Column>

                            <!-- Columna: Fecha de Resolución -->
                            <Column field="resolution_date" header="Fecha Resolución" sortable
                                style="min-width: 140px;">
                                <template #body="{ data }">
                                    <span class="text-dark">
                                        {{ formatDate(data.resolution_date) }}
                                    </span>
                                </template>
                            </Column>

                            <!-- Columna: Estado -->
                            <Column field="status" header="Estado" sortable class="text-center" style="width: 120px;">
                                <template #body="{ data }">
                                    <span class="badge rounded-pill badge-subtle" :class="data.status
                                            ? 'badge-subtle-success'
                                            : 'badge-subtle-warning'
                                        ">
                                        <i :class="data.status
                                                ? 'fad fa-check-circle me-1'
                                                : 'fad fa-circle me-1'
                                            " style="font-size:10px;" />
                                        {{ data.status ? "Vigente" : "No Vigente" }}
                                    </span>
                                </template>
                            </Column>

                            <!-- Columna: Acciones -->
                            <Column header="Acciones" class="text-center" style="min-width:140px; width: 140px;">
                                <template #body="{ data }">
                                    <div class="btn-group btn-group-sm" role="group">

                                        <button v-if="can('enabling_resolutions.update')" class="btn btn-falcon-default"
                                            type="button" title="Editar" :aria-label="`Editar ${data.resolution_number}`" @click="goToEdit(data.uuid)">
                                            <i class="fad fa-edit text-warning" style="font-size:14px;" />
                                        </button>
                                        <button v-if="can('enabling_resolutions.delete')" class="btn btn-falcon-default"
                                            type="button" title="Eliminar" :aria-label="`Eliminar ${data.resolution_number}`" @click="handleDelete(data)">
                                            <i class="fad fa-trash text-danger" style="font-size:14px;" />
                                        </button>
                                    </div>
                                </template>
                            </Column>
                            <!-- Loading state -->
                            <template #loading>
                                <NoaTableSpinner message="Cargando datos..." />
                            </template>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
/**
 * @file EnablingResolutionsListView.vue
 * @description Vista de listado del módulo de Resoluciones de Habilitación.
 * Implementa DataTable con paginación server-side, búsqueda global y acciones CRUD.
 * @module enablingResolutions/ListView
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEnablingResolutionsStore } from '../store/enablingResolutions.store.js';
import { usePermissionsStore } from '@store';
import { useTable } from '@/hooks/useTable.js';
import { useTableActions } from '@/hooks/useTableActions.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import NoaTableSpinner from '@/components/NoaTableSpinner.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

/** @type {import('vue-router').Router} Instancia del router de Vue */
const router = useRouter();

/** @type {import('pinia').Store} Store del módulo de Resoluciones de Habilitación */
const store = useEnablingResolutionsStore();

/** @type {import('pinia').Store} Store de permisos del usuario */
const permissionsStore = usePermissionsStore();

/** @type {import('vue').Ref<boolean>} Indicador de carga inicial de la vista */
const isViewLoading = ref(true);

/** @type {import('vue').Ref<string>} Texto de búsqueda actual */
const searchQuery = ref('');

/**
 * Hook que provee búsqueda con debounce.
 * @type {Object}
 * @property {Function} debouncedSearch - Función de búsqueda con debounce.
 */
const { debouncedSearch } = useTable({}, () => store.setGlobalFilter(searchQuery.value));

/**
 * Hook que provee acciones de tabla (confirmación de eliminación, tooltips).
 * @type {Object}
 * @property {Function} confirmDelete - Función para confirmar eliminación con SweetAlert2.
 * @property {Function} initTooltips - Inicializa tooltips de Bootstrap.
 * @property {Function} destroyTooltips - Destruye tooltips de Bootstrap.
 */
const { confirmDelete, initTooltips, destroyTooltips } = useTableActions(store, router);

/**
 * Verifica si el usuario tiene permiso para una acción específica.
 * @param {string} action - Nombre de la acción/permiso.
 * @returns {boolean} True si el usuario tiene el permiso.
 */
const can = (action) => permissionsStore.can(action);

/**
 * Limpia el campo de búsqueda y recarga el listado sin filtros.
 * @returns {Promise<void>}
 */
const clearSearch = async () => { searchQuery.value = ''; await store.clearFilters(); };

/**
 * Recarga el listado de resoluciones.
 */
const refreshTable = () => store.fetchItems();

/**
 * Maneja el cambio de página en el DataTable.
 * Convierte el índice base 0 de PrimeVue al número de página base 1.
 * @param {Object} event - Evento de paginación de PrimeVue.
 * @param {number} event.first - Índice del primer registro de la página.
 * @param {number} event.rows - Cantidad de registros por página.
 * @returns {Promise<void>}
 */
const onPageChange = async ({ first, rows }) => {
    await store.setPage(Math.floor(first / rows) + 1);
};

/**
 * Navega a la vista de creación de resolución.
 */
const goToCreate = () => router.push('/empresas/resoluciones-habilitacion/crear');

/**
 * Navega a la vista de edición de una resolución.
 * @param {string} uuid - UUID de la resolución a editar.
 */
const goToEdit = (uuid) => router.push(`/empresas/resoluciones-habilitacion/editar/${uuid}`);

/**
 * Inicia el proceso de eliminación de una resolución con confirmación.
 * @param {Object} item - Registro de resolución a eliminar.
 */
const handleDelete = (item) => confirmDelete(item, {
    title: '¿Eliminar resolución de habilitación?',
    nameField: 'resolution_number',
});

/**
 * Formatea una fecha ISO al formato legible dd/mm/yyyy.
 * @param {string} dateStr - Fecha en formato ISO o similar.
 * @returns {string} Fecha formateada o '—' si no es válida.
 */
const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    } catch {
        return dateStr;
    }
};

/**
 * Hook del ciclo de vida: carga el listado al montar el componente.
 */
onMounted(async () => {
    try {
        searchQuery.value = store.search;
        await store.fetchItems();
    } finally {
        isViewLoading.value = false;
        initTooltips();
    }
});

/**
 * Hook del ciclo de vida: limpia tooltips al desmontar.
 */
onUnmounted(() => destroyTooltips());
</script>

<style scoped>
.fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translate3d(0, 15px, 0);
    }

    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
}

/* Tabla Estilo Profesional Falcon */
:deep(.professional-table .p-datatable-thead > tr > th) {
    padding: 0.625rem 0.75rem !important;
    font-size: 0.75rem !important;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #495057;
    border-bottom: 2px solid #e9ecef !important;
    background: #f8f9fa;
}

:deep(.professional-table .p-datatable-tbody > tr > td) {
    padding: 0.625rem 0.75rem !important;
    vertical-align: middle;
    border-bottom: 1px solid #e9ecef;
    font-size: 0.825rem !important;
    color: #212529;
    transition: background-color 150ms ease-in-out;
}

:deep(.professional-table .p-datatable-tbody > tr:hover) {
    background: #f8f9fa !important;
}

:deep(.professional-table .p-datatable-tbody > tr:last-child > td) {
    border-bottom: none;
}

/* Paginador */
:deep(.p-paginator) {
    padding: 0.5rem 1rem !important;
    background: #f8f9fa !important;
    border-top: 1px solid #e9ecef !important;
    border-radius: 0 0 0.75rem 0.75rem !important;
}

:deep(.p-paginator .p-paginator-page) {
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 0.25rem !important;
    margin: 0 0.125rem;
    font-size: 0.75rem;
    transition: all 150ms ease-in-out;
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
    font-size: 0.75rem;
    color: #6c757d;
}

:deep(.p-paginator .p-dropdown) {
    min-height: auto !important;
    height: 26px !important;
    font-size: 0.75rem !important;
}

:deep(.p-paginator .p-dropdown .p-dropdown-label) {
    font-size: 0.725rem !important;
    padding: 0 0.25rem !important;
}

:deep(.p-paginator .p-dropdown .p-dropdown-trigger) {
    width: 18px !important;
}

/* Badges */
.badge-subtle {
    font-weight: 500;
    font-size: 0.75rem;
    padding: 0.35em 0.6em;
    transition: all 150ms ease-in-out;
    white-space: nowrap;
}

.badge-subtle-success {
    background: rgba(25, 135, 84, 0.1);
    color: #198754;
    border: 1px solid rgba(25, 135, 84, 0.2);
}

.badge-subtle-secondary {
    background: rgba(108, 117, 125, 0.1);
    color: #6c757d;
    border: 1px solid rgba(108, 117, 125, 0.2);
}

.badge-subtle-info {
    background: rgba(13, 202, 240, 0.1);
    color: #0dcaf0;
    border: 1px solid rgba(13, 202, 240, 0.2);
}

.badge-subtle-warning {
    background: rgba(255, 193, 7, 0.1);
    color: #856404;
    border: 1px solid rgba(255, 193, 7, 0.2);
}

.badge-subtle:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Botones Acciones */
:deep(.btn-group .btn) {
    padding: 0.25rem 0.45rem;
    transition: all 150ms ease-in-out;
}

:deep(.btn-group .btn:hover) {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    z-index: 1;
}
</style>