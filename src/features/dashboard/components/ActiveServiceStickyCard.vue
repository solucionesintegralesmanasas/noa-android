<template>
  <div
    v-if="activeService"
    class="active-service-sticky card border-0 shadow-sm overflow-hidden"
    :class="esDisponibilidad ? 'is-disponibilidad' : 'is-en-ruta'"
    role="region"
    aria-label="Servicio activo"
  >
    <div class="card-body">
      <div class="d-flex align-items-center gap-3">
        <span v-if="esDisponibilidad" class="service-badge badge bg-warning text-dark">
          <span class="pulse-indicator bg-dark" aria-hidden="true"></span>
          En servicio
        </span>
        <span v-else class="service-badge badge bg-success">
          <span class="pulse-indicator bg-white" aria-hidden="true"></span>
          En ruta
        </span>
        <div class="flex-fill min-w-0">
          <p class="service-title text-truncate">
            {{ activeService.project_name || 'Servicio en curso' }}
            <span v-if="activeService.vehicle_plate" class="service-plate">{{ activeService.vehicle_plate }}</span>
          </p>
          <p class="service-meta">
            <span v-if="activeService.start_time"><i class="far fa-clock me-1" aria-hidden="true"></i>{{ activeService.start_time }}</span>
            <span v-if="activeService.routes_count"> · <i class="fas fa-route me-1" aria-hidden="true"></i>{{ activeService.routes_count }} recorrido{{ activeService.routes_count !== 1 ? 's' : '' }}</span>
            <span v-if="activeService.tracking_active" class="service-gps"><i class="fas fa-satellite-dish me-1" aria-hidden="true"></i>GPS</span>
          </p>
        </div>
        <router-link
          v-if="activeService.service_uuid"
          :to="`/planilla-de-control-de-prestacion-servicios/control-de-servicios?service_uuid=${activeService.service_uuid}`"
          class="btn btn-success service-cta"
        >
          <i class="fas fa-play-circle" aria-hidden="true"></i>
          <span>Continuar</span>
        </router-link>
        <router-link v-else to="/planilla-de-control-de-prestacion-servicios/control-de-servicios" class="btn btn-warning service-cta">
          <i class="fas fa-plus-circle" aria-hidden="true"></i>
          <span>Abrir</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeService: { type: Object, default: null },
  esDisponibilidad: { type: Boolean, default: false },
});
</script>

<style scoped>
.active-service-sticky {
  position: sticky;
  top: 60px;
  z-index: 1020;
  border-radius: 16px !important;
  border-left: 5px solid #00d27a !important;
}
.active-service-sticky.is-disponibilidad { border-left-color: #f5803e !important; }
.active-service-sticky .card-body { padding: 12px 14px !important; }
.service-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}
.pulse-indicator {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
  animation: pulse-ring 1.4s ease-out infinite;
}
@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
  70% { box-shadow: 0 0 0 7px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}
.service-title {
  font-weight: 800;
  font-size: 15px;
  color: #001c41;
  margin: 0;
  line-height: 1.25;
}
.dark .service-title { color: #f1f4f9; }
.service-plate {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 6px;
  background: #edf2f9;
  font-size: 12px;
  font-weight: 800;
  vertical-align: middle;
}
.service-meta { margin: 2px 0 0; font-size: 13px; color: #5e6e82; line-height: 1.35; }
.service-gps { margin-left: 6px; color: #009e5c; font-weight: 700; }
.service-cta {
  min-height: 52px;
  min-width: 120px;
  padding: 10px 18px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
}
@media (max-width: 575.98px) {
  .active-service-sticky { top: 56px; }
  .service-badge { font-size: 11px; padding: 7px 10px; }
  .service-title { font-size: 14px; }
  .service-cta { min-width: 108px; font-size: 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .pulse-indicator { animation: none; }
}
</style>
