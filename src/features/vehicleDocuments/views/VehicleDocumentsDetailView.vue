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
                        <dt class="col-5 text-muted fw-medium">Tipo de Documento:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.document_type || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Número de Póliza:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.policy_number || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Entidad Emisora:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.issuing_entity || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Fecha de Emisión:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.issue_date || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Inicio de Vigencia:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.effective_date || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Fecha de Vencimiento:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.expiry_date || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Tomador:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.taker || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Código de Tarifa:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.tariff_code || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Estado:</dt>
                        <dd class="col-7">
                            <span class="badge rounded-pill badge-subtle" :class="item.status === 'VIGENTE'
                                ? 'badge-subtle-success'
                                : 'badge-subtle-warning'
                                ">
                                {{ item.status }}
                            </span>
                        </dd>
                    </dl>
                </div>
            </div>
        </div>

        <div class="col-12 col-lg-4">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <h6 class="mb-0 fw-medium" style="font-size: 0.85rem;">Relaciones</h6>
                </div>
                <div class="card-body py-3">
                    <dl class="row mb-0 small g-2 g-md-3" style="font-size: 0.85rem;">
                        <dt class="col-5 text-muted fw-medium">Empresa:</dt>
                        <dd class="col-7 text-dark">{{ item.company_business_name || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Vehículo:</dt>
                        <dd class="col-7 text-dark">{{ item.vehicle_license_plate || '—' }}</dd>
                    </dl>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVehicleDocumentsStore } from '../store/vehicleDocuments.store.js';
import { usePermissionsStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import Swal from 'sweetalert2';


/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageSubtitle = computed(() => isViewLoading ? '' : 'Detalle completo del registro');
const breadcrumbs = computed(() => [ { label: 'Documentos', to: getBackRoute(), }, { label: 'Perfil' }, ]);

const route = useRoute();
const router = useRouter();
const store = useVehicleDocumentsStore();
const permissionsStore = usePermissionsStore();

const item = computed(() => store.selectedItem || {});
const isViewLoading = ref(true);

const can = (action) => permissionsStore.can(action);

const getDocumentTypeTitle = (documentType) => {
    switch (documentType) {
        case 'soat': return 'Póliza SOAT';
        case 'tecnomecanica': return 'Revisión Técnico Mecánica (RTM)';
        case 'poliza': return 'Pólizas de Responsabilidad Civil (RCC y RCE)';
        default: return 'Documentos';
    }
};

const pageTitle = computed(() => {
    return getDocumentTypeTitle(route.params.documentType);
});

const getBackRoute = () => {
    const type = route.params.documentType;
    if (type) return `/vehiculos-documentos/${type}`;
    return '/vehiculos-documentos';
};

const getEditRoute = () => {
    const type = route.params.documentType;
    if (type) return `/vehiculos-documentos/${type}/editar/${route.params.id}`;
    return `/vehiculos-documentos/editar/${route.params.id}`;
};

const goBack = () => router.push(getBackRoute());
const goToEdit = () => router.push(getEditRoute());

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
</style>