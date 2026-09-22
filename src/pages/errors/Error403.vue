<template>
  <div class="row flex-center min-vh-100 py-6 text-center">
    <div class="col-sm-10 col-md-8 col-lg-6 col-xxl-5">
      <router-link to="/" class="d-flex flex-center mb-4">
        <NoaBadge size="56px" />
      </router-link>
      <div class="card">
        <div class="card-body p-4 p-sm-5">
          <div class="fw-black lh-1 text-300 fs-error">403</div>
          <p class="lead mt-4 text-800 font-sans-serif fw-semi-bold w-md-75 w-xl-100 mx-auto">
            Acceso denegado
          </p>
          <hr />
          <p>
            No tienes permiso para acceder a esta página. Si crees que es un error,
            <a href="mailto:transespecialessinbarreras@gmail.com">contáctanos</a>.
          </p>
          <router-link to="/" class="btn btn-primary btn-sm mt-3">
            <span class="fas fa-home me-2"></span>Volver al inicio
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import NoaBadge from '@/components/NoaBadge.vue';
defineOptions({ name: 'Error403' });
</script>