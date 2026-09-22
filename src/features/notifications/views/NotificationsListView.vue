<template>
    <BasePageHeader 
        title="Alertas y Vencimientos"
        description="Monitoreo en tiempo real de documentos vencidos o próximos a vencer." 
        icon="fad fa-bell text-primary" 
        :show-refresh="true"
        :show-create="false" 
        :show-bg="true" 
        :loading="isViewLoading || store.loading" 
        :compact="true"
        :breadcrumbs="[{ label: 'Notificaciones' }, { label: 'Listado' }]" 
        @refresh="refreshTable"
    />

    <!-- ACCIONES RÁPIDAS Y FILTROS -->
    <div class="card border-0 shadow-sm mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <div class="bg-holder d-none d-lg-block bg-card"
            style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />
        <div class="card-body position-relative py-3">
            <div class="row align-items-center justify-content-between g-3">
                <div class="col-12 col-lg-auto d-flex flex-wrap align-items-center gap-2">
                    <!-- Botón de Sincronización Manual -->
                    <button class="btn btn-sm btn-primary shadow-sm" type="button" @click="handleSync" :disabled="store.loading">
                        <i class="fad fa-sync-alt me-1" :class="{ 'fa-spin': store.loading }" />
                        Sincronizar Alertas
                    </button>
                    <!-- Marcar todas como leídas -->
                    <button class="btn btn-sm btn-falcon-default" type="button" @click="handleMarkAllAsRead" :disabled="store.loading || store.unreadCount === 0">
                        <i class="fad fa-check-double me-1 text-success" />
                        Marcar todo como leído
                    </button>
                </div>

                <!-- Filtros -->
                <div class="col-12 col-lg-auto">
                    <div class="d-flex align-items-center gap-2 flex-wrap flex-sm-nowrap">
                        <select aria-label="Filtrar por estado" v-model="filterStatus" @change="applyFilters" class="form-select form-select-sm border-200 w-100">
                            <option value="">Todos los estados</option>
                            <option value="PENDIENTE">Pendientes</option>
                            <option value="LEIDA">Leídas</option>
                        </select>
                        <select aria-label="Filtrar por tipo" v-model="filterType" @change="applyFilters" class="form-select form-select-sm border-200 w-100">
                            <option value="">Todos los tipos</option>
                            <option value="VEHICLE_DOCUMENT">Documentos de Vehículo</option>
                            <option value="OPERATION_CARD">Tarjetas de Operación</option>
                            <option value="DRIVER_LICENSE">Licencias de Conducción</option>
                            <option value="FIRST_RTM">Primera RTM</option>
                            <option value="AGREEMENT">Convenios Colab.</option>
                            <option value="AFFILIATE_CHARGE">Cobros de Administración</option>
                            <option value="VEHICLE_INSPECTION_PENDING">Inspección de Vehículo Pendiente</option>
                            <option value="VEHICLE_MAINTENANCE_ALERT">Mantenimiento Preventivo</option>
                            <option value="SOCIAL_SECURITY_MORA">Seguridad Social</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- TABLA DE ALERTAS -->
    <div class="row gx-3 fade-in-up" style="animation-delay: 0.2s;">
        <div class="col-12 col-xxl-12">
            <div class="card border-0 shadow-sm">
                <!-- SKELETON -->
                <div v-if="isViewLoading" class="card-body p-0">
                    <div class="table-responsive scrollbar">
                        <table class="table table-sm mb-0">
                            <thead>
                                <tr>
                                    <th v-for="w in ['15%', '40%', '15%', '15%', '15%']" :key="w" style="padding:12px 8px">
                                        <div class="skeleton-text" :style="`height:16px;width:${w}`" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="n in 5" :key="`sk-${n}`">
                                    <td v-for="i in 5" :key="i">
                                        <div class="skeleton-text" style="height:18px;width:75%;" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- DATATABLE -->
                <div v-else class="card-body p-0">
                    <DataTable 
                        :value="store.notifications" 
                        lazy 
                        :paginator="true" 
                        :rows="15"
                        :totalRecords="store.meta.total || store.notifications.length" 
                        :loading="store.loading" 
                        responsiveLayout="scroll"
                        tableStyle="min-width: 50rem" 
                        class="table table-sm mb-0 professional-table"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} alertas"
                        emptyMessage="No se encontraron alertas registradas" 
                        @page="onPageChange"
                    >
                        <!-- Columna Tipo -->
                        <Column field="type" header="Tipo de Alerta" style="width: 200px;">
                            <template #body="{ data }">
                                <div class="d-flex align-items-center">
                                    <i :class="getTypeIcon(data.type) + ' me-2 fs-7'" />
                                    <span class="fw-medium text-800">{{ getTypeLabel(data.type) }}</span>
                                </div>
                            </template>
                        </Column>

                        <!-- Columna Título & Detalle -->
                        <Column field="message" header="Alerta / Detalles">
                            <template #body="{ data }">
                                <div class="d-flex flex-column">
                                    <span class="fw-semibold text-dark fs-10 mb-1">{{ data.title }}</span>
                                    <span class="text-600 fs-11" v-html="formatMessage(data.message)"></span>
                                </div>
                            </template>
                        </Column>

                        <!-- Columna Días Restantes -->
                        <Column field="days_left" header="Plazo" style="width: 180px;">
                            <template #body="{ data }">
                                <template v-if="data.type === 'VEHICLE_MAINTENANCE_ALERT'">
                                    <span v-if="data.days_left < 0" class="badge badge-subtle badge-subtle-danger">
                                        <i class="fad fa-exclamation-triangle me-1" /> Vencido hace {{ Math.abs(data.days_left) }} km
                                    </span>
                                    <span v-else class="badge badge-subtle badge-subtle-warning">
                                        <i class="fad fa-history me-1" /> Vence en {{ data.days_left }} km
                                    </span>
                                </template>
                                <template v-else>
                                    <span v-if="data.days_left === null" class="badge badge-subtle badge-subtle-danger">
                                        <i class="fad fa-exclamation-triangle me-1" /> Faltante / Crítico
                                    </span>
                                    <span v-else-if="data.days_left < 0" class="badge badge-subtle badge-subtle-danger">
                                        <i class="fad fa-calendar-times me-1" /> Vencido hace {{ Math.abs(data.days_left) }} d
                                    </span>
                                    <span v-else-if="data.days_left === 0" class="badge badge-subtle badge-subtle-warning">
                                        <i class="fad fa-clock me-1" /> Vence Hoy
                                    </span>
                                    <span v-else-if="data.days_left <= 15" class="badge badge-subtle badge-subtle-warning">
                                        <i class="fad fa-history me-1" /> {{ data.days_left }} días restantes
                                    </span>
                                    <span v-else class="badge badge-subtle badge-subtle-success">
                                        <i class="fad fa-check-circle me-1" /> {{ data.days_left }} días restantes
                                    </span>
                                </template>
                            </template>
                        </Column>

                        <!-- Columna Fecha Expiración -->
                        <Column field="expiry_date" header="Fecha Límite" style="width: 150px;">
                            <template #body="{ data }">
                                <span class="text-700 fw-medium">{{ formatDate(data.expiry_date) }}</span>
                            </template>
                        </Column>

                        <!-- Columna Estado -->
                        <Column field="status" header="Estado" style="width: 120px;" class="text-center">
                            <template #body="{ data }">
                                <span class="badge rounded-pill badge-subtle" :class="data.status === 'LEIDA' ? 'badge-subtle-secondary' : 'badge-subtle-primary'">
                                    <i :class="data.status === 'LEIDA' ? 'fad fa-envelope-open me-1' : 'fad fa-envelope me-1'" />
                                    {{ data.status === 'LEIDA' ? 'Leída' : 'Pendiente' }}
                                </span>
                            </template>
                        </Column>

                        <!-- Columna Acciones -->
                        <Column header="Acciones" class="text-center" style="width: 120px;">
                            <template #body="{ data }">
                                <button 
                                    v-if="data.status !== 'LEIDA'" 
                                    class="btn btn-falcon-default btn-sm shadow-sm" 
                                    type="button" 
                                    title="Marcar como leída" 
                                    @click="handleMarkAsRead(data.uuid)"
                                >
                                    <i class="fad fa-check text-success me-1" /> Marcar Leída
                                </button>
                                <span v-else class="text-muted fs-11 fw-medium">
                                    <i class="fad fa-check-double text-success me-1" /> Leída
                                </span>
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useNotificationsStore } from '../store/notifications.store.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import NoaTableSpinner from '@/components/NoaTableSpinner.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Swal from 'sweetalert2';

const store = useNotificationsStore();
const isViewLoading = ref(true);

const filterStatus = ref('');
const filterType = ref('');
const currentPage = ref(1);

const getTypeIcon = (type) => {
    switch (type) {
        case 'VEHICLE_DOCUMENT': return 'fad fa-file-certificate text-info';
        case 'OPERATION_CARD': return 'fad fa-id-card text-warning';
        case 'DRIVER_LICENSE': return 'fad fa-id-badge text-success';
        case 'FIRST_RTM': return 'fad fa-wrench text-danger';
        case 'AGREEMENT': return 'fad fa-file-contract text-primary';
        case 'AFFILIATE_CHARGE': return 'fad fa-file-invoice-dollar text-success';
        case 'VEHICLE_INSPECTION_PENDING': return 'fad fa-clipboard-check text-danger';
        case 'VEHICLE_MAINTENANCE_ALERT': return 'fad fa-tools text-warning';
        case 'SOCIAL_SECURITY_MORA': return 'fad fa-shield-alt text-danger';
        default: return 'fad fa-bell text-secondary';
    }
};

const getTypeLabel = (type) => {
    switch (type) {
        case 'VEHICLE_DOCUMENT': return 'Documento Vehículo';
        case 'OPERATION_CARD': return 'Tarjeta Operación';
        case 'DRIVER_LICENSE': return 'Licencia Conducción';
        case 'FIRST_RTM': return 'Primera RTM';
        case 'AGREEMENT': return 'Convenio';
        case 'AFFILIATE_CHARGE': return 'Cuota Adm.';
        case 'VEHICLE_INSPECTION_PENDING': return 'Inspección Pend.';
        case 'VEHICLE_MAINTENANCE_ALERT': return 'Mantenimiento Prev.';
        case 'SOCIAL_SECURITY_MORA': return 'Seguridad Social';
        default: return 'Alerta';
    }
};

const formatMessage = (msg) => {
    if (!msg) return '';
    let formatted = msg;
    // Resaltar palabras clave
    formatted = formatted.replace(/(VENCIDO|VENCIDA|VENCIDAS)/g, '<strong class="text-danger">$1</strong>');
    formatted = formatted.replace(/(por vencer|vence en|PRÓXIMO|PRÓXIMA|PROXIMO|PROXIMA)/gi, '<strong class="text-warning">$1</strong>');
    return formatted;
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return dateStr;
    }
};

const loadData = async () => {
    const filters = {};
    if (filterStatus.value) filters.status = filterStatus.value;
    if (filterType.value) filters.type = filterType.value;
    
    await store.fetchNotifications(currentPage.value, filters);
};

const applyFilters = async () => {
    currentPage.value = 1;
    await loadData();
};

const refreshTable = async () => {
    await loadData();
};

const onPageChange = async ({ first, rows }) => {
    currentPage.value = Math.floor(first / rows) + 1;
    await loadData();
};

const handleSync = async () => {
    await store.syncNotifications();
};

const handleMarkAllAsRead = async () => {
    const result = await Swal.fire({
        title: '¿Marcar todo como leído?',
        text: 'Esta acción cambiará el estado de todas las alertas pendientes.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, marcar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2c7be5'
    });

    if (result.isConfirmed) {
        await store.markAllAsRead();
    }
};

const handleMarkAsRead = async (uuid) => {
    await store.markAsRead(uuid);
};

const handleDelete = async (uuid) => {
    const result = await Swal.fire({
        title: '¿Eliminar alerta?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e63757'
    });

    if (result.isConfirmed) {
        await store.deleteNotification(uuid);
        Swal.fire({
            icon: 'success',
            title: 'Eliminada',
            text: 'La alerta ha sido eliminada.',
            timer: 1500,
            showConfirmButton: false
        });
    }
};

onMounted(async () => {
    try {
        await loadData();
    } finally {
        isViewLoading.value = false;
    }
});
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

/* Tabla Estilo Profesional */
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

/* Badges */
.badge-subtle {
    font-weight: 500;
    font-size: 0.75rem;
    padding: 0.35em 0.6em;
    border-radius: 0.25rem;
}

.badge-subtle-success {
    background: rgba(25, 135, 84, 0.1);
    color: #198754;
    border: 1px solid rgba(25, 135, 84, 0.2);
}

.badge-subtle-warning {
    background: rgba(255, 193, 7, 0.1);
    color: #856404;
    border: 1px solid rgba(255, 193, 7, 0.2);
}

.badge-subtle-danger {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    border: 1px solid rgba(220, 53, 69, 0.2);
}

.badge-subtle-primary {
    background: rgba(13, 110, 253, 0.1);
    color: #0d6efd;
    border: 1px solid rgba(13, 110, 253, 0.2);
}

.badge-subtle-secondary {
    background: rgba(108, 117, 125, 0.1);
    color: #6c757d;
    border: 1px solid rgba(108, 117, 125, 0.2);
}
</style>
