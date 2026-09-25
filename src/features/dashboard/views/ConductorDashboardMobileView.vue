<template>
  <div class="conductor-mobile">
    <!-- Hero del conductor, réplica del mockup Android -->
    <div class="hero-card" role="region" aria-labelledby="titulo-conductor">
      <div class="hero-driver">
        <span class="hero-avatar" aria-hidden="true">{{ iniciales }}</span>
        <div class="hero-info">
          <p class="hero-greeting">{{ saludo }}</p>
          <h1 id="titulo-conductor" class="hero-name">Sr. {{ primerNombre }}</h1>
          <p class="hero-badges">
            <span class="badge badge-rol">
              <i class="fas fa-steering-wheel" aria-hidden="true"></i> ROL CONDUCTOR
            </span>
            <span v-if="licencia" class="badge badge-licencia">
              Cat. {{ licencia.category || 'C2' }} · {{ licencia.status || 'ACTIVA' }}
            </span>
          </p>
          <p class="hero-meta">
            <span v-if="documento">CC: {{ documento }}</span>
            <span v-if="licencia?.due_date"> · Vence: {{ licencia.due_date }}</span>
          </p>
        </div>
      </div>
      <dl class="stats-strip">
        <div class="stat-item">
          <dt>Inspecciones</dt>
          <dd>{{ kpis.inspections_count || 0 }}</dd>
        </div>
        <div class="stat-item">
          <dt>Planillas</dt>
          <dd>{{ kpis.control_sheets_count || 0 }}</dd>
        </div>
        <div class="stat-item">
          <dt>FUECs</dt>
          <dd>{{ kpis.fuecs_count || 0 }}</dd>
        </div>
        <div class="stat-item">
          <dt>Servicios</dt>
          <dd>{{ kpis.service_delivery_count || 0 }}</dd>
        </div>
      </dl>
    </div>

    <!-- ═══════════════════════════════════════════════════════════
         BANNER DE FLUJO OPERATIVO PRIORITARIO
         Prioridad 1: Inspección Preoperacional Diaria
         Prioridad 2: Inicio / Control de Servicio en Ruta
    ═══════════════════════════════════════════════════════════ -->
    <div class="priority-flow-card" :class="tieneInspeccionHoy ? 'is-inspected' : 'is-pending'" role="region" aria-labelledby="titulo-prioridad">
      <!-- Caso 1: Inspección pendiente (Prioridad 1) -->
      <template v-if="!tieneInspeccionHoy">
        <div class="priority-header">
          <div class="priority-badge-wrap">
            <span class="priority-pill pill-warning">
              <span class="priority-pulse-dot" aria-hidden="true"></span>
              PASO 1 · PREOPERACIONAL PENDIENTE
            </span>
          </div>
          <span v-if="primerVehiculo" class="priority-vehicle-tag">
            <i class="fas fa-truck me-1" aria-hidden="true"></i>{{ formatearPlaca(primerVehiculo.plate) }}
          </span>
        </div>

        <div class="priority-body">
          <div class="priority-icon-box box-warning" aria-hidden="true">
            <i class="fas fa-clipboard-check"></i>
          </div>
          <div class="priority-text">
            <h2 id="titulo-prioridad" class="priority-title">Inspección Preoperacional Obligatoria</h2>
            <p class="priority-desc">
              Antes de salir a ruta o iniciar servicios, debes registrar la inspección diaria de tu vehículo.
            </p>
          </div>
        </div>

        <div class="priority-actions">
          <router-link
            to="/inspeccion-vehiculos/crear"
            class="priority-main-btn btn-warning-action"
          >
            <i class="fas fa-play-circle me-1" aria-hidden="true"></i>
            <span>Iniciar Inspección del Día</span>
          </router-link>

          <button
            type="button"
            class="priority-blocked-btn"
            disabled
            title="Debes realizar la inspección preoperacional antes de iniciar el servicio"
          >
            <i class="fas fa-lock me-1" aria-hidden="true"></i>
            <span>Servicio bloqueado (Paso 2)</span>
          </button>
        </div>
      </template>

      <!-- Caso 2: Inspección completada -> Iniciar Servicio (Prioridad 2) -->
      <template v-else>
        <div class="priority-header">
          <div class="priority-badge-wrap">
            <span class="priority-pill pill-success">
              <i class="fas fa-check-circle me-1" aria-hidden="true"></i>
              PREOPERACIONAL DEL DÍA COMPLETADO
            </span>
          </div>
          <span v-if="primerVehiculo" class="priority-vehicle-tag is-success">
            <i class="fas fa-truck me-1" aria-hidden="true"></i>{{ formatearPlaca(primerVehiculo.plate) }}
          </span>
        </div>

        <div class="priority-body">
          <div class="priority-icon-box box-success" aria-hidden="true">
            <i class="fas fa-steering-wheel"></i>
          </div>
          <div class="priority-text">
            <h2 id="titulo-prioridad" class="priority-title">
              {{ tieneServicioActivo ? 'Servicio en Curso Habilitado' : 'Listo para Salir a Ruta' }}
            </h2>
            <p class="priority-desc">
              <template v-if="tieneServicioActivo">
                {{ activeService.project_name || 'Servicio activo' }}
                <span v-if="activeService.start_time"> · Salida: {{ activeService.start_time }}</span>
              </template>
              <template v-else>
                Vehículo verificado. Ya puedes abrir tu hoja de control y registrar recorridos.
              </template>
            </p>
          </div>
        </div>

        <div class="priority-actions">
          <!-- Si hay servicio activo: Continuar servicio -->
          <router-link
            v-if="tieneServicioActivo && activeService.service_uuid"
            :to="`/planilla-de-control-de-prestacion-servicios/control-de-servicios?service_uuid=${activeService.service_uuid}`"
            class="priority-main-btn btn-success-action"
          >
            <i class="fas fa-play-circle me-1" aria-hidden="true"></i>
            <span>Continuar Servicio en Ruta</span>
          </router-link>

          <!-- Si no hay servicio activo: Iniciar servicio -->
          <router-link
            v-else
            to="/planilla-de-control-de-prestacion-servicios/control-de-servicios"
            class="priority-main-btn btn-primary-action"
          >
            <i class="fas fa-steering-wheel me-1" aria-hidden="true"></i>
            <span>Iniciar Control de Servicio</span>
          </router-link>

          <router-link
            to="/inspeccion-vehiculos"
            class="priority-sub-btn"
          >
            <i class="fas fa-clipboard-check me-1" aria-hidden="true"></i>
            <span>Ver inspección de hoy</span>
          </router-link>
        </div>
      </template>
    </div>

    <!-- Módulos de gestión rápida -->
    <div class="mobile-section" role="region" aria-labelledby="titulo-modulos">
      <div class="section-header">
        <h2 id="titulo-modulos" class="section-title">
          <span class="section-icon" aria-hidden="true"><i class="fas fa-th-large" aria-hidden="true"></i></span>
          Gestión Rápida
        </h2>
        <router-link class="see-all" to="/dashboard/conductor">Ver todo</router-link>
      </div>
      <div class="module-grid">
        <article class="module-card mc-blue" aria-labelledby="mod-inspecciones">
          <span class="mc-count">{{ kpis.inspections_count || 0 }} registradas</span>
          <span class="mc-icon-wrap" aria-hidden="true"><i class="fas fa-tasks-alt" aria-hidden="true"></i></span>
          <h3 id="mod-inspecciones" class="mc-title">Inspecciones</h3>
          <p class="mc-desc">Historial de seguridad vial pre-operacional</p>
          <div class="mc-actions">
            <router-link class="mc-btn-primary" to="/inspeccion-vehiculos">Ver inspecciones</router-link>
            <router-link class="mc-btn-secondary" to="/inspeccion-vehiculos/crear">+ Nueva</router-link>
          </div>
        </article>

        <article class="module-card mc-orange" aria-labelledby="mod-planillas">
          <span class="mc-count">{{ kpis.control_sheets_count || 0 }} registradas</span>
          <span class="mc-icon-wrap" aria-hidden="true"><i class="fas fa-clipboard-list" aria-hidden="true"></i></span>
          <h3 id="mod-planillas" class="mc-title">Planillas de Control</h3>
          <p class="mc-desc">Verificación de documentos PDF y auditoría</p>
          <div class="mc-actions">
            <router-link class="mc-btn-primary" to="/planillas-de-control-de-servicios">Ver planillas</router-link>
            <router-link class="mc-btn-secondary" to="/planillas-de-control-de-servicios/crear">+ Nueva</router-link>
          </div>
        </article>

        <article class="module-card mc-green" aria-labelledby="mod-fuec">
          <span class="mc-count">{{ kpis.fuecs_count || 0 }} asignados</span>
          <span class="mc-icon-wrap" aria-hidden="true"><i class="fas fa-file-contract" aria-hidden="true"></i></span>
          <h3 id="mod-fuec" class="mc-title">FUEC</h3>
          <p class="mc-desc">Extractos únicos de contrato vigentes</p>
          <div class="mc-actions">
            <router-link class="mc-btn-primary" to="/extracto-de-contrato">Mis FUECs</router-link>
            <span class="mc-note"><i class="fas fa-shield-check" aria-hidden="true"></i> Doc. en ruta</span>
          </div>
        </article>

        <article class="module-card mc-teal" aria-labelledby="mod-servicio">
          <span class="mc-count">{{ kpis.service_delivery_count || 0 }} servicios</span>
          <span class="mc-icon-wrap" aria-hidden="true"><i class="fas fa-route" aria-hidden="true"></i></span>
          <h3 id="mod-servicio" class="mc-title">Control de Servicio</h3>
          <p class="mc-desc">Planillas PCP, hora y km de recorrido</p>
          <div class="mc-actions">
            <router-link
              v-if="tieneInspeccionHoy"
              class="mc-btn-primary"
              to="/planilla-de-control-de-prestacion-servicios/control-de-servicios"
            >
              Registrar
            </router-link>
            <button
              v-else
              type="button"
              class="mc-btn-primary mc-btn-disabled"
              disabled
              title="Requiere realizar la inspección preoperacional primero"
            >
              <i class="fas fa-lock me-1" aria-hidden="true"></i> Bloqueado
            </button>
            <router-link class="mc-btn-secondary" to="/planilla-de-control-de-prestacion-servicios">Listado</router-link>
          </div>
        </article>
      </div>
    </div>

    <!-- Vehículos -->
    <div class="mobile-section" role="region" aria-labelledby="titulo-vehiculos">
      <div class="section-header">
        <h2 id="titulo-vehiculos" class="section-title">
          <span class="section-icon is-orange" aria-hidden="true"><i class="fas fa-truck" aria-hidden="true"></i></span>
          Mis Vehículos
        </h2>
        <div class="vehicle-search">
          <label class="visually-hidden" for="f-buscar-placa-movil">Buscar placa o marca</label>
          <input
            id="f-buscar-placa-movil"
            v-model="busqueda"
            type="search"
            placeholder="Buscar placa..."
            autocomplete="off"
          />
        </div>
      </div>
      <div v-if="vehiculosFiltrados.length > 0" class="vehicle-list">
        <article v-for="vehiculo in vehiculosFiltrados" :key="vehiculo.uuid" class="vehicle-card">
          <h3 class="vehicle-plate">{{ formatearPlaca(vehiculo.plate) }}</h3>
          <p class="vehicle-data">{{ vehiculo.brand }} {{ vehiculo.line }} · Modelo {{ vehiculo.model || 'N/A' }}</p>
          <p class="vehicle-km">{{ formatearNumero(vehiculo.current_mileage) }} km</p>
        </article>
      </div>
      <div v-else class="empty-vehicle" role="status">
        <p class="ev-icon" aria-hidden="true">🚌</p>
        <p class="ev-title">Sin vehículos asignados</p>
        <p class="ev-sub">No tienes vehículos vinculados a proyectos o extractos de contrato (FUEC) activos.</p>
        <button v-if="busqueda" type="button" class="mc-btn-secondary" @click="busqueda = ''">Limpiar búsqueda</button>
      </div>
    </div>

    <!-- Pie de página móvil y acción de cierre de sesión -->
    <div class="mobile-section mobile-footer-actions">
      <button
        type="button"
        class="mobile-logout-full-btn"
        :disabled="isLoggingOut"
        @click="ejecutarCerrarSesion"
      >
        <span v-if="isLoggingOut" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        <i v-else class="fas fa-sign-out-alt me-2" aria-hidden="true"></i>
        <span>{{ isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión' }}</span>
      </button>
      <p class="mobile-app-version">NOA Transportes · Conductor v{{ appVersion }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore, useConfigStore, usePermissionsStore, useUserStore } from '@store';
import { useDashboardStore } from '../store/dashboard.store';
import { confirmLogout } from '@/utils/confirm.js';
import { env } from '@utils/env.js';
import { logger } from '@utils/logger.js';

const appVersion = computed(() => env.APP_VERSION || '1.1.0');

const authStore = useAuthStore();
const configStore = useConfigStore();
const userStore = useUserStore();
const permissionsStore = usePermissionsStore();
const dashboardStore = useDashboardStore();

const busqueda = ref('');
const isLoggingOut = ref(false);

async function ejecutarCerrarSesion() {
  if (isLoggingOut.value) return;

  const confirmado = await confirmLogout();
  if (!confirmado) return;

  isLoggingOut.value = true;
  configStore.setLoading(true, 'Cerrando sesión...');

  try {
    await authStore.logout({ redirect: true });
  } catch (error) {
    isLoggingOut.value = false;
    configStore.setLoading(false);
    logger.error('Error al cerrar sesión desde panel móvil:', error);
  }
}

const datos = computed(() => dashboardStore.conductorData || {});
const nombreCompleto = computed(() => {
  void permissionsStore.roles;
  void authStore.currentTenant;
  return datos.value.conductor?.name || userStore.fullName || userStore.username || 'Conductor';
});
const primerNombre = computed(() => {
  const crudo = nombreCompleto.value.trim();
  if (!crudo) return 'Conductor';
  const primera = crudo.split(/\s+/)[0];
  return primera.charAt(0).toUpperCase() + primera.slice(1).toLowerCase();
});
const iniciales = computed(() => {
  const partes = nombreCompleto.value.trim().split(/\s+/).filter(Boolean);
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return (partes[0] || 'CO').substring(0, 2).toUpperCase();
});
const documento = computed(() => datos.value.conductor?.document || null);
const licencia = computed(() => datos.value.conductor?.license || null);
const kpis = computed(() => datos.value.kpis || {});
const vehiculos = computed(() => datos.value.vehicles || []);

const saludo = computed(() => {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 18) return 'Buenas tardes';
  return 'Buenas noches';
});

const vehiculosFiltrados = computed(() => {
  const consulta = busqueda.value.trim().toLowerCase();
  if (!consulta) return vehiculos.value;
  return vehiculos.value.filter((v) => {
    const placa = String(v.plate || '').toLowerCase();
    const marca = String(v.brand || '').toLowerCase();
    const linea = String(v.line || '').toLowerCase();
    return placa.includes(consulta) || marca.includes(consulta) || linea.includes(consulta);
  });
});

function formatearNumero(valor) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return '0';
  return Number(valor).toLocaleString('es-CO');
}

function formatearPlaca(placa) {
  if (!placa) return 'SIN-PLACA';
  const limpia = String(placa).trim().toUpperCase();
  if (limpia.length === 6) return `${limpia.substring(0, 3)} · ${limpia.substring(3)}`;
  return limpia;
}

const primerVehiculo = computed(() => {
  if (vehiculos.value && vehiculos.value.length > 0) {
    return vehiculos.value[0];
  }
  return null;
});

const activeService = computed(() => datos.value.active_service || null);
const tieneServicioActivo = computed(() => !!activeService.value);

const tzoffset = (new Date()).getTimezoneOffset() * 60000;
const hoyStr = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];

const inspeccionHoy = computed(() => {
  const lista = datos.value.recent_inspections || [];
  const encontrada = lista.find((item) => {
    const f = item.date || item.inspection_date;
    if (!f) return false;
    return String(f).substring(0, 10) === hoyStr;
  });
  if (encontrada) return encontrada;

  if (datos.value.has_today_inspection) {
    return { date: hoyStr };
  }
  return null;
});

const tieneInspeccionHoy = computed(() => !!inspeccionHoy.value);

onMounted(async () => {
  try {
    await dashboardStore.fetchConductorDashboardData(30);
  } catch (error) {
    logger.error('No se pudo cargar el panel móvil del conductor', error);
  }
});
</script>

<style scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
.conductor-mobile {
  width: 100% !important;
  max-width: 100vw !important;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 0 10px;
  box-sizing: border-box;
}
.conductor-mobile section,
.conductor-mobile .mobile-section {
  padding: 0 !important;
  margin: 0 !important;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.hero-card {
  margin: 6px 6px 0;
  background: linear-gradient(135deg, #0c2461 0%, #1e3a8a 60%, #1d4ed8 100%);
  border-radius: 16px;
  padding: 12px 14px 10px;
  color: #ffffff !important;
  box-shadow: 0 3px 10px rgba(12, 36, 97, 0.25);
}
.hero-driver {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hero-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.45);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 15px;
  color: #ffffff !important;
  flex-shrink: 0;
  overflow: hidden !important;
}
.hero-greeting {
  font-size: 11px;
  color: #ffffff !important;
  opacity: 0.95;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}
.hero-name {
  font-size: 16px;
  font-weight: 800;
  color: #ffffff !important;
  margin: 1px 0 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.hero-badges {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin: 4px 0 0;
}
.badge {
  font-size: 8.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 16px;
}
.badge-rol {
  background: #f97316 !important;
  color: #ffffff !important;
  box-shadow: 0 1px 4px rgba(249, 115, 22, 0.35);
}
.badge-licencia {
  background: #15803d !important;
  color: #ffffff !important;
  border: 1px solid #22c55e !important;
}
.hero-meta {
  font-size: 10px;
  color: #ffffff !important;
  opacity: 0.95;
  font-weight: 500;
  margin: 3px 0 0;
}
.stats-strip {
  display: flex;
  gap: 6px;
  margin: 8px 0 0;
  padding: 0;
}
.stat-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.18) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  border-radius: 10px;
  padding: 6px 3px;
  text-align: center;
  display: flex;
  flex-direction: column-reverse;
  gap: 1px;
}
.stat-item dd {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #ffffff !important;
}
.stat-item dt {
  font-size: 9px;
  font-weight: 700;
  color: #ffffff !important;
  letter-spacing: 0.2px;
  text-transform: uppercase;
}
/* ── TARJETA DE FLUJO OPERATIVO PRIORITARIO (SMART BANNER) ── */
.priority-flow-card {
  margin: 6px 6px 0;
  border-radius: 16px;
  background: #ffffff;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
}
.priority-flow-card.is-pending {
  border-left: 4px solid #f97316;
  background: linear-gradient(180deg, #fffaf5 0%, #ffffff 100%);
}
.priority-flow-card.is-inspected {
  border-left: 4px solid #10b981;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
}
.priority-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.priority-badge-wrap {
  display: flex;
  align-items: center;
}
.priority-pill {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.3px;
  padding: 2px 8px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.pill-warning {
  background: #ffedd5;
  color: #c2410c;
  border: 1px solid #fed7aa;
}
.pill-success {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
.priority-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ea580c;
  animation: pulse-dot 1.4s infinite;
}
@keyframes pulse-dot {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; box-shadow: 0 0 6px #ea580c; }
  100% { transform: scale(0.95); opacity: 0.7; }
}
.priority-vehicle-tag {
  font-size: 10px;
  font-weight: 700;
  color: #475569;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.priority-vehicle-tag.is-success {
  color: #166534;
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.priority-body {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.priority-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.box-warning {
  background: #fff7ed;
  color: #f97316;
  border: 1px solid #ffedd5;
}
.box-success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
}
.priority-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.priority-title {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a !important;
  margin: 0;
  line-height: 1.25;
}
.priority-desc {
  font-size: 10px;
  color: #475569 !important;
  margin: 0;
  line-height: 1.35;
  font-weight: 500;
}
.priority-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 2px;
}
.priority-main-btn {
  width: 100%;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 11px;
  font-weight: 800 !important;
  text-align: center;
  text-decoration: none !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #ffffff !important;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transition: all 0.15s ease;
}
.btn-warning-action {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important;
}
.btn-warning-action:active {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%) !important;
  transform: scale(0.98);
}
.btn-success-action {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
}
.btn-success-action:active {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  transform: scale(0.98);
}
.btn-primary-action {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
}
.btn-primary-action:active {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important;
  transform: scale(0.98);
}
.priority-blocked-btn {
  width: 100%;
  border-radius: 9px;
  padding: 7px 10px;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  background: #f1f5f9 !important;
  color: #94a3b8 !important;
  border: 1px dashed #cbd5e1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: not-allowed;
}
.priority-sub-btn {
  font-size: 10.5px;
  color: #2563eb !important;
  font-weight: 700;
  text-align: center;
  text-decoration: none !important;
  padding: 4px 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.mc-btn-disabled {
  background: #e2e8f0 !important;
  color: #94a3b8 !important;
  border: 1px dashed #cbd5e1 !important;
  cursor: not-allowed !important;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 2px;
  margin: 0;
}
.section-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
}
.section-icon {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: #1e40af;
  color: #ffffff !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}
.section-icon.is-orange {
  background: #f97316;
}
.see-all {
  font-size: 10.5px;
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
}
.module-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 0 6px;
  margin: 0;
  box-sizing: border-box;
}
.module-card {
  background: #fff;
  border-radius: 14px;
  padding: 10px 9px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 10px rgba(0, 0, 0, 0.03);
  border-top: 3px solid transparent;
  position: relative;
  margin: 0;
}
.mc-blue { border-top-color: #2563eb; }
.mc-orange { border-top-color: #f97316; }
.mc-green { border-top-color: #22c55e; }
.mc-teal { border-top-color: #14b8a6; }
.mc-count {
  position: absolute;
  top: 7px;
  right: 7px;
  font-size: 8px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 14px;
  background: #eef2ff;
  color: #1e293b;
}
.mc-blue .mc-count { background: #dbeafe !important; color: #1e40af !important; }
.mc-orange .mc-count { background: #ffedd5 !important; color: #c2410c !important; }
.mc-green .mc-count { background: #dcfce7 !important; color: #15803d !important; }
.mc-teal .mc-count { background: #ccfbf1 !important; color: #0f766e !important; }
.mc-icon-wrap {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #f1f5f9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
.mc-blue .mc-icon-wrap { color: #2563eb; background: #eff6ff; }
.mc-orange .mc-icon-wrap { color: #f97316; background: #fff7ed; }
.mc-green .mc-icon-wrap { color: #22c55e; background: #f0fdf4; }
.mc-teal .mc-icon-wrap { color: #14b8a6; background: #f0fdfa; }
.mc-title {
  font-size: 11.5px;
  margin: 0;
  font-weight: 700;
  color: #0f172a !important;
}
.mc-desc {
  font-size: 9px;
  color: #475569 !important;
  margin: 0;
  line-height: 1.25;
  font-weight: 500;
}
.mc-actions {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 2px;
}
.mc-btn-primary,
a.mc-btn-primary,
button.mc-btn-primary {
  border-radius: 7px;
  padding: 5px 6px;
  font-size: 9.5px;
  font-weight: 700 !important;
  text-align: center;
  text-decoration: none !important;
  display: inline-block;
  min-height: 28px;
  line-height: 16px;
  color: #ffffff !important;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}
.mc-blue .mc-btn-primary,
.mc-blue a.mc-btn-primary {
  background: #2563eb !important;
  color: #ffffff !important;
}
.mc-blue .mc-btn-primary:active,
.mc-blue a.mc-btn-primary:active {
  background: #1d4ed8 !important;
}
.mc-orange .mc-btn-primary,
.mc-orange a.mc-btn-primary {
  background: #f97316 !important;
  color: #ffffff !important;
}
.mc-orange .mc-btn-primary:active,
.mc-orange a.mc-btn-primary:active {
  background: #ea580c !important;
}
.mc-green .mc-btn-primary,
.mc-green a.mc-btn-primary {
  background: #22c55e !important;
  color: #ffffff !important;
}
.mc-green .mc-btn-primary:active,
.mc-green a.mc-btn-primary:active {
  background: #16a34a !important;
}
.mc-teal .mc-btn-primary,
.mc-teal a.mc-btn-primary {
  background: #14b8a6 !important;
  color: #ffffff !important;
}
.mc-teal .mc-btn-primary:active,
.mc-teal a.mc-btn-primary:active {
  background: #0d9488 !important;
}
.mc-btn-secondary,
a.mc-btn-secondary,
button.mc-btn-secondary {
  border-radius: 7px;
  padding: 5px 6px;
  font-size: 9.5px;
  font-weight: 600 !important;
  text-align: center;
  text-decoration: none !important;
  display: inline-block;
  min-height: 28px;
  line-height: 16px;
  background: #f8fafc !important;
  border: 1px solid #cbd5e1 !important;
  color: #1e293b !important;
  cursor: pointer;
  transition: all 0.15s ease;
}
.mc-btn-secondary:active,
a.mc-btn-secondary:active {
  background: #e2e8f0 !important;
}
.mc-note {
  font-size: 9.5px;
  color: #64748b;
  text-align: center;
  padding: 3px 0;
  font-weight: 600;
}
.vehicle-search input {
  font-size: 9.5px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 4px 6px;
  color: #1e293b;
  background: #f8fafc;
  width: 100px;
}
.vehicle-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 6px;
  margin: 0;
  box-sizing: border-box;
}
.vehicle-card {
  background: #fff;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.7);
}
.vehicle-plate {
  font-size: 13px;
  margin: 0;
  color: #0f172a !important;
  font-weight: 800;
}
.vehicle-data {
  font-size: 10.5px;
  color: #475569 !important;
  margin: 1px 0;
  font-weight: 500;
}
.vehicle-km {
  font-size: 12px;
  font-weight: 800;
  color: #1d4ed8 !important;
  margin: 0;
  font-variant-numeric: tabular-nums;
}
.empty-vehicle {
  background: #fff;
  border-radius: 14px;
  padding: 14px 10px;
  text-align: center;
  margin: 0 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.7);
}
.ev-icon {
  font-size: 24px;
  margin: 0 0 4px;
  opacity: 0.5;
}
.ev-title {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 2px;
}
.ev-sub {
  font-size: 10px;
  color: #64748b;
  line-height: 1.35;
  margin: 0 0 8px;
}
.mobile-footer-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 14px 8px 24px;
}
.mobile-logout-full-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: #dc2626 !important;
  border: 1.5px solid #fecaca !important;
  border-radius: 12px !important;
  font-size: 14px;
  font-weight: 700;
  padding: 12px 16px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  outline: none !important;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.15s ease;
}
.mobile-logout-full-btn:active {
  background: #fef2f2;
  border-color: #fca5a5 !important;
  transform: scale(0.98);
}
.mobile-logout-full-btn:disabled {
  opacity: 0.6;
  pointer-events: none;
}
.mobile-app-version {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
  font-weight: 500;
}
</style>
