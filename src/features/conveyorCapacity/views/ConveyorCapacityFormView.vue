<template>
    <div class="row gx-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader
                :title="pageTitle"
                :subtitle="pageSubtitle"
                icon="fad fa-truck-loading text-primary"
                :breadcrumbs="breadcrumbs"
                :show-back="true"
                @back="goBack"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-edit text-primary"></i>
                        <h5 class="mb-0 fw-medium">Información General</h5>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Campos
                            obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body">
                                                                                <form @submit.prevent="handleSubmit" class="row g-3" novalidate>
                        
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="enabling_resolution_uuid">Resolución
                                    Habilitante</label>
                                <PrimeSelect :input-id="'f-enabling_resolution_uuid'" v-model="formData.enabling_resolution_uuid"
                                    :options="store.catalogs.enabling_resolutions" option-value="uuid" option-label="resolution_number"
                                    placeholder="Seleccione una resolución..." showClear filter class="w-100"
                                    :invalid="!!validationErrors.enabling_resolution_uuid" />
                                <div v-if="validationErrors.enabling_resolution_uuid" class="invalid-feedback d-block" id="f-enabling_resolution_uuid-error" role="alert">
                                    {{ validationErrors.enabling_resolution_uuid }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="vehicle_type">
                                    Tipo de Vehículo
                                </label>
                                <input id="vehicle_type" v-model="formData.vehicle_type" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.vehicle_type }" type="text" autocomplete="off"
                                    placeholder="Ej: Camión Doble Troque" maxlength="20" />
                                <div v-if="validationErrors.vehicle_type" class="invalid-feedback d-block" id="f-vehicle_type-error" role="alert">
                                    {{ validationErrors.vehicle_type }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="statusSelect">
                                    Estado de Habilitación
                                </label>
                                <PrimeSelect :input-id="'f-status'" v-model="formData.status"
                                    :options="[{ label: 'Habilitado', value: '1' }, { label: 'Deshabilitado', value: '0' }]"
                                    option-label="label" option-value="value" class="w-100"
                                    :invalid="!!validationErrors.status" />
                                <div v-if="validationErrors.status" class="invalid-feedback d-block" id="f-status-error" role="alert">
                                    {{ validationErrors.status }}
                                </div>
                            </div>
                        

                        
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="authorized_capacity">
                                    Capacidad Autorizada
                                </label>
                                <input id="authorized_capacity" v-model.number="formData.authorized_capacity"
                                    class="form-control" :class="{ 'is-invalid': validationErrors.authorized_capacity }"
                                    type="number" placeholder="0" min="0" />
                                <div v-if="validationErrors.authorized_capacity" class="invalid-feedback d-block" id="f-authorized_capacity-error" role="alert">
                                    {{ validationErrors.authorized_capacity }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="current_capacity">
                                    Capacidad Operativa Actual
                                </label>
                                <input id="current_capacity" v-model.number="formData.current_capacity"
                                    class="form-control" :class="{ 'is-invalid': validationErrors.current_capacity }"
                                    type="number" placeholder="0" min="0" />
                                <div v-if="validationErrors.current_capacity" class="invalid-feedback d-block" id="f-current_capacity-error" role="alert">
                                    {{ validationErrors.current_capacity }}
                                </div>
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                <label class="form-label required" for="minimum_own_capacity">
                                    Capacidad Mínima Propia
                                </label>
                                <input id="minimum_own_capacity" v-model.number="formData.minimum_own_capacity"
                                    class="form-control"
                                    :class="{ 'is-invalid': validationErrors.minimum_own_capacity }" type="number"
                                    placeholder="0" min="0" />
                                <div v-if="validationErrors.minimum_own_capacity" class="invalid-feedback d-block" id="f-minimum_own_capacity-error" role="alert">
                                    {{ validationErrors.minimum_own_capacity }}
                                </div>
                            </div>
                        

                        <div class="col-12">
                        <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" /><!-- BOTONES -->
                        </div>
                        </form>
                </div>
            </div>

            <div class="card border-0 shadow-sm mt-3 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body py-3">
                    <div class="d-flex align-items-start gap-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-lightbulb text-primary fs-5"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <ul class="text-muted small mb-0 ps-3">
                                <li>
                                    La <strong>Capacidad Autorizada</strong> es el límite máximo de carga o pasajeros
                                    que la autoridad de tránsito permite operar bajo una resolución específica.
                                </li>
                                <li>
                                    La <strong>Capacidad Mínima Propia</strong> es un requisito legal para ciertas
                                    categorías de transporte; asegúrate de que este valor cumwith la normativa vigente
                                    para el tipo de vehículo registrado.
                                </li>
                                <li>
                                    Mantener la <strong>Capacidad Operativa Actual</strong> actualizada es crucial para
                                    la generación precisa de manifiestos de carga y FUECs. Una discrepancia puede
                                    generar observaciones en auditorías.
                                </li>
                                <li>
                                    Si cambias la resolución habilitante, verifica que el nuevo documento esté vigente y
                                    permita el tipo de vehículo que estás registrando.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { toast } from '@/utils/toast.js';
/**
 * @file ConveyorCapacityFormView.vue
 * @description Vista de formulario (crear/editar) del módulo de Capacidad de Transporte.
 * Gestiona la carga de catálogos, validación manual y persistencia de datos.
 * @module conveyorCapacity/FormView
 */

import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useConveyorCapacityStore } from '../store/conveyorCapacity.store.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import PrimeSelect from 'primevue/select';
import BaseFormActions from '@/components/BaseFormActions.vue';

/** @type {import('vue-router').Route} Ruta activa */
const route = useRoute();

/** @type {import('vue-router').Router} Instancia del router */
const router = useRouter();

/** @type {import('pinia').Store} Store del módulo */
const store = useConveyorCapacityStore();

/**
 * Indica si el formulario está en modo edición.
 * @type {import('vue').ComputedRef<boolean>}
 */
const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Capacidad de Transporte' : 'Registrar Capacidad de Transporte');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica los datos de la capacidad de transporte autorizada' : 'Completa los datos para registrar una nueva capacidad de transporte asociada a una resolución habilitante');
const breadcrumbs = computed(() => [ { label: 'Capacidad de Transporte', to: '/empresas/capacidad-transportadora', }, { label: isEditMode.value ? 'Editar' : 'Nuevo' }, ]);


/** @type {import('vue').Ref<boolean>} Indicador de carga inicial */
const isViewLoading = ref(true);

/** @type {import('vue').Ref<boolean>} Indicador de envío en progreso */
const submitting = ref(false);

/** @type {import('vue').Reactive<Object>} Errores de validación por campo */
const validationErrors = reactive({});

/**
 * Estado reactivo del formulario.
 * @type {import('vue').Reactive<Object>}
 * @property {string} enabling_resolution_uuid - UUID de la resolución habilitante.
 * @property {string} vehicle_type - Tipo o categoría de vehículo.
 * @property {number} authorized_capacity - Capacidad máxima autorizada.
 * @property {number} current_capacity - Capacidad operativa actual.
 * @property {number} minimum_own_capacity - Capacidad mínima propia exigida.
 * @property {string} status - Estado de habilitación ('1' o '0').
 */
const formData = reactive({
    enabling_resolution_uuid: '',
    vehicle_type: '',
    authorized_capacity: 0,
    current_capacity: 0,
    minimum_own_capacity: 0,
    status: '1',
});

/**
 * Valida los campos obligatorios del formulario.
 * Para campos numéricos usa comparación explícita contra '', null y undefined.
 * @returns {boolean} True si el formulario es válido.
 */
const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    if (!formData.enabling_resolution_uuid || formData.enabling_resolution_uuid === '' || formData.enabling_resolution_uuid === null || formData.enabling_resolution_uuid === undefined) {
        validationErrors.enabling_resolution_uuid = 'Debe seleccionar una resolución habilitante';
    }

    if (!formData.vehicle_type || formData.vehicle_type.trim() === '') {
        validationErrors.vehicle_type = 'El tipo de vehículo es obligatorio';
    }

    if (formData.authorized_capacity === '' || formData.authorized_capacity === null || formData.authorized_capacity === undefined || formData.authorized_capacity < 0) {
        validationErrors.authorized_capacity = 'La capacidad autorizada es obligatoria y debe ser mayor o igual a 0';
    }

    if (formData.current_capacity === '' || formData.current_capacity === null || formData.current_capacity === undefined || formData.current_capacity < 0) {
        validationErrors.current_capacity = 'La capacidad operativa actual es obligatoria y debe ser mayor o igual a 0';
    }

    if (formData.minimum_own_capacity === '' || formData.minimum_own_capacity === null || formData.minimum_own_capacity === undefined || formData.minimum_own_capacity < 0) {
        validationErrors.minimum_own_capacity = 'La capacidad mínima propia es obligatoria y debe ser mayor o igual a 0';
    }

    if (formData.status === '' || formData.status === null || formData.status === undefined) {
        validationErrors.status = 'Debe seleccionar un estado';
    }

    return Object.keys(validationErrors).length === 0;
};

/**
 * Navega de regreso al listado de capacidades.
 */
const goBack = () => router.push('/empresas/capacidad-transportadora');

/**
 * Procesa el envío del formulario (crear o actualizar).
 * Valida, persiste datos y navega al listado al completar.
 * @returns {Promise<void>}
 */
const handleSubmit = async () => {
    if (!validateForm()) {
        await nextTick();
        const firstError = document.querySelector('[aria-invalid="true"], .is-invalid');
        if (firstError) {
            if (!/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(firstError.tagName)) firstError.setAttribute('tabindex', '-1');
            firstError.focus({ preventScroll: true });
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return toast('Atención', 'Revisa los campos obligatorios', 'warning');
    }

    try {
        submitting.value = true;
        let uuid = isEditMode.value ? route.params.id : null;

        if (isEditMode.value) {
            await store.updateItem(uuid, formData);
        } else {
            const newItem = await store.createItem(formData);
            uuid = newItem?.uuid || newItem?.id;
        }

        goBack();
    } catch (error) {
        toast('Error', 'No se pudo procesar la solicitud', 'error');
    } finally {
        submitting.value = false;
    }
};

/**
 * Hook del ciclo de vida: carga catálogos y datos del registro (si edita).
 */
onMounted(async () => {
    isViewLoading.value = true;
    try {
        await store.loadFormOptions();
        if (isEditMode.value) {
            const item = await store.fetchProfileById(route.params.id);
            if (item) {
                Object.assign(formData, {
                    enabling_resolution_uuid: item.enabling_resolution_uuid || '',
                    vehicle_type: item.vehicle_type || '',
                    authorized_capacity: item.authorized_capacity ?? 0,
                    current_capacity: item.current_capacity ?? 0,
                    minimum_own_capacity: item.minimum_own_capacity ?? 0,
                    status: (item.status == 1 || item.status === true || item.status === '1') ? '1' : '0',
                });
            }
        }
    } finally {
        isViewLoading.value = false;
    }
});
</script>

<style scoped>
/* ===== CARDS ===== */
.card {
    border-radius: 0.625rem !important;
    transition: box-shadow 150ms ease-in-out;
}

.card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-header {
    border-radius: 0.625rem 0.625rem 0 0 !important;
    background: linear-gradient(135deg, #f8f9fa, #fff);
}


/* ===== VALIDACIONES (Nativas) ===== */
.required::after {
    content: " *";
    color: #dc3545;
    font-weight: 600;
}

.form-control.is-invalid,
.form-select.is-invalid {
    border-color: #dc3545 !important;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

/* ==================== SELECT2 VALIDATION ==================== */


.invalid-feedback {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 0.875em;
    color: #dc3545;
}

/* ==================== SELECT2 UI FIXES ==================== */





/* ===== BOTONES ===== */
.btn {
    transition: all 150ms ease-in-out;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
}

.btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.btn-falcon-default {
    background: #f8f9fa;
    border-color: #e9ecef;
    color: #212529;
}

.bg-opacity-10 {
    --bs-bg-opacity: 0.1;
}

.fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translate3d(0, 15px, 0);
    }
    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
}
</style>
