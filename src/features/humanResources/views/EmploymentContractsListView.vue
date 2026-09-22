<template>
    <BasePageHeader title="Contratos Laborales" subtitle="Gestiona los contratos laborales registrados en el sistema"
        icon="fad fa-file-contract text-primary" :show-refresh="true" :show-create="true" :show-bg="true"
        :loading="isViewLoading || store.loading" :compact="true" :canCreate="can('employmentContracts.create')"
        :breadcrumbs="[{ label: 'Recursos Humanos' }, { label: 'Contratos Laborales' }]" @refresh="refreshTable" @create="goToCreate" />

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
                            type="search" placeholder="Buscar por nombre, documento..."
                            aria-label="Buscar contrato" @input="debouncedSearch" />
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
                        {{ store.pagination.totalItems || 0 }} resultado{{ store.pagination.totalItems !== 1 ? 's' : '' }}
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

                <div class="card-body p-0">
                    <div class="table-responsive scrollbar">
                        <DataTable :value="store.items" :lazy="true" :paginator="true" :rows="store.pagination.itemsPerPage || 15"
                            :totalRecords="store.pagination.totalItems || 0" @page="onPage"
                            :loading="store.loading" dataKey="uuid" class="p-datatable-sm w-100" responsiveLayout="scroll"
                            :rowHover="true" stripedRows>
                            
                            <!-- Empleado -->
                            <Column header="Empleado" style="min-width:250px;">
                                <template #body="{ data }">
                                    <div class="d-flex align-items-center">
                                        <div class="avatar avatar-l me-2">
                                            <div class="avatar-name rounded-circle">
                                                <span>{{ getInitials(data.thirdParty?.first_name || data.thirdParty?.trade_name) }}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h6 class="mb-0 fw-medium text-900">
                                                {{ data.thirdParty?.first_name }} {{ data.thirdParty?.last_name }} {{ data.thirdParty?.trade_name }}
                                            </h6>
                                            <small class="text-muted">Doc: {{ data.thirdParty?.document_number }}</small>
                                        </div>
                                    </div>
                                </template>
                            </Column>

                            <!-- Tipo -->
                            <Column header="Tipo Contrato" style="min-width:150px;">
                                <template #body="{ data }">
                                    <span class="badge bg-primary">{{ data.contract_type?.replace(/_/g, ' ') }}</span>
                                </template>
                            </Column>

                            <!-- Fechas -->
                            <Column header="Fechas" style="min-width:150px;">
                                <template #body="{ data }">
                                    <div class="small">
                                        <div class="text-nowrap"><i class="fad fa-play text-success me-1"></i>{{ formatDate(data.start_date) }}</div>
                                        <div class="text-nowrap text-muted mt-1" v-if="data.end_date">
                                            <i class="fad fa-stop text-danger me-1"></i>{{ formatDate(data.end_date) }}
                                        </div>
                                    </div>
                                </template>
                            </Column>

                            <!-- Estado -->
                            <Column header="Estado" class="text-center" style="min-width:120px;">
                                <template #body="{ data }">
                                    <span class="badge" :class="{
                                        'bg-success': data.status === 'ACTIVO',
                                        'bg-warning': data.status === 'SUSPENDIDO',
                                        'bg-danger': data.status === 'TERMINADO'
                                    }">
                                        <i class="fad me-1" :class="{
                                            'fa-check': data.status === 'ACTIVO',
                                            'fa-pause': data.status === 'SUSPENDIDO',
                                            'fa-times': data.status === 'TERMINADO'
                                        }"></i>
                                        {{ data.status }}
                                    </span>
                                </template>
                            </Column>

                            <!-- Acciones -->
                            <Column header="Acciones" class="text-center" style="min-width:140px; width: 140px;">
                                <template #body="{ data }">
                                    <div class="btn-group btn-group-sm" role="group">
                                        <button v-if="can('employmentContracts.show')" class="btn btn-falcon-default" type="button"
                                            title="Ver detalle" :aria-label="`Ver detalle de ${data.thirdParty?.first_name}`" @click="goToDetail(data.uuid)">
                                            <i class="fad fa-eye text-primary" style="font-size:14px;" />
                                        </button>
                                        <button v-if="can('employmentContracts.update')" class="btn btn-falcon-default" type="button"
                                            title="Editar" :aria-label="`Editar ${data.thirdParty?.first_name}`" @click="goToEdit(data.uuid)">
                                            <i class="fad fa-edit text-warning" style="font-size:14px;" />
                                        </button>
                                        <button v-if="can('employmentContracts.destroy')" class="btn btn-falcon-default"
                                            type="button" title="Eliminar" :aria-label="`Eliminar ${data.thirdParty?.first_name}`" @click="handleDelete(data)">
                                            <i class="fad fa-trash text-danger" style="font-size:14px;" />
                                        </button>
                                    </div>
                                </template>
                            </Column>

                            <template #empty>
                                <div class="text-center py-5">
                                    <i class="fad fa-file-contract fs-1 text-muted opacity-50 mb-3 d-block" />
                                    <h6 class="text-muted mb-1 fw-medium">No hay contratos registrados</h6>
                                    <p class="text-muted small mb-3">Comienza agregando tu primer contrato</p>
                                    <button v-if="can('employmentContracts.create')" class="btn btn-primary btn-sm"
                                        @click="goToCreate">
                                        <i class="fad fa-plus me-1" />Agregar contrato
                                    </button>
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEmploymentContractsStore } from '../store/employmentContracts.store.js';
import { usePermissionsStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import NoaTableSpinner from '@/components/NoaTableSpinner.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

const router = useRouter();
const store = useEmploymentContractsStore();
const permissionsStore = usePermissionsStore();

const isViewLoading = ref(false);
const searchQuery = ref('');
let searchTimeout = null;

const can = (action) => permissionsStore.can(action);

const getInitials = (text) => {
    if (!text) return '?';
    const words = String(text).trim().split(/\s+/);
    return words.length === 1
        ? words[0][0].toUpperCase()
        : (words[0][0] + words[1][0]).toUpperCase();
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).format('DD/MM/YYYY');
};

const fetchContracts = async (page = 1) => {
    store.pagination.currentPage = page;
    store.search = searchQuery.value;
    await store.fetchItems();
};

const onPage = (event) => {
    fetchContracts(event.page + 1);
};

const debouncedSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchContracts(1);
    }, 500);
};

const clearSearch = () => {
    searchQuery.value = '';
    fetchContracts(1);
};

const refreshTable = () => fetchContracts(1);

const goToCreate = () => router.push({ name: 'employmentContracts.create' });
const goToEdit = (uuid) => router.push({ name: 'employmentContracts.edit', params: { id: uuid } });
const goToDetail = (uuid) => router.push({ name: 'employmentContracts.profile', params: { id: uuid } });

const handleDelete = async (contract) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Se eliminará el contrato permanentemente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await store.deleteItem(contract.uuid);
            fetchContracts(store.pagination.currentPage || 1);
        } catch (error) {
            // Error managed by global handler
        }
    }
};

onMounted(() => {
    fetchContracts(1);
});
</script>