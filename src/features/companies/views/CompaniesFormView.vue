<template>
    <div class="row gx-2 gx-md-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">

            <BasePageHeader
                :title="pageTitle"
                :subtitle="pageSubtitle"
                icon="fad fa-building text-primary"
                :breadcrumbs="breadcrumbs"
                :show-back="true"
                @back="goBack"
            />

            <div class="card border-0 shadow-sm fade-in-up" style="animation-delay: 0.1s;">
                <div class="card-header bg-light py-2 px-2 px-md-3 border-bottom">
                    <div class="d-flex flex-wrap align-items-center gap-2">
                        <i class="fad fa-clipboard-list text-primary"></i>
                        <h6 class="mb-0 fw-semibold text-dark">Información de la empresa</h6>
                        <span class="badge bg-primary bg-opacity-10 text-primary ms-0 ms-sm-2">
                            <i class="fad fa-asterisk me-1" style="font-size: 8px;"></i>Campos obligatorios
                        </span>
                    </div>
                </div>

                <div class="card-body p-2 p-md-3 p-lg-4">
                    <form @submit.prevent="handleSubmit" class="row g-2 g-md-3" novalidate>

                        <div class="col-12">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom">
                                <i class="fad fa-id-card me-2"></i>Datos legales e Identificación
                            </h6>
                        </div>


                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required" for="f-person_type">Tipo de persona</label>
                            <PrimeSelect :input-id="'f-person_type'" v-model="formData.person_type"
                                :options="[{ label: 'Jurídica', value: 'PERSONA JURIDICA' }, { label: 'Natural', value: 'PERSONA NATURAL' }]"
                                option-label="label" option-value="value" placeholder="Seleccionar tipo" showClear filter class="w-100"
                                :invalid="!!validationErrors['person_type']" />
                            <div v-if="validationErrors.person_type" class="invalid-feedback d-block" id="f-person_type-error" role="alert">
                                {{ validationErrors.person_type }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required" for="f-type_of_company">Sector (Naturaleza)</label>
                            <PrimeSelect :input-id="'f-type_of_company'" v-model="formData.type_of_company"
                                :options="[{ label: 'Privado', value: 'PRIVADO' }, { label: 'Público', value: 'PUBLICO' }]"
                                option-label="label" option-value="value" placeholder="Seleccionar" showClear filter class="w-100"
                                :invalid="!!validationErrors['type_of_company']" />
                            <div v-if="validationErrors.type_of_company" class="invalid-feedback d-block" id="f-type_of_company-error" role="alert">
                                {{ validationErrors.type_of_company }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required" for="f-document_type_uuid">Tipo de documento</label>
                            <PrimeSelect :input-id="'f-document_type_uuid'" v-model="formData.document_type_uuid"
                                :options="store.catalogs.documentTypes" option-value="uuid" option-label="name"
                                placeholder="Seleccionar tipo" showClear filter class="w-100"
                                :invalid="!!validationErrors['document_type_uuid']" />
                            <div v-if="validationErrors.document_type_uuid" class="invalid-feedback d-block" id="f-document_type_uuid-error" role="alert">
                                {{ validationErrors.document_type_uuid }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label" for="f-legal-structure">Estructura Legal</label>
                            <PrimeSelect :input-id="'f-legal-structure'" v-model="formData.legal_structure"
                                :options="[{ label: 'SAS', value: 'SOCIEDAD POR ACCIONES SIMPLIFICADA - SAS' }, { label: 'LTDA', value: 'SOCIEDAD DE RESPONSABILIDAD LIMITADA - LTDA' }, { label: 'SPA', value: 'SOCIEDAD POR ACCIONES - SPA' }, { label: 'SA', value: 'SOCIEDAD ANONIMA - SA' }, { label: 'UT', value: 'UNIÓN TEMPORAL - UT' }, { label: 'ESAL', value: 'ENTIDAD SIN ÁNIMO DE LUCRO - ESAL' }]"
                                option-label="label" option-value="value" placeholder="Seleccionar estructura" showClear filter class="w-100"
                                :invalid="!!validationErrors['legal_structure']" />
                        </div>


                        <div class="col-9 col-sm-9 col-md-8 col-lg-3">
                            <label class="form-label required" for="f-document_number">Número de documento</label>
                            <input id="f-document_number" :aria-invalid="!!validationErrors['document_number']" :aria-describedby="validationErrors['document_number'] ? 'f-document_number-error' : undefined" type="text" autocomplete="off" class="form-control"
                                :class="{ 'is-invalid': validationErrors.document_number }"
                                v-model="formData.document_number" placeholder="Ej: 900123456" />
                            <div v-if="validationErrors.document_number" class="invalid-feedback d-block" id="f-document_number-error" role="alert">
                                {{ validationErrors.document_number }}
                            </div>
                        </div>

                        <div class="col-3 col-sm-3 col-md-4 col-lg-2">
                            <label class="form-label" for="f-verification_digit">Dígito</label>
                            <input id="f-verification_digit" :aria-invalid="!!validationErrors['verification_digit']" :aria-describedby="validationErrors['verification_digit'] ? 'f-verification_digit-error' : undefined" type="text" autocomplete="off" class="form-control" v-model="formData.verification_digit" maxlength="1"
                                placeholder="0" />
                        </div>

                        <div class="col-12 col-sm-12 col-md-12 col-lg-7">
                            <label class="form-label required" for="f-business_name">Razón social legal completa</label>
                            <input id="f-business_name" :aria-invalid="!!validationErrors['business_name']" :aria-describedby="validationErrors['business_name'] ? 'f-business_name-error' : undefined" type="text" autocomplete="off" class="form-control"
                                :class="{ 'is-invalid': validationErrors.business_name }"
                                v-model="formData.business_name" placeholder="Razón social completa" />
                            <div v-if="validationErrors.business_name" class="invalid-feedback d-block" id="f-business_name-error" role="alert">
                                {{ validationErrors.business_name }}
                            </div>
                        </div>


                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label" for="f-trade_name">Nombre comercial (Marca)</label>
                            <input id="f-trade_name" :aria-invalid="!!validationErrors['trade_name']" :aria-describedby="validationErrors['trade_name'] ? 'f-trade_name-error' : undefined" type="text" autocomplete="off" class="form-control" v-model="formData.trade_name"
                                placeholder="Nombre de la marca" />
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label" for="f-economic_sector">Sector Económico</label>
                            <input id="f-economic_sector" :aria-invalid="!!validationErrors['economic_sector']" :aria-describedby="validationErrors['economic_sector'] ? 'f-economic_sector-error' : undefined" type="text" autocomplete="off" class="form-control" v-model="formData.economic_sector"
                                placeholder="Sector económico" />
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label" for="f-commercial_registration">Matrícula Mercantil</label>
                            <input id="f-commercial_registration" :aria-invalid="!!validationErrors['commercial_registration']" :aria-describedby="validationErrors['commercial_registration'] ? 'f-commercial_registration-error' : undefined" type="text" autocomplete="off" class="form-control" v-model="formData.commercial_registration"
                                placeholder="Ej: 12345678" />
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label" for="f-approximate_number_of_employees">N° Empleados</label>
                            <input id="f-approximate_number_of_employees" :aria-invalid="!!validationErrors['approximate_number_of_employees']" :aria-describedby="validationErrors['approximate_number_of_employees'] ? 'f-approximate_number_of_employees-error' : undefined" type="text" autocomplete="off" class="form-control" v-model="formData.approximate_number_of_employees"
                                placeholder="Ej: 1-50" />
                        </div>



                        <div class="col-12 mt-3 mt-md-4">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom">
                                <i class="fad fa-map-marker-alt me-2"></i>Ubicación y Tributación
                            </h6>
                        </div>


                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required" for="f-municipality_uuid">Municipio</label>
                            <PrimeSelect :input-id="'f-municipality_uuid'" v-model="formData.municipality_uuid"
                                :options="store.catalogs.municipalities" option-value="uuid" option-label="name"
                                placeholder="Seleccionar municipio" showClear filter class="w-100"
                                :invalid="!!validationErrors['municipality_uuid']" />
                            <div v-if="validationErrors.municipality_uuid" class="invalid-feedback d-block" id="f-municipality_uuid-error" role="alert">
                                {{ validationErrors.municipality_uuid }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-12 col-md-12 col-lg-6">
                            <label class="form-label required" for="f-address">Dirección</label>
                            <input id="f-address" :aria-invalid="!!validationErrors['address']" :aria-describedby="validationErrors['address'] ? 'f-address-error' : undefined" type="text" autocomplete="off" class="form-control" :class="{ 'is-invalid': validationErrors.address }"
                                v-model="formData.address" placeholder="Dirección completa" />
                            <div v-if="validationErrors.address" class="invalid-feedback d-block" id="f-address-error" role="alert">
                                {{ validationErrors.address }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label" for="f-postal_code">Código postal</label>
                            <input id="f-postal_code" :aria-invalid="!!validationErrors['postal_code']" :aria-describedby="validationErrors['postal_code'] ? 'f-postal_code-error' : undefined" type="text" autocomplete="off" class="form-control" v-model="formData.postal_code" placeholder="C.P." />
                        </div>


                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required" for="f-phone">Teléfono</label>
                            <input id="f-phone" :aria-invalid="!!validationErrors['phone']" :aria-describedby="validationErrors['phone'] ? 'f-phone-error' : undefined" type="tel" class="form-control" :class="{ 'is-invalid': validationErrors.phone }"
                                v-model="formData.phone" placeholder="Teléfono" />
                            <div v-if="validationErrors.phone" class="invalid-feedback d-block" id="f-phone-error" role="alert">
                                {{ validationErrors.phone }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-5">
                            <label class="form-label required" for="f-email">Correo electrónico</label>
                            <input id="f-email" :aria-invalid="!!validationErrors['email']" :aria-describedby="validationErrors['email'] ? 'f-email-error' : undefined" type="email" class="form-control" :class="{ 'is-invalid': validationErrors.email }"
                                v-model="formData.email" placeholder="correo@empresa.com" />
                            <div v-if="validationErrors.email" class="invalid-feedback d-block" id="f-email-error" role="alert">
                                {{ validationErrors.email }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-12 col-md-12 col-lg-4">
                            <label class="form-label required" for="f-web_page">Página Web</label>
                            <input id="f-web_page" :aria-invalid="!!validationErrors['web_page']" :aria-describedby="validationErrors['web_page'] ? 'f-web_page-error' : undefined" type="url" class="form-control" :class="{ 'is-invalid': validationErrors.web_page }"
                                v-model="formData.web_page" placeholder="https://www.empresa.com" />
                            <div v-if="validationErrors.web_page" class="invalid-feedback d-block" id="f-web_page-error" role="alert">
                                {{ validationErrors.web_page }}
                            </div>
                        </div>


                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required" for="f-tax_regime_uuid">Régimen Fiscal</label>
                            <PrimeSelect :input-id="'f-tax_regime_uuid'" v-model="formData.tax_regime_uuid"
                                :options="store.catalogs.taxRegimes" option-value="uuid" option-label="name"
                                placeholder="Seleccionar régimen" showClear filter class="w-100"
                                :invalid="!!validationErrors['tax_regime_uuid']" />
                            <div v-if="validationErrors.tax_regime_uuid" class="invalid-feedback d-block" id="f-tax_regime_uuid-error" role="alert">
                                {{ validationErrors.tax_regime_uuid }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required" for="f-moneda">Moneda</label>
                            <PrimeSelect :input-id="'f-moneda'" v-model="formData.currency_code"
                                :options="[{ label: 'COP - Peso colombiano', value: 'COP' }, { label: 'USD - Dólar americano', value: 'USD' }]"
                                option-label="label" option-value="value" class="w-100"
                                :invalid="!!validationErrors['currency_code']" />
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required" for="f-pais">País</label>
                            <PrimeSelect :input-id="'f-pais'" v-model="formData.country_code"
                                :options="[{ label: 'Colombia', value: 'CO' }, { label: 'Estados Unidos', value: 'US' }]"
                                option-label="label" option-value="value" class="w-100"
                                :invalid="!!validationErrors['country_code']" />
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required" for="f-status">Estado</label>
                            <PrimeSelect :input-id="'f-status'" v-model="formData.is_active"
                                :options="[{ label: 'Activo', value: '1' }, { label: 'Inactivo', value: '0' }]"
                                option-label="label" option-value="value" class="w-100"
                                :invalid="!!validationErrors['is_active']" />
                        </div>


                        <div class="col-12 mt-3 mt-md-4">
                            <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom">
                                <i class="fad fa-user-tie me-2"></i>Representante Legal y Firma
                            </h6>
                        </div>


                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required" for="f-legal_representative_document_type">Tipo Doc. Representante</label>
                            <PrimeSelect :input-id="'f-legal_representative_document_type'" v-model="formData.legal_representative_document_type"
                                :options="store.catalogs.documentTypes" option-value="prefix" option-label="name"
                                placeholder="Seleccionar tipo" showClear filter class="w-100"
                                :invalid="!!validationErrors['legal_representative_document_type']" />
                            <div v-if="validationErrors.legal_representative_document_type"
                                class="invalid-feedback d-block" id="f-legal_representative_document_type-error" role="alert">
                                {{ validationErrors.legal_representative_document_type }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required" for="f-legal_representative_document_number">Núm. Doc. Representante</label>
                            <input id="f-legal_representative_document_number" :aria-invalid="!!validationErrors['legal_representative_document_number']" :aria-describedby="validationErrors['legal_representative_document_number'] ? 'f-legal_representative_document_number-error' : undefined" type="text" autocomplete="off" class="form-control"
                                :class="{ 'is-invalid': validationErrors.legal_representative_document_number }"
                                v-model="formData.legal_representative_document_number" placeholder="Ej: 123456789" />
                            <div v-if="validationErrors.legal_representative_document_number" class="invalid-feedback d-block" id="f-legal_representative_document_number-error" role="alert">
                                {{ validationErrors.legal_representative_document_number }}
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label" for="f-legal_representative_document_issue_date">Fecha Exp. Documento</label>
                            <input id="f-legal_representative_document_issue_date" :aria-invalid="!!validationErrors['legal_representative_document_issue_date']" :aria-describedby="validationErrors['legal_representative_document_issue_date'] ? 'f-legal_representative_document_issue_date-error' : undefined" type="date" class="form-control"
                                v-model="formData.legal_representative_document_issue_date" placeholder="YYYY-MM-DD" />
                        </div>
                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label" for="f-legal_representative_nationality">Nacionalidad Representante</label>
                            <input id="f-legal_representative_nationality" :aria-invalid="!!validationErrors['legal_representative_nationality']" :aria-describedby="validationErrors['legal_representative_nationality'] ? 'f-legal_representative_nationality-error' : undefined" type="text" autocomplete="off" class="form-control" v-model="formData.legal_representative_nationality"
                                placeholder="Ej: Colombiana" />
                        </div>


                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required" for="f-legal_representative_name">Nombres del representante</label>
                            <input id="f-legal_representative_name" :aria-invalid="!!validationErrors['legal_representative_name']" :aria-describedby="validationErrors['legal_representative_name'] ? 'f-legal_representative_name-error' : undefined" type="text" autocomplete="off" class="form-control"
                                :class="{ 'is-invalid': validationErrors.legal_representative_name }"
                                v-model="formData.legal_representative_name" placeholder="Nombres del representante" />
                            <div v-if="validationErrors.legal_representative_name" class="invalid-feedback d-block" id="f-legal_representative_name-error" role="alert">
                                {{ validationErrors.legal_representative_name }}
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label required" for="f-legal_representative_last_name">Apellidos del representante</label>
                            <input id="f-legal_representative_last_name" :aria-invalid="!!validationErrors['legal_representative_last_name']" :aria-describedby="validationErrors['legal_representative_last_name'] ? 'f-legal_representative_last_name-error' : undefined" type="text" autocomplete="off" class="form-control"
                                :class="{ 'is-invalid': validationErrors.legal_representative_last_name }"
                                v-model="formData.legal_representative_last_name" placeholder="Apellidos del representante" />
                            <div v-if="validationErrors.legal_representative_last_name" class="invalid-feedback d-block" id="f-legal_representative_last_name-error" role="alert">
                                {{ validationErrors.legal_representative_last_name }}
                            </div>
                        </div>



                        <div class="col-12 col-sm-6 col-md-6 col-lg-3">
                            <label class="form-label" for="f-signature">Firma del representante</label>
                            <div class="d-flex flex-column gap-2 p-2 border rounded-3 bg-light">
                                <div v-if="filePreviews.signature" class="preview-box text-center">
                                    <img :src="filePreviews.signature" alt="Vista previa de la firma del representante" class="img-thumbnail img-fluid" style="max-height: 60px;">
                                </div>
                                <input type="file" id="f-signature" class="form-control form-control-sm"
                                    @change="onFileChange($event, 'signature')" accept="image/*" />
                            </div>
                        </div>

                        <div class="text-center col-12 col-sm-6 col-md-6 col-lg-3">
                            <div class="d-flex flex-column align-items-center">
                                <div class="position-relative">
                                    <img :src="filePreviews.logo || '/assets/img/team/default.png'"
                                        alt="Logo de la empresa"
                                        class="rounded-3 border shadow-sm bg-white img-fluid"
                                        style="width: 100px; height: 100px; object-fit: contain;">
                                    <label for="logoInput" aria-label="Cambiar logo de la empresa"
                                        class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle p-1"
                                        style="transform: translate(50%, 50%); width: 32px; height: 32px;">
                                        <i class="fas fa-camera" aria-hidden="true"></i>
                                    </label>
                                </div>
                                <input type="file" id="logoInput" class="d-none" @change="onFileChange($event, 'logo')"
                                    accept="image/*" />
                                <span class="fs-10 text-muted mt-3">Logo de la empresa</span>
                            </div>
                        </div>

                        <div class="col-12">
                            <BaseFormActions :submitting="submitting" :is-edit-mode="isEditMode" @cancel="goBack" />
                        </div>
                    </form>
                </div>
            </div>

            <div class="card border-0 shadow-sm mt-2 mt-md-3 fade-in-up" style="animation-delay: 0.2s;">
                <div class="card-body p-2 p-md-3 p-lg-4">
                    <div class="d-flex align-items-start gap-3">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                            <i class="fad fa-lightbulb text-primary fs-5"></i>
                        </div>
                        <div>
                            <h6 class="fw-medium mb-1">¿Sabías qué?</h6>
                            <p class="text-muted small mb-0">
                                La información aquí registrada será la base para la generación de documentos legales,
                                contratos y facturación electrónica. Verifica que el NIT sea correcto.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <!-- Panel RUES flotante -->
    <RuesLookupPanel @select="mapRuesRegistro" />
</template>

<script setup>
import { toast } from '@/utils/toast.js';
/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-14
 * @module {Features.Companies}
 * @resource {Company}
 */
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCompaniesStore } from '../store/companies.store.js';
import { usePermissionsStore } from '@store';
import { useUserStore } from '@store';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';
import RuesLookupPanel from '@/components/RuesLookupPanel.vue';

// --- STORES Y ROUTER ---
const route = useRoute();
const router = useRouter();
const store = useCompaniesStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();

// --- ESTADOS ---
const isEditMode = computed(() => route.params.id !== undefined);

/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => isEditMode.value ? 'Actualizar empresa' : 'Nueva empresa');
const pageSubtitle = computed(() => isEditMode.value ? 'Modifica la información legal y tributaria de la empresa' : 'Completa los datos para dar de alta una nueva entidad');
const breadcrumbs = computed(() => [ { label: 'Empresas', to: '/empresa/listas-empresa' }, { label: isEditMode.value ? 'Editar' : 'Nueva' } ]);

const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

const formData = reactive({
    person_type: '',
    type_of_company: '',
    document_type_uuid: '',
    document_number: '',
    verification_digit: '',
    business_name: '',
    trade_name: '',
    economic_sector: '',
    legal_structure: '',
    commercial_registration: '',
    approximate_number_of_employees: '',
    municipality_uuid: '',
    address: '',
    postal_code: '',
    phone: '',
    email: '',
    currency_code: 'COP',
    country_code: 'CO',
    tax_regime_uuid: '',
    legal_representative_name: '',
    legal_representative_last_name: '',
    legal_representative_document_type: '',
    legal_representative_document_number: '',
    legal_representative_nationality: '',
    legal_representative_document_issue_date: '',
    is_active: '1',
    web_page: '',
    logo: null,
    signature: null,
});

const filePreviews = reactive({ logo: null, signature: null });

// --- FUNCIONES ---
const can = (action, subject) => permissionsStore.can(action, subject);

const onFileChange = (event, field) => {
    const file = event.target.files[0];
    if (file) {
        formData[field] = file;
        filePreviews[field] = URL.createObjectURL(file);
    }
};

const goBack = () => {
    if (can('companies.index')) {
        router.push('/empresa/listas-empresa');
    } else {
        router.push(`/empresa/perfil/${userStore.company_uuid}`);
    }
};

// ─── RUES Lookup ─────────────────────────────────────────────────────────────
/**
 * Mapea el registro del RUES al formData al recibir el evento @select del panel.
 * @param {Object} registro
 */
async function mapRuesRegistro(registro) {
    if (registro.nit) formData.document_number = registro.nit;
    if (registro.digito_verificacion) formData.verification_digit = registro.digito_verificacion;
    if (registro.razon_social) formData.business_name = registro.razon_social;
    if (registro.matricula) formData.commercial_registration = registro.matricula;

    if (registro.representante_legal) {
        const partes = registro.representante_legal.trim().split(' ');
        if (partes.length >= 2) {
            formData.legal_representative_last_name = partes.slice(0, Math.ceil(partes.length / 2)).join(' ');
            formData.legal_representative_name = partes.slice(Math.ceil(partes.length / 2)).join(' ');
        }
    }
    if (registro.num_identificacion_representante_legal) {
        formData.legal_representative_document_number = registro.num_identificacion_representante_legal;
    }

    await nextTick();
}

// --- VALIDACION Y SUBMIT ---
const isEmpty = (v) => v === null || v === undefined || (typeof v === 'string' ? v.trim() === '' : !v);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);
    const required = [
        'person_type', 'type_of_company', 'document_type_uuid', 'document_number', 'business_name',
        'municipality_uuid', 'address', 'phone', 'email', 'tax_regime_uuid', 'web_page',
        'legal_representative_name', 'legal_representative_last_name', 'legal_representative_document_type', 'legal_representative_document_number'
    ];
    required.forEach(field => {
        if (isEmpty(formData[field])) validationErrors[field] = 'Este campo es obligatorio';
        else if (field === 'email' && !EMAIL_RE.test(String(formData[field]))) validationErrors[field] = 'El correo electrónico no tiene un formato válido';
    });
    return Object.keys(validationErrors).length === 0;
};

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
        let companyUuid = isEditMode.value ? route.params.id : null;

        if (isEditMode.value) {
            await store.updateItem(companyUuid, formData);
        } else {
            const newItem = await store.createItem(formData);
            companyUuid = newItem?.uuid || newItem?.id;
        }

        if (formData.logo instanceof File) {
            await store.uploadLogo(companyUuid, formData.logo);
        }
        if (formData.signature instanceof File) {
            await store.uploadSignature(companyUuid, formData.signature);
        }

        submitting.value = false;
        goBack();
    } catch (error) {
        submitting.value = false;
        toast('Error', 'No se pudo procesar la solicitud', 'error');
    }
};

// --- CICLO DE VIDA ---
onMounted(async () => {
    isViewLoading.value = true;
    try {
        await store.loadFormOptions();
        if (isEditMode.value) {
            const response = await store.fetchProfileById(route.params.id);
            const company = response?.data?.data || response?.data || response;
            if (company) {
                Object.assign(formData, company);
                if (formData.legal_representative_document_issue_date) {
                    formData.legal_representative_document_issue_date = formData.legal_representative_document_issue_date.split(' ')[0];
                }
                formData.is_active = (company.is_active == 1 || company.is_active === true || company.is_active === '1') ? '1' : '0';
                filePreviews.logo = company.logo_url;
                filePreviews.signature = company.signature_url;
            }
        }
    } catch (e) {

    } finally {
        isViewLoading.value = false;
        await nextTick();
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
