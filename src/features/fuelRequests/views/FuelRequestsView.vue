<template>
    <div class="container-fluid py-3">
        <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
            <div>
                <h1 class="h4 mb-1">
                    <i class="fad fa-qrcode text-primary me-2" aria-hidden="true" />
                    Solicitudes de tanqueo
                </h1>
                <p class="text-muted small mb-0">Solicita el tanqueo y muestra el QR aprobado en la estación.</p>
            </div>
            <button type="button" class="btn btn-falcon-default btn-sm" :disabled="store.loading" @click="refresh">
                <i class="fad fa-sync me-1" aria-hidden="true" />Actualizar
            </button>
        </div>

        <div v-if="can('fuel_requests.create')" class="card border-0 shadow-sm mb-3">
            <div class="card-body">
                <label class="form-label fw-medium" for="f-vehiculo">Vehículo</label>
                <select id="f-vehiculo" v-model="vehicleUuid" class="form-select mb-2"
                    :disabled="store.vehiculosLoading || !store.vehiculos.length"
                    :aria-invalid="!!createError"
                    aria-describedby="f-vehiculo-ayuda f-crear-error">
                    <option value="">Selecciona un vehículo</option>
                    <option v-for="v in store.vehiculos" :key="v.uuid" :value="v.uuid">
                        {{ v.vehicle_license_plate }}{{ v.internal_number ? ` (${v.internal_number})` : '' }}
                    </option>
                </select>

                <p v-if="store.vehiculosLoading" id="f-vehiculo-ayuda" class="small text-muted mb-2" role="status">
                    <i class="fad fa-spinner fa-spin me-1" aria-hidden="true" />Cargando tus vehículos…
                </p>
                <div v-else-if="store.vehiculosError" class="alert alert-warning py-2 small mb-2 d-flex align-items-center justify-content-between gap-2" role="alert">
                    <span id="f-vehiculo-ayuda">{{ store.vehiculosError }}</span>
                    <button type="button" class="btn btn-sm btn-outline-warning touch-target" @click="store.fetchVehiculos()">
                        Reintentar
                    </button>
                </div>
                <p v-else-if="!store.vehiculos.length" id="f-vehiculo-ayuda" class="text-warning small mb-2">
                    No tienes vehículos asignados para solicitar tanqueo.
                </p>

                <label class="form-label fw-medium" for="f-notas">Observaciones (opcional)</label>
                <textarea id="f-notas" v-model="notes" class="form-control mb-3" rows="2" maxlength="500"
                    placeholder="Estación, ruta o novedad" />

                <p v-if="createError" id="f-crear-error" class="text-danger small mb-2" role="alert">
                    {{ createError }}
                </p>
                <button type="button" class="btn btn-primary w-100 touch-target" :disabled="store.loading || !vehicleUuid"
                    @click="crear">
                    <i class="fad fa-paper-plane me-1" aria-hidden="true" />Solicitar tanqueo
                </button>
            </div>
        </div>

        <div v-if="store.loading && !store.items.length" class="text-center text-muted py-4" role="status">
            <i class="fad fa-spinner fa-spin me-2" aria-hidden="true" />Cargando solicitudes…
        </div>
        <div v-else-if="store.error && !store.items.length" class="alert alert-warning d-flex align-items-center justify-content-between gap-2" role="alert">
            <span>{{ store.error }}</span>
            <button type="button" class="btn btn-sm btn-outline-warning touch-target" @click="refresh">Reintentar</button>
        </div>
        <div v-else-if="!store.items.length" class="card border-0 shadow-sm">
            <div class="card-body text-center text-muted py-4">
                <i class="fad fa-inbox fs-2 mb-2" aria-hidden="true" />
                <p class="mb-0 small">Todavía no tienes solicitudes de tanqueo.</p>
            </div>
        </div>
        <div v-else class="d-flex flex-column gap-2">
            <div v-for="item in store.items" :key="item.uuid" class="card border-0 shadow-sm">
                <div class="card-body py-3">
                    <div class="d-flex justify-content-between align-items-start gap-2">
                        <div>
                            <p class="fw-bold mb-0">{{ item.vehicle?.vehicle_license_plate || 'Vehículo' }}</p>
                            <small class="text-muted">{{ item.code }}</small>
                        </div>
                        <span class="badge" :class="`bg-${meta(item.status).color} bg-opacity-10 text-${meta(item.status).color}`">
                            <i class="fad me-1" :class="meta(item.status).icon" aria-hidden="true" />{{ meta(item.status).label }}
                        </span>
                    </div>
                    <p class="small text-muted mb-1 mt-2">
                        Solicitud: {{ fecha(item.requested_at) }}
                    </p>
                    <p v-if="item.approved_by_name" class="small text-muted mb-1">
                        Aprobó: {{ item.approved_by_name }}
                    </p>
                    <p v-if="item.status === 'RECHAZADA' && item.rejection_reason" class="small mb-1">
                        <strong>Motivo:</strong> {{ item.rejection_reason }}
                    </p>
                    <div class="d-flex flex-wrap gap-2 mt-2">
                        <button v-if="item.status === 'PENDIENTE' && can('fuel_requests.approve')"
                            type="button" class="btn btn-success btn-sm flex-grow-1 touch-target" :disabled="store.loading"
                            @click="aprobar(item)">
                            <i class="fad fa-check me-1" aria-hidden="true" />Aprobar
                        </button>
                        <button v-if="item.status === 'PENDIENTE' && can('fuel_requests.reject')"
                            type="button" class="btn btn-outline-danger btn-sm touch-target" :disabled="store.loading"
                            @click="abrirRechazo(item)">
                            Rechazar
                        </button>
                        <button v-if="['APROBADA', 'USADA', 'VENCIDA'].includes(item.status)"
                            type="button" class="btn btn-primary btn-sm flex-grow-1 touch-target" @click="verQr(item)">
                            <i class="fad fa-qrcode me-1" aria-hidden="true" />Ver QR
                        </button>
                        <button v-if="['PENDIENTE', 'APROBADA'].includes(item.status) && can('fuel_requests.cancel')"
                            type="button" class="btn btn-outline-secondary btn-sm touch-target" :disabled="store.loading"
                            @click="anular(item)">
                            Anular
                        </button>
                    </div>
                </div>
            </div>
            <p v-if="store.total > store.items.length" class="small text-muted text-center mb-0">
                Mostrando las {{ store.items.length }} solicitudes más recientes de {{ store.total }}.
            </p>
        </div>

        <Dialog v-model:visible="showRechazo" modal :draggable="false" header="Rechazar solicitud"
            :style="{ width: '92vw', maxWidth: '460px' }">
            <p class="small text-muted mb-2">
                Indica el motivo. El conductor lo verá en su solicitud.
            </p>
            <label class="form-label fw-medium" for="f-motivo">Motivo del rechazo</label>
            <textarea id="f-motivo" v-model="motivo" class="form-control mb-2" rows="3" maxlength="500"
                :aria-invalid="!!motivoError" aria-describedby="f-motivo-error"
                placeholder="Por ejemplo: vehículo con tanqueo reciente" />
            <p v-if="motivoError" id="f-motivo-error" class="text-danger small mb-2" role="alert">{{ motivoError }}</p>
            <div class="d-flex justify-content-end gap-2 mt-3">
                <button type="button" class="btn btn-falcon-default touch-target" @click="showRechazo = false">Cancelar</button>
                <button type="button" class="btn btn-danger touch-target" :disabled="store.loading" @click="confirmarRechazo">
                    Rechazar solicitud
                </button>
            </div>
        </Dialog>

        <Dialog v-model:visible="showQr" modal :draggable="false" header="QR de tanqueo"
            :style="{ width: '92vw', maxWidth: '760px' }">
            <div v-if="selected" class="row g-3 align-items-start">
                <div v-if="qrLoading" class="col-12 d-flex align-items-center gap-2 text-muted small" role="status">
                    <span class="spinner-border spinner-border-sm" aria-hidden="true" />
                    Generando QR de tanqueo…
                </div>
                <div v-else-if="qrError" class="col-12">
                    <div class="alert alert-warning mb-0 py-2 small d-flex align-items-center justify-content-between gap-2" role="alert">
                        <span>{{ qrError }}</span>
                        <button type="button" class="btn btn-sm btn-outline-warning touch-target" @click="verQr(selected)">Reintentar</button>
                    </div>
                </div>
                <div class="col-12 col-md-5">
                    <div class="border rounded p-2 text-center">
                        <small class="text-muted d-block mb-1">Validación</small>
                        <img v-if="store.qr?.qr_url" :src="store.qr.qr_url" alt="QR de validación de la solicitud"
                            class="img-fluid" style="max-width: 240px;" />
                        <p v-else class="text-muted small mb-0 py-4">QR no disponible</p>
                    </div>
                </div>
                <div class="col-12 col-md-7">
                    <p class="mb-1"><strong>{{ selected.code }}</strong></p>
                    <p class="text-muted small mb-3">{{ meta(selected.status).label }}</p>
                    <dl class="row small mb-0">
                        <dt class="col-5 text-muted">Empresa</dt>
                        <dd class="col-7">{{ selected.snapshot?.empresa?.nombre || '—' }}</dd>
                        <dt class="col-5 text-muted">NIT</dt>
                        <dd class="col-7">{{ selected.snapshot?.empresa?.nit || '—' }}</dd>
                        <dt class="col-5 text-muted">Placa</dt>
                        <dd class="col-7">{{ selected.snapshot?.vehiculo?.placa || selected.vehicle?.vehicle_license_plate || '—' }}</dd>
                        <dt class="col-5 text-muted">Marca</dt>
                        <dd class="col-7">{{ selected.snapshot?.vehiculo?.marca || '—' }}</dd>
                        <dt class="col-5 text-muted">Modelo</dt>
                        <dd class="col-7">{{ selected.snapshot?.vehiculo?.modelo || '—' }}</dd>
                        <dt class="col-5 text-muted">Clase</dt>
                        <dd class="col-7">{{ selected.snapshot?.vehiculo?.clase || '—' }}</dd>
                        <dt class="col-5 text-muted">Solicita</dt>
                        <dd class="col-7">{{ selected.snapshot?.conductor || nombreConductor(selected) }}</dd>
                        <dt class="col-5 text-muted">Aprueba</dt>
                        <dd class="col-7">{{ selected.snapshot?.aprobador || selected.approved_by_name || '—' }}</dd>
                        <dt class="col-5 text-muted">Vigencia</dt>
                        <dd class="col-7">{{ selected.snapshot?.vigencia || fechaHora(selected.expires_at) }}</dd>
                    </dl>
                </div>
                <div class="col-12">
                    <div class="border rounded p-2 text-center">
                        <small class="text-muted d-block mb-1">QR con datos (sin internet)</small>
                        <img v-if="store.qr?.qr_data" :src="store.qr.qr_data" alt="QR con datos de la solicitud"
                            class="img-fluid" style="max-width: 230px;" />
                        <p v-else class="text-muted small mb-0 py-3">QR no disponible</p>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import Dialog from 'primevue/dialog';
import { toast } from '@/utils/toast.js';
import { confirmar } from '@/utils/dialogs.js';
import { extractStoreErrorMessage } from '@store/helpers/runStoreAction.js';
import { useFuelRequestsStore } from '../store/fuelRequests.store.js';
import { usePermissionsStore } from '@store';
import dateUtils from '@/utils/date.js';

const store = useFuelRequestsStore();
const permissionsStore = usePermissionsStore();
const can = (action) => permissionsStore.can(action);

const vehicleUuid = ref('');
const notes = ref('');
const createError = ref('');

const showRechazo = ref(false);
const itemRechazo = ref(null);
const motivo = ref('');
const motivoError = ref('');

const showQr = ref(false);
const selected = ref(null);
const qrLoading = ref(false);
const qrError = ref('');

const META = {
    PENDIENTE: { label: 'Pendiente', color: 'warning', icon: 'fa-clock' },
    APROBADA: { label: 'Aprobada', color: 'success', icon: 'fa-check-circle' },
    USADA: { label: 'Usada', color: 'info', icon: 'fa-gas-pump' },
    RECHAZADA: { label: 'Rechazada', color: 'danger', icon: 'fa-times-circle' },
    VENCIDA: { label: 'Vencida', color: 'danger', icon: 'fa-hourglass-end' },
    ANULADA: { label: 'Anulada', color: 'secondary', icon: 'fa-ban' },
};
const DESCONOCIDO = { label: 'Estado no disponible', color: 'secondary', icon: 'fa-question-circle' };
const meta = (status) => META[status] ?? DESCONOCIDO;

const nombreConductor = (item) => {
    const d = item.driver;
    if (!d) return item.snapshot?.conductor || '—';
    return d.company_name || [d.first_name, d.last_name].filter(Boolean).join(' ') || '—';
};
const fecha = (v) => (v ? dateUtils.format(String(v).substring(0, 10)) : '—');
const fechaHora = (v) => {
    if (!v) return '—';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString('es-CO');
};

const refresh = () => store.fetchItems();

const avisarSiValidacion = async (error) => {
    if (error?.response?.status === 422) {
        await toast('No se pudo completar', store.error || 'Revisa los datos e inténtalo de nuevo.', 'warning');
    }
};

const crear = async () => {
    createError.value = '';
    if (!vehicleUuid.value) {
        createError.value = 'Selecciona el vehículo para la solicitud.';
        return;
    }
    try {
        await store.crear(vehicleUuid.value, notes.value.trim() || null);
        vehicleUuid.value = '';
        notes.value = '';
        await toast('Solicitud enviada', 'Queda pendiente de aprobación por la empresa.', 'success');
    } catch (error) {
        createError.value = extractStoreErrorMessage(error, 'No se pudo enviar la solicitud.');
    }
};

const aprobar = async (item) => {
    if (!await confirmar({
        titulo: '¿Aprobar esta solicitud de tanqueo?',
        texto: 'El conductor podrá mostrar el QR en la estación.',
        confirmar: 'Sí, aprobar',
    })) return;
    try {
        await store.aprobar(item.uuid);
        await toast('Solicitud aprobada', 'El conductor ya puede mostrar el QR.', 'success');
    } catch (error) {
        await avisarSiValidacion(error);
    }
};

const abrirRechazo = (item) => {
    itemRechazo.value = item;
    motivo.value = '';
    motivoError.value = '';
    showRechazo.value = true;
};

const confirmarRechazo = async () => {
    const texto = motivo.value.trim();
    if (!texto) {
        motivoError.value = 'Escribe el motivo del rechazo.';
        return;
    }
    if (!itemRechazo.value) return;
    try {
        await store.rechazar(itemRechazo.value.uuid, texto);
        showRechazo.value = false;
        await toast('Solicitud rechazada', 'El motivo quedó registrado para el conductor.', 'success');
    } catch (error) {
        motivoError.value = extractStoreErrorMessage(error, 'No se pudo rechazar la solicitud.');
        await avisarSiValidacion(error);
    }
};

const anular = async (item) => {
    if (!await confirmar({
        titulo: '¿Anular esta solicitud de tanqueo?',
        texto: 'El QR dejará de ser válido.',
        confirmar: 'Sí, anular',
        peligro: true,
    })) return;
    try {
        await store.anular(item.uuid);
        await toast('Solicitud anulada', 'La solicitud ya no es válida.', 'success');
    } catch (error) {
        await avisarSiValidacion(error);
    }
};

const verQr = async (item) => {
    selected.value = item;
    store.qr = null;
    qrError.value = '';
    showQr.value = true;
    qrLoading.value = true;
    try {
        const qr = await store.cargarQr(item.uuid);
        if (!qr) {
            qrError.value = 'La respuesta del servidor no trae el QR. Inténtalo de nuevo.';
        }
    } catch (error) {
        qrError.value = extractStoreErrorMessage(error, 'No se pudo generar el QR. La solicitud debe estar aprobada y vigente.');
    } finally {
        qrLoading.value = false;
    }
};

onMounted(() => {
    Promise.allSettled([store.fetchItems(), store.fetchVehiculos()]);
});
</script>

<style scoped>
.touch-target {
    min-height: 48px;
}
</style>
