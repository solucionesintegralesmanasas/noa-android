<template>
  <nav class="conductor-bottomnav" aria-label="Navegación principal del conductor">
    <router-link to="/dashboard" class="bnav-item" active-class="is-active" aria-label="Inicio">
      <i class="fas fa-home" aria-hidden="true"></i>
      <span>Inicio</span>
    </router-link>
    <a href="#conductor-vehiculos" class="bnav-item" aria-label="Mis vehículos">
      <i class="fas fa-truck-moving" aria-hidden="true"></i>
      <span>Vehículos</span>
      <em v-if="vehiclesCount > 0" class="bnav-badge">{{ vehiclesCount }}</em>
    </a>
    <router-link
      to="/planilla-de-control-de-prestacion-servicios/control-de-servicios"
      class="bnav-fab"
      :class="{ 'is-active-service': hasActiveService }"
      aria-label="Continuar o abrir servicio"
    >
      <span class="bnav-fab-ring" aria-hidden="true"></span>
      <i class="fas" :class="hasActiveService ? 'fa-play' : 'fa-plus'" aria-hidden="true"></i>
      <span class="bnav-fab-label">{{ hasActiveService ? 'Servicio' : 'Iniciar' }}</span>
      <em v-if="hasActiveService" class="bnav-fab-dot" aria-hidden="true"></em>
    </router-link>
    <a href="#conductor-mapa" class="bnav-item" aria-label="Mi ubicación en vivo">
      <i class="fas fa-satellite-dish" aria-hidden="true"></i>
      <span>Mapa</span>
      <em v-if="gpsActive" class="bnav-live-dot" aria-hidden="true"></em>
    </a>
    <router-link to="/profile" class="bnav-item" active-class="is-active" aria-label="Mi perfil">
      <i class="fas fa-user-circle" aria-hidden="true"></i>
      <span>Perfil</span>
    </router-link>
  </nav>
</template>

<script setup>
defineProps({
  vehiclesCount: { type: Number, default: 0 },
  hasActiveService: { type: Boolean, default: false },
  gpsActive: { type: Boolean, default: false },
});
</script>

<style scoped>
.conductor-bottomnav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1030;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 2px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid #e3e8ef;
  padding: 8px 6px calc(8px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -4px 20px rgba(0, 28, 65, 0.08);
}
.dark .conductor-bottomnav {
  background: rgba(27, 30, 34, 0.96);
  border-top-color: #2c3238;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
}
.bnav-item {
  position: relative;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-height: 52px;
  min-width: 56px;
  border-radius: 12px;
  color: #5e6e82;
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}
.bnav-item i { font-size: 20px; line-height: 1; }
.bnav-item.is-active { color: var(--noa-primary, #2c7be5); background: rgba(44, 123, 229, 0.1); }
.bnav-badge {
  position: absolute;
  top: 4px;
  right: calc(50% - 22px);
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #2c7be5;
  color: #fff;
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.bnav-live-dot {
  position: absolute;
  top: 8px;
  right: calc(50% - 16px);
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #00d27a;
  border: 2px solid #fff;
  animation: bnav-pulse 1.6s ease-out infinite;
}
@keyframes bnav-pulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 210, 122, 0.6); }
  70% { box-shadow: 0 0 0 6px rgba(0, 210, 122, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 210, 122, 0); }
}
.bnav-fab {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 68px;
  height: 64px;
  margin-top: -28px;
  border-radius: 20px;
  background: linear-gradient(135deg, #2c7be5 0%, #0a4ebb 100%);
  color: #fff;
  text-decoration: none;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(44, 123, 229, 0.4);
  border: 3px solid #fff;
}
.dark .bnav-fab { border-color: #1b1e22; }
.bnav-fab i { font-size: 20px; }
.bnav-fab.is-active-service { background: linear-gradient(135deg, #00d27a 0%, #009e5c 100%); box-shadow: 0 8px 20px rgba(0, 210, 122, 0.45); }
.bnav-fab-dot {
  position: absolute;
  top: 8px;
  right: 10px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  animation: bnav-pulse 1.4s ease-out infinite;
}
@media (min-width: 992px) {
  .conductor-bottomnav { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .bnav-live-dot, .bnav-fab-dot { animation: none; }
}
</style>
