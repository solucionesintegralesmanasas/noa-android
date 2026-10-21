<template>
    <div class="card border-0 shadow-sm">
        <div class="card-header bg-light py-2 px-3 border-bottom">
            <div class="d-flex align-items-center gap-2">
                <i class="fad fa-gas-pump text-primary" aria-hidden="true"></i>
                <h6 class="mb-0 fw-medium">Registro de Combustible</h6>
                <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                    <i class="fad fa-asterisk me-1" style="font-size: 0.5rem;" aria-hidden="true"></i>Campos obligatorios
                </span>
            </div>
        </div>

        <div class="card-body">
            <form class="row g-3" novalidate @submit.prevent="handleSubmit">
                <!-- Identificación -->
                <div class="col-12 col-sm-6 col-md-4">
                    <label class="form-label required" for="f-vehicle_uuid">Vehículo</label>
                    <PrimeSelect :input-id="'f-vehicle_uuid'" v-model="form.vehicle_uuid" :options="vehicleOptions"
                        option-label="label" option-value="value" placeholder="Buscar por placa..." filter
                        class="w-100" :invalid="!!errors.vehicle_uuid" />
                    <div v-if="errors.vehicle_uuid" id="f-vehicle_uuid-error" class="invalid-feedback d-block" role="alert">
                        {{ errors.vehicle_uuid }}
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-md-4">
                    <label class="form-label required" for="f-date">Fecha</label>
                    <input id="f-date" v-model="form.date" type="date" class="form-control"
                        :class="{ 'is-invalid': errors.date }" :aria-invalid="!!errors.date"
                        :aria-describedby="errors.date ? 'f-date-error' : undefined" />
                    <div v-if="errors.date" id="f-date-error" class="invalid-feedback d-block" role="alert">{{ errors.date }}</div>
                </div>

                <div class="col-12 col-sm-6 col-md-4">
                    <label class="form-label" for="f-driver_uuid">Conductor</label>
                    <PrimeSelect :input-id="'f-driver_uuid'" v-model="form.driver_uuid" :options="driverOptions"
                        option-label="label" option-value="value" placeholder="Buscar conductor..." filter showClear
                        class="w-100" />
                </div>

                <div class="col-12 col-sm-6 col-md-4">
                    <label class="form-label" for="f-engine_displacement">Cilindraje (vehículo)</label>
                    <input id="f-engine_displacement" :value="meta.engine_displacement || '—'" type="text"
                        class="form-control" readonly tabindex="-1" aria-readonly="true" />
                </div>

                <div class="col-12 col-sm-6 col-md-4">
                    <label class="form-label" for="f-fuel_type">Combustible</label>
                    <input id="f-fuel_type" :value="meta.fuel_type || '—'" type="text" class="form-control"
                        readonly tabindex="-1" aria-readonly="true" />
                </div>

                <!-- Tanqueo -->
                <div class="col-12 mt-3">
                    <h6 class="text-muted fw-medium mb-0 pb-2 border-bottom" style="font-size: 0.9rem;">
                        <i class="fad fa-dollar-sign me-2" aria-hidden="true"></i>Tanqueo
                    </h6>
                </div>

                <div class="col-12 col-sm-6 col-md-4">
                    <label class="form-label required" for="f-total_spent">Total Tanqueo ($COP)</label>
                    <div class="input-group">
                        <span class="input-group-text">$</span>
                        <input id="f-total_spent" v-model.number="form.total_spent" type="number" min="0" step="0.01"
                            class="form-control" :class="{ 'is-invalid': errors.total_spent }"
                            :aria-invalid="!!errors.total_spent" autocomplete="off" />
                    </div>
                    <div v-if="errors.total_spent" class="invalid-feedback d-block" role="alert">{{ errors.total_spent }}</div>
                </div>

                <div class="col-12 col-sm-6 col-md-4">
                    <label class="form-label" for="f-fuel_price_per_gallon">
                        Valor por Galón ($COP)
                        <span v-if="sinTanqueo" class="badge bg-secondary bg-opacity-10 text-secondary ms-1">No aplica</span>
                    </label>
                    <div class="input-group">
                        <span class="input-group-text">$</span>
                        <input id="f-fuel_price_per_gallon" v-model.number="form.fuel_price_per_gallon" type="number"
                            min="0" step="0.01" class="form-control" :disabled="sinTanqueo"
                            :class="{ 'is-invalid': errors.fuel_price_per_gallon }"
                            :aria-invalid="!!errors.fuel_price_per_gallon" autocomplete="off" />
                    </div>
                    <div v-if="errors.fuel_price_per_gallon" class="invalid-feedback d-block" role="alert">{{ errors.fuel_price_per_gallon }}</div>
                </div>

                <div class="col-12 col-sm-6 col-md-4">
                    <label class="form-label" for="f-gallons_pumped">Galones Ingresados</label>
                    <input id="f-gallons_pumped" :value="gallonsPumped" type="text" class="form-control"
                        readonly tabindex="-1" aria-readonly="true" />
                </div>

                <div class="col-12 col-sm-6 col-md-4">
                    <label class="form-label" for="f-average_performance">Rendimiento para el cálculo (km/gal)</label>
                    <input id="f-average_performance" v-model.number="rendimientoInput" type="number" min="0"
                        step="0.01" class="form-control" autocomplete="off" @input="rendimientoTocado = true" />
                    <div class="form-text">
                        Se completa con el rendimiento real del vehículo o, si no hay histórico, con la tabla por
                        cilindraje. Puede ajustarlo.
                    </div>
                </div>

                <!-- Alcance estimado en km -->
                <div class="col-12">
                    <div class="card border-success border-opacity-25 bg-success bg-opacity-10">
                        <div class="card-body py-3">
                            <div v-if="sinRendimiento" class="d-flex align-items-start gap-2">
                                <i class="fas fa-info-circle text-secondary mt-1" aria-hidden="true"></i>
                                <div>
                                    <h6 class="mb-1 text-secondary">Alcance sin calcular</h6>
                                    <small class="text-muted">
                                        Aún no hay un rendimiento (km/gal) calculable para este vehículo.
                                        Escriba el rendimiento para estimar cuántos km alcanzan los galones ingresados.
                                    </small>
                                </div>
                            </div>
                            <template v-else>
                                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                                    <div>
                                        <h6 class="mb-1 text-success">
                                            <i class="fad fa-road me-2" aria-hidden="true"></i>
                                            Alcance estimado de los galones ingresados
                                        </h6>
                                        <small class="text-muted">
                                            Galones ingresados × rendimiento aplicado
                                            (<strong>{{ rendimientoAplicado.toFixed(2) }} km/gal</strong> ·
                                            {{ origenRendimientoTexto }})
                                        </small>
                                    </div>
                                    <div class="text-end">
                                        <div class="fs-4 fw-bold text-success">
                                            {{ alcanceGalones ?? '—' }} <small class="fs-6">km</small>
                                        </div>
                                        <small class="text-muted">desde el tanqueo</small>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Rendimiento y costo del kilometraje -->
                <div class="col-12 mt-3">
                    <div class="card border-info border-opacity-25 bg-info bg-opacity-10">
                        <div class="card-body py-3">
                            <div class="row g-3">
                                <div class="col-12 col-sm-6">
                                    <label class="form-label fw-semibold" for="f-rendimiento">Rendimiento</label>
                                    <input id="f-rendimiento" :value="rendimientoTotal ?? '—'" type="text"
                                        class="form-control" readonly tabindex="-1" aria-readonly="true" />
                                    <div class="form-text">Total Tanqueo ÷ Rendimiento (km/gal)</div>
                                </div>
                                <div class="col-12 col-sm-6">
                                    <label class="form-label fw-semibold" for="f-cost_per_km">Costo del kilometraje ($COP)</label>
                                    <input id="f-cost_per_km" :value="costPerKm" type="text" class="form-control"
                                        readonly tabindex="-1" aria-readonly="true" />
                                    <div class="form-text">Precio por galón ÷ Rendimiento (km/gal)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Acciones -->
                <div class="col-12 mt-3 d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-falcon-default" :disabled="submitting" @click="$emit('cancel')">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary" :disabled="submitting">
                        <span v-if="submitting" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                        <i v-else class="fas fa-save me-1" aria-hidden="true"></i>
                        {{ submitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Guardar') }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { toast } from '@/utils/toast.js';
import { useFuelManagementStore } from '../store/fuelManagement.store.js';
import PrimeSelect from 'primevue/select';

const props = defineProps({
    /** Registro existente para modo edición (opcional). */
    fuelLog: { type: Object, default: null },
    isEdit: { type: Boolean, default: false },
});

const emit = defineEmits(['saved', 'cancel']);

const store = useFuelManagementStore();

const catalogs = computed(() => store.catalogs);

/** Opciones del selector de vehículo (con búsqueda por placa/número interno). */
const vehicleOptions = computed(() => (catalogs.value.vehicles || []).map((v) => ({
    label: `${v.vehicle_license_plate ?? 'Sin placa'}${v.internal_number ? ` (${v.internal_number})` : ''}`,
    value: v.uuid,
})));

/** Solo conductores: el servicio ya filtra con `type=is_driver`. */
const driverOptions = computed(() => (catalogs.value.thirdParties || []).map((t) => ({
    label: [t.first_name, t.last_name].filter(Boolean).join(' ')
        || t.company_name
        || t.document_number
        || 'Conductor',
    value: t.uuid,
})));

const form = reactive({
    vehicle_uuid: '',
    driver_uuid: '',
    date: new Date().toISOString().substring(0, 10),
    total_spent: 0,
    fuel_price_per_gallon: 0,
});

const errors = reactive({});
const submitting = computed(() => store.loading);

/** Rendimiento (km/gal) para el cálculo del alcance y si el usuario lo modificó. */
const rendimientoInput = ref(null);
const rendimientoTocado = ref(false);

/** Datos del vehículo: en edición usa el snapshot guardado; si no, el contexto del backend. */
const meta = computed(() => {
    if (props.isEdit && props.fuelLog) {
        return {
            engine_displacement: props.fuelLog.engine_displacement,
            fuel_type: props.fuelLog.fuel_type,
            displacement_liters: Number(props.fuelLog.displacement_liters || 0),
            idle_factor: Number(props.fuelLog.idle_factor || 0),
        };
    }
    const ctx = store.context || {};
    return {
        engine_displacement: ctx.engine_displacement,
        fuel_type: ctx.fuel_type,
        displacement_liters: Number(ctx.displacement_liters || 0),
        idle_factor: Number(ctx.idle_factor || 0),
    };
});

// Cálculos reactivos (espejo del backend)

const sinTanqueo = computed(() => (Number(form.total_spent) || 0) === 0);

const gallonsPumped = computed(() => {
    const price = Number(form.fuel_price_per_gallon) || 0;
    if (price <= 0) return '0.00';
    return (Number(form.total_spent) / price).toFixed(2);
});

/** Costo del kilometraje: precio por galón ÷ rendimiento (km/gal). */
const costPerKm = computed(() => {
    const rendimiento = Number(rendimientoInput.value || 0);
    if (rendimiento > 0) {
        return (Number(form.fuel_price_per_gallon) / rendimiento).toFixed(2);
    }
    return '0.00';
});

/** Rendimiento del registro: Total Tanqueo ÷ Rendimiento (km/gal). */
const rendimientoTotal = computed(() => {
    const rendimiento = Number(rendimientoInput.value || 0);
    if (rendimiento <= 0) return null;
    return (Number(form.total_spent) / rendimiento).toFixed(2);
});

/** Rendimiento (km/gal) con el que se estima el alcance: del registro o histórico real. */
const rendimientoAplicado = computed(() => Number(rendimientoInput.value || 0));

const origenRendimiento = computed(() => {
    if (rendimientoTocado.value) return 'manual';
    if (props.isEdit && props.fuelLog) {
        return props.fuelLog.performance_source || '';
    }
    return store.context?.performance_source || '';
});

/** No hay rendimiento calculable: ni odómetros ni histórico real. */
const sinRendimiento = computed(() => rendimientoAplicado.value <= 0);

const origenRendimientoTexto = computed(() => {
    switch (origenRendimiento.value) {
        case 'registro': return 'rendimiento del registro';
        case 'historico': return 'promedio histórico';
        case 'cilindraje': return 'estimado por cilindraje (tabla)';
        case 'manual': return 'valor manual';
        case 'sin_dato': return 'sin dato calculado';
        default: return 'sin dato calculado';
    }
});

/** km que alcanzan los galones ingresados: galones × km/gal. */
const alcanceGalones = computed(() => {
    const galones = parseFloat(gallonsPumped.value);
    if (galones <= 0 || rendimientoAplicado.value <= 0) return null;
    return (galones * rendimientoAplicado.value).toFixed(2);
});

// Precarga del contexto al cambiar vehículo/fecha

watch(
    () => [form.vehicle_uuid, form.date],
    async ([vehicleUuid, date]) => {
        if (!vehicleUuid || props.isEdit) return;
        const ctx = await store.loadContext(vehicleUuid, date);
        if (!ctx) return;
        if (!rendimientoTocado.value) {
            const calculado = Number(ctx.average_performance ?? 0);
            rendimientoInput.value = calculado > 0 ? calculado : null;
        }
    }
);

// Carga inicial (edición)

watch(
    () => props.fuelLog,
    (item) => {
        if (!item) return;
        form.vehicle_uuid = item.vehicle_uuid ?? '';
        form.driver_uuid = item.driver_uuid ?? '';
        form.date = (item.date ?? '').substring(0, 10);
        form.total_spent = Number(item.total_spent ?? 0);
        form.fuel_price_per_gallon = Number(item.fuel_price_per_gallon ?? 0);
        const rendimiento = Number(item.average_performance ?? 0);
        rendimientoInput.value = rendimiento > 0 ? rendimiento : null;
        rendimientoTocado.value = false;
    },
    { immediate: true }
);

// Validación

function isEmpty(v) {
    return v === null || v === undefined || (typeof v === 'string' ? v.trim() === '' : false);
}

function validate() {
    Object.keys(errors).forEach((k) => delete errors[k]);

    if (isEmpty(form.vehicle_uuid)) errors.vehicle_uuid = 'Este campo es obligatorio';
    if (isEmpty(form.date)) errors.date = 'Este campo es obligatorio';
    if (isEmpty(form.total_spent)) errors.total_spent = 'Este campo es obligatorio';

    if (!sinTanqueo.value && (Number(form.fuel_price_per_gallon) || 0) <= 0) {
        errors.fuel_price_per_gallon = 'Indique el valor por galón para calcular los galones';
    }

    return Object.keys(errors).length === 0;
}

async function handleSubmit() {
    if (!validate()) {
        await toast('Atención', 'Revisa los campos obligatorios', 'warning');
        const firstError = document.querySelector('.is-invalid');
        firstError?.focus?.({ preventScroll: true });
        return;
    }

    const payload = {
        vehicle_uuid: form.vehicle_uuid,
        driver_uuid: form.driver_uuid || null,
        date: form.date,
        total_spent: Number(form.total_spent) || 0,
        fuel_price_per_gallon: sinTanqueo.value ? 0 : Number(form.fuel_price_per_gallon),
    };

    // Solo se envía si el usuario cambió el rendimiento; si no, el backend lo calcula.
    if (rendimientoTocado.value) {
        payload.average_performance = Number(rendimientoInput.value) > 0 ? Number(rendimientoInput.value) : null;
    }

    try {
        const saved = props.isEdit && props.fuelLog?.uuid
            ? await store.updateItem(props.fuelLog.uuid, payload)
            : await store.createItem(payload);
        emit('saved', saved);
    } catch {
        // El store ya notifica el error.
    }
}

defineExpose({ form });
</script>

<style scoped>
.required::after {
    content: " *";
    color: #dc3545;
    font-weight: 600;
}
</style>
