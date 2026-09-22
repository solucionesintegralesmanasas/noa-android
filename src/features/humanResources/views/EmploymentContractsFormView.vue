<template>
    <div class="row g-2 g-md-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">

            <BasePageHeader
                :title="pageTitle"
                :subtitle="pageSubtitle"
                icon="fad fa-file-contract text-primary"
                :breadcrumbs="breadcrumbs"
                :show-back="true"
                @back="goBack"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-file-contract text-primary"></i>
                        <h5 class="mb-0 fw-medium">Información del contrato laboral</h5>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Campos obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body p-2 p-md-3 p-lg-4 p-md-4">
                    <form @submit.prevent="handleSubmit" class="row g-2 g-md-3" novalidate>

                        <!-- Empleado -->
                        <div class="col-12 col-sm-12 col-md-6 col-lg-6">
                            <label class="form-label required" for="third_party_uuid">Empleado</label>
                            <PrimeSelect :input-id="'third_party_uuid'" v-model="formData.third_party_uuid"
                                :options="store.catalogs?.thirdParties ?? []" option-value="uuid"
                                :option-label="(opt) => `${opt.document_number || ''} - ${opt.first_name || ''} ${opt.last_name || ''} ${opt.trade_name || ''}`.trim()"
                                placeholder="Seleccionar empleado..." showClear filter class="w-100"
                                :invalid="!!validationErrors['third_party_uuid']" />
                            <div v-if="validationErrors.third_party_uuid" class="invalid-feedback d-block" id="f-third_party_uuid-error" role="alert">
                                {{ validationErrors.third_party_uuid }}
                            </div>
                        </div>

                        <!-- Tipo de contrato -->
                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                            <label class="form-label required" for="contract_type">Tipo de Contrato</label>
                            <PrimeSelect :input-id="'contract_type'" v-model="formData.contract_type"
                                :options="[{ label: 'Término Fijo', value: 'TERMINO_FIJO' }, { label: 'Término Indefinido', value: 'TERMINO_INDEFINIDO' }, { label: 'Obra o Labor', value: 'OBRA_LABOR' }, { label: 'Prestación de Servicios', value: 'PRESTACION_SERVICIOS' }, { label: 'Aprendizaje', value: 'APRENDIZAJE' }]"
                                option-label="label" option-value="value" class="w-100"
                                :invalid="!!validationErrors['contract_type']" />
                            <div v-if="validationErrors.contract_type" class="invalid-feedback d-block" id="f-contract_type-error" role="alert">
                                {{ validationErrors.contract_type }}
                            </div>
                        </div>

                        <!-- Estado -->
                        <div class="col-12 col-sm-6 col-md-3 col-lg-3">
                            <label class="form-label required" for="status">Estado</label>
                            <PrimeSelect :input-id="'status'" v-model="formData.status"
                                :options="[{ label: 'Activo', value: 'ACTIVO' }, { label: 'Suspendido', value: 'SUSPENDIDO' }, { label: 'Terminado', value: 'TERMINADO' }]"
                                option-label="label" option-value="value" class="w-100"
                                :invalid="!!validationErrors['status']" />
                            <div v-if="validationErrors.status" class="invalid-feedback d-block" id="f-status-error" role="alert">
                                {{ validationErrors.status }}
                            </div>
                        </div>

                        <div class="col-12 mt-3">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom">
                                <i class="fad fa-calendar-alt me-2"></i>Fechas y Condiciones
                            </h6>
                        </div>

                        <!-- Fecha Inicio -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="start_date">Fecha de inicio</label>
                            <input id="start_date" v-model="formData.start_date" class="form-control"
                                :class="{ 'is-invalid': validationErrors.start_date }" type="date" />
                            <div v-if="validationErrors.start_date" class="invalid-feedback d-block" id="f-start_date-error" role="alert">
                                {{ validationErrors.start_date }}
                            </div>
                        </div>

                        <!-- Fecha Fin -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="end_date">Fecha de finalización</label>
                            <input id="end_date" v-model="formData.end_date" class="form-control"
                                :class="{ 'is-invalid': validationErrors.end_date }" type="date" />
                            <div v-if="validationErrors.end_date" class="invalid-feedback d-block" id="f-end_date-error" role="alert">
                                {{ validationErrors.end_date }}
                            </div>
                        </div>

                        <!-- Salario Base -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label required" for="base_salary">Salario Base</label>
                            <input id="base_salary" v-model="formData.base_salary" class="form-control"
                                :class="{ 'is-invalid': validationErrors.base_salary }" type="number" min="0" step="0.01" />
                            <div v-if="validationErrors.base_salary" class="invalid-feedback d-block" id="f-base_salary-error" role="alert">
                                {{ validationErrors.base_salary }}
                            </div>
                        </div>

                        <!-- Horas Semanales -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label class="form-label" for="working_hours_per_week">Horas Semanales</label>
                            <input id="working_hours_per_week" v-model="formData.working_hours_per_week" class="form-control"
                                :class="{ 'is-invalid': validationErrors.working_hours_per_week }" type="number" min="1" max="168" />
                            <div v-if="validationErrors.working_hours_per_week" class="invalid-feedback d-block" id="f-working_hours_per_week-error" role="alert">
                                {{ validationErrors.working_hours_per_week }}
                            </div>
                        </div>

                        <!-- Naturaleza Salarial -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                            <label class="form-label" for="salary_type">Naturaleza Salarial</label>
                            <PrimeSelect :input-id="'salary_type'" v-model="formData.salary_type"
                                :options="[{ label: 'Ordinario', value: 'ORDINARIO' }, { label: 'Integral', value: 'INTEGRAL' }]"
                                option-label="label" option-value="value" class="w-100"
                                :invalid="!!validationErrors['salary_type']" />
                            <div v-if="validationErrors.salary_type" class="invalid-feedback d-block" id="f-salary_type-error" role="alert">
                                {{ validationErrors.salary_type }}
                            </div>
                        </div>

                        <!-- Auxilio Transporte -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-4">
                            <label class="form-label" for="transport_subsidy_applies">¿Aplica auxilio de transporte?</label>
                            <PrimeSelect :input-id="'transport_subsidy_applies'" v-model="formData.transport_subsidy_applies"
                                :options="[{ label: 'No', value: '0' }, { label: 'Sí', value: '1' }]"
                                option-label="label" option-value="value" class="w-100"
                                :invalid="!!validationErrors['transport_subsidy_applies']" />
                            <div v-if="validationErrors.transport_subsidy_applies" class="invalid-feedback d-block" id="f-transport_subsidy_applies-error" role="alert">
                                {{ validationErrors.transport_subsidy_applies }}
                            </div>
                        </div>

                        <!-- Motivo Terminación -->
                        <div class="col-12" v-if="formData.status === 'TERMINADO'">
                            <label class="form-label required" for="termination_reason">Motivo de Terminación</label>
                            <input id="termination_reason" v-model="formData.termination_reason" class="form-control"
                                :class="{ 'is-invalid': validationErrors.termination_reason }" type="text" />
                            <div v-if="validationErrors.termination_reason" class="invalid-feedback d-block" id="f-termination_reason-error" role="alert">
                                {{ validationErrors.termination_reason }}
                            </div>
                        </div>

                        <div class="col-12">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { toast } from '@/utils/toast.js';

import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmploymentContractsStore } from '../store/employmentContracts.store.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';
import { handleGlobalError } from '@/utils/error-handler.js';

// --- STORES Y ROUTER ---
const route = useRoute();
const router = useRouter();
const store = useEmploymentContractsStore();

// --- ESTADOS ---
const isEditMode = computed(() => route.params.id !== undefined);

const pageTitle = computed(() => isEditMode.value ? 'Actualizar Contrato Laboral' : 'Nuevo Contrato Laboral');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica la información del contrato laboral' : 'Completa los datos para crear un nuevo contrato laboral');
const breadcrumbs = computed(() => [ { label: 'Contratos Laborales', to: '/recursos-humanos/contratos-laborales/listas' }, { label: isEditMode.value ? 'Editar' : 'Nuevo' } ]);
const submitting = ref(false);
const validationErrors = reactive({});

const formData = reactive({
    third_party_uuid: '',
    contract_type: 'TERMINO_FIJO',
    start_date: '',
    end_date: '',
    base_salary: '',
    salary_type: 'ORDINARIO',
    transport_subsidy_applies: '0',
    working_hours_per_week: 48,
    status: 'ACTIVO',
    termination_reason: ''
});

const loadData = async () => {
    store.loading = true;
    try {
        if (!store.catalogs?.thirdParties) {
            const catalogs = await store.loadFormOptions();
            store.catalogs = catalogs;
        }

        if (isEditMode.value) {
            const contract = await store.fetchProfileById(route.params.id);
            if (contract) {
                Object.assign(formData, {
                    third_party_uuid: contract.third_party_uuid || '',
                    contract_type: contract.contract_type || 'TERMINO_FIJO',
                    start_date: contract.start_date ? contract.start_date.split('T')[0] : '',
                    end_date: contract.end_date ? contract.end_date.split('T')[0] : '',
                    base_salary: contract.base_salary || '',
                    salary_type: contract.salary_type || 'ORDINARIO',
                    transport_subsidy_applies: contract.transport_subsidy_applies ? '1' : '0',
                    working_hours_per_week: contract.working_hours_per_week || 48,
                    status: contract.status || 'ACTIVO',
                    termination_reason: contract.termination_reason || ''
                });
            }
        }
        await nextTick();
    } catch (error) {
        handleGlobalError(error);
        goBack();
    } finally {
        store.loading = false;
    }
};

const handleSubmit = async () => {
    submitting.value = true;
    Object.keys(validationErrors).forEach(k => delete validationErrors[k]);

    // Data to send
    const payload = { ...formData };
    payload.transport_subsidy_applies = payload.transport_subsidy_applies === '1';

    try {
        if (isEditMode.value) {
            await store.updateItem(route.params.id, payload);
            toast.success('Contrato laboral actualizado exitosamente.');
        } else {
            await store.createItem(payload);
            toast.success('Contrato laboral creado exitosamente.');
        }
        goBack();
    } catch (error) {
        if (error.response?.status === 422) {
            const errors = error.response.data.errors;
            for (const key in errors) {
                validationErrors[key] = errors[key][0];
            }
            await nextTick();
            const firstKey = Object.keys(validationErrors)[0];
            const target = (firstKey && document.getElementById(`f-${firstKey}`))
                || document.querySelector('[aria-invalid="true"], .is-invalid');
            if (target) {
                if (!/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(target.tagName)) target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            toast.error('Por favor, revisa los errores en el formulario.');
        } else {
            handleGlobalError(error);
        }
    } finally {
        submitting.value = false;
    }
};

const goBack = () => {
    router.push({ name: 'employmentContracts.list' });
};

onMounted(() => {
    loadData();
});
</script>
