<template>
  <div :id="anchorId" class="vehicle-carousel-wrap">
    <div class="vehicle-carousel" role="list" aria-label="Vehículos asignados">
      <article v-for="v in vehicles" :key="v.uuid" class="vehicle-card" role="listitem">
        <div class="d-flex align-items-start justify-content-between mb-2">
          <div class="colombia-license-plate" aria-label="Placa del vehículo">{{ formatPlate(v.plate) }}</div>
          <span class="badge vehicle-status" :class="v.is_active ? 'bg-subtle-success text-success' : 'bg-subtle-secondary text-secondary'">
            {{ v.is_active ? 'HABILITADO' : 'INACTIVO' }}
          </span>
        </div>
        <h3 class="vehicle-name">{{ v.brand }} {{ v.line }}</h3>
        <p class="vehicle-sub">Modelo {{ v.model || 'N/A' }}<span v-if="v.internal_number"> · Int. #{{ v.internal_number }}</span></p>
        <div class="odometer-box">
          <span class="odometer-label"><i class="fas fa-tachometer-alt me-1 text-primary" aria-hidden="true"></i>Km actual</span>
          <span class="odometer-value">{{ formatNumber(v.current_mileage) }} <small>km</small></span>
          <span class="odometer-period">+{{ formatNumber(v.km_traveled_period) }} km en el periodo</span>
        </div>
        <p class="vehicle-insp">
          <i class="far fa-clock me-1" aria-hidden="true"></i>Última insp: <strong>{{ v.last_inspection_date || 'Sin registro' }}</strong>
          <span class="badge bg-subtle-primary text-primary ms-1">{{ v.inspections_count }} insp.</span>
        </p>
        <router-link :to="`/inspeccion-vehiculos/crear?vehicle_uuid=${v.uuid}`" class="btn btn-primary vehicle-cta">
          <i class="fas fa-clipboard-check me-1" aria-hidden="true"></i>Inspeccionar
        </router-link>
      </article>
      <div v-if="!vehicles.length" class="vehicle-empty">
        <i class="fas fa-car-side" aria-hidden="true"></i>
        <p><strong>Sin vehículos asignados</strong><br />Contacta a tu empresa para vincularte a un FUEC.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ vehicles: { type: Array, default: () => [] }, anchorId: { type: String, default: 'conductor-vehiculos' } });
const formatNumber = (n) => (n === null || n === undefined || isNaN(n) ? '0' : Number(n).toLocaleString('es-CO'));
const formatPlate = (p) => {
  if (!p) return 'SIN PLACA';
  const c = p.trim().toUpperCase();
  return c.length === 6 ? `${c.substring(0, 3)} · ${c.substring(3)}` : c;
};
</script>

<style scoped>
.vehicle-carousel-wrap { margin: 0 -4px; }
.vehicle-carousel {
  display: flex; gap: 12px; overflow-x: auto; padding: 4px 4px 12px;
  scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: thin;
}
.vehicle-card {
  flex: 0 0 min(300px, 82vw); scroll-snap-align: start;
  background: #fff; border: 1px solid #e3e8ef; border-radius: 16px; padding: 14px;
  display: flex; flex-direction: column; gap: 6px;
}
.dark .vehicle-card { background: #1b1e22; border-color: #2c3238; }
.colombia-license-plate {
  background: linear-gradient(180deg, #ffdf00 0%, #f4c430 100%);
  border: 2px solid #212529; border-radius: 8px; padding: 3px 10px 4px;
  font-weight: 900; font-size: 16px; letter-spacing: 1px; color: #111; line-height: 1.1;
}
.vehicle-status { font-size: 11px; font-weight: 800; }
.vehicle-name { margin: 2px 0 0; font-size: 15px; font-weight: 800; color: #001c41; }
.dark .vehicle-name { color: #f1f4f9; }
.vehicle-sub { margin: 0; font-size: 13px; color: #5e6e82; }
.odometer-box { background: #f4f7fb; border: 1px solid #e3e8ef; border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; }
.dark .odometer-box { background: #16181b; border-color: #25282c; }
.odometer-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #5e6e82; }
.odometer-value { font-size: 22px; font-weight: 800; color: #2c7be5; font-variant-numeric: tabular-nums; }
.odometer-value small { font-size: 13px; font-weight: 700; }
.odometer-period { font-size: 13px; font-weight: 700; color: #009e5c; }
.vehicle-insp { font-size: 13px; color: #5e6e82; margin: 2px 0; }
.vehicle-cta { min-height: 50px; border-radius: 13px; font-size: 14px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; margin-top: auto; }
.vehicle-empty { flex: 1 0 100%; text-align: center; padding: 32px 16px; color: #5e6e82; font-size: 14px; }
.vehicle-empty i { font-size: 32px; margin-bottom: 8px; display: block; }
</style>
