<template>
  <BasePageHeader
      :title="pageTitle"
      :subtitle="pageSubtitle"
      icon="fad fa-info-circle text-primary"
      :breadcrumbs="breadcrumbs"
      
      @back="goBack"
  />

  <!-- SKELETON LOADING -->
  <div
    v-if="isViewLoading"
    class="row g-3 mb-3 fade-in-up"
    style="animation-delay: 0.1s;"
  >
    <div class="col-12 col-xxl-12">
      <div class="card border-0 shadow-sm">
        <div
          class="card-body d-flex gap-4 flex-column flex-sm-row align-items-center py-4 g-2 g-md-3"
        >
          <div
            class="skeleton-avatar rounded-3 flex-shrink-0"
            style="width: 100px; height: 100px;"
          ></div>
          <div class="w-100">
            <div class="row g-2">
              <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="i in 4" :key="i">
                <div
                  class="skeleton-text"
                  style="height: 14px; width: 90%;"
                ></div>
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
        <div
          class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2"
        >
          <i
            class="fad fa-info-circle text-primary"
            style="font-size: 14px;"
          ></i>
          <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">
            Información General
          </h6>
        </div>
        <div class="card-body py-3">
          <dl class="row mb-0 small g-2 g-md-3" style="font-size: 0.85rem;">
            <dt class="col-5 text-muted fw-medium">Número de Inscripción:</dt>
            <dd class="col-7 text-dark fw-semibold">{{ item.registration_number || '—' }}</dd>

            <dt class="col-5 text-muted fw-medium">Fecha de Expedición:</dt>
            <dd class="col-7 text-dark">{{ item.issue_date?.split(/T| /)[0] || '—' }}</dd>

            <dt class="col-5 text-muted fw-medium">Fecha de Vencimiento:</dt>
            <dd class="col-7 text-dark">{{ item.expiration_date?.split(/T| /)[0] || '—' }}</dd>

            <dt class="col-5 text-muted fw-medium">Estado:</dt>
            <dd class="col-7">
              <span
                class="badge rounded-pill badge-subtle"
                :class="{
                  'badge-subtle-success': item.status === 'VIGENTE' || item.status === 'RENOVADO',
                  'badge-subtle-warning': item.status === 'VENCIDO' || item.status === 'SUSPENDIDO',
                  'badge-subtle-danger': item.status === 'CANCELADO',
                  'badge-subtle-secondary': item.status === 'NO_INSCRITO'
                }"
              >
                {{ item.status || '—' }}
              </span>
            </dd>

            <dt class="col-5 text-muted fw-medium">Capacidad Jurídica:</dt>
            <dd class="col-7 text-dark">{{ item.legal_capacity_score || '0.00' }}</dd>

            <dt class="col-5 text-muted fw-medium">Capacidad Financiera:</dt>
            <dd class="col-7 text-dark">{{ item.financial_capacity_score || '0.00' }}</dd>

            <dt class="col-5 text-muted fw-medium">Capacidad Organizacional:</dt>
            <dd class="col-7 text-dark">{{ item.organizational_capacity_score || '0.00' }}</dd>

            <dt class="col-5 text-muted fw-medium">Capacidad Contratación:</dt>
            <dd class="col-7 text-dark">{{ item.contracting_capacity_score || '0.00' }}</dd>

            <dt class="col-5 text-muted fw-medium">Observaciones:</dt>
            <dd class="col-7 text-dark">{{ item.remarks || 'Sin observaciones' }}</dd>
          </dl>
        </div>
      </div>
    </div>

    <div class="col-12 col-lg-4">
      <div class="card border-0 shadow-sm mb-3" v-if="item.rup_certificate_path">
        <div class="card-header bg-light py-2 px-3 border-bottom">
          <h6 class="mb-0 fw-medium" style="font-size: 0.85rem;">Certificado RUP</h6>
        </div>
        <div class="card-body text-center">
          <a :href="item.rup_certificate_path" target="_blank" class="btn btn-outline-primary w-100">
            <i class="fad fa-file-pdf me-2"></i> Descargar / Ver Certificado
          </a>
        </div>
      </div>
      
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-light py-2 px-3 border-bottom">
          <h6 class="mb-0 fw-medium" style="font-size: 0.85rem;">Auditoría</h6>
        </div>
        <div class="card-body py-3">
           <dl class="row mb-0 small g-2 g-md-3" style="font-size: 0.8rem;">
             <dt class="col-6 text-muted">Creado:</dt>
             <dd class="col-6 text-dark">{{ item.created_at || '—' }}</dd>
             <dt class="col-6 text-muted">Actualizado:</dt>
             <dd class="col-6 text-dark">{{ item.updated_at || '—' }}</dd>
           </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRupRecordsStore } from '../store/rupRecords.store.js';
import { usePermissionsStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import Swal from 'sweetalert2';


/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => 'Perfil de ' + 'Registro RUP');
const pageSubtitle = computed(() => isViewLoading ? '' : 'Detalle completo del registro');
const breadcrumbs = computed(() => [ { label: 'Registros RUP', to: '/empresas/registro-unico-de-proponentes', }, { label: 'Perfil' }, ]);

const route = useRoute();
const router = useRouter();
const store = useRupRecordsStore();
const permissionsStore = usePermissionsStore();

const item = computed(() => store.selectedItem || {});
const isViewLoading = ref(true);

const can = (action) => permissionsStore.can(action);
const goBack = () => router.push('/empresas/registro-unico-de-proponentes');
const goToEdit = () => router.push(`/empresas/registro-unico-de-proponentes/editar/${route.params.id}`);

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