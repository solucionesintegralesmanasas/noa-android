<template>
    <div class="fuec-detail-wrapper fade-in-up" :class="{ 'qr-access': accessedViaQR }">

        <div class="card border-0 shadow-lg mb-4 overflow-hidden bg-primary bg-gradient text-white">
            <div class="card-body position-relative py-4">
                <div class="bg-holder opacity-10"
                    style="background-image: url(/assets/img/icons/spot-illustrations/corner-4.png);"></div>

                <div class="row align-items-center g-3">
                    <div class="col-auto">
                        <div class="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow"
                            style="width: 72px; height: 72px;">
                            <i class="fad fa-file-contract fs-1"></i>
                        </div>
                    </div>
                    <div class="col">
                        <h2 class="mb-1 fw-bold">FUEC #{{ currentFuecData?.number_fuec }}</h2>
                        <p class="mb-0 opacity-75">
                            <i class="fad fa-hashtag me-1"></i>
                            Solicitud: {{ currentFuecData?.request_number }}
                        </p>
                    </div>
                    <div class="col-auto text-end">
                        <span v-if="accessedViaQR"
                            class="badge bg-success-subtle text-success border border-success-subtle fs-6 px-3 py-2 rounded-pill shadow-sm mb-2 badge-qr-verified">
                            <i class="fad fa-qrcode me-1"></i>Verificado por QR
                        </span>
                        <span class="badge bg-white text-primary fs-6 px-3 py-2 rounded-pill shadow-sm">
                            <i
                                :class="currentFuecData?.status === 'ACTIVO' ? 'fad fa-check-circle me-1' : 'fad fa-circle me-1'"></i>
                            {{ currentFuecData?.status || '---' }}
                        </span>
                        <div class="text-white-50 small mt-2">
                            <i class="fad fa-calendar-alt me-1"></i>
                            Emitido: {{ formatDate(currentFuecData?.created_at) }}
                        </div>
                        <div class="verification-code mt-2 d-inline-block">
                            <small class="text-white-50 d-block">Código Verificación:</small>
                            <span class="fw-bold font-monospace">{{
                                currentFuecData?.verification_code || '-' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="errorMsg" class="alert alert-danger border-0 shadow-sm mb-4 d-flex align-items-center gap-3">
            <i class="fad fa-exclamation-triangle fs-4"></i>
            <div>
                <h6 class="mb-0 fw-semibold">Error de Validación</h6>
                <small>{{ errorMsg }}</small>
            </div>
        </div>

        <div v-if="loading" class="row g-4">
            <div class="col-lg-8">
                <div class="card border-0 shadow-sm">
                    <div class="card-body py-4">
                        <div class="skeleton-text" style="height: 24px; width: 50%; margin-bottom: 1.5rem;"></div>
                        <div class="row g-3">
                            <div class="col-6" v-for="i in 8" :key="i">
                                <div class="skeleton-text" style="height: 14px; width: 70%;"></div>
                                <div class="skeleton-text mt-1" style="height: 18px; width: 85%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card border-0 shadow-sm">
                    <div class="card-body py-4">
                        <div class="skeleton-text" style="height: 24px; width: 60%; margin-bottom: 1rem;"></div>
                        <div class="skeleton-text" style="height: 120px; width: 100%;"></div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="row g-4">

            <div class="col-lg-8">

                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white border-bottom py-3 px-4">
                        <div class="d-flex align-items-center gap-2">
                            <div class="bg-primary bg-opacity-10 rounded-circle p-2">
                                <i class="fad fa-route text-primary"></i>
                            </div>
                            <h5 class="mb-0 fw-semibold">Vigencia y Recorrido</h5>
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <div class="row g-4">
                            <div class="col-md-6">
                                <label class="form-label text-muted small mb-1">Fecha de Inicio</label>
                                <div class="d-flex align-items-center gap-2 fs-6">
                                    <i class="fad fa-play-circle text-success"></i>
                                    <span class="fw-medium">{{ formatDate(currentFuecData?.effective_date) }}</span>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-muted small mb-1">Fecha de Expiración</label>
                                <div class="d-flex align-items-center gap-2 fs-6">
                                    <i class="fad fa-stop-circle text-danger"></i>
                                    <span class="fw-medium">{{ formatDate(currentFuecData?.expiration_date) }}</span>
                                    <span v-if="isExpiringSoon(currentFuecData?.expiration_date)"
                                        class="badge bg-warning-subtle text-warning border border-warning-subtle ms-2"
                                        style="font-size: 0.7rem;">
                                        <i class="fad fa-exclamation-triangle me-1"></i>Próximo a vencer
                                    </span>
                                </div>
                            </div>
                            <div class="col-12">
                                <label class="form-label text-muted small mb-1">Ruta del Servicio</label>
                                <div class="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                                    <div class="text-center">
                                        <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-1"
                                            style="width: 36px; height: 36px; font-weight: 600;">
                                            <i class="fad fa-map-marker-alt"></i>
                                        </div>
                                        <small class="text-muted d-block">Origen</small>
                                        <div class="fw-semibold">{{ currentFuecData?.origin_route || '-' }}</div>
                                    </div>
                                    <div class="flex-grow-1 border-top border-dashed my-2 mx-3"></div>
                                    <div class="text-center">
                                        <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mb-1"
                                            style="width: 36px; height: 36px; font-weight: 600;">
                                            <i class="fad fa-flag-checkered"></i>
                                        </div>
                                        <small class="text-muted d-block">Destino</small>
                                        <div class="fw-semibold">{{ currentFuecData?.destination_route || '-' }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white border-bottom py-3 px-4">
                        <div class="d-flex align-items-center gap-2">
                            <div class="bg-primary bg-opacity-10 rounded-circle p-2">
                                <i class="fad fa-building text-primary"></i>
                            </div>
                            <h5 class="mb-0 fw-semibold">Empresa Contratante</h5>
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <div class="row g-4 align-items-center">
                            <div class="col-md-4 text-center">
                                <div v-if="currentFuecData?.company?.logo_url" class="mb-3">
                                    <img :src="getMediaUrl(currentFuecData.company.logo_url)"
                                        :alt="currentFuecData.company.business_name"
                                        class="img-fluid rounded-3 border shadow-sm"
                                        style="max-height: 100px; object-fit: contain;">
                                </div>
                                <div v-else
                                    class="bg-light rounded-3 d-flex align-items-center justify-content-center mb-3"
                                    style="height: 100px;">
                                    <i class="fad fa-building fs-1 text-muted opacity-50"></i>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <div class="fs-5 fw-bold text-dark mb-2">{{ currentFuecData?.company?.business_name ||
                                    '-' }}</div>
                                <div class="row g-2 fs-6">
                                    <div class="col-6">
                                        <span class="text-muted small d-block">NIT</span>
                                        <span class="font-monospace">{{ currentFuecData?.company?.document_number }}-{{
                                            currentFuecData?.company?.verification_digit }}</span>
                                    </div>
                                    <div class="col-6">
                                        <span class="text-muted small d-block">Teléfono</span>
                                        <a :href="`tel:${currentFuecData?.company?.phone}`"
                                            class="text-decoration-none">{{ currentFuecData?.company?.phone || '-'
                                            }}</a>
                                    </div>
                                    <div class="col-12">
                                        <span class="text-muted small d-block">Dirección</span>
                                        <span>{{ currentFuecData?.company?.address || '-' }}</span>
                                    </div>
                                    <div class="col-12">
                                        <span class="text-muted small d-block">Email</span>
                                        <a :href="`mailto:${currentFuecData?.company?.email}`"
                                            class="text-decoration-none">{{ currentFuecData?.company?.email || '-'
                                            }}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white border-bottom py-3 px-4">
                        <div class="d-flex align-items-center gap-2">
                            <div class="bg-primary bg-opacity-10 rounded-circle p-2">
                                <i class="fad fa-user-tie text-primary"></i>
                            </div>
                            <h5 class="mb-0 fw-semibold">Contratista</h5>
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <div class="row g-4">
                            <div class="col-md-6">
                                <label class="form-label text-muted small mb-1">Nombre / Razón Social</label>
                                <div class="fs-6 fw-medium">{{ currentFuecData?.contractor?.company_name || '-' }}</div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-muted small mb-1">Documento</label>
                                <div class="font-monospace fs-6">{{ currentFuecData?.contractor?.document_number || '-'
                                }}</div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-muted small mb-1">Representante Legal</label>
                                <div class="fs-6">{{ currentFuecData?.contractor?.responsible_name || '-' }}</div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-muted small mb-1">Documento Representante</label>
                                <div class="font-monospace fs-6">{{ currentFuecData?.contractor?.responsible_document ||
                                    '-' }}</div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-muted small mb-1">Teléfono</label>
                                <a :href="`tel:${currentFuecData?.contractor?.responsible_phone}`"
                                    class="text-decoration-none fs-6">{{ currentFuecData?.contractor?.responsible_phone
                                        || '-' }}</a>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-muted small mb-1">Dirección</label>
                                <div class="fs-6">{{ currentFuecData?.contractor?.responsible_address || '-' }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white border-bottom py-3 px-4">
                        <div class="d-flex align-items-center gap-2">
                            <div class="bg-primary bg-opacity-10 rounded-circle p-2">
                                <i class="fad fa-car text-primary"></i>
                            </div>
                            <h5 class="mb-0 fw-semibold">Vehículo Asignado</h5>
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <div class="row g-4 align-items-center">
                            <div class="col-auto">
                                <div class="vehicle-avatar bg-primary bg-gradient text-white rounded-4 d-flex align-items-center justify-content-center shadow-sm"
                                    style="width: 72px; height: 72px; font-size: 1.4rem; font-weight: 700;">
                                    {{ getPlateInitials(currentFuecData?.vehicle?.vehicle_license_plate) }}
                                </div>
                            </div>
                            <div class="col">
                                <div class="fs-4 fw-bold font-monospace mb-1">{{
                                    currentFuecData?.vehicle?.vehicle_license_plate || '-' }}</div>
                                <div class="text-muted small">
                                    {{ currentFuecData?.vehicle?.brand?.description }} {{ currentFuecData?.vehicle?.line
                                        || '' }} {{ currentFuecData?.vehicle?.model }}
                                    <span class="text-muted mx-2">•</span>
                                    {{ currentFuecData?.vehicle?.vehicle_class?.description }} <span
                                        class="text-muted mx-2">•</span> Movil {{
                                            currentFuecData?.vehicle?.internal_number || '-' }}
                                </div>
                            </div>
                            <div class="col-auto">
                                <span
                                    class="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-3 py-2">
                                    <i class="fad fa-id-card me-1"></i>
                                    Tarjeta: {{ currentFuecData?.vehicle?.operation_cards?.[0]?.operating_card_number ||
                                        '-' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-white border-bottom py-3 px-4">
                        <div class="d-flex align-items-center gap-2">
                            <div class="bg-primary bg-opacity-10 rounded-circle p-2">
                                <i class="fad fa-file-alt text-primary"></i>
                            </div>
                            <h5 class="mb-0 fw-semibold">Objeto del Contrato</h5>
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <div class="mb-3">
                            <label class="form-label text-muted small mb-1">Nombre del Objeto</label>
                            <div class="fs-6 fw-medium">{{ currentFuecData?.objects_contract?.name || '-' }}</div>
                        </div>
                        <div>
                            <label class="form-label text-muted small mb-1">Descripción</label>
                            <p class="fs-6 text-muted mb-0" style="line-height: 1.6;">
                                {{ currentFuecData?.objects_contract?.description || '-' }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white border-bottom py-3 px-4">
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center gap-2">
                                <div class="bg-primary bg-opacity-10 rounded-circle p-2">
                                    <i class="fad fa-user-circle text-primary"></i>
                                </div>
                                <h5 class="mb-0 fw-semibold">Conductores Asignados</h5>
                            </div>
                            <span class="badge bg-light text-dark border">
                                {{ getConductorsCount }} asignado{{ getConductorsCount !== 1 ? 's' : '' }}
                            </span>
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <div v-if="currentFuecData?.main_conductor"
                            class="d-flex align-items-start gap-3 p-3 bg-light rounded-3 mb-3">
                            <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
                                {{ getInitials(currentFuecData.main_conductor.first_name,
                                    currentFuecData.main_conductor.last_name) }}
                            </div>
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center gap-2 mb-1">
                                    <span class="fw-semibold fs-6">{{ currentFuecData.main_conductor.first_name }} {{
                                        currentFuecData.main_conductor.last_name }}</span>
                                    <span class="badge bg-primary text-white rounded-pill px-2 py-1"
                                        style="font-size: 0.65rem;">Principal</span>
                                </div>
                                <div class="row g-2 fs-6">
                                    <div class="col-auto">
                                        <span class="text-muted small">C.C.</span>
                                        <span class="font-monospace ms-1">{{
                                            currentFuecData.main_conductor.document_number }}</span>
                                    </div>
                                </div>
                                <div v-if="currentFuecData.main_conductor.driver_licenses?.length" class="mt-2">
                                    <span class="text-muted small d-block mb-1">Licencia(s) de Conducción:</span>
                                    <div class="d-flex flex-wrap gap-2">
                                        <span v-for="license in currentFuecData.main_conductor.driver_licenses"
                                            :key="license.number"
                                            class="badge bg-white border text-dark fs-7 px-2 py-1">
                                            <i class="fad fa-id-card-alt me-1 text-primary"></i>
                                            {{ license.category }} • Vence: {{ formatDate(license.expiration_date) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="currentFuecData?.secondary_conductor"
                            class="d-flex align-items-start gap-3 p-3 bg-light rounded-3 mb-3">
                            <div class="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
                                {{ getInitials(currentFuecData.secondary_conductor.first_name,
                                    currentFuecData.secondary_conductor.last_name) }}
                            </div>
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center gap-2 mb-1">
                                    <span class="fw-semibold fs-6">{{ currentFuecData.secondary_conductor.first_name }}
                                        {{ currentFuecData.secondary_conductor.last_name }}</span>
                                    <span class="badge bg-secondary text-white rounded-pill px-2 py-1"
                                        style="font-size: 0.65rem;">Secundario</span>
                                </div>
                                <div class="row g-2 fs-6">
                                    <div class="col-auto">
                                        <span class="text-muted small">C.C.</span>
                                        <span class="font-monospace ms-1">{{
                                            currentFuecData.secondary_conductor.document_number }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="currentFuecData?.tertiary_conductor"
                            class="d-flex align-items-start gap-3 p-3 bg-light rounded-3">
                            <div class="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
                                {{ getInitials(currentFuecData.tertiary_conductor.first_name,
                                    currentFuecData.tertiary_conductor.last_name) }}
                            </div>
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center gap-2 mb-1">
                                    <span class="fw-semibold fs-6">{{ currentFuecData.tertiary_conductor.first_name }}
                                        {{ currentFuecData.tertiary_conductor.last_name }}</span>
                                    <span class="badge bg-info text-white rounded-pill px-2 py-1"
                                        style="font-size: 0.65rem;">Terciario</span>
                                </div>
                                <div class="row g-2 fs-6">
                                    <div class="col-auto">
                                        <span class="text-muted small">C.C.</span>
                                        <span class="font-monospace ms-1">{{
                                            currentFuecData.tertiary_conductor.document_number }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="!currentFuecData?.main_conductor && !currentFuecData?.secondary_conductor && !currentFuecData?.tertiary_conductor"
                            class="text-center text-muted py-4">
                            <i class="fad fa-user-slash fs-3 d-block mb-2 opacity-50"></i>
                            <p class="mb-0 small">No hay conductores asignados a este FUEC</p>
                        </div>
                    </div>
                </div>

            </div>

            <div class="col-lg-4">
                <div class="sidebar-wrapper d-flex flex-column gap-4">

                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white border-bottom py-3 px-4">
                            <h5 class="mb-0 fw-semibold">Resumen del FUEC</h5>
                        </div>
                        <div class="card-body p-4">
                            <div class="text-center mb-3 pb-3 border-bottom">
                                <img v-if="currentFuecData?.company?.logo_url" :src="getMediaUrl(currentFuecData.company.logo_url)"
                                    :alt="currentFuecData.company.business_name" class="img-fluid rounded-3 mb-2"
                                    style="max-height: 60px; object-fit: contain;">
                                <div class="fw-semibold fs-6">{{ currentFuecData?.company?.business_name }}</div>
                            </div>

                            <div class="mb-3">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="text-muted small">Número FUEC</span>
                                    <span class="font-monospace fw-medium">{{ currentFuecData?.number_fuec }}</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="text-muted small">N° Solicitud</span>
                                    <span class="font-monospace small text-break text-end ms-2">{{
                                        currentFuecData?.request_number || '-' }}</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="text-muted small">Estado</span>
                                    <span
                                        :class="currentFuecData?.status === 'ACTIVO' ? 'text-success' : 'text-warning'"
                                        class="fw-medium">{{ currentFuecData?.status }}</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="text-muted small">Vigencia</span>
                                    <span class="fw-medium small">{{ formatDateShort(currentFuecData?.effective_date) }}
                                        - {{ formatDateShort(currentFuecData?.expiration_date) }}</span>
                                </div>
                            </div>

                            <div class="mb-4">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <span class="text-muted small">Progreso de vigencia</span>
                                    <span class="fw-medium small">{{ getValidityProgress }}%</span>
                                </div>
                                <div class="progress" style="height: 6px;">
                                    <div class="progress-bar" :class="getValidityProgressClass" role="progressbar"
                                        :style="{ width: getValidityProgress + '%' }"
                                        :aria-valuenow="getValidityProgress" aria-valuemin="0" aria-valuemax="100">
                                    </div>
                                </div>
                            </div>

                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-primary btn-sm" @click="printFUEC"><i
                                        class="fad fa-print me-1"></i>Imprimir FUEC</button>
                                <button class="btn btn-outline-secondary btn-sm" @click="downloadPDF"><i
                                        class="fad fa-file-pdf me-1"></i>Descargar PDF</button>
                                <button class="btn btn-primary btn-sm" @click="editFUEC"><i
                                        class="fad fa-edit me-1"></i>Editar FUEC</button>
                            </div>
                        </div>
                    </div>

                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white border-bottom py-3 px-4">
                            <div class="d-flex align-items-center gap-2">
                                <div class="bg-success bg-opacity-10 rounded-circle p-2">
                                    <i class="fad fa-shield-check text-success"></i>
                                </div>
                                <h6 class="mb-0 fw-semibold">Autenticidad del Documento</h6>
                            </div>
                        </div>
                        <div class="card-body p-4">
                            <div class="mb-3">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="text-muted small">Código de Verificación</span>
                                    <span class="font-monospace fw-medium small">{{
                                        currentFuecData?.verification_code || '-' }}</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="text-muted small">Fecha de Emisión</span>
                                    <span class="fw-medium small">{{ formatDateShort(currentFuecData?.created_at)
                                    }}</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="text-muted small">Última Actualización</span>
                                    <span class="fw-medium small">{{ formatDateShort(currentFuecData?.updated_at)
                                    }}</span>
                                </div>
                            </div>

                            <div class="d-grid mb-3">
                                <button type="button" @click="verifyAuthenticity"
                                    class="btn btn-outline-success btn-sm">
                                    <i class="fad fa-check-circle me-1"></i>Verificar Autenticidad
                                </button>
                            </div>

                            <button class="btn btn-outline-secondary btn-sm w-100 mb-3" @click="copyVerificationCode">
                                <i class="fad fa-copy me-1"></i>Copiar Código de Verificación
                            </button>

                            <div class="legal-notice p-2 rounded">
                                <small class="text-muted d-block">
                                    <i class="fad fa-info-circle me-1"></i>
                                    Este documento tiene validez jurídica según Resolución {{ ministryResolution }} del
                                    Ministerio de Transporte de Colombia.
                                </small>
                            </div>
                        </div>
                    </div>

                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white border-bottom py-3 px-4">
                            <div class="d-flex align-items-center justify-content-between">
                                <div class="d-flex align-items-center gap-2">
                                    <div class="bg-primary bg-opacity-10 rounded-circle p-2">
                                        <i class="fad fa-users text-primary"></i>
                                    </div>
                                    <h5 class="mb-0 fw-semibold">Pasajeros</h5>
                                </div>
                                <span class="badge bg-light text-dark border">{{ currentFuecData?.passengers?.length ||
                                    0 }}</span>
                            </div>
                        </div>
                        <div class="card-body p-4">
                            <div v-if="currentFuecData?.passengers?.length" class="list-group list-group-flush">
                                <div v-for="(passenger, index) in currentFuecData.passengers"
                                    :key="passenger.uuid || index"
                                    class="list-group-item px-0 py-2 d-flex align-items-center gap-2">
                                    <div class="bg-light rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        style="width: 32px; height: 32px; font-size: 0.8rem; font-weight: 600;">{{ index
                                            + 1 }}</div>
                                    <div class="flex-grow-1">
                                        <div class="fw-medium small">{{ passenger.full_name || `Pasajero ${index + 1}`
                                        }}</div>
                                        <div class="text-muted small" style="font-size: 0.75rem;">{{
                                            passenger.document_number || 'Documento no registrado' }}</div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="text-center text-muted py-3">
                                <i class="fad fa-user-friends fs-4 d-block mb-2 opacity-50"></i>
                                <p class="mb-0 small">No hay pasajeros registrados</p>
                            </div>
                        </div>
                    </div>

                    <div class="card border-0 shadow-sm" v-if="currentFuecData?.company?.signature_url">
                        <div class="card-header bg-white border-bottom py-3 px-4">
                            <div class="d-flex align-items-center gap-2">
                                <div class="bg-primary bg-opacity-10 rounded-circle p-2">
                                    <i class="fad fa-signature text-primary"></i>
                                </div>
                                <h5 class="mb-0 fw-semibold">Firma Digital</h5>
                            </div>
                        </div>
                        <div class="card-body p-4 text-center">
                            <img :src="getMediaUrl(currentFuecData.company.signature_url)" alt="Firma digital" class="img-fluid mb-2"
                                style="max-height: 80px; max-width: 200px;">
                            <p class="text-muted small mb-0">Firma autorizada de {{
                                currentFuecData?.company?.business_name }}</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <div class="mt-5 pt-4 border-top border-primary border-opacity-25">
            <div class="d-flex flex-column gap-4 px-2">
                <div class="text-muted text-center"
                    style="font-size: 0.75rem; line-height: 1.6; max-width: 800px; margin: 0 auto;">
                    <p class="mb-0">
                        <i class="fad fa-info-circle me-1"></i>
                        Este documento ha sido generado electrónicamente por
                        <strong>Falcon FUEC</strong>, desarrollado y administrado por
                        <strong>SOLUCIONES INTEGRALES MANA S.A.S</strong>, conforme a las disposiciones establecidas
                        por el Ministerio
                        de Transporte de Colombia.
                    </p>
                </div>
            </div>
        </div>

        <div class="print-footer d-none">
            <div class="print-line">
                {{ appName }} - {{ companyName }} |
                FUEC N {{ currentFuecData?.number_fuec }} |
                Verificacion: {{ verificationCode }} |
                Resolucion {{ ministryResolution }} MTC
            </div>
            <div class="print-line">
                Documento generado electronicamente - ID: {{ currentFuecData?.request_number }}
            </div>
        </div>


    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import dateUtils from '@/utils/date.js';
import Swal from 'sweetalert2';
import FuecService from '@/features/fuec/services/fuec.service.js';
import getMediaUrl from '@/utils/media.js';

// ===== CONFIGURACIÓN MTC =====
const OFFICIAL_DOMAIN = import.meta.env.VITE_MTC_OFFICIAL_URL || 'https://fuec.mintransporte.gov.co';
const ministryResolution = ref(import.meta.env.VITE_MTC_RESOLUTION || '202330400815');

// ===== PROPS =====
const props = defineProps({
    currentFuecData: { type: Object, required: false, default: null },
    loading: { type: Boolean, default: false }
});

const router = useRouter();
const route = useRoute();

const internalFuecData = ref(null);
const internalLoading = ref(false);
const errorMsg = ref(null);
const accessedViaQR = ref(false);
const verificationCode = ref('');

const currentFuecData = computed(() => props.currentFuecData || internalFuecData.value);
const loading = computed(() => props.loading || internalLoading.value);

// ===== VARIABLES DE IDENTIDAD (Añadidas para el nuevo Footer) =====
const appName = ref(import.meta.env.VITE_APP_NAME || 'Sistema FUEC');
const companyName = computed(() => currentFuecData.value?.company?.business_name || 'Empresa de Transporte');

// ===== URLS DE VERIFICACIÓN =====
const verifyAuthenticity = () => {
    if (!currentFuecData.value) return;

    const currentDate = dateUtils.dayjs();
    const effectiveDate = dateUtils.dayjs(currentFuecData.value.effective_date).startOf('day');
    const expirationDate = dateUtils.dayjs(currentFuecData.value.expiration_date).endOf('day');

    if (currentDate.isBefore(effectiveDate)) {
        Swal.fire({
            title: 'No Vigente',
            html: `
                <p class="mb-2">El FUEC <strong>#${currentFuecData.value.number_fuec || ''}</strong> aún no está en periodo de vigencia.</p>
                <div class="alert alert-warning small mb-0 mt-2 text-start">
                    <i class="fad fa-exclamation-triangle me-1"></i>
                    La vigencia iniciará el <strong>${formatDateShort(currentFuecData.value.effective_date)}</strong>.
                </div>
            `,
            icon: 'warning',
            confirmButtonText: '<i class="fad fa-check me-1"></i>Aceptar',
            confirmButtonColor: '#ffc107',
            customClass: { popup: 'rounded-3 shadow', confirmButton: 'btn btn-warning px-4 mx-1 text-dark' },
            buttonsStyling: false
        });
        return;
    }

    if (currentDate.isAfter(expirationDate)) {
        Swal.fire({
            title: 'FUEC Vencido',
            html: `
                <p class="mb-2">El FUEC <strong>#${currentFuecData.value.number_fuec || ''}</strong> se encuentra expirado.</p>
                <div class="alert alert-danger small mb-0 mt-2 text-start">
                    <i class="fad fa-times-circle me-1"></i>
                    La validez del documento terminó el <strong>${formatDateShort(currentFuecData.value.expiration_date)}</strong>.
                </div>
            `,
            icon: 'error',
            confirmButtonText: '<i class="fad fa-check me-1"></i>Aceptar',
            confirmButtonColor: '#dc3545',
            customClass: { popup: 'rounded-3 shadow', confirmButton: 'btn btn-danger px-4 mx-1' },
            buttonsStyling: false
        });
        return;
    }

    Swal.fire({
        title: 'Documento Validado',
        html: `
            <p class="mb-2">El FUEC <strong>#${currentFuecData.value.number_fuec || ''}</strong> es válido y está vigente.</p>
            <div class="alert alert-success small mb-0 mt-2 text-start">
                <i class="fad fa-shield-check me-1"></i>
                Este documento es auténtico y cumple con la normativa de fechas.
            </div>
        `,
        icon: 'success',
        confirmButtonText: '<i class="fad fa-check me-1"></i>Aceptar',
        confirmButtonColor: '#198754',
        customClass: {
            popup: 'rounded-3 shadow',
            confirmButton: 'btn btn-success px-4 mx-1'
        },
        buttonsStyling: false
    });
};

// ===== UTILIDADES DE FORMATO =====
const formatDate = (dateStr, withTime = false) => {
    if (!dateStr) return '-';
    const format = withTime ? 'DD [de] MMMM [de] YYYY [a las] HH:mm' : 'DD [de] MMMM [de] YYYY';
    return dateUtils.dayjs(dateStr).locale('es').format(format);
};

const formatDateShort = (dateStr) => {
    if (!dateStr) return '-';
    return dateUtils.dayjs(dateStr).locale('es').format('DD/MM/YYYY');
};

const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    return new Intl.NumberFormat('es-CO').format(value);
};

// ===== UTILIDADES VISUALES =====
const getPlateInitials = (plate) => {
    if (!plate) return '?';
    const clean = String(plate).replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return clean.substring(0, 3) || '?';
};

const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return '?';
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}`.trim() || '?';
};

// ===== CÁLCULOS DERIVADOS =====
const isExpiringSoon = (dateStr) => {
    if (!dateStr) return false;
    const expiry = dateUtils.dayjs(dateStr);
    const today = dateUtils.dayjs();
    const daysDiff = expiry.diff(today, 'days');
    return daysDiff >= 0 && daysDiff <= 5;
};

const getConductorsCount = computed(() => {
    let count = 0;
    if (currentFuecData.value?.main_conductor) count++;
    if (currentFuecData.value?.secondary_conductor) count++;
    if (currentFuecData.value?.tertiary_conductor) count++;
    return count;
});

const getValidityProgress = computed(() => {
    if (!currentFuecData.value?.effective_date || !currentFuecData.value?.expiration_date) return 0;
    const start = dateUtils.dayjs(currentFuecData.value.effective_date);
    const end = dateUtils.dayjs(currentFuecData.value.expiration_date);
    const now = dateUtils.dayjs();
    const totalDays = end.diff(start, 'days');
    const elapsedDays = now.diff(start, 'days');
    if (totalDays <= 0) return 100;
    if (elapsedDays < 0) return 0;
    if (elapsedDays > totalDays) return 100;
    return Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
});

const getValidityProgressClass = computed(() => {
    const progress = getValidityProgress.value;
    if (progress >= 80) return 'bg-danger';
    if (progress >= 60) return 'bg-warning';
    return 'bg-success';
});

// ===== ACCIONES =====
const printFUEC = () => {
    document.body.classList.add('printing-fuec');
    setTimeout(() => {
        window.print();
        document.body.classList.remove('printing-fuec');
    }, 100);
};

const downloadPDF = async () => {
    try {
        if (!currentFuecData.value?.uuid) throw new Error('UUID no disponible');
        await FuecService.generatePDF(currentFuecData.value.uuid, {
            includeVerificationQR: true,
            ministryCompliant: true,
            verificationCode: verificationCode.value
        });
    } catch (error) {
        console.error('Error generando PDF:', error);
        alert('No se pudo generar el PDF. Intente nuevamente o contacte al administrador.');
    }
};

const editFUEC = () => {
    if (currentFuecData.value?.uuid) {
        router.push(`/operations/fuec/editar/${currentFuecData.value.uuid}`);
    }
};

const copyVerificationCode = async (event) => {
    try {
        await navigator.clipboard.writeText(currentFuecData.value?.verification_code || '-');
        // Mostrar feedback visual simple
        const btn = event?.currentTarget;
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fad fa-check me-1"></i>Copiado';
            btn.classList.add('btn-success');
            btn.classList.remove('btn-outline-secondary');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('btn-success');
                btn.classList.add('btn-outline-secondary');
            }, 2000);
        }
    } catch (err) {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar el código. Selecciónelo manualmente.');
    }
};

// ===== INICIALIZACIÓN DE TOOLTIPS =====
const initTooltips = () => {
    if (typeof window?.bootstrap?.Tooltip !== 'undefined') {
        setTimeout(() => {
            document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
                try {
                    const instance = window.bootstrap.Tooltip.getInstance(el);
                    if (instance) instance.dispose();
                    new window.bootstrap.Tooltip(el, { trigger: 'hover', delay: { show: 150, hide: 80 } });
                } catch (e) { /* Ignorar */ }
            });
        }, 100);
    }
};

// ===== CARGA DE DATOS CON VALIDACIÓN QR =====
const loadFuecData = async (id, code) => {
    try {
        internalLoading.value = true;
        errorMsg.value = null;

        // Usamos el endpoint público de validación para cualquier identificador provisto
        const response = await FuecService.validate(id);

        const data = response.data?.data ?? response.data;
        if (!data) {
            throw new Error('No se encontró información para el código proporcionado o ya ha expirado.');
        }

        internalFuecData.value = data;
        verificationCode.value = data?.verification_code || '-';

        // Registrar evento de verificación por QR para auditoría MTC
        if (accessedViaQR.value) {
            await FuecService.logVerification?.(data.uuid, 'QR_SCAN', {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                source: 'mobile_qr'
            });
        }

        return data;
    } catch (error) {
        console.error('Error al cargar/validar el FUEC:', error);
        errorMsg.value = error.response?.data?.message || 'No se pudo cargar la información del FUEC.';
        throw error;
    } finally {
        internalLoading.value = false;
    }
};

// ===== ON MOUNTED =====
onMounted(async () => {
    initTooltips();

    // Detectar acceso por QR desde parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    accessedViaQR.value = urlParams.has('qr') || urlParams.has('scan') || route.query.source === 'qr' || !!route.params.code;

    // Cargar datos si no se recibieron por props
    if (!props.currentFuecData && route.params.id) {
        const code = route.params.code || urlParams.get('code');
        await loadFuecData(route.params.id, code);
    } else if (!props.currentFuecData && !route.params.id) {
        const result = await Swal.fire({
            title: 'Consultar FUEC',
            text: 'Ingrese el código de verificación del FUEC a consultar:',
            input: 'text',
            inputPlaceholder: 'Ej: AB1234',
            showCancelButton: true,
            confirmButtonText: '<i class="fad fa-search me-1"></i>Consultar',
            cancelButtonText: 'Regresar',
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
                popup: 'rounded-3 shadow',
                confirmButton: 'btn btn-primary px-4 mx-1',
                cancelButton: 'btn btn-secondary px-4 mx-1'
            },
            buttonsStyling: false,
            inputValidator: (value) => {
                if (!value || value.trim() === '') {
                    return 'Debe ingresar un identificador válido';
                }
            }
        });

        if (result.isConfirmed) {
            const enteredId = result.value.trim();
            router.replace(`/validacion-de-fuec/${enteredId}`);
        } else {
            router.push('/');
        }
    } else if (props.currentFuecData) {
        // Generar código de verificación para datos ya cargados
        verificationCode.value = props.currentFuecData?.verification_code || '-';
    }
});

// ===== WATCHERS =====
watch(() => props.currentFuecData, (newData) => {
    if (newData) {
        verificationCode.value = newData?.verification_code || '-';
    }
}, { immediate: true });

watch(() => route.params.id, async (newId) => {
    if (newId && !props.currentFuecData) {
        const urlParams = new URLSearchParams(window.location.search);
        const code = route.params.code || urlParams.get('code');
        await loadFuecData(newId, code);
    }
});
</script>

<style scoped>
/* ===== ANIMACIONES ===== */
.fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
    opacity: 0;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ===== VARIABLES ===== */
:root {
    --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    --shadow-md: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    --shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.175);
    --transition: 150ms ease-in-out;
}

/* ===== WRAPPER ===== */
.fuec-detail-wrapper {
    --bs-body-bg: #f8f9fa;
    min-height: 100vh;
    padding: 1rem 0;
}

.fuec-detail-wrapper.qr-access::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #198754, #0d6efd, #198754);
    z-index: 1000;
    animation: scanLine 3s linear infinite;
}

@keyframes scanLine {

    0%,
    100% {
        opacity: 0.3;
    }

    50% {
        opacity: 1;
    }
}

/* ===== CARDS ===== */
.card {
    border-radius: 1rem !important;
    transition: box-shadow var(--transition), transform var(--transition);
    border: none !important;
}

.card:hover {
    box-shadow: var(--shadow-lg) !important;
    transform: translateY(-2px);
}

.card-header {
    background: linear-gradient(135deg, #fff, #f8f9fa) !important;
    border-radius: 1rem 1rem 0 0 !important;
}

/* ===== AVATAR DE PLACA ===== */
.vehicle-avatar {
    background: linear-gradient(135deg, var(--bs-primary), var(--bs-primary-dark, #0a58ca)) !important;
    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
    transition: transform var(--transition);
}

.vehicle-avatar:hover {
    transform: scale(1.05);
}

/* ===== TIPOGRAFÍA ===== */
.fw-semibold {
    font-weight: 600 !important;
}

.fw-bold {
    font-weight: 700 !important;
}

.fs-7 {
    font-size: 0.8rem !important;
}

.fs-6 {
    font-size: 0.9rem !important;
}

.fs-5 {
    font-size: 1rem !important;
}

.text-muted {
    color: #6c757d !important;
}

.text-primary {
    color: #0d6efd !important;
}

.font-monospace {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

/* ===== BADGES ===== */
.badge {
    font-weight: 500;
    letter-spacing: 0.02em;
    transition: transform var(--transition);
}

.badge:hover {
    transform: translateY(-1px);
}

.badge-qr-verified {
    animation: pulse-verify 2s infinite;
    box-shadow: 0 0 0 2px rgba(25, 135, 84, 0.3);
}

@keyframes pulse-verify {

    0%,
    100% {
        box-shadow: 0 0 0 2px rgba(25, 135, 84, 0.3);
    }

    50% {
        box-shadow: 0 0 0 4px rgba(25, 135, 84, 0.1);
    }
}

.bg-success-subtle {
    background-color: rgba(25, 135, 84, 0.1) !important;
}

.text-success {
    color: #198754 !important;
}

.border-success-subtle {
    border-color: rgba(25, 135, 84, 0.2) !important;
}

.bg-warning-subtle {
    background-color: rgba(255, 193, 7, 0.1) !important;
}

.text-warning {
    color: #997404 !important;
}

.border-warning-subtle {
    border-color: rgba(255, 193, 7, 0.2) !important;
}

.bg-info-subtle {
    background-color: rgba(13, 110, 253, 0.1) !important;
}

.text-info {
    color: #0d6efd !important;
}

.border-info-subtle {
    border-color: rgba(13, 110, 253, 0.2) !important;
}

/* ===== CAMPOS DE FORMULARIO ===== */
.form-label {
    margin-bottom: 0.25rem !important;
    font-size: 0.75rem !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600 !important;
}

/* ===== BOTONES ===== */
.btn {
    transition: all var(--transition);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    font-weight: 500;
}

.btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary {
    background: linear-gradient(135deg, var(--bs-primary), var(--bs-primary-dark, #0a58ca));
    border: none;
}

.btn-primary:hover {
    background: linear-gradient(135deg, var(--bs-primary-dark, #0a58ca), var(--bs-primary-darker, #084298));
}

.btn-outline-secondary {
    border-color: #dee2e6;
    color: #495057;
}

.btn-outline-secondary:hover {
    background-color: #f8f9fa;
    border-color: #adb5bd;
}

/* ===== SIDEBAR ===== */
.sidebar-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

@media (min-width: 992px) {
    .sticky-summary {
        position: sticky;
        top: 2rem;
        z-index: 100;
        max-height: calc(100vh - 4rem);
        overflow-y: auto;
    }

    .sticky-summary .card-body {
        padding-bottom: 1.5rem !important;
    }
}

@media (max-width: 991px) {
    .sticky-summary {
        position: static !important;
        max-height: none;
        overflow-y: visible;
    }
}

/* ===== RUTA VISUAL ===== */
.border-dashed {
    border-style: dashed !important;
    border-color: #adb5bd !important;
}

/* ===== LISTA DE PASAJEROS ===== */
.list-group-item {
    background: transparent !important;
    border: none !important;
}

/* ===== SKELETON ===== */
.skeleton-text {
    background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
    background-size: 200% 100%;
    animation: skeleton-pulse 1.5s infinite ease-in-out;
    border-radius: 0.5rem;
}

@keyframes skeleton-pulse {

    0%,
    100% {
        background-position: 200% 0;
        opacity: 1;
    }

    50% {
        background-position: -200% 0;
        opacity: 0.6;
    }
}

/* ===== CÓDIGO DE VERIFICACIÓN ===== */
.verification-code {
    font-family: 'Courier New', monospace;
    letter-spacing: 1px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
    padding: 0.4rem 0.8rem;
    border-radius: 0.4rem;
    border: 1px dashed rgba(255, 255, 255, 0.3);
}

/* ===== QR DE VERIFICACIÓN ===== */
.verification-qr {
    border: 3px solid #0d6efd;
    border-radius: 0.75rem;
    transition: transform 0.2s ease;
}

.verification-qr:hover {
    transform: scale(1.02);
}

/* ===== NOTA LEGAL ===== */
.legal-notice {
    font-size: 0.7rem;
    color: #6c757d;
    border-left: 3px solid #0d6efd;
    padding-left: 0.75rem;
    background: rgba(13, 110, 253, 0.03);
    border-radius: 0 0.25rem 0.25rem 0;
}

/* ===== RESPONSIVE PARA MÓVIL (Escaneo QR) ===== */
@media (max-width: 576px) {
    .fuec-detail-wrapper {
        padding: 0.5rem 0;
    }

    .card-body {
        padding: 1.25rem !important;
    }

    .fs-5 {
        font-size: 0.95rem !important;
    }

    .fs-6 {
        font-size: 0.85rem !important;
    }

    .form-label {
        font-size: 0.7rem !important;
    }

    .d-flex.gap-2 {
        flex-direction: column;
        width: 100%;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }

    .border-dashed {
        display: none;
    }

    .d-flex.align-items-center.gap-3.p-3 {
        flex-direction: column;
        text-align: center;
    }

    .verification-qr {
        width: 100px !important;
        height: 100px !important;
    }

    .verification-code {
        font-size: 0.75rem;
        padding: 0.3rem 0.6rem;
    }
}

/* ===== ESTILOS DE IMPRESIÓN ===== */
@media print {
    body {
        font-size: 10pt !important;
        color: #000 !important;
        background: #fff !important;
    }

    body.printing-fuec .fuec-detail-wrapper {
        padding: 0 !important;
    }

    .card {
        box-shadow: none !important;
        border: 1px solid #dee2e6 !important;
        break-inside: avoid;
        page-break-inside: avoid;
    }

    .card-header {
        background: #fff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .no-print,
    .btn,
    .sidebar-wrapper>*:not(.card:first-child):not(.card:nth-child(2)),
    .badge-qr-verified {
        display: none !important;
    }

    .sticky-summary {
        position: static !important;
        max-height: none !important;
        overflow-y: visible !important;
    }

    .bg-gradient {
        background: #0d6efd !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .text-white,
    .text-white-50 {
        color: #000 !important;
    }

    .verification-qr {
        border: 2px solid #000 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .verification-code {
        border: 1px solid #000 !important;
        background: #fff !important;
        color: #000 !important;
    }

    .badge {
        border: 1px solid #000 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .print-footer {
        display: block !important;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 8pt;
        color: #666;
        border-top: 1px solid #ddd;
        padding: 8px 0;
        background: #fff;
        font-family: monospace;
    }

    .vehicle-avatar {
        background: #0d6efd !important;
        color: #fff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    a {
        text-decoration: none;
        color: #000 !important;
    }

    a[href]::after {
        content: " (" attr(href) ")";
        font-size: 8pt;
        color: #666;
    }
}

/* ===== ACCESIBILIDAD ===== */
:focus-visible {
    outline: 2px solid #0d6efd !important;
    outline-offset: 2px !important;
}

/* El cursor de ayuda (?) solo aplica a elementos informativos no clicables.
   Los controles interactivos mantienen la mano (pointer). */
[title]:not(button, a, input, select, textarea, [role="button"]),
[data-bs-toggle="tooltip"]:not(button, a, input, select, textarea, [role="button"]) {
    cursor: help;
}

button[title],
a[title],
button[data-bs-toggle="tooltip"],
a[data-bs-toggle="tooltip"] {
    cursor: pointer;
}

.verification-section:focus-within {
    outline: 2px solid #0d6efd;
    outline-offset: 2px;
    border-radius: 0.5rem;
}

/* ===== UTILIDADES ===== */
.bg-opacity-10 {
    --bs-bg-opacity: 0.1;
}

.rounded-4 {
    border-radius: 1rem !important;
}

.rounded-3 {
    border-radius: 0.75rem !important;
}
</style>