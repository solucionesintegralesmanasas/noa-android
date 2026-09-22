<template>
    <BasePageHeader
        :title="pageTitle"
        :subtitle="pageSubtitle"
        icon="fad fa-university text-primary"
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
                    <i class="fad fa-university text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">
                        Información Bancaria
                    </h6>
                </div>
                <div class="card-body py-3">
                    <dl class="row mb-0 small g-2 g-md-3" style="font-size: 0.85rem;">
                        <dt class="col-5 text-muted fw-medium">UUID:</dt>
                        <dd class="col-7">
                            <code class="text-primary small">{{ item.uuid || '—' }}</code>
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Empresa:</dt>
                        <dd class="col-7 text-dark fw-semibold">
                            {{ item.company?.business_name || '—' }}
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Banco:</dt>
                        <dd class="col-7 text-dark">
                            {{ item.bank_name || '—' }}
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Sucursal:</dt>
                        <dd class="col-7 text-dark">
                            {{ item.branch_office || '—' }}
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Tipo de Cuenta:</dt>
                        <dd class="col-7">
                            <span v-if="item.account_type" class="badge bg-info bg-opacity-10 text-info fw-semibold">
                                {{ capitalize(item.account_type) }}
                            </span>
                            <span v-else class="text-muted">—</span>
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Número de Cuenta:</dt>
                        <dd class="col-7">
                            <code class="text-primary fw-semibold">{{ item.account_number || '—' }}</code>
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Titular:</dt>
                        <dd class="col-7 text-dark">
                            {{ item.account_holder || '—' }}
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Estado:</dt>
                        <dd class="col-7">
                            <span class="badge rounded-pill badge-subtle" :class="item.is_active
                                ? 'badge-subtle-success'
                                : 'badge-subtle-warning'
                                ">
                                <i :class="item.is_active
                                    ? 'fad fa-check-circle me-1'
                                    : 'fad fa-circle me-1'
                                    " style="font-size:10px;" />
                                {{ item.is_active ? "Activo" : "Inactivo" }}
                            </span>
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Fecha de Creación:</dt>
                        <dd class="col-7 text-dark">
                            {{ formatDate(item.created_at) }}
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Última Actualización:</dt>
                        <dd class="col-7 text-dark">
                            {{ formatDate(item.updated_at) }}
                        </dd>
                    </dl>
                </div>
            </div>
        </div>

        <div class="col-12 col-lg-4">
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <h6 class="mb-0 fw-medium" style="font-size: 0.85rem;">
                        <i class="fad fa-building me-1 text-primary"></i>
                        Empresa Asociada
                    </h6>
                </div>
                <div class="card-body text-center py-4">
                    <div class="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style="width: 70px; height: 70px;">
                        <i class="fad fa-building text-primary fs-2"></i>
                    </div>
                    <h6 class="fw-semibold mb-1">
                        {{ item.company?.business_name || 'Sin información' }}
                    </h6>
                </div>
            </div>

            <div class="card border-0 shadow-sm">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <h6 class="mb-0 fw-medium" style="font-size: 0.85rem;">
                        <i class="fad fa-credit-card me-1 text-primary"></i>
                        Resumen de Cuenta
                    </h6>
                </div>
                <div class="card-body py-3">
                    <div class="d-flex align-items-center gap-3 mb-3">
                        <div class="bg-info bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-university text-info"></i>
                        </div>
                        <div>
                            <p class="mb-0 small text-muted">Banco</p>
                            <p class="mb-0 fw-semibold">{{ item.bank_name || '—' }}</p>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <div class="bg-success bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-hashtag text-success"></i>
                        </div>
                        <div>
                            <p class="mb-0 small text-muted">Cuenta</p>
                            <p class="mb-0 fw-semibold"><code>{{ item.account_number || '—' }}</code></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBankDetailsStore } from '../store/bankDetails.store.js';
import { usePermissionsStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import Swal from 'sweetalert2';


/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => 'Perfil de ' + 'Datos Bancarios');
const pageSubtitle = computed(() => isViewLoading ? '' : 'Detalle completo de la cuenta bancaria');
const breadcrumbs = computed(() => [ { label: 'Datos Bancarios', to: '/empresas/datos-bancarios', }, { label: 'Perfil' }, ]);

const route = useRoute();
const router = useRouter();
const store = useBankDetailsStore();
const permissionsStore = usePermissionsStore();

const item = computed(() => store.selectedItem || {});
const isViewLoading = ref(true);

const can = (action) => permissionsStore.can(action);
const goBack = () => router.push('/empresas/datos-bancarios');
const goToEdit = () => router.push(`/empresas/datos-bancarios/editar/${route.params.id}`);

const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        return d.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
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

.badge-subtle-warning {
    background: rgba(255, 193, 7, 0.1);
    color: #856404;
    border: 1px solid rgba(255, 193, 7, 0.2);
}
</style>