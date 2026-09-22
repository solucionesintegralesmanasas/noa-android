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
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Información General</h6>
                </div>
                <div class="card-body py-3">
                    <dl class="row mb-0 small g-2 g-md-3" style="font-size: 0.85rem;">
                        <dt class="col-5 text-muted fw-medium">Nombre:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.name || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Dirección:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.address || '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">Empresa:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.company?.name || item.company_name || '—' }}
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Municipio:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ item.municipality?.name || item.municipality_name ||
                            '—' }}</dd>

                        <dt class="col-5 text-muted fw-medium">¿Sede principal?</dt>
                        <dd class="col-7">
                            <span class="badge rounded-pill badge-subtle"
                                :class="item.is_primary ? 'badge-subtle-info' : 'badge-subtle-secondary'">
                                {{ item.is_primary ? 'Sí' : 'No' }}
                            </span>
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Estado:</dt>
                        <dd class="col-7">
                            <span class="badge rounded-pill badge-subtle"
                                :class="item.status ? 'badge-subtle-success' : 'badge-subtle-warning'">
                                {{ item.status ? 'Activo' : 'Inactivo' }}
                            </span>
                        </dd>

                        <dt class="col-5 text-muted fw-medium">Creado el:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ formatDate(item.created_at) }}</dd>

                        <dt class="col-5 text-muted fw-medium">Actualizado el:</dt>
                        <dd class="col-7 text-dark fw-semibold">{{ formatDate(item.updated_at) }}</dd>
                    </dl>
                </div>
            </div>
        </div>

        <div class="col-12 col-lg-4">
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <h6 class="mb-0 fw-medium" style="font-size: 0.85rem;">Resumen</h6>
                </div>
                <div class="card-body text-center py-4">
                    <div class="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                        style="width: 80px; height: 80px;">
                        <i class="fad fa-building text-primary" style="font-size: 32px;"></i>
                    </div>
                    <h5 class="fw-bold text-dark mb-1">{{ item.name || '—' }}</h5>
                    <p class="text-muted small mb-0">{{ item.company?.name || item.company_name || '' }}</p>
                    <span class="badge rounded-pill mt-2"
                        :class="item.status ? 'badge-subtle-success' : 'badge-subtle-warning'">
                        {{ item.status ? 'Activo' : 'Inactivo' }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBranchesStore } from '../store/branches.store.js';
import { usePermissionsStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import Swal from 'sweetalert2';


/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => 'Perfil de ' + 'Sucursal');
const pageSubtitle = computed(() => isViewLoading ? '' : 'Detalle completo del registro');
const breadcrumbs = computed(() => [ { label: 'Sucursales', to: '/empresas/sucursales/listas-sucursal' }, { label: 'Perfil' } ]);

const route = useRoute();
const router = useRouter();
const store = useBranchesStore();
const permissionsStore = usePermissionsStore();

const item = computed(() => store.selectedItem || {});
const isViewLoading = ref(true);

const can = (action) => permissionsStore.can(action);
const goBack = () => router.push('/empresas/sucursales/listas-sucursal');
const goToEdit = () => router.push(`/empresas/sucursales/editar/${route.params.id}`);

const formatDate = (value) => {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return value;
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