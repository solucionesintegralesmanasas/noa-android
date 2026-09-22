<template>
    <div class="rues-lookup-wrapper">
        <!-- ══════════════════════════════════════════════
        BOTÓN FLOTANTE TRIGGER (DISEÑO PREMIUM)
    ══════════════════════════════════════════════ -->
        <a class="rues-lookup-toggle shadow-sm d-flex align-items-center gap-2" href="#" @click.prevent="abrir"
            title="Consultar NIT en el RUES">
            <div class="rues-icon-wrapper d-flex align-items-center justify-content-center">
                <i class="fas fa-search search-icon"></i>
            </div>
            <span class="rues-label-text">RUES</span>
        </a>

        <!-- ══════════════════════════════════════════════
        PANEL OFFCANVAS
    ══════════════════════════════════════════════ -->
        <Teleport to="body">
            <div ref="offcanvasRef" class="offcanvas offcanvas-end rues-panel border-0" id="rues-lookup-offcanvas"
                tabindex="-1" aria-labelledby="rues-lookup-offcanvas">

                <!-- Header -->
                <div class="offcanvas-header rues-panel-header justify-content-between">
                    <div class="z-1 py-1">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <h5 class="text-white mb-0 me-2 fs-6 fs-md-5">
                                <i class="fas fa-database me-2"></i>Consulta RUES
                            </h5>
                        </div>
                        <p class="mb-0 fs-10 text-white opacity-75">
                            Registro Único Empresarial y Social — datos.gov.co
                        </p>
                    </div>
                    <div class="z-1" data-bs-theme="dark">
                        <button class="btn-close" type="button" data-bs-dismiss="offcanvas"
                            aria-label="Cerrar"></button>
                    </div>
                </div>

                <!-- Body -->
                <div class="offcanvas-body scrollbar-overlay px-3 h-100">

                    <!-- Buscador -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">
                            <i class="fas fa-id-card me-1 text-primary"></i>NIT a consultar
                        </label>
                        <div class="input-group">
                            <input v-model="nitInput" type="text" class="form-control" placeholder="Ej: 123456789"
                                @keydown.enter.prevent="buscar" :disabled="loading" inputmode="numeric" maxlength="15"
                                autocomplete="off" />
                            <button class="btn btn-primary px-2 px-sm-3" type="button"
                                :disabled="loading || !nitInput.trim()" @click="buscar">
                                <span v-show="loading" class="spinner-border spinner-border-sm me-1"></span>
                                <i v-show="!loading" class="fas fa-search me-sm-1"></i>
                                <span class="d-none d-sm-inline">{{ loading ? 'Buscando...' : 'Buscar' }}</span>
                            </button>
                        </div>
                        <div class="form-text">
                            <i class="fas fa-info-circle me-1"></i>
                            Ingresa el NIT sin dígito de verificación.
                        </div>
                    </div>

                    <!-- Sin resultados -->
                    <div v-if="searched && registros.length === 0" class="alert alert-warning py-2">
                        <i class="fas fa-exclamation-triangle me-1"></i>
                        No se encontraron registros para el NIT <strong>{{ lastNit }}</strong>.
                    </div>

                    <!-- Resultados -->
                    <div v-if="registros.length > 0">
                        <!-- Aviso cuando todos los registros están cancelados -->
                        <div v-if="tieneSoloInactivos" class="alert alert-warning py-2 mb-2 small">
                            <i class="fas fa-exclamation-triangle me-1"></i>
                            Solo se encontraron registros con matrícula cancelada. Puedes seleccionar uno para copiar
                            los datos.
                        </div>

                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <h6 class="mb-0 fw-semibold text-dark">
                                <i class="fas fa-list me-1 text-primary"></i>
                                {{ registros.length }} registro{{ registros.length > 1 ? 's' : '' }} encontrado{{
                                    registros.length > 1 ? 's' : '' }}
                            </h6>
                            <small class="text-muted">Selecciona uno para aplicar</small>
                        </div>

                        <div v-for="(reg, idx) in registros" :key="idx" class="rues-card mb-2 border rounded-3 p-3"
                            :class="{ 'rues-card--selected': selectedIdx === idx }" @click="selectedIdx = idx">

                            <!-- Indicador selección -->
                            <div class="d-flex align-items-start gap-2">
                                <div class="rues-radio mt-1 flex-shrink-0">
                                    <i
                                        :class="selectedIdx === idx ? 'fas fa-check-circle text-primary' : 'far fa-circle text-muted'"></i>
                                </div>
                                <div class="flex-grow-1 min-w-0">
                                    <div class="d-flex flex-wrap justify-content-between align-items-start gap-1 mb-1">
                                        <p class="mb-0 fw-semibold text-dark small text-break pe-2">{{ reg.razon_social
                                            }}</p>
                                        <span class="badge flex-shrink-0"
                                            :class="esCancelado(reg) ? 'bg-warning text-dark' : 'bg-success'">
                                            {{ esCancelado(reg) ? 'Cancelada' : 'Vigente' }}
                                        </span>
                                    </div>
                                    <p class="mb-1 small text-muted">
                                        <span class="me-2">
                                            <i class="fas fa-hashtag me-1"></i>NIT: <strong>{{ reg.nit }}</strong>-{{
                                                reg.digito_verificacion }}
                                        </span>
                                    </p>
                                    <p class="mb-1 small text-muted">
                                        <i class="fas fa-building me-1"></i>{{ reg.camara_comercio }} — Mat. {{
                                            reg.matricula }}
                                    </p>
                                    <p class="mb-1 small text-muted">
                                        <i class="fas fa-tag me-1"></i>{{ reg.organizacion_juridica }}
                                    </p>
                                    <p class="mb-0 small text-muted">
                                        <i class="fas fa-sync me-1"></i>Renovado: {{ reg.ultimo_ano_renovado || '—' }}
                                    </p>
                                    <p v-if="reg.representante_legal" class="mb-0 small text-muted mt-1">
                                        <i class="fas fa-user-tie me-1"></i>RL: {{ reg.representante_legal }}
                                    </p>
                                    <p class="mb-0 small" style="font-size: 0.7rem;">
                                        <i class="fas fa-info-circle me-1 text-muted"></i>
                                        <span :class="esCancelado(reg) ? 'text-warning' : 'text-success'">
                                            {{ reg.estado_matricula }}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Botón aplicar -->
                        <div class="mt-3">
                            <button class="btn btn-primary w-100" :disabled="selectedIdx === null" @click="aplicar">
                                <i class="fas fa-check me-2"></i>Aplicar datos al formulario
                            </button>
                            <button class="btn btn-outline-secondary w-100 mt-2" type="button" @click="limpiar">
                                <i class="fas fa-times me-1"></i>Cancelar
                            </button>
                        </div>
                    </div>

                    <!-- Ilustración inicial -->
                    <div v-if="!searched && registros.length === 0" class="text-center mt-5 pt-3">
                        <div class="mb-3 text-primary opacity-50">
                            <i class="fas fa-search" style="font-size: 3rem;"></i>
                        </div>
                        <h6 class="text-muted">Consulta el RUES</h6>
                        <p class="fs-10 text-muted">
                            Ingresa un NIT para buscar la información oficial de la empresa en el
                            Registro Único Empresarial y Social de Colombia.
                        </p>
                        <div class="alert alert-info py-2 text-start small">
                            <i class="fas fa-lightbulb me-1"></i>
                            <strong>Tip:</strong> Se priorizan los registros vigentes. Si hay varias cámaras, podrás
                            elegir cuál aplicar.
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
/**
 * @author Darwin Montes
 * @version 1.1.0
 * @created_at 2026-06-14
 * @module {Components}
 * @resource {RuesLookupPanel}
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { useNitLookup, esCancelado } from '@/hooks/useNitLookup';

const emit = defineEmits(['select']);

const nitInput = ref('');
const selectedIdx = ref(null);
const offcanvasRef = ref(null);
let bsOffcanvas = null;

const {
    lookingUpNit: loading,
    registros,
    searched,
    lastNit,
    tieneSoloInactivos,
    lookupNit,
    resetLookup,
} = useNitLookup();

onMounted(() => {
    if (offcanvasRef.value && window.bootstrap?.Offcanvas) {
        bsOffcanvas = new window.bootstrap.Offcanvas(offcanvasRef.value);
    }
});

onUnmounted(() => {
    if (bsOffcanvas) {
        bsOffcanvas.hide();
        bsOffcanvas.dispose();
    }
    const backdrops = document.querySelectorAll('.offcanvas-backdrop');
    backdrops.forEach(el => el.remove());
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.classList.remove('modal-open');
});

async function buscar() {
    await lookupNit(nitInput.value);
    if (registros.value.length > 0) {
        selectedIdx.value = 0;
    } else {
        selectedIdx.value = null;
    }
}

function abrir() {
    if (bsOffcanvas) {
        bsOffcanvas.show();
    }
}

function aplicar() {
    if (selectedIdx.value === null) return;
    const registro = registros.value[selectedIdx.value];
    emit('select', registro);
    cerrarOffcanvas();
}

function limpiar() {
    nitInput.value = '';
    selectedIdx.value = null;
    resetLookup();
    cerrarOffcanvas();
}

function cerrarOffcanvas() {
    if (bsOffcanvas) {
        bsOffcanvas.hide();
    }
}
</script>

<style scoped>
/* ══════════════════════════════════════════════
   BOTÓN FLOTANTE TRIGGER (DISEÑO PREMIUM)
 ══════════════════════════════════════════════ */
.rues-lookup-toggle {
    position: fixed;
    right: 0;
    bottom: 5rem;
    z-index: 1040;
    text-decoration: none;
    cursor: pointer;
    background: #0d6efd;
    color: #ffffff;
    border: 1px solid #0a58ca;
    border-right: none;
    border-radius: 20px 0 0 20px !important;
    padding: 0.5rem 0.85rem 0.5rem 0.75rem;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.25) !important;
}

.rues-lookup-toggle:hover {
    background: #0b5ed7;
    color: #ffffff;
    padding-left: 1rem;
    box-shadow: -4px 4px 16px rgba(13, 110, 253, 0.4) !important;
}

.rues-icon-wrapper {
    width: 20px;
    height: 20px;
}

.search-icon {
    font-size: 0.85rem;
    transition: transform 0.3s ease;
}

.rues-lookup-toggle:hover .search-icon {
    transform: scale(1.15) rotate(15deg);
}

.rues-label-text {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

/* ══════════════════════════════════════════════
   PANEL OFFCANVAS
 ══════════════════════════════════════════════ */
.rues-panel {
    width: 380px;
    max-width: 95vw;
}

.rues-panel-header {
    background: linear-gradient(135deg, #0d6efd, #0a58ca);
    color: #fff;
    padding: 1rem 1.25rem;
}

/* ══════════════════════════════════════════════
   CARDS DE RESULTADO
 ══════════════════════════════════════════════ */
.rues-card {
    cursor: pointer;
    background: #fff;
    border-color: #dee2e6 !important;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.rues-card:hover {
    border-color: #0d6efd !important;
    background: #f8fbff;
}

.rues-card--selected {
    border-color: #0d6efd !important;
    background: #eef4ff;
    box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.15);
}

.rues-card--inactive {
    opacity: 0.75;
}

.rues-card--inactive:hover {
    border-color: #dc3545 !important;
    background: #fff8f8;
}

/* Scrollbar panel */
.scrollbar-overlay {
    overflow-y: auto;
}

@media (max-width: 575.98px) {
    .rues-lookup-toggle {
        bottom: 3.5rem;
        padding: 0.4rem 0.65rem 0.4rem 0.55rem;
    }

    .rues-label-text {
        font-size: 0.65rem;
    }
}
</style>
