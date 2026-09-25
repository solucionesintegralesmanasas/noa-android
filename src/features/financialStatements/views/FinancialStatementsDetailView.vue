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
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="i in 6" :key="i">
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
        <div class="col-12 col-lg-12">
            <!-- Balance general -->
            <div class="card border-0 shadow-sm mb-3 rounded-0">
                <div class="card-header text-white text-center py-2 rounded-0 border-0">
                    <h6 class="mb-0 fw-bold">Balance general</h6>
                </div>
                <div class="card-body p-0">
                    <table class="table table-bordered mb-0 text-center align-middle" style="font-size: 0.85rem;">
                        <tbody>
                            <tr class="bg-light fw-bold text-dark" style="background-color: #e9ecef !important;">
                                <td colspan="3" style="width: 50%;">Moneda</td>
                                <td colspan="3" style="width: 50%;">Anexo certificados financieros</td>
                            </tr>
                            <tr>
                                <td colspan="3">{{ item.currency || 'COP' }}</td>
                                <td colspan="3">
                                    <a v-if="item.financial_statements_path || item.annex_path || item.file_url"
                                        :href="item.financial_statements_path || item.annex_path || item.file_url"
                                        target="_blank"
                                        class="btn btn-link btn-sm p-0 text-primary text-decoration-none fw-medium">
                                        <i class="fad fa-cloud-download-alt me-1"></i> Descargar
                                    </a>
                                    <span v-else class="text-muted small">No disponible</span>
                                </td>
                            </tr>

                            <tr class="bg-light fw-bold text-dark" style="background-color: #e9ecef !important;">
                                <td colspan="2" style="width: 33.33%;">Activo corriente</td>
                                <td colspan="2" style="width: 33.33%;">Inventario</td>
                                <td colspan="2" style="width: 33.33%;">Activo total</td>
                            </tr>
                            <tr>
                                <td colspan="2">{{ formatCurrency(item.current_assets) }}</td>
                                <td colspan="2">{{ formatCurrency(item.inventory) }}</td>
                                <td colspan="2">{{ formatCurrency(item.total_assets) }}</td>
                            </tr>

                            <tr class="bg-light fw-bold text-dark" style="background-color: #e9ecef !important;">
                                <td colspan="2">Pasivo corriente</td>
                                <td colspan="2">Obligaciones financieras</td>
                                <td colspan="2">Pasivo total</td>
                            </tr>
                            <tr>
                                <td colspan="2">{{ formatCurrency(item.current_liabilities) }}</td>
                                <td colspan="2">{{ formatCurrency(item.financial_obligations) }}</td>
                                <td colspan="2">{{ formatCurrency(item.total_liabilities) }}</td>
                            </tr>

                            <tr class="bg-light fw-bold text-dark" style="background-color: #e9ecef !important;">
                                <td colspan="3">Utilidades retenidas/acumuladas</td>
                                <td colspan="3">Patrimonio</td>
                            </tr>
                            <tr>
                                <td colspan="3">{{ formatCurrency(item.retained_earnings) }}</td>
                                <td colspan="3">{{ formatCurrency(item.equity) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Estados de resultados (PyG) -->
            <div class="card border-0 shadow-sm mb-3 rounded-0">
                <div class="card-header text-white text-center py-2 rounded-0 border-0">
                    <h6 class="mb-0 fw-bold">Estados de resultados (PyG)</h6>
                </div>
                <div class="card-body p-0">
                    <table class="table table-bordered mb-0 text-center align-middle" style="font-size: 0.85rem;">
                        <tbody>
                            <tr class="bg-light fw-bold text-dark" style="background-color: #e9ecef !important;">
                                <td style="width: 50%;">Ventas/Ingresos operacionales</td>
                                <td style="width: 50%;">Utilidades operacionales antes de impuestos</td>
                            </tr>
                            <tr>
                                <td>{{ formatCurrency(item.operational_income) }}</td>
                                <td>{{ formatCurrency(item.operating_profit_before_tax) }}</td>
                            </tr>

                            <tr class="bg-light fw-bold text-dark" style="background-color: #e9ecef !important;">
                                <td>Utilidad neta del periodo</td>
                                <td>Depreciación y amortización</td>
                            </tr>
                            <tr>
                                <td>{{ formatCurrency(item.net_income_period) }}</td>
                                <td>{{ formatCurrency(item.depreciation_amortization) }}</td>
                            </tr>

                            <tr class="bg-light fw-bold text-dark" style="background-color: #e9ecef !important;">
                                <td>Gastos financieros / intereses</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>{{ formatCurrency(item.financial_expenses) }}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Observaciones -->
            <div class="card border-0 shadow-sm rounded-0">
                <div class="card-header text-white text-center py-2 rounded-0 border-0">
                    <h6 class="mb-0 fw-bold">Observaciones</h6>
                </div>
                <div class="card-body p-0 text-center py-3 border border-top-0 border-light"
                    style="font-size: 0.85rem;">
                    {{ item.remarks || 'Sin observaciones' }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFinancialStatementsStore } from '../store/financialStatements.store.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import Swal from 'sweetalert2';


/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isViewLoading.value ? 'Cargando...' : `Estados financieros del año ${item.value.fiscal_year || ''}`);
const pageSubtitle = computed(() => isViewLoading.value ? '' : 'Detalle completo del reporte financiero');
const breadcrumbs = computed(() => [ { label: 'Estados financieros', to: '/empresas/estados-financieros' }, { label: 'Perfil' }, ]);

const route = useRoute();
const router = useRouter();
const store = useFinancialStatementsStore();

const item = computed(() => store.selectedItem || {});
const isViewLoading = ref(true);

const goBack = () => router.push('/empresas/estados-financieros');

/**
 * Formatea un valor monetario.
 * Acepta tanto objetos { amount, currency } como strings/números directos.
 */
const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '—';

    try {
        // Extraer el monto si viene como objeto { amount, currency }
        const raw = (typeof value === 'object' && value !== null && 'amount' in value)
            ? value.amount
            : value;
        const amount = Number(raw);
        if (isNaN(amount)) return '—';
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    } catch (e) {
        return '—';
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
        console.error('[FinancialStatementsDetail] Error:', error);
        goBack();
    } finally {
        setTimeout(() => { isViewLoading.value = false; }, 300);
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
</style>