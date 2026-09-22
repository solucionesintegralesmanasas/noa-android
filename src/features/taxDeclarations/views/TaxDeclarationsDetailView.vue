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
                        <dt class="col-5 text-muted fw-medium">Empresa:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.company?.business_name || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Año Gravable:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.fiscal_year || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Patrimonio Bruto:</dt>
                        <dd class="col-7 text-dark fw-semibold">
                            {{ item.gross_assets?.amount ? new Intl.NumberFormat('es-CO', {
                                style: 'currency', currency: item.gross_assets.currency || 'COP'
                            }).format(item.gross_assets.amount) : '—' }}
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Patrimonio Líquido:</dt>
                        <dd class="col-7 text-dark fw-semibold">
                            {{ item.net_assets?.amount ? new Intl.NumberFormat('es-CO', {
                                style: 'currency', currency: item.net_assets.currency || 'COP'
                            }).format(item.net_assets.amount) : '—' }}
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Total Ingresos Brutos:</dt>
                        <dd class="col-7 text-dark fw-semibold">
                            {{ item.total_gross_income?.amount ? new Intl.NumberFormat('es-CO', {
                                style: 'currency', currency: item.total_gross_income.currency || 'COP'
                            }).format(item.total_gross_income.amount) : '—' }}
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Renta Líquida Ordinaria:</dt>
                        <dd class="col-7 text-dark fw-semibold">
                            {{ item.ordinary_net_income?.amount ? new Intl.NumberFormat('es-CO', {
                                style: 'currency', currency: item.ordinary_net_income.currency || 'COP'
                            }).format(item.ordinary_net_income.amount) : '—' }}
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Utilidad Neta Antes de Impuestos:</dt>
                        <dd class="col-7 text-dark fw-semibold">
                            {{ item.pre_tax_net_profit?.amount ? new Intl.NumberFormat('es-CO', {
                                style: 'currency', currency: item.pre_tax_net_profit.currency || 'COP'
                            }).format(item.pre_tax_net_profit.amount) : '—' }}
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Total Ingresos Operacionales y No Operacionales:</dt>
                        <dd class="col-7 text-dark fw-semibold">
                            {{ item.total_operating_non_operating_income?.amount ? new Intl.NumberFormat('es-CO', {
                                style: 'currency', currency: item.total_operating_non_operating_income.currency || 'COP'
                            }).format(item.total_operating_non_operating_income.amount) : '—' }}
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Estado:</dt>
                        <dd class="col-7 text-dark fw-semibold">
                            <span class="badge rounded-pill badge-subtle" :class="{
                                'badge-subtle-success': ['PRESENTADA', 'PRESENTADO'].includes(item.status?.toUpperCase()),
                                'badge-subtle-secondary': item.status?.toUpperCase() === 'BORRADOR'
                            }">
                                {{ item.status || '—' }}
                            </span>
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Observaciones Generales:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.remarks || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Fecha de Registro:</dt>
                        <dd class="col-7 text-dark fw-semibold">
                            {{ item.created_at ? new Date(item.created_at).toLocaleDateString('es-CO') : '—' }}
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Fecha de Actualización:</dt>
                        <dd class="col-7 text-dark fw-semibold">
                            {{ item.updated_at ? new Date(item.updated_at).toLocaleDateString('es-CO') : '—' }}
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
/**
 * @fileoverview Vista de detalle para declaraciones de renta.
 * @module views/TaxDeclarationsDetailView
 */

import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTaxDeclarationsStore } from '../store/taxDeclarations.store.js';
import { usePermissionsStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import Swal from 'sweetalert2';


/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => 'Perfil de Declaración de Renta');
const pageSubtitle = computed(() => isViewLoading ? '' : 'Detalle completo de la declaración de renta');
const breadcrumbs = computed(() => [ { label: 'Declaraciones de Renta', to: '/declaraciones-de-renta', }, { label: 'Perfil' }, ]);

const route = useRoute();
const router = useRouter();
const store = useTaxDeclarationsStore();
const permissionsStore = usePermissionsStore();

const item = computed(() => store.selectedItem || {});
const isViewLoading = ref(true);

/**
 * Verifica si el usuario tiene un permiso específico.
 * @param {string} action - Acción a verificar.
 * @returns {boolean} Verdadero si el usuario tiene el permiso.
 */
const can = (action) => permissionsStore.can(action);

/**
 * Navega hacia atrás.
 */
const goBack = () => router.push('/empresas/declaraciones-de-renta');

/**
 * Navega a la vista de edición.
 */
const goToEdit = () => router.push(`/empresas/declaraciones-de-renta/editar/${route.params.id}`);

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
</style>