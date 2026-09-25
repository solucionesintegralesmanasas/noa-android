<template>
    <div class="row g-2 g-md-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">

            <BasePageHeader
                :title="pageTitle"
                :subtitle="pageSubtitle"
                icon="fad fa-briefcase text-primary"
                :breadcrumbs="breadcrumbs"
                :show-back="true"
                @back="goBack"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-briefcase text-primary"></i>
                        <h5 class="mb-0 fw-medium">Información del proyecto</h5>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Campos obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body p-2 p-md-3 p-lg-4 p-md-4">
                    <form @submit.prevent="handleSubmit" class="row g-2 g-md-3" novalidate>

                        <input type="hidden" v-model="formData.company_uuid" />

                        <div class="col-12 mt-1">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom">
                                <i class="fad fa-tasks me-2"></i>Datos del Proyecto
                            </h6>
                        </div>

                        <div class="col-12">
                            <label class="form-label required" for="project_name">Nombre del Proyecto</label>
                            <input id="project_name" v-model="formData.project_name" class="form-control"
                                :class="{ 'is-invalid': validationErrors.project_name }" type="text" autocomplete="off"
                                placeholder="Ej: Proyecto Ruta Norte 2026" maxlength="255" />
                            <div v-if="validationErrors.project_name" class="invalid-feedback d-block" id="f-project_name-error" role="alert">
                                {{ validationErrors.project_name }}
                            </div>
                        </div>

                        <div class="col-12 col-md-4">
                            <label class="form-label required" for="start_date">Fecha de Inicio</label>
                            <input id="start_date" v-model="formData.start_date" class="form-control"
                                :class="{ 'is-invalid': validationErrors.start_date }" type="date"
                                :max="formData.completion_date || undefined" />
                            <div v-if="validationErrors.start_date" class="invalid-feedback d-block" id="f-start_date-error" role="alert">
                                {{ validationErrors.start_date }}
                            </div>
                        </div>

                        <div class="col-12 col-md-4">
                            <label class="form-label required" for="completion_date">Fecha de Finalización</label>
                            <input id="completion_date" v-model="formData.completion_date" class="form-control"
                                :class="{ 'is-invalid': validationErrors.completion_date }" type="date"
                                :min="formData.start_date || undefined" />
                            <div v-if="validationErrors.completion_date" class="invalid-feedback d-block" id="f-completion_date-error" role="alert">
                                {{ validationErrors.completion_date }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-4">
                            <label class="form-label" for="project_value">Valor del Proyecto ($)</label>
                            <input id="project_value" v-model="formData.project_value" class="form-control"
                                :class="{ 'is-invalid': validationErrors.project_value }" type="number" min="0"
                                step="0.01" placeholder="0.00" />
                            <div v-if="validationErrors.project_value" class="invalid-feedback d-block" id="f-project_value-error" role="alert">
                                {{ validationErrors.project_value }}
                            </div>
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label" for="purchase_order">Número de Orden de Compra</label>
                            <input id="purchase_order" v-model="formData.purchase_order" class="form-control"
                                :class="{ 'is-invalid': validationErrors.purchase_order }" type="text"
                                autocomplete="off" placeholder="OC-2026-001" maxlength="255" />
                            <div v-if="validationErrors.purchase_order" class="invalid-feedback d-block" id="f-purchase_order-error" role="alert">
                                {{ validationErrors.purchase_order }}
                            </div>
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label" for="purchase_order_file">Documento de Orden de Compra (PDF)</label>

                            <!-- PDF existente -->
                            <div v-if="existingPurchaseOrder.name && !purchaseFile && !removeExistingPurchaseOrder"
                                class="d-flex align-items-center gap-2 border rounded-3 p-2 mb-2 bg-light">
                                <i class="fad fa-file-pdf text-danger" style="font-size: 18px;" />
                                <span class="small text-truncate fw-medium flex-grow-1">{{ existingPurchaseOrder.name }}</span>
                                <a :href="getMediaUrl(existingPurchaseOrder.url)" target="_blank"
                                    class="btn btn-falcon-default btn-sm py-0 px-2" title="Ver PDF">
                                    <i class="fad fa-eye me-1" style="font-size: 11px;" />Ver
                                </a>
                                <button type="button" class="btn btn-falcon-default btn-sm py-0 px-2 text-danger"
                                    title="Quitar PDF" @click="removeExistingPurchaseFile">
                                    <i class="fad fa-times" />
                                </button>
                            </div>

                            <!-- Archivo nuevo seleccionado -->
                            <div v-if="purchaseFile"
                                class="d-flex align-items-center gap-2 border rounded-3 p-2 mb-2 bg-light">
                                <i class="fad fa-file-pdf text-danger" style="font-size: 18px;" />
                                <span class="small text-truncate fw-medium flex-grow-1">{{ purchaseFile.name }}</span>
                                <span class="badge badge-subtle-info flex-shrink-0" style="font-size: 0.65rem;">
                                    Nuevo
                                </span>
                                <button type="button" class="btn btn-falcon-default btn-sm py-0 px-2 text-danger"
                                    title="Cancelar selección" @click="clearPurchaseFile">
                                    <i class="fad fa-times" />
                                </button>
                            </div>

                            <div v-if="removeExistingPurchaseOrder"
                                class="small text-danger d-flex align-items-center gap-1 mb-2">
                                <i class="fad fa-trash-alt" />El PDF actual será eliminado al guardar.
                            </div>

                            <input id="purchase_order_file" ref="purchaseOrderInput" type="file"
                                accept="application/pdf,.pdf" class="form-control"
                                :class="{ 'is-invalid': validationErrors.purchase_order_file }"
                                @change="onPurchaseFileChange" />
                            <div v-if="validationErrors.purchase_order_file" class="invalid-feedback d-block" id="f-purchase_order_file-error" role="alert">
                                {{ validationErrors.purchase_order_file }}
                            </div>
                        </div>

                        <!-- Sección asignaciones -->
                        <div class="col-12 mt-3">
                            <div class="d-flex justify-content-between align-items-end gap-2 flex-wrap">
                                <div>
                                    <h6 class="text-muted fw-medium mb-0">
                                        <i class="fad fa-users me-2"></i>Conductores y sus vehículos
                                    </h6>
                                    <small class="text-muted">{{ formData.assignments.length }} asignación{{
                                        formData.assignments.length !== 1 ? 'es' : '' }}</small>
                                </div>
                                <button type="button" class="btn btn-sm btn-soft-primary"
                                    @click="addAssignment">
                                    <i class="fad fa-plus me-1" />Agregar conductor + vehículo
                                </button>
                            </div>
                        </div>

                        <div class="col-12">
                            <div v-if="!formData.assignments.length" class="alert alert-light border small py-2 mb-2">
                                <i class="fad fa-info-circle me-1" />Asigna un conductor con su vehículo seleccionando
                                cada campo de la fila.
                            </div>

                            <div v-for="(row, index) in formData.assignments" :key="row.key"
                                class="row gx-2 gy-2 mb-2 align-items-end">
                                <div class="col-12 col-md-4">
                                    <label class="form-label small text-muted mb-1 d-block" :for="`row-${row.key}-driver`">
                                        Conductor
                                    </label>
                                    <PrimeSelect v-model="row.third_party_uuid" :options="driverOptions"
                                        :inputId="`row-${row.key}-driver`" optionLabel="label" optionValue="uuid"
                                        filter showClear placeholder="Seleccione conductor..."
                                        class="w-100" style="width:100%;" />
                                </div>
                                <div class="col-12 col-md-4">
                                    <label class="form-label small text-muted mb-1 d-block" :for="`row-${row.key}-vehicle`">
                                        Vehículo
                                    </label>
                                    <PrimeSelect v-model="row.vehicle_uuid" :options="vehicleOptions"
                                        :inputId="`row-${row.key}-vehicle`" optionLabel="label" optionValue="uuid"
                                        filter showClear placeholder="Seleccione vehículo..."
                                        class="w-100" style="width:100%;" />
                                </div>
                                <div class="col-12 col-md-2">
                                    <span class="form-label small text-muted mb-1 d-block" :id="`row-${row.key}-active-caption`">Estado</span>
                                    <div class="form-check form-switch ps-0 d-flex align-items-center m-0"
                                        style="height: 37px;">
                                        <input :id="`row-${row.key}-active`" v-model="row.is_active" type="checkbox"
                                            class="form-check-input ms-0" role="switch" :aria-labelledby="`row-${row.key}-active-caption row-${row.key}-active`">
                                        <label class="form-check-label small ms-2 mb-0"
                                            :for="`row-${row.key}-active`">
                                            <span :class="row.is_active ? '' : 'text-danger fw-medium'">
                                                {{ row.is_active ? 'Activo' : 'Retirado' }}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <div class="col-12 col-md-2">
                                    <button type="button" class="btn btn-sm btn-falcon-danger w-100"
                                        :disabled="formData.assignments.length === 1" @click="removeAssignment(index)">
                                        <i class="fal fa-trash me-1" aria-hidden="true" />Quitar
                                    </button>
                                </div>
                            </div>

                            <div v-if="validationErrors.assignments" class="invalid-feedback d-block mt-0" id="f-assignments-error" role="alert">
                                <span v-for="(msg, i) in validationErrors.assignments" :key="i" class="d-block">
                                    <i class="fad fa-exclamation-circle me-1" aria-hidden="true"></i>{{ msg }}
                                </span>
                            </div>
                        </div>

                        <div class="col-12">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>
                    </form>
                </div>
            </div>

            <div class="card border-0 shadow-sm mt-3 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body p-2 p-md-3 p-lg-4 p-md-4">
                    <div class="d-flex align-items-start gap-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-lightbulb text-primary fs-5"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <p class="text-muted small mb-0">
                                Cada conductor dentro de un proyecto debe tener su vehículo asignado. Así podrás
                                controlar la operación de forma clara: quién conduce, qué vehículo y en qué proyecto.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectsStore } from '../store/projects.store.js';
import { usePermissionsStore, useUserStore } from '@store';
import { toast } from '@/utils/toast.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import PrimeSelect from 'primevue/select';
import BaseFormActions from '@/components/BaseFormActions.vue';
import { getMediaUrl } from '@/utils/media.js';

// --- STORES Y ROUTER ---
const route = useRoute();
const router = useRouter();
const store = useProjectsStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();

// --- ESTADOS ---
const isEditMode = computed(() => Boolean(route.params.id));

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar Proyecto' : 'Nuevo Proyecto');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica la información y las asignaciones del proyecto' : 'Completa los datos para dar de alta un nuevo proyecto');
const breadcrumbs = computed(() => [
    { label: 'Operación' },
    { label: 'Proyectos', to: '/proyectos' },
    { label: isEditMode.value ? 'Editar' : 'Nuevo' },
]);

const submitting = ref(false);
const validationErrors = ref({});

const formData = reactive({
    company_uuid: '',
    project_name: '',
    start_date: '',
    completion_date: '',
    project_value: null,
    purchase_order: '',
    assignments: [],
});

// --- Estado de la orden de compra (PDF) ---
const existingPurchaseOrder = ref({ url: '', name: '' });
const purchaseFile = ref(null);
const removeExistingPurchaseOrder = ref(false);
const purchaseOrderInput = ref(null);

const onPurchaseFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    purchaseFile.value = file;
    if (file) {
        removeExistingPurchaseOrder.value = false;
    }
};

const clearPurchaseFile = () => {
    purchaseFile.value = null;
    removeExistingPurchaseOrder.value = false;
    if (purchaseOrderInput.value) purchaseOrderInput.value.value = '';
};

const removeExistingPurchaseFile = () => {
    removeExistingPurchaseOrder.value = true;
    clearPurchaseFile();
};

let counter = 0;
const nextKey = () => ++counter;

const driverOptions = computed(() =>
    (store?.catalogs?.drivers || []).map(d => ({
        uuid: d.uuid,
        label: d.company_name || `${d.first_name || ''} ${d.last_name || ''}`.trim() || d.document_number || 'Conductor',
    }))
);

const vehicleOptions = computed(() =>
    (store?.catalogs?.vehicles || []).map(v => ({
        uuid: v.uuid,
        label: v.vehicle_license_plate || v.internal_number || 'Vehículo',
    }))
);

const can = (action) => permissionsStore.can(action);

const goBack = () => {
    if (can('projects.index')) {
        router.push('/proyectos');
    } else {
        router.push(`/proyectos/perfil/${route.params.id}`);
    }
};

const addAssignment = () => {
    formData.assignments.push({ key: nextKey(), third_party_uuid: '', vehicle_uuid: '', is_active: true });
};

const removeAssignment = (index) => {
    if (formData.assignments.length === 1) return;
    formData.assignments.splice(index, 1);
};

/** Valida los datos del formulario antes de enviar. */
const validateForm = () => {
    const errors = {};
    if (!formData.project_name || !formData.project_name.trim()) {
        errors.project_name = 'El nombre del proyecto es obligatorio';
    }
    if (!formData.start_date) errors.start_date = 'La fecha de inicio es obligatoria';
    if (!formData.completion_date) errors.completion_date = 'La fecha de finalización es obligatoria';
    if (formData.start_date && formData.completion_date && formData.completion_date < formData.start_date) {
        errors.completion_date = 'La fecha de finalización no puede ser anterior a la de inicio';
    }
    if (formData.project_value !== null && formData.project_value !== '' && Number(formData.project_value) < 0) {
        errors.project_value = 'El valor del proyecto no puede ser negativo';
    }

    if (purchaseFile.value) {
        const isPdf = /\.pdf$/i.test(purchaseFile.value.name) || purchaseFile.value.type === 'application/pdf';
        if (!isPdf) {
            errors.purchase_order_file = 'La orden de compra debe ser un archivo PDF';
        } else if (purchaseFile.value.size > 10 * 1024 * 1024) {
            errors.purchase_order_file = 'La orden de compra no debe superar los 10 MB';
        }
    }

    const validAssignments = [];
    const driversSeen = {};
    const vehiclesSeen = {};

    formData.assignments.forEach((row, index) => {
        const label = `Fila ${index + 1}`;
        if (!row.third_party_uuid || !row.vehicle_uuid) {
            errors.assignments = errors.assignments || [];
            errors.assignments.push(`${label}: selecciona conductor y vehículo.`);
            return;
        }

        if (driversSeen[row.third_party_uuid]) {
            errors.assignments = errors.assignments || [];
            errors.assignments.push(`${label}: el conductor ya fue asignado a este proyecto.`);
        } else {
            driversSeen[row.third_party_uuid] = true;
            validAssignments.push({
                third_party_uuid: row.third_party_uuid,
                vehicle_uuid: row.vehicle_uuid,
                is_active: row.is_active !== false,
            });
        }

        if (vehiclesSeen[row.vehicle_uuid]) {
            errors.assignments = errors.assignments || [];
            errors.assignments.push(`${label}: el vehículo ya fue asignado a este proyecto.`);
        } else {
            vehiclesSeen[row.vehicle_uuid] = true;
        }
    });

    return { errors, validAssignments };
};

const handleSubmit = async () => {
    if (submitting.value) return;

    const { errors, validAssignments } = validateForm();
    validationErrors.value = errors;

    if (Object.keys(errors).length) {
        await nextTick();
        const firstError = document.querySelector('[aria-invalid="true"], .is-invalid, .is-invalid-select2');
        if (firstError) {
            if (!/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(firstError.tagName)) firstError.setAttribute('tabindex', '-1');
            firstError.focus({ preventScroll: true });
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return await toast('Atención', 'Revisa los campos obligatorios', 'warning');
    }

    submitting.value = true;
    try {
        const payload = {
            company_uuid: formData.company_uuid,
            project_name: formData.project_name.trim(),
            start_date: formData.start_date,
            completion_date: formData.completion_date,
            project_value: formData.project_value === '' || formData.project_value === null ? null : Number(formData.project_value),
            purchase_order: formData.purchase_order?.trim() || null,
            assignments: validAssignments,
        };

        if (purchaseFile.value) {
            payload.purchase_order_file = purchaseFile.value;
        } else if (removeExistingPurchaseOrder.value) {
            payload.remove_purchase_order = true;
        }

        if (isEditMode.value) {
            await store.updateItem(route.params.id, payload);
        } else {
            await store.createItem(payload);
        }
        router.push(isEditMode.value ? `/proyectos/perfil/${route.params.id}` : '/proyectos');
    } catch (err) {
        const errorsPayload = err?.response?.data?.data || err?.response?.data?.errors;
        if (errorsPayload && typeof errorsPayload === 'object' && Object.keys(errorsPayload).length) {
            validationErrors.value = errorsPayload;
        } else {
            await toast('Error', 'Ocurrió un error al guardar el proyecto', 'error');
        }
    } finally {
        submitting.value = false;
    }
};

const loadFormData = async () => {
    existingPurchaseOrder.value = { url: '', name: '' };
    clearPurchaseFile();

    if (isEditMode.value) {
        const record = await store.fetchProfileById(route.params.id);
        if (!record) return;

        formData.company_uuid = record.company_uuid || '';
        formData.project_name = record.project_name || '';
        formData.start_date = record.start_date || '';
        formData.completion_date = record.completion_date || '';
        formData.project_value = record.project_value ?? null;
        formData.purchase_order = record.purchase_order || '';

        existingPurchaseOrder.value = {
            url: record.purchase_order_url || '',
            name: record.purchase_order_name || '',
        };

        const assignments = Array.isArray(record.assignments) ? record.assignments : [];
        for (const a of assignments) {
            formData.assignments.push({
                key: nextKey(),
                third_party_uuid: a.third_party_uuid,
                vehicle_uuid: a.vehicle_uuid,
                is_active: a.is_active !== false,
            });
        }
        if (!formData.assignments.length) {
            addAssignment();
        }
    } else {
        addAssignment();
    }
};

onMounted(async () => {
    try {
        await store.loadCatalogs();
        formData.company_uuid = userStore.company_uuid || '';
        await loadFormData();
    } finally {
        // sin estado de carga explícito: el encabezado y la card se muestran de inmediato
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

.invalid-feedback {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 0.875em;
    color: #dc3545;
}

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

.btn-soft-primary {
    background: rgba(13, 110, 253, 0.1);
    color: #0d6efd;
    border: 1px solid rgba(13, 110, 253, 0.2);
}

.btn-soft-primary:hover {
    background: rgba(13, 110, 253, 0.18);
    color: #0a58ca;
}

.btn-falcon-default {
    background: #f8f9fa;
    border-color: #e9ecef;
    color: #212529;
}

.btn-falcon-danger {
    background: #f8f9fa;
    border-color: #e9ecef;
    color: #dc3545;
}

.btn-falcon-danger:hover:not(:disabled) {
    background: #dc3545;
    border-color: #dc3545;
    color: #fff;
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