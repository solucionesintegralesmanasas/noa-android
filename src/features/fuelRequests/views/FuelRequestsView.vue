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

        <div class="card border-0 shadow-sm mb-3">
            <div class="card-body">
                <label class="form-label fw-medium" for="vehiculo">Vehículo</label>
                <select id="vehiculo" v-model="vehicleUuid" class="form-select mb-2">
                    <option value="">Selecciona un vehículo</option>
                    <option v-for="v in store.vehiculos" :key="v.uuid" :value="v.uuid">
                        {{ v.vehicle_license_plate }}{{ v.internal_number ? ` (${v.internal_number})` : '' }}
                    </option>
                </select>
                <label class="form-label fw-medium" for="notes">Observaciones (opcional)</label>
                <textarea id="notes" v-model="notes" class="form-control mb-3" rows="2" maxlength="500" />
                <button type="button" class="btn btn-primary w-100 py-2" :disabled="store.loading || !vehicleUuid"
                    @click="solicitar">
                    <i class="fad fa-paper-plane me-1" aria-hidden="true" />Solicitar tanqueo
                </button>
                <p v-if="!store.vehiculos.length" class="text-warning small mb-0 mt-2">
                    No tienes vehículos asignados para solicitar tanqueo.
                </p>
            </div>
        </div>

        <div v-if="store.loading" class="text-center text-muted py-4">
            <i class="fad fa-spinner fa-spin me-2" aria-hidden="true" />Cargando...
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
                            {{ meta(item.status).label }}
                        </span>
                    </div>
                    <p class="small text-muted mb-1 mt-2">
                        Solicitud: {{ dateUtils.format(String(item.requested_at).substring(0, 10)) }}
                    </p>
                    <p v-if="item.approved_by_name" class="small text-muted mb-1">
                        Aprobó: {{ item.approved_by_name }}
                    </p>
                    <div class="d-flex gap-2 mt-2">
                        <button v-if="['PENDIENTE'].includes(item.status) && can('fuel_requests.approve')"
                            type="button" class="btn btn-success btn-sm flex-grow-1" :disabled="store.loading"
                            @click="aprobar(item)">
                            <i class="fad fa-check me-1" aria-hidden="true" />Aprobar
                        </button>
                        <button v-if="['PENDIENTE'].includes(item.status) && can('fuel_requests.reject')"
                            type="button" class="btn btn-outline-danger btn-sm" :disabled="store.loading"
                            @click="rechazar(item)">
                            Rechazar
                        </button>
                        <button v-if="['APROBADA', 'USADA', 'VENCIDA'].includes(item.status)"
                            type="button" class="btn btn-primary btn-sm flex-grow-1" @click="verQr(item)">
                            <i class="fad fa-qrcode me-1" aria-hidden="true" />Ver QR
                        </button>
                        <button v-if="['PENDIENTE', 'APROBADA'].includes(item.status) && can('fuel_requests.cancel')"
                            type="button" class="btn btn-outline-secondary btn-sm" :disabled="store.loading"
                            @click="anular(item)">
                            Anular
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="showQr" modal :draggable="false" :style="{ width: '92vw', maxWidth: '460px' }"
            header="QR de tanqueo">
            <div v-if="selected" class="text-center">
                <p class="fw-bold mb-1">{{ selected.code }}</p>
                <p class="text-muted small">{{ meta(selected.status).label }}</p>
                <img v-if="qr?.qr_url" :src="qr.qr_url" alt="QR de validación" class="img-fluid mb-2"
                    style="max-width: 240px;" />
                <div class="small text-start mb-2">
                    <p class="mb-1"><strong>Placa:</strong> {{ datosVehiculo.placa }}</p>
                    <p class="mb-1"><strong>Marca:</strong> {{ datosVehiculo.marca }}</p>
                    <p class="mb-1"><strong>Modelo:</strong> {{ datosVehiculo.modelo }}</p>
                    <p class="mb-1"><strong>Clase:</strong> {{ datosVehiculo.clase }}</p>
                    <p class="mb-1"><strong>Solicita:</strong> {{ selected.snapshot?.conductor || '—' }}</p>
                    <p class="mb-1"><strong>Aprueba:</strong> {{ selected.snapshot?.aprobador || selected.approved_by_name || '—' }}</p>
                    <p class="mb-1"><strong>Vigencia:</strong> {{ selected.snapshot?.vigencia || '—' }}</p>
                </div>
                <img v-if="qr?.qr_data" :src="qr.qr_data" alt="QR con datos" class="img-fluid mb-2"
                    style="max-width: 230px;" />
                <small class="text-muted d-block">QR con datos (sin internet)</small>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import Dialog from 'primevue/dialog';
import { toast } from '@/utils/toast.js';
import { confirmar } from '@/utils/dialogs.js';
import { useFuelRequestsStore } from '../store/fuelRequests.store.js';
import { usePermissionsStore } from '@store';
import dateUtils from '@/utils/date.js';

const store = useFuelRequestsStore();
const permissionsStore = usePermissionsStore();
const can = (action) => permissionsStore.can(action);
const vehicleUuid = ref('');
const notes = ref('');
const showQr = ref(false);
const selected = ref(null);
const qr = ref(null);

const META = {
    PENDIENTE: { label: 'Pendiente', color: 'warning' },
    APROBADA: { label: 'Aprobada', color: 'success' },
    USADA: { label: 'Usada', color: 'info' },
    RECHAZADA: { label: 'Rechazada', color: 'danger' },
    VENCIDA: { label: 'Vencida', color: 'danger' },
    ANULADA: { label: 'Anulada', color: 'secondary' },
};
const meta = (status) => META[status] ?? META.ANULADA;

const datosVehiculo = computed(() => ({
    placa: selected.value?.snapshot?.vehiculo?.placa || selected.value?.vehicle?.vehicle_license_plate || '—',
    marca: selected.value?.snapshot?.vehiculo?.marca || '—',
    modelo: selected.value?.snapshot?.vehiculo?.modelo || '—',
    clase: selected.value?.snapshot?.vehiculo?.clase || '—',
}));

const refresh = async () => {
    await store.fetchItems();
};

const solicitar = async () => {
    if (!vehicleUuid.value) return;
    try {
        await store.crear(vehicleUuid.value, notes.value || null);
        vehicleUuid.value = '';
        notes.value = '';
        await toast('Solicitud enviada', 'Queda pendiente de aprobación por la empresa.', 'success');
    } catch {
        // El store ya muestra el error.
    }
};

const verQr = async (item) => {
    selected.value = item;
    qr.value = null;
    showQr.value = true;
    try {
        qr.value = await store.cargarQr(item.uuid);
    } catch {
        await toast('Aviso', 'No se pudo cargar el QR.', 'warning');
    }
};

const anular = async (item) => {
    const confirmado = await confirmar({
        titulo: '¿Anular esta solicitud de tanqueo?',
        texto: 'El QR dejará de ser válido.',
        confirmar: 'Sí, anular',
        peligro: true,
    });
    if (!confirmado) return;
    try {
        await store.anular(item.uuid);
        await toast('Solicitud anulada', 'La solicitud ya no es válida.', 'success');
    } catch {
        // El store ya muestra el error.
    }
};

const aprobar = async (item) => {
    const confirmado = await confirmar({
        titulo: '¿Aprobar esta solicitud de tanqueo?',
        texto: 'El conductor podrá mostrar el QR en la estación.',
        confirmar: 'Sí, aprobar',
    });
    if (!confirmado) return;
    try {
        await store.aprobar(item.uuid);
        await toast('Solicitud aprobada', 'El conductor ya puede mostrar el QR.', 'success');
    } catch {
        // El store ya muestra el error.
    }
};

const rechazar = async (item) => {
    const confirmado = await confirmar({
        titulo: '¿Rechazar esta solicitud de tanqueo?',
        texto: 'El conductor verá la solicitud rechazada.',
        confirmar: 'Sí, rechazar',
        peligro: true,
    });
    if (!confirmado) return;
    try {
        await store.rechazar(item.uuid, null);
        await toast('Solicitud rechazada', 'La solicitud fue rechazada.', 'success');
    } catch {
        // El store ya muestra el error.
    }
};

onMounted(async () => {
    await Promise.all([store.fetchItems(), store.fetchVehiculos()]);
});
</script>
