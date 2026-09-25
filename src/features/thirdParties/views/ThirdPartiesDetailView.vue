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
                        <dt class="col-5 text-muted fw-medium">Tipo de Persona:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.person_type || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Documento:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.document_number || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Nombre/Razón Social:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.trade_name || item.company_name ||
                            `${item.first_name || ''} ${item.last_name || ''}` || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Email:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.email || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Teléfono:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.phone || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Dirección:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.address || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Régimen Tributario:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.tax_regime || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Roles:</dt>
                        <dd class="col-7 text-dark fw-semibold">
                            <span v-if="item.is_affiliate && item.is_driver" class="badge bg-primary me-1"><i class="fad fa-steering-wheel me-1"></i>Conductor Propietario</span>
                            <span v-if="item.is_customer" class="badge bg-primary me-1">Cliente</span>
                            <span v-if="item.is_supplier" class="badge bg-success me-1">Proveedor</span>
                            <span v-if="item.is_employee" class="badge bg-info me-1">Empleado</span>
                            <span v-if="item.is_affiliate && !item.is_driver" class="badge bg-warning me-1">Afiliado</span>
                            <span v-if="item.is_driver && !item.is_affiliate" class="badge bg-dark me-1">Conductor</span>
                            <span v-if="item.is_others" class="badge bg-secondary me-1">Otro</span>
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Estado:</dt>
                        <dd class="col-7">
                            <span class="badge rounded-pill badge-subtle" :class="item.is_active
                                    ? 'badge-subtle-success'
                                    : 'badge-subtle-warning'
                                ">
                                {{ item.is_active ? "Activo" : "Inactivo" }}
                            </span>
                        </dd>
                    </dl>
                </div>
            </div>
        </div>

        <div class="col-12 col-lg-4" v-if="item.logo_url || item.signature_url">
            <!-- Sección de archivos/preview si aplica -->
            <div class="card border-0 shadow-sm mb-3" v-if="item.logo_url">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <h6 class="mb-0 fw-medium" style="font-size: 0.85rem;">Logotipo</h6>
                </div>
                <div class="card-body text-center">
                    <img :src="item.logo_url" alt="Logotipo del tercero" class="img-fluid rounded border shadow-sm" style="max-height: 150px;" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useThirdPartiesStore } from '../store/thirdParties.store.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import Swal from 'sweetalert2';


/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => 'Perfil de ' + 'ThirdParties');
const pageSubtitle = computed(() => isViewLoading.value ? '' : 'Detalle completo del registro');
const breadcrumbs = computed(() => [ { label: 'ThirdParties', to: '/terceros', }, { label: 'Perfil' }, ]);

const route = useRoute();
const router = useRouter();
const store = useThirdPartiesStore();

const item = computed(() => store.selectedItem || {});
const isViewLoading = ref(true);

const goBack = () => router.push('/terceros');

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