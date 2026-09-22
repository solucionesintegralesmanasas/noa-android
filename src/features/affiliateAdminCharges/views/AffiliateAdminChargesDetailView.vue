<template>
    <BasePageHeader
        :title="pageTitle"
        :subtitle="pageSubtitle"
        icon="fad fa-info-circle text-primary"
        :breadcrumbs="breadcrumbs"
        
        @back="goBack"
    />

    <!-- SKELETON LOADING -->
    <div v-if="isViewLoading" class="row g-3 mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <div class="col-12 col-xxl-12">
            <div class="card border-0 shadow-sm">
                <div class="card-body d-flex gap-4 flex-column flex-sm-row align-items-center py-4 g-2 g-md-3">
                    <div class="skeleton-avatar rounded-3 flex-shrink-0" style="width: 100px; height: 100px;"></div>
                    <div class="w-100">
                        <div class="row g-2">
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="i in 4" :key="i">
                                <div class="skeleton-text" style="height: 14px; width: 90%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <div v-else class="row g-3 mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <div class="col-12 col-lg-8">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-info-circle text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">
                        Información General
                    </h6>
                </div>
                <div class="card-body py-3">
                    <dl class="row mb-0 small g-2 g-md-3" style="font-size: 0.85rem;">
                        <dt class="col-5 text-muted fw-medium">Referencia:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.payment_reference || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Concepto:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.concept || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Tipo de Cargo:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ formatChargeType(item.charge_type) }}</dd>

                        <dt class="col-5 text-muted fw-medium">Monto:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ formatCurrency(item.amount, item.currency_code) }}
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Periodo:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ formatDate(item.period_date) }}</dd>

                        <dt class="col-5 text-muted fw-medium">Fecha Límite:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ formatDate(item.due_date) }}</dd>

                        <dt class="col-5 text-muted fw-medium">Próximo Pago:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ formatDate(item.next_payment_date) }}</dd>

                        <dt class="col-5 text-muted fw-medium">% Recargo:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.late_fee_percentage }}%</dd>

                        <dt class="col-5 text-muted fw-medium">Estado:</dt>
                        <dd class="col-7">
                            <span class="badge rounded-pill badge-subtle" :class="getStatusBadgeClass(item.status)">
                                {{ formatStatus(item.status) }}
                            </span>
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Fecha de Pago:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ formatDate(item.payment_date) }}</dd>

                        <dt class="col-5 text-muted fw-medium">Ref. Bancaria:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.bank_reference || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Observaciones:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.notes || '—' }}</dd>
                    </dl>
                </div>
            </div>
        </div>

        <div class="col-12 col-lg-4">
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <h6 class="mb-0 fw-medium" style="font-size: 0.85rem;">Entidades Relacionadas</h6>
                </div>
                <div class="card-body">
                    <dl class="row mb-0 small g-2 g-md-3">
                        <dt class="col-5 text-muted fw-medium">Empresa:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.company?.business_name || item.company_uuid ||
                            '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Vehículo:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.vehicle?.vehicle_license_plate ||
                            item.vehicle_uuid || '—' }}</dd>
                    </dl>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAffiliateAdminChargesStore } from '../store/affiliateCharges.store.js';
import { usePermissionsStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';


/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => 'Perfil de ' + 'Cuota de Administración');
const pageSubtitle = computed(() => isViewLoading ? '' : 'Detalle completo del registro');
const breadcrumbs = computed(() => [ { label: 'Cuotas de Administración', to: '/pagos-de-administracion', }, { label: 'Perfil' }, ]);

const route = useRoute();
const router = useRouter();
const store = useAffiliateAdminChargesStore();
const permissionsStore = usePermissionsStore();

const item = computed(() => store.selectedItem || {});
const isViewLoading = ref(true);

const can = (action) => permissionsStore.can(action);
const goBack = () => router.push('/pagos-de-administracion');
const goToEdit = () => router.push(`/pagos-de-administracion/editar/${route.params.id}`);

// Helpers
const formatCurrency = (amount, currency) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: currency || 'COP' }).format(amount);
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return dayjs(dateStr).format('DD/MM/YYYY');
};

const formatStatus = (status) => {
    const map = {
        'PENDIENTE': 'Pendiente',
        'PAGADO': 'Pagado',
        'VENCIDO': 'Vencido',
        'EN_MORA': 'En Mora',
        'ANULADO': 'Anulado'
    };
    return map[status] || status;
};

const formatChargeType = (type) => {
    const map = {
        'CUOTA_ADMINISTRACION': 'Cuota de Administración',
        'PAGO_MENSUALIDAD': 'Pago de Mensualidad',
        'PAGO_CUPO': 'Pago de Cupo'
    };
    return map[type] || type;
};

const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'PAGADO': return 'badge-subtle-success';
        case 'PENDIENTE': return 'badge-subtle-info';
        case 'VENCIDO':
        case 'EN_MORA': return 'badge-subtle-warning';
        case 'ANULADO': return 'badge-subtle-secondary';
        default: return 'badge-subtle-secondary';
    }
};

onMounted(async () => {
    isViewLoading.value = true;
    try {
        await store.fetchProfileById(route.params.id);
        if (!store.selectedItem) {
            await Swal.fire('No encontrado', 'El registro solicitado no existe.', 'warning');
            goBack();
        }
    } catch (error) {
        console.error(error);
        goBack();
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
</style>