<template>
  <section aria-label="Accesos rápidos del conductor">
    <div class="d-flex align-items-center gap-2 mb-3 px-1">
      <div class="section-icon-badge bg-primary text-white" aria-hidden="true"><i class="fas fa-th-large"></i></div>
      <div>
        <h2 class="quick-title">Mis operaciones</h2>
        <p class="quick-sub">Una acción principal por módulo, a un toque</p>
      </div>
    </div>
    <div class="quick-grid">
      <article class="quick-card card-action-blue">
        <div class="quick-icon bg-subtle-primary text-primary"><i class="fas fa-clipboard-check" aria-hidden="true"></i></div>
        <h3>Inspección</h3>
        <p>{{ kpis.inspections_count }} registradas</p>
        <router-link to="/inspeccion-vehiculos/crear" class="btn btn-primary quick-cta">
          <i class="fas fa-plus me-1" aria-hidden="true"></i>Nueva inspección
        </router-link>
        <router-link to="/inspeccion-vehiculos" class="quick-link">Ver historial</router-link>
      </article>
      <article class="quick-card card-action-cyan">
        <div class="quick-icon bg-subtle-info text-info"><i class="fas fa-route" aria-hidden="true"></i></div>
        <h3>Recorrido</h3>
        <p>{{ kpis.service_delivery_count }} servicios</p>
        <router-link to="/planilla-de-control-de-prestacion-servicios/control-de-servicios" class="btn btn-info text-white quick-cta">
          <i class="fas fa-play-circle me-1" aria-hidden="true"></i>Registrar recorrido
        </router-link>
        <router-link to="/planilla-de-control-de-prestacion-servicios" class="quick-link">Ver planillas PCP</router-link>
      </article>
      <article class="quick-card card-action-green">
        <div class="quick-icon bg-subtle-success text-success"><i class="fas fa-file-contract" aria-hidden="true"></i></div>
        <h3>Mis FUEC</h3>
        <p>{{ kpis.fuecs_count }} asignados</p>
        <router-link to="/extracto-de-contrato" class="btn btn-success quick-cta">
          <i class="fas fa-file-alt me-1" aria-hidden="true"></i>Consultar FUECs
        </router-link>
        <span class="quick-hint"><i class="fas fa-shield-check text-success me-1" aria-hidden="true"></i>Documento legal en ruta</span>
      </article>
      <article class="quick-card card-action-amber">
        <div class="quick-icon bg-subtle-warning text-warning"><i class="fas fa-clipboard-list" aria-hidden="true"></i></div>
        <h3>Planillas</h3>
        <p>{{ kpis.control_sheets_count }} registradas</p>
        <router-link to="/planillas-de-control-de-servicios" class="btn btn-warning text-dark quick-cta">
          <i class="fas fa-folder-open me-1" aria-hidden="true"></i>Ver planillas
        </router-link>
        <router-link to="/planillas-de-control-de-servicios/crear" class="quick-link">Nueva planilla</router-link>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({ kpis: { type: Object, default: () => ({}) } });
</script>

<style scoped>
.section-icon-badge { width: 36px; height: 36px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
.quick-title { margin: 0; font-size: 17px; font-weight: 800; color: #001c41; line-height: 1.2; }
.dark .quick-title { color: #f1f4f9; }
.quick-sub { margin: 0; font-size: 13px; color: #5e6e82; }
.quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (min-width: 1200px) { .quick-grid { grid-template-columns: repeat(4, 1fr); } }
.quick-card {
  background: #fff; border-radius: 16px; padding: 16px 14px;
  border-top: 4px solid #2c7be5; box-shadow: 0 1px 4px rgba(0,28,65,.08);
  display: flex; flex-direction: column; align-items: stretch; text-align: left; gap: 6px;
}
.dark .quick-card { background: #1b1e22; border-color: #2c3238; }
.card-action-blue { border-top-color: #2c7be5 !important; }
.card-action-cyan { border-top-color: #27bcfd !important; }
.card-action-green { border-top-color: #00d27a !important; }
.card-action-amber { border-top-color: #f5803e !important; }
.quick-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.quick-card h3 { margin: 4px 0 0; font-size: 15px; font-weight: 800; color: #001c41; }
.dark .quick-card h3 { color: #f1f4f9; }
.quick-card p { margin: 0; font-size: 13px; color: #5e6e82; }
.quick-cta { min-height: 50px; border-radius: 13px; font-size: 14px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; margin-top: 6px; }
.quick-link { text-align: center; font-size: 13px; font-weight: 700; color: #2c7be5; text-decoration: none; padding: 8px; min-height: 40px; display: inline-flex; align-items: center; justify-content: center; }
.quick-hint { text-align: center; font-size: 12px; color: #5e6e82; padding: 8px 4px; }
</style>
