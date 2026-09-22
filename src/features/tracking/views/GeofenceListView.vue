<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import BasePageHeader from '@/components/BasePageHeader.vue';
import NoaTableSpinner from '@/components/NoaTableSpinner.vue';
import { useTrackingStore } from '../store/tracking.store';
import { usePermissionsStore } from '@/store/modules/permissions';
import { useToast } from 'vue-toastification';

const router = useRouter();
const store = useTrackingStore();
const permissions = usePermissionsStore();
const toast = useToast();

const isViewLoading = ref(true);
const searchQuery = ref('');

const filteredGeofences = computed(() => {
    if (!searchQuery.value.trim()) return store.geofences;
    const term = searchQuery.value.toLowerCase();
    return store.geofences.filter((g) =>
        g.name.toLowerCase().includes(term) || (g.description || '').toLowerCase().includes(term)
    );
});

function goToCreate() {
    router.push({ name: 'tracking.geofences.create' });
}

function goToEdit(geofence) {
    router.push({ name: 'tracking.geofences.edit', params: { id: geofence.uuid } });
}

async function refreshTable() {
    isViewLoading.value = true;
    await store.fetchGeofences();
    isViewLoading.value = false;
}

async function confirmDelete(geofence) {
    const result = await Swal.fire({
        title: '¿Eliminar geocerca?',
        text: `La geocerca "${geofence.name}" será eliminada permanentemente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
        try {
            await store.deleteGeofence(geofence.uuid);
            toast.success('Geocerca eliminada exitosamente');
        } catch (err) {
            toast.error('Error al eliminar la geocerca');
        }
    }
}

function clearSearch() {
    searchQuery.value = '';
}

onMounted(async () => {
    isViewLoading.value = true;
    await store.fetchGeofences();
    isViewLoading.value = false;
});
</script>

<template>
    <div>
        <BasePageHeader title="Geocercas" description="Zonas geográficas para alertas de conductores"
            icon="fad fa-draw-polygon text-primary" :show-refresh="true"
            :show-create="permissions.can('locations.geofences')" :show-bg="true"
            :loading="isViewLoading || store.loading" :compact="true"
            :breadcrumbs="[{ label: 'Geolocalización' }, { label: 'Geocercas' }]"
            @refresh="refreshTable" @create="goToCreate" />

        <div class="card border-0 shadow-sm mb-3 fade-in-up" style="animation-delay: 0.1s;">
            <div class="bg-holder d-none d-lg-block bg-card"
                style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />
            <div class="card-body position-relative py-2">
                <div class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 g-2 g-md-3">
                    <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 flex-grow-1">
                        <h6 class="mb-0 fw-medium text-nowrap">Búsqueda</h6>
                        <div class="input-group input-group-sm w-100" style="max-width: 420px;">
                            <span class="input-group-text bg-light border-end-0">
                                <i class="fad fa-search text-muted" />
                            </span>
                            <input v-model="searchQuery" class="form-control form-control-sm border-start-0 shadow-none"
                                type="search" placeholder="Buscar geocerca por nombre..." aria-label="Buscar geocerca" />
                            <button v-if="searchQuery" class="btn btn-outline-secondary border-start-0" type="button"
                                title="Limpiar" @click="clearSearch">
                                <i class="fad fa-times" />
                            </button>
                        </div>
                    </div>
                    <div v-if="!isViewLoading && !store.loading" class="text-muted text-lg-end text-nowrap">
                        <small>
                            <i class="fad fa-filter me-1" />
                            {{ filteredGeofences.length }} geocerca{{ filteredGeofences.length !== 1 ? 's' : '' }}
                        </small>
                    </div>
                </div>
            </div>
        </div>

        <div class="row gx-3 fade-in-up" style="animation-delay: 0.2s;">
            <div class="col-12 col-xxl-12">
                <div class="card border-0 shadow-sm">
                    <div class="bg-holder d-none d-lg-block bg-card"
                        style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />

                    <div v-if="isViewLoading" class="card-body p-0">
                        <div class="table-responsive scrollbar">
                            <table class="table table-sm mb-0">
                                <thead>
                                    <tr>
                                        <th v-for="w in ['30%','15%','15%','15%','10%','15%']" :key="w" style="padding:12px 8px">
                                            <div class="skeleton-text" :style="`height:16px;width:${w}`" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="n in 8" :key="`sk-${n}`">
                                        <td>
                                            <div class="skeleton-text" style="height:18px;width:75%;" />
                                        </td>
                                        <td>
                                            <div class="skeleton-text" style="height:18px;width:60%;" />
                                        </td>
                                        <td>
                                            <div class="skeleton-text" style="height:18px;width:50%;" />
                                        </td>
                                        <td>
                                            <div class="skeleton-text" style="height:18px;width:70%;" />
                                        </td>
                                        <td>
                                            <div class="skeleton-text" style="height:18px;width:55%;" />
                                        </td>
                                        <td>
                                            <div class="d-flex justify-content-center gap-1">
                                                <div v-for="j in 2" :key="j" class="skeleton-icon" style="height:28px;width:28px;" />
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div v-else class="card-body p-0">
                        <div class="table-responsive scrollbar">
                            <DataTable :value="filteredGeofences" :paginator="true" :rows="10"
                                :rowsPerPageOptions="[10, 25, 50, 100]" :loading="store.loading"
                                responsiveLayout="scroll" tableStyle="min-width: 50rem"
                                class="table table-sm mb-0 professional-table"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                                emptyMessage="No se encontraron geocercas">
                                <template #loading>
                                    <NoaTableSpinner message="Cargando geocercas..." />
                                </template>

                                <Column header="Nombre">
                                    <template #body="{ data }">
                                        <div class="fw-semibold text-dark">{{ data.name }}</div>
                                        <div class="text-muted" style="font-size: 0.75rem;">{{ data.description }}</div>
                                    </template>
                                </Column>

                                <Column header="Tipo">
                                    <template #body="{ data }">
                                        <span class="badge rounded-pill badge-subtle"
                                            :class="data.type === 'circle' ? 'badge-subtle-info' : 'badge-subtle-warning'">
                                            <i :class="data.type === 'circle' ? 'fad fa-circle' : 'fad fa-draw-polygon'" style="font-size:10px;" />
                                            {{ data.type === 'circle' ? 'Círculo' : 'Polígono' }}
                                        </span>
                                    </template>
                                </Column>

                                <Column header="Radio / Puntos">
                                    <template #body="{ data }">
                                        <template v-if="data.type === 'circle'">
                                            <i class="fad fa-ruler-horizontal text-muted me-1" style="font-size:12px;" />
                                            {{ data.radius_meters }} m
                                        </template>
                                        <template v-else>
                                            {{ (data.polygon_points || []).length }} puntos
                                        </template>
                                    </template>
                                </Column>

                                <Column header="Alertas">
                                    <template #body="{ data }">
                                        <span class="badge rounded-pill badge-subtle badge-subtle-success me-1"
                                            v-if="data.alert_on_enter">
                                            <i class="fad fa-sign-in-alt" style="font-size:10px;" /> Entrada
                                        </span>
                                        <span class="badge rounded-pill badge-subtle badge-subtle-danger"
                                            v-if="data.alert_on_exit">
                                            <i class="fad fa-sign-out-alt" style="font-size:10px;" /> Salida
                                        </span>
                                        <span v-if="!data.alert_on_enter && !data.alert_on_exit" class="text-muted">—</span>
                                    </template>
                                </Column>

                                <Column header="Vel. Máx.">
                                    <template #body="{ data }">
                                        <span v-if="data.max_speed_kmh">
                                            <i class="fad fa-gauge-high text-muted me-1" style="font-size:12px;" />
                                            {{ data.max_speed_kmh }} km/h
                                        </span>
                                        <span v-else class="text-muted">—</span>
                                    </template>
                                </Column>

                                <Column field="is_active" header="Estado" style="text-align:center">
                                    <template #body="{ data }">
                                        <span class="badge rounded-pill badge-subtle"
                                            :class="data.is_active ? 'badge-subtle-success' : 'badge-subtle-warning'">
                                            <i :class="data.is_active ? 'fad fa-check-circle me-1' : 'fad fa-pause-circle me-1'" style="font-size:10px;" />
                                            {{ data.is_active ? 'Activa' : 'Inactiva' }}
                                        </span>
                                    </template>
                                </Column>

                                <Column header="Acciones" style="text-align:center">
                                    <template #body="{ data }">
                                        <div class="btn-group btn-group-sm" role="group">
                                            <button class="btn btn-falcon-default" type="button" title="Editar" :aria-label="`Editar ${data.name}`"
                                                @click="goToEdit(data)">
                                                <i class="fad fa-edit text-primary" style="font-size:14px;" />
                                            </button>
                                            <button class="btn btn-falcon-default" type="button" title="Eliminar" :aria-label="`Eliminar ${data.name}`"
                                                @click="confirmDelete(data)">
                                                <i class="fad fa-trash text-danger" style="font-size:14px;" />
                                            </button>
                                        </div>
                                    </template>
                                </Column>

                                <template #empty>
                                    <div class="text-center py-5">
                                        <i class="fad fa-draw-polygon fs-1 text-muted opacity-50 mb-3 d-block" />
                                        <h6 class="text-muted mb-1 fw-medium">No hay geocercas registradas</h6>
                                        <p class="text-muted small mb-3">Define zonas geográficas para monitorear a los conductores</p>
                                        <button v-if="permissions.can('locations.geofences')" class="btn btn-primary btn-sm"
                                            @click="goToCreate">
                                            <i class="fad fa-plus me-1" /> Crear primera geocerca
                                        </button>
                                    </div>
                                </template>
                            </DataTable>
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
}

:deep(.professional-table .p-datatable-tbody > tr:hover) {
    background: #f8f9fa !important;
}

:deep(.professional-table .p-paginator) {
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
}

:deep(.professional-table .p-paginator .p-paginator-page.p-highlight) {
    background: #0d6efd;
    border-color: #0d6efd;
}

:deep(.btn-group .btn) {
    transition: background-color 0.15s ease-in-out;
}

:deep(.btn-group .btn:hover) {
    background-color: #e9ecef;
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

.badge-subtle-info {
    background: rgba(13, 202, 240, .1);
    color: #0d6efd;
    border: 1px solid rgba(13, 202, 240, .25);
}

.skeleton-text,
.skeleton-icon {
    background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 4px;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
</style>