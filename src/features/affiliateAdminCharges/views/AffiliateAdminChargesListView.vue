<template>
    <BasePageHeader :title="'Cobros - Cuota de Administración'" description="Gestión y control de pagos de vehículos"
        icon="fad fa-file-invoice-dollar text-primary" :show-refresh="true" :show-create="true" :show-bg="true"
        :loading="isViewLoading || store.loading" :compact="true"
        :breadcrumbs="[{ label: 'Financiero' }, { label: 'Cobros' }]" @refresh="refreshTable" @create="goToCreate" />

    <!-- SUMMARY SECTION -->
    <div class="row g-3 mb-3 fade-in-up" style="animation-delay: 0.05s;">
        <div class="col-12 col-sm-6 col-md-3">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2">
                            <i class="fad fa-file-invoice-dollar text-primary"></i>
                        </div>
                        <span class="badge badge-subtle-primary">Total</span>
                    </div>
                    <h4 class="mb-1 fw-bold">{{ formatCurrency(summary.totals.general) }}</h4>
                    <p class="text-muted small mb-0">Cobros registrados (Página actual)</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
            <div class="card border-0 shadow-sm h-100 border-start border-warning border-4">
                <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <div class="bg-warning bg-opacity-10 rounded-circle p-2">
                            <i class="fad fa-hourglass-half text-warning"></i>
                        </div>
                        <span class="badge badge-subtle-warning">Pendiente</span>
                    </div>
                    <h4 class="mb-1 fw-bold text-warning">{{ formatCurrency(summary.totals.pending) }}</h4>
                    <p class="text-muted small mb-0">Por recaudar</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
            <div class="card border-0 shadow-sm h-100 border-start border-success border-4">
                <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <div class="bg-success bg-opacity-10 rounded-circle p-2">
                            <i class="fad fa-check-circle text-success"></i>
                        </div>
                        <span class="badge badge-subtle-success">Pagado</span>
                    </div>
                    <h4 class="mb-1 fw-bold text-success">{{ formatCurrency(summary.totals.paid) }}</h4>
                    <p class="text-muted small mb-0">Total recaudado</p>
                </div>
            </div>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
            <div class="card border-0 shadow-sm h-100 border-start border-danger border-4">
                <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <div class="bg-danger bg-opacity-10 rounded-circle p-2">
                            <i class="fad fa-exclamation-triangle text-danger"></i>
                        </div>
                        <span class="badge badge-subtle-danger">Mora / Vencido</span>
                    </div>
                    <h4 class="mb-1 fw-bold text-danger">{{ formatCurrency(summary.totals.overdue) }}</h4>
                    <p class="text-muted small mb-0">Vencido y en mora</p>
                </div>
            </div>
        </div>
    </div>

    <!-- SEARCH BAR -->
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
                        <input v-model="searchQuery"
                            class="form-control form-control-sm border-start-0 shadow-none"
                            type="search"
                            placeholder="Buscar por concepto, vehículo o referencia..."
                            aria-label="Buscar cobro"
                            @input="debouncedSearch" />
                        <button v-if="searchQuery" class="btn btn-outline-secondary border-start-0"
                            type="button" title="Limpiar búsqueda" @click="clearSearch">
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

    <!-- DATATABLE SECTION -->
    <div class="row fade-in-up g-2 g-md-3" style="animation-delay: 0.2s;">
        <div class="col-12">
            <div class="card border-0 shadow-sm overflow-hidden">
                <!-- SKELETON -->
                <div v-if="isViewLoading" class="card-body p-0">
                    <div class="table-responsive scrollbar">
                        <table class="table table-sm mb-0 fs-10 table-view-tickets professional-table unifont-table"
                            style="min-width: 60rem; table-layout: fixed;">
                            <colgroup>
                                <col style="width: 25%">
                                <col style="width: 15%">
                                <col style="width: 15%">
                                <col style="width: 12%">
                                <col style="width: 12%">
                                <col style="width: 10%">
                                <col style="width: 11%">
                            </colgroup>
                            <thead>
                                <tr>
                                    <th v-for="w in 7" :key="w" style="padding: 12px 16px;">
                                        <div class="skeleton-el" style="height:16px; width:80%;"></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="n in 7" :key="n">
                                    <td class="align-middle">
                                        <div class="d-flex align-items-center">
                                            <div class="skeleton-el flex-shrink-0"
                                                style="height:32px; width:32px; border-radius:50%; margin-right:8px;">
                                            </div>
                                            <div class="skeleton-el" style="height:18px; width:80%;"></div>
                                        </div>
                                    </td>
                                    <td v-for="i in 4" :key="i" class="align-middle">
                                        <div class="skeleton-el" style="height:18px; width:80%;"></div>
                                    </td>
                                    <td class="align-middle text-center">
                                        <div class="skeleton-el mx-auto"
                                            style="height:22px; width:64px; border-radius:999px;"></div>
                                    </td>
                                    <td class="align-middle">
                                        <div class="d-flex justify-content-center align-items-center gap-1">
                                            <div class="skeleton-el" style="height:30px; width:30px; border-radius:6px;"></div>
                                            <div class="skeleton-el" style="height:30px; width:30px; border-radius:6px;"></div>
                                            <div class="skeleton-el" style="height:30px; width:30px; border-radius:6px;"></div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- TABLE -->
                <div v-else class="card-body p-0">
                    <div class="table-responsive scrollbar">
                        <DataTable :value="store.items" lazy :paginator="true" :rows="store.pagination.itemsPerPage"
                            :totalRecords="store.pagination.totalItems" :first="(store.pagination.currentPage - 1) * store.pagination.itemsPerPage"
                            @page="onPageChange" responsiveLayout="scroll" :loading="store.loading"
                            class="table table-sm mb-0 professional-table unifont-table"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="{first} a {last} de {totalRecords}"
                            :rowsPerPageOptions="[10, 25, 50, 100]">

                            <Column field="vehicle" header="Vehículo" style="min-width: 120px">
                                <template #body="{ data }">
                                    <div class="d-flex align-items-center">
                                        <div class="bg-primary bg-opacity-10 rounded p-1 me-2">
                                            <i class="fad fa-steering-wheel text-primary" style="font-size: 12px;"></i>
                                        </div>
                                        <div>
                                            <span class="fw-bold text-dark">{{ getVehiclePlate(data.vehicle_uuid) || 'Vehículo' }}</span>
                                            <div class="text-muted small d-flex flex-wrap gap-1">
                                                <span class="badge bg-light text-primary border shadow-none"
                                                    style="font-weight: 500;">Ref: {{ data.payment_reference || '-' }}</span>
                                                <span v-if="data.bank_reference"
                                                    class="badge bg-light text-success border shadow-none"
                                                    style="font-weight: 500;">Banco: {{ data.bank_reference }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </Column>

                            <Column field="charge_type" header="Tipo de Cobro" style="width: 15%;">
                                <template #body="{ data }">
                                    <span class="text-muted">{{ formatChargeType(data.charge_type) }}</span>
                                    <div class="text-muted small">{{ data.concept || '-' }}</div>
                                </template>
                            </Column>

                            <Column field="amount" header="Monto" style="width: 12%;">
                                <template #body="{ data }">
                                    <div class="d-flex flex-column">
                                        <span class="fw-bold text-success">{{ formatCurrency(data.amount) }}</span>
                                    </div>
                                </template>
                            </Column>

                            <Column field="period_date" header="Período" style="width: 12%;">
                                <template #body="{ data }">
                                    <div class="d-flex align-items-center text-muted">
                                        <i class="fad fa-calendar-alt me-1 opacity-50"></i>
                                        {{ formatDate(data.period_date) }}
                                    </div>
                                </template>
                            </Column>

                            <Column field="due_date" header="Vencimiento" style="width: 12%;">
                                <template #body="{ data }">
                                    <div class="d-flex align-items-center"
                                        :class="isPastDue(data.due_date, data.status) ? 'text-danger fw-semibold' : 'text-muted'">
                                        <i class="fad fa-calendar-times me-1 opacity-50"></i>
                                        {{ formatDate(data.due_date) }}
                                    </div>
                                </template>
                            </Column>

                            <Column field="status" header="Estado" style="width: 10%;" class="text-center">
                                <template #body="{ data }">
                                    <span class="badge badge-subtle rounded-pill"
                                        :class="getStatusBadgeClass(data.status)"
                                        style="font-size: 0.75rem; padding: 0.35em 0.7em;">
                                        {{ formatStatus(data.status) }}
                                    </span>
                                </template>
                            </Column>

                            <Column header="Acciones" style="width: 12%; text-align:center;">
                                <template #body="{ data }">
                                    <div class="d-flex justify-content-center align-items-center gap-1">
                                        <button v-if="can('affiliate_admin_charges.update') && !['PAGADO', 'ANULADO'].includes(data.status)"
                                            class="btn btn-falcon-default btn-action" @click="handlePay(data)"
                                            title="Pagar Mensualidad" :aria-label="`Pagar mensualidad de ${data.payment_reference}`" data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i class="fad fa-hand-holding-usd text-success"></i>
                                        </button>
                                        <button v-if="['PAGADO', 'PENDIENTE'].includes(data.status)" class="btn btn-falcon-default btn-action" @click="handleDownloadReceipt(data.uuid)"
                                            title="Descargar Recibo" :aria-label="`Descargar recibo de ${data.payment_reference}`" data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i class="fad fa-file-pdf text-danger"></i>
                                        </button>
                                        <button v-if="can('affiliate_admin_charges.profile')" class="btn btn-falcon-default btn-action"
                                            @click="viewVehicleHistory(data)" title="Historial de Vehículo" :aria-label="`Historial del vehículo ${data.payment_reference}`"
                                            data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i class="fad fa-history text-info"></i>
                                        </button>
                                        <button v-if="can('affiliate_admin_charges.profile')" class="btn btn-falcon-default btn-action" @click="goToDetail(data.uuid)"
                                            title="Visualizar" :aria-label="`Ver detalle de ${data.payment_reference}`" data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i class="fad fa-eye text-primary"></i>
                                        </button>
                                        <button v-if="can('affiliate_admin_charges.update')" class="btn btn-falcon-default btn-action" @click="goToEdit(data.uuid)"
                                            title="Editar" :aria-label="`Editar ${data.payment_reference}`" data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i class="fad fa-edit text-warning"></i>
                                        </button>
                                        <button v-if="can('affiliate_admin_charges.delete')" class="btn btn-falcon-default btn-action" @click="handleDelete(data)"
                                            title="Eliminar" :aria-label="`Eliminar ${data.payment_reference}`" data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i class="fad fa-trash text-danger"></i>
                                        </button>
                                    </div>
                                </template>
                            </Column>

                            <template #empty>
                                <div class="text-center py-5">
                                    <div v-if="searchQuery">
                                        <div class="mb-3">
                                            <i class="fad fa-search-minus fs-1 text-warning opacity-50"></i>
                                        </div>
                                        <h6 class="text-muted mb-1 fw-medium">Sin coincidencias para "{{ searchQuery }}"</h6>
                                        <p class="text-muted small mb-3">Intenta con otros términos o limpia el filtro de búsqueda</p>
                                        <button class="btn btn-outline-secondary btn-sm rounded-pill px-4" @click="clearSearch">
                                            <i class="fad fa-eraser me-1"></i>Limpiar búsqueda
                                        </button>
                                    </div>
                                    <div v-else>
                                        <div class="mb-3">
                                            <i class="fad fa-file-invoice-dollar fs-1 text-muted opacity-50"></i>
                                        </div>
                                        <h6 class="text-muted mb-1 fw-medium">No hay cobros registrados</h6>
                                        <p class="text-muted small mb-3">Comienza agregando el primer cobro al sistema</p>
                                        <button class="btn btn-primary btn-sm rounded-pill px-4" @click="goToCreate">
                                            <i class="fad fa-plus me-1"></i>Registrar Cobro
                                        </button>
                                    </div>
                                </div>
                            </template>

                            <template #footer>
                                <div class="d-flex justify-content-between align-items-center py-2 px-3 bg-light rounded-bottom">
                                    <small class="text-muted" style="font-size: 0.85rem;">
                                        <i class="fad fa-list me-1"></i>
                                        Mostrando <strong>{{ store.items.length || 0 }}</strong> de
                                        <strong>{{ store.pagination.totalItems || 0 }}</strong> registros
                                    </small>
                                    <small class="text-muted" style="font-size: 0.85rem;">
                                        <i class="fad fa-pages me-1"></i>
                                        Página <strong>{{ store.pagination.currentPage }}</strong> de
                                        <strong>{{ store.pagination.totalPages || 1 }}</strong>
                                    </small>
                                </div>
                            </template>
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

    <!-- MODAL DE HISTORIAL -->
    <div class="modal fade unifont-table" id="historyModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-light py-2">
                    <h5 class="modal-title fw-bold fs-9 text-dark">
                        <i class="fad fa-history text-info me-2"></i>Historial de Pagos: {{ historyVehicle }}
                    </h5>
                    <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal"
                        aria-label="Cerrar"></button>
                </div>
                <div class="modal-body p-0">
                    <div class="table-responsive scrollbar">
                        <table class="table table-sm mb-0 fs-10 professional-table">
                            <thead class="bg-light">
                                <tr>
                                    <th class="py-2 ps-3">Periodo</th>
                                    <th class="py-2">Concepto</th>
                                    <th class="py-2">Monto</th>
                                    <th class="py-2 text-center">Estado</th>
                                    <th class="py-2">Fecha Pago</th>
                                    <th class="py-2 pe-3 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in historyItems" :key="item.uuid" class="align-middle">
                                    <td class="ps-3 fw-medium">{{ formatDate(item.period_date) }}</td>
                                    <td>
                                        <span class="text-muted d-block small">{{ formatChargeType(item.charge_type) }}</span>
                                        {{ item.concept }}
                                    </td>
                                    <td class="fw-bold text-success">{{ formatCurrency(item.amount) }}</td>
                                    <td class="text-center">
                                        <span class="badge badge-subtle rounded-pill px-2 py-1" :class="getStatusBadgeClass(item.status)">
                                            {{ formatStatus(item.status) }}
                                        </span>
                                    </td>
                                    <td class="text-muted">{{ item.payment_date ? formatDate(item.payment_date) : '-' }}</td>
                                    <td class="pe-3 text-center">
                                        <button v-if="can('affiliate_admin_charges.update') && !['PAGADO', 'ANULADO'].includes(item.status)"
                                            class="btn btn-falcon-success btn-sm py-0 px-2 rounded me-1"
                                            @click="handlePayFromHistory(item)"
                                            title="Pagar Mensualidad">
                                            <i class="fad fa-hand-holding-usd text-success me-1"></i> Pagar
                                        </button>

                                        <button v-if="['PAGADO', 'PENDIENTE'].includes(item.status)" class="btn btn-falcon-default btn-sm py-0 px-2 rounded" @click="handleDownloadReceipt(item.uuid)" title="Descargar Recibo">
                                            <i class="fad fa-file-pdf text-danger me-1"></i>Recibo
                                        </button>

                                        <span v-if="item.status === 'PAGADO'" class="badge bg-light text-success border shadow-none ms-1" style="font-weight: 500;">
                                            <i class="fad fa-check-double me-1"></i>Ref: {{ item.bank_reference || 'N/A' }}
                                        </span>
                                        <span v-if="!['PAGADO', 'PENDIENTE'].includes(item.status) && !can('affiliate_admin_charges.update')" class="text-muted small">-</span>
                                    </td>
                                </tr>
                                <tr v-if="historyItems.length === 0">
                                    <td colspan="6" class="text-center py-4 text-muted italic">
                                        No hay cobros registrados para este vehículo.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer bg-light py-2">
                    <button type="button" class="btn btn-falcon-default btn-sm px-4"
                        data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAffiliateAdminChargesStore } from '../store/affiliateCharges.store.js';
import { usePermissionsStore } from '@store';
import { useTable } from '@/hooks/useTable.js';
import { useTableActions } from '@/hooks/useTableActions.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import NoaTableSpinner from '@/components/NoaTableSpinner.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const router = useRouter();
const store = useAffiliateAdminChargesStore();
const permissionsStore = usePermissionsStore();

const isViewLoading = ref(true);
const searchQuery = ref('');

const { debouncedSearch } = useTable({}, () => store.setGlobalFilter(searchQuery.value));
const { confirmDelete } = useTableActions(store, router);

const can = (action) => permissionsStore.can(action);

const clearSearch = async () => { searchQuery.value = ''; await store.setGlobalFilter(''); };

const refreshTable = async () => {
    await store.fetchItems();
};

const onPageChange = async ({ first, rows }) => {
    if (rows && rows !== store.pagination.itemsPerPage) {
        store.pagination.itemsPerPage = rows;
    }
    await store.setPage(Math.floor(first / rows) + 1);
};

// Navegación
const goToCreate = () => router.push('/pagos-de-administracion/crear');
const goToEdit = (uuid) => router.push(`/pagos-de-administracion/editar/${uuid}`);
const goToDetail = (uuid) => router.push(`/pagos-de-administracion/perfil/${uuid}`);

const handleDelete = (item) => confirmDelete(item, {
    title: '¿Eliminar cargo?',
    nameField: 'payment_reference',
});

const handleDownloadReceipt = async (uuid) => {
    await store.downloadReceipt(uuid);
};

const historyItems = ref([]);
const historyVehicle = ref('');
let activeHistoryRef = null;

const viewVehicleHistory = async (item) => {
    const reference = item.payment_reference;
    if (!reference) return;

    activeHistoryRef = reference;
    historyVehicle.value = getVehiclePlate(item.vehicle_uuid) || 'Vehículo';
    const data = await store.fetchPaymentHistory(reference);
    historyItems.value = data;

    const modalEl = document.getElementById('historyModal');
    if (modalEl) {
        const modal = new window.bootstrap.Modal(modalEl);
        modal.show();
    }
};

const handlePayFromHistory = async (item) => {
    const modalEl = document.getElementById('historyModal');
    if (modalEl) {
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        }
    }
    await handlePay(item, true);
};

const handlePay = async (item, fromHistory = false) => {
    const { value: formValues } = await Swal.fire({
        title: 'Registrar Pago',
        html: `
            <div class="alert alert-success bg-success-subtle text-success py-2 fs-9 mb-3 text-start border-0">
                <i class="fad fa-info-circle me-1"></i> <strong>Ref. Pago (Cuenta):</strong> ${item.payment_reference || 'N/A'}<br>
                <i class="fad fa-file-invoice me-1"></i> <strong>Concepto:</strong> ${item.concept || 'N/A'}
            </div>
            <div class="text-start mb-3">
                <label class="form-label fw-medium" style="font-size: 0.85rem;">Fecha de Pago</label>
                <input id="swal-payment-date" class="form-control" type="date" placeholder="YYYY-MM-DD" value="${dayjs().format('YYYY-MM-DD')}">
            </div>
            <div class="text-start mb-3">
                <label class="form-label fw-medium" style="font-size: 0.85rem;">Método de Pago</label>
                <select id="swal-payment-method" class="form-select form-select-sm w-100">
                    <option value="EFECTIVO" selected>Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia / Consignación</option>
                    <option value="TARJETA">Tarjeta</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CORTESIA">Cortesía</option>
                    <option value="OTRO">Otro</option>
                </select>
            </div>
            <div class="text-start mb-3">
                <label class="form-label fw-medium" style="font-size: 0.85rem;">Referencia Bancaria <span class="text-muted">(Opcional)</span></label>
                <input id="swal-bank-ref" class="form-control form-control-sm" type="text" autocomplete="off" placeholder="Ej. Transacción #12345">
            </div>
            <div class="text-start">
                <label class="form-label fw-medium" style="font-size: 0.85rem;">Notas <span class="text-muted">(Opcional)</span></label>
                <textarea id="swal-notes" class="form-control form-control-sm" rows="2" placeholder="Comentarios adicionales..."></textarea>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: '<i class="fad fa-check-circle me-1"></i> Procesar Pago',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#00d27a',
        cancelButtonColor: '#6c757d',
        preConfirm: () => {
            const payment_date = document.getElementById('swal-payment-date').value;
            if (!payment_date) {
                Swal.showValidationMessage('La fecha de pago es obligatoria');
                return false;
            }
            return {
                payment_date,
                payment_method: document.getElementById('swal-payment-method').value,
                bank_reference: document.getElementById('swal-bank-ref').value,
                notes: document.getElementById('swal-notes').value
            };
        }
    });

    if (formValues) {
        await store.applyMonthlyPayment(item.uuid, formValues);
        
        // Auto-filtrar la tabla para mostrar el registro pagado y el nuevo generado
        if (item.payment_reference) {
            searchQuery.value = item.payment_reference;
            await store.setGlobalFilter(item.payment_reference);
        }

        // Descargar el recibo de pago automáticamente
        await handleDownloadReceipt(item.uuid);

        if (fromHistory && activeHistoryRef) {
            const data = await store.fetchPaymentHistory(activeHistoryRef);
            historyItems.value = data;
            setTimeout(() => {
                const modalEl = document.getElementById('historyModal');
                if (modalEl) {
                    const modal = new window.bootstrap.Modal(modalEl);
                    modal.show();
                }
            }, 600);
        }
    } else {
        if (fromHistory && activeHistoryRef) {
            const modalEl = document.getElementById('historyModal');
            if (modalEl) {
                const modal = new window.bootstrap.Modal(modalEl);
                modal.show();
            }
        }
    }
};

// Helper de Vehículos desde el catálogo cargado
const getVehiclePlate = (uuid) => {
    if (!uuid || !store.catalogs?.vehicles) return '';
    const vehicle = store.catalogs.vehicles.find(v => v.uuid === uuid);
    return vehicle ? vehicle.vehicle_license_plate : '';
};

// Computed property para simular el resumen basado en los datos actuales
// Nota: Para datos reales de toda la BD, se requiere un endpoint fetchSummary en el backend.
const summary = computed(() => {
    const items = store.items || [];
    let general = 0, pending = 0, paid = 0, overdue = 0;
    
    items.forEach(item => {
        const amount = parseFloat(item.amount || 0);
        general += amount;
        if (item.status === 'PAGADO') paid += amount;
        else if (item.status === 'PENDIENTE') pending += amount;
        else if (item.status === 'VENCIDO' || item.status === 'EN_MORA') overdue += amount;
    });

    return {
        totals: { general, pending, paid, overdue }
    };
});

// UTILIDADES VISUALES
const formatChargeType = (value) => {
    const map = {
        'CUOTA_ADMINISTRACION': 'Administración',
        'PAGO_MENSUALIDAD': 'Pago Mensualidad',
        'PAGO_CUPO': 'Pago de Cupo',
        'SEGURO_VEHICULO': 'Seguro Vehículo',
        'GPS': 'GPS',
        'MANTENIMIENTO': 'Mantenimiento',
        'MULTA': 'Multa',
        'OTRO': 'Otro'
    };
    return map[value] || value;
};

const formatStatus = (value) => {
    const map = {
        'PENDIENTE': 'Pendiente',
        'PAGADO': 'Pagado',
        'VENCIDO': 'Vencido',
        'EN_MORA': 'En Mora',
        'ANULADO': 'Anulado'
    };
    return map[value] || value;
};

const getStatusBadgeClass = (status) => {
    const map = {
        'PENDIENTE': 'badge-subtle-warning',
        'PAGADO': 'badge-subtle-success',
        'VENCIDO': 'badge-subtle-danger',
        'EN_MORA': 'badge-subtle-danger',
        'ANULADO': 'badge-subtle-secondary'
    };
    return map[status] || 'badge-subtle-secondary';
};

const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(value);
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return dayjs(dateStr).format('DD/MM/YYYY');
};

const isPastDue = (dueDate, status) => {
    if (!dueDate || status === 'PAGADO') return false;
    const today = dayjs().startOf('day');
    const dateToCompare = dayjs(dueDate).startOf('day');
    return dateToCompare.isBefore(today);
};

const initTooltips = () => {
    if (typeof window?.bootstrap?.Tooltip !== 'undefined') {
        setTimeout(() => {
            document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
                try {
                    const instance = window.bootstrap.Tooltip.getInstance(el);
                    if (instance) instance.dispose();
                    new window.bootstrap.Tooltip(el, { trigger: 'hover', delay: { show: 150, hide: 80 } });
                } catch (e) { /* Ignorar */ }
            });
        }, 100);
    }
};

onMounted(async () => {
    isViewLoading.value = true;
    try {
        await Promise.all([store.loadCatalogs(), store.fetchItems()]);
    } catch (error) {
        console.error("Error al cargar cobros:", error);
    } finally {
        isViewLoading.value = false;
        initTooltips();
    }
});
</script>

<style scoped>
/* ===== ANIMACIONES ===== */
.fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ===== SKELETON ===== */

@keyframes skeleton-pulse {
    0%,
    100% {
        background-position: 200% 0;
        opacity: 1;
    }
    50% {
        background-position: -200% 0;
        opacity: 0.45;
    }
}

/* ===== TABLA PROFESIONAL ===== */
:deep(.professional-table.unifont-table .p-datatable-tbody > tr > td) {
    font-size: 0.88rem !important;
    color: #2c3e50;
    padding: 0.8rem 1rem !important;
    vertical-align: middle;
    white-space: normal !important;
    word-wrap: break-word;
}

:deep(.professional-table.unifont-table .p-datatable-thead > tr > th) {
    background: #f8f9fa;
    font-size: 0.78rem !important;
    text-transform: uppercase;
    font-weight: 700;
    padding: 0.75rem 1rem !important;
    border-bottom: 2px solid #edf2f9 !important;
    color: #495057;
    white-space: nowrap;
}

:deep(.professional-table.unifont-table .p-datatable-tbody > tr:hover) {
    background-color: #f8f9fa !important;
}

/* ===== BADGES FALCON ===== */
.badge-subtle {
    font-weight: 500;
    transition: transform 150ms;
}

.badge-subtle:hover {
    transform: translateY(-1px);
}

.badge-subtle-success {
    background-color: rgba(0, 210, 106, 0.1);
    color: #008644;
    border: 1px solid rgba(0, 210, 106, 0.2);
}

.badge-subtle-warning {
    background-color: rgba(255, 174, 0, 0.1);
    color: #9c6b00;
    border: 1px solid rgba(255, 174, 0, 0.2);
}

.badge-subtle-danger {
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    border: 1px solid rgba(220, 53, 69, 0.2);
}

/* ===== BOTONES DE ACCIÓN ===== */
.btn-action {
    width: 30px;
    height: 30px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 150ms;
}

.btn-action:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn-falcon-default {
    background: #f8f9fa;
    border-color: #e9ecef;
    color: #212529;
    transition: all 150ms;
}

.btn-falcon-default:hover:not(:disabled) {
    background: #e9ecef;
    border-color: #dee2e6;
}

/* ===== INPUT DE BÚSQUEDA ===== */
.input-group:focus-within {
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
    border-radius: 0.25rem;
}

.input-group .form-control:focus {
    box-shadow: none;
}

/* ===== PAGINADOR ===== */
:deep(.p-paginator) {
    padding: 0.5rem 1rem !important;
    background: #f8f9fa !important;
}
</style>