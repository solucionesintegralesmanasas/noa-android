<template>
    <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle" icon="fad fa-building" :breadcrumbs="breadcrumbs"
        :showBack="true" :showEdit="can('companies.update')" @back="goBack" @edit="goToEdit" />

    <!-- SKELETON LOADING -->
    <div v-if="isViewLoading" class="row g-3 mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <div class="col-12 col-xxl-12">
            <div class="card border-0 shadow-sm">
                <div class="card-body d-flex gap-4 flex-column flex-sm-row align-items-center py-4 g-2 g-md-3">
                    <div class="skeleton-avatar rounded-3 flex-shrink-0" style="width: 100px; height: 100px;"></div>
                    <div class="w-100">
                        <div class="row g-2">
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="i in 6" :key="i">
                                <div class="skeleton-text" style="height: 14px; width: 90%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <div v-else class="row g-3 mb-3 fade-in-up" style="animation-delay: 0.1s;">

        <!-- SECCIÓN 1: INFORMACIÓN GENERAL -->
        <div class="col-12 col-sm-12 col-md-12 col-lg-8">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-info-circle text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Información General</h6>
                </div>
                <div class="card-body py-3">
                    <div class="d-flex gap-3 flex-column flex-sm-row align-items-start g-2 g-md-3">
                        <!-- Logo -->
                        <div class="text-center flex-shrink-0">
                            <img v-if="company.logo_url" class="rounded-3 shadow-sm img-fluid" :src="getMediaUrl(company.logo_url)"
                                :alt="company.business_name" width="100" height="100"
                                style="object-fit: cover; border: 2px solid #f1f3f5;" @error="handleImageError" />
                            <div v-else
                                class="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center fw-bold"
                                style="width: 100px; height: 100px; font-size: 1.2rem;">
                                {{ avatarInitials }}
                            </div>
                        </div>

                        <!-- Datos básicos -->
                        <div class="w-100">
                            <dl class="row mb-0 small g-2 g-md-3" style="font-size: 0.85rem;">
                                <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium">Razón social:</dt>
                                <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark fw-semibold">{{ company.business_name || '—' }}</dd>

                                <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium mt-1">Nombre comercial:</dt>
                                <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark mt-1">{{ company.trade_name || '—' }}</dd>

                                <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium mt-1">Tipo de persona:</dt>
                                <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark mt-1">
                                    <span class="badge bg-light text-dark border" style="font-size: 0.7rem;">
                                        {{ company.person_type || '—' }}
                                    </span>
                                </dd>

                                <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium mt-1">Estructura legal:</dt>
                                <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark mt-1">{{ company.legal_structure || '—' }}</dd>

                                <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium mt-1">Sector económico:</dt>
                                <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark mt-1">{{ company.economic_sector || '—' }}</dd>

                                <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium mt-1">Matrícula mercantil:</dt>
                                <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark mt-1">{{ company.commercial_registration || '—' }}</dd>

                                <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium mt-1">N° de Empleados:</dt>
                                <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark mt-1">{{ company.approximate_number_of_employees || '—' }}</dd>

                                <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium mt-1">NIT:</dt>
                                <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark font-monospace mt-1">
                                    {{ company.document_number || '—' }}
                                    <span v-if="company.verification_digit" class="text-muted">-{{ company.verification_digit }}</span>
                                </dd>

                                <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium mt-1">Tipo documento:</dt>
                                <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark mt-1">{{ company.type_of_document?.prefix || '—' }}</dd>

                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SECCIÓN 2: CONTACTO Y UBICACIÓN -->
        <div class="col-12 col-sm-12 col-md-12 col-lg-4">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-address-book text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Contacto</h6>
                </div>
                <div class="card-body py-3">
                    <dl class="row mb-0 small g-2 g-md-3" style="font-size: 0.85rem;">
                        <dt class="col-12 col-sm-4 col-md-4 col-lg-4 text-muted fw-medium">Teléfono:</dt>
                        <dd class="col-12 col-sm-8 col-md-8 col-lg-8 text-dark">
                            <a v-if="company.phone" :href="`tel:${company.phone}`"
                                class="text-decoration-none text-dark">
                                {{ company.phone }}
                            </a>
                            <span v-else>—</span>
                        </dd>

                        <dt class="col-12 col-sm-4 col-md-4 col-lg-4 text-muted fw-medium mt-2">Email:</dt>
                        <dd class="col-12 col-sm-8 col-md-8 col-lg-8 mt-2">
                            <a v-if="company.email" :href="`mailto:${company.email}`"
                                class="text-primary text-decoration-none">
                                {{ company.email }}
                            </a>
                            <span v-else>—</span>
                        </dd>

                        <dt class="col-12 col-sm-4 col-md-4 col-lg-4 text-muted fw-medium mt-2">Dirección:</dt>
                        <dd class="col-12 col-sm-8 col-md-8 col-lg-8 text-dark mt-2">{{ company.address || '—' }}</dd>

                        <dt class="col-12 col-sm-4 col-md-4 col-lg-4 text-muted fw-medium mt-2">Código postal:</dt>
                        <dd class="col-12 col-sm-8 col-md-8 col-lg-8 text-dark mt-2">{{ company.postal_code || '—' }}</dd>

                        <dt class="col-12 col-sm-4 col-md-4 col-lg-4 text-muted fw-medium mt-2">Ubicación:</dt>
                        <dd class="col-12 col-sm-8 col-md-8 col-lg-8 text-dark mt-2">
                            <i class="fad fa-map-marker-alt me-1 text-muted"></i>
                            {{ cityLabel }}
                        </dd>

                        <dt class="col-12 col-sm-4 col-md-4 col-lg-4 text-muted fw-medium mt-2">Web:</dt>
                        <dd class="col-12 col-sm-8 col-md-8 col-lg-8 text-dark mt-2">
                            <a v-if="company.web_page" :href="company.web_page" target="_blank"
                                class="text-primary text-decoration-none text-truncate d-block">
                                {{ company.web_page }}
                            </a>
                            <span v-else>—</span>
                        </dd>

                        <dt class="col-12 col-sm-4 col-md-4 col-lg-4 text-muted fw-medium mt-2">País:</dt>
                        <dd class="col-12 col-sm-8 col-md-8 col-lg-8 text-dark mt-2">
                            <span class="badge bg-light text-dark border" style="font-size: 0.7rem;">
                                {{ countryLabel }}
                            </span>
                        </dd>
                    </dl>
                </div>
            </div>
        </div>

        <!-- SECCIÓN 3: REPRESENTANTE LEGAL -->
        <div class="col-12 col-sm-12 col-md-6 col-lg-6">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-user-tie text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Representante Legal</h6>
                </div>
                <div class="card-body py-3">
                    <dl class="row mb-0 small g-2 g-md-3" style="font-size: 0.85rem;">
                        <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium">Nombre completo:</dt>
                        <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark fw-medium">
                            {{ company.legal_representative_name || '—' }}
                            {{ company.legal_representative_last_name || '' }}
                        </dd>

                        <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium mt-2">Nacionalidad:</dt>
                        <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark mt-2">{{ company.legal_representative_nationality || '—' }}</dd>

                        <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium mt-2">Tipo documento:</dt>
                        <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark mt-2">{{ company.legal_representative_document_type || '—' }}</dd>

                        <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium mt-2">Número documento:</dt>
                        <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark font-monospace mt-2">{{ company.legal_representative_document_number || '—' }}</dd>

                        <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium mt-2">Fecha Exp. Doc.:</dt>
                        <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark mt-2">{{ formatDateShort(company.legal_representative_document_issue_date) || '—' }}</dd>
                    </dl>
                </div>
            </div>
        </div>

        <!-- SECCIÓN 4: INFORMACIÓN FINANCIERA -->
        <div class="col-12 col-sm-12 col-md-6 col-lg-6">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-file-invoice-dollar text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Información Financiera</h6>
                </div>
                <div class="card-body py-3">
                    <dl class="row mb-0 small g-2 g-md-3" style="font-size: 0.85rem;">
                        <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium">Régimen tributario:</dt>
                        <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark">
                            {{ company.tax_regime?.name || (company.tax_regime_uuid ? 'Configurado' : '—') }}
                        </dd>

                        <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium mt-2">Moneda:</dt>
                        <dd class="col-12 col-sm-7 col-md-8 col-lg-8 text-dark mt-2">
                            <span class="badge bg-light text-dark border" style="font-size: 0.7rem;">
                                {{ company.currency_code || 'COP' }}
                            </span>
                        </dd>

                        <dt class="col-12 col-sm-5 col-md-4 col-lg-4 text-muted fw-medium mt-2">Estado contable:</dt>
                        <dd class="col-12 col-sm-7 col-md-8 col-lg-8 mt-2">
                            <span class="badge rounded-pill"
                                :class="company.is_active === 1 ? 'badge-subtle-success' : 'badge-subtle-warning'"
                                style="font-size: 0.7rem; padding: 0.25em 0.6em;">
                                {{ company.is_active === 1 ? 'Activo' : 'Inactivo' }}
                            </span>
                        </dd>
                    </dl>
                </div>
            </div>
        </div>

        <!-- SECCIÓN 5: DOCUMENTOS ADJUNTOS -->
        <div class="col-12 col-sm-12 col-md-12 col-lg-12">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-folder-open text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Documentos Adjuntos</h6>
                </div>
                <div class="card-body py-3">
                    <div class="row g-3">
                        <!-- Logo -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <div class="border rounded-3 p-3 text-center h-100" style="background: #fafafa;">
                                <i class="fad fa-image text-muted mb-2" style="font-size: 24px;"></i>
                                <p class="small fw-medium mb-1">Logo de la empresa</p>
                                <a v-if="company.logo_url" :href="getMediaUrl(company.logo_url)" target="_blank"
                                    class="btn btn-outline-primary btn-sm" style="font-size: 0.75rem;">
                                    <i class="fad fa-external-link me-1"></i>Ver
                                </a>
                                <span v-else class="text-muted small">No disponible</span>
                            </div>
                        </div>
                        <!-- Firma -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <div class="border rounded-3 p-3 text-center h-100" style="background: #fafafa;">
                                <i class="fad fa-signature text-muted mb-2" style="font-size: 24px;"></i>
                                <p class="small fw-medium mb-1">Firma del representante</p>
                                <a v-if="company.signature_url" :href="getMediaUrl(company.signature_url)" target="_blank"
                                    class="btn btn-outline-primary btn-sm" style="font-size: 0.75rem;">
                                    <i class="fad fa-external-link me-1"></i>Ver
                                </a>
                                <span v-else class="text-muted small">No disponible</span>
                            </div>
                        </div>
                        <!-- Archivos adicionales -->
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <div class="border rounded-3 p-3 h-100" style="background: #fafafa;">
                                <p class="small fw-medium mb-2">Otros archivos ({{company.files?.filter(f =>
                                    !f.is_primary)?.length || 0}})</p>
                                <div v-if="company.files?.length" class="list-unstyled mb-0"
                                    style="max-height: 120px; overflow-y: auto;">
                                    <li v-for="file in company.files" :key="file.uuid" class="mb-2">
                                        <a :href="getMediaUrl(file.url)" target="_blank"
                                            class="text-decoration-none small d-flex align-items-center gap-2">
                                            <i :class="getFileIcon(file)" class="text-muted"
                                                style="font-size: 12px;"></i>
                                            <span class="text-truncate" :title="file.path">{{
                                                truncateFileName(file.path) }}</span>
                                        </a>
                                    </li>
                                </div>
                                <span v-else class="text-muted small">Sin archivos adicionales</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SECCIÓN 6: ENTIDADES RELACIONADAS -->
        <div class="col-12 col-sm-12 col-md-6 col-lg-6">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-building-user text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Sucursales ({{ company.branches?.length || 0
                    }})</h6>
                </div>
                <div class="card-body py-3">
                    <div v-if="company.branches?.length" class="list-group list-group-flush small">
                        <div v-for="branch in company.branches" :key="branch.uuid"
                            class="list-group-item py-2 px-0 border-0 d-flex justify-content-between align-items-center">
                            <div>
                                <span class="fw-medium text-dark">{{ branch.name }}</span>
                                <small class="text-muted d-block">{{ branch.address }}</small>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <span v-if="branch.is_primary" class="badge badge-subtle-success"
                                    style="font-size: 0.7rem;">
                                    <i class="fad fa-star me-1" style="font-size: 8px;"></i>Principal
                                </span>
                                <router-link v-if="can('branches.view')"
                                    :to="`/empresas/sucursales/perfil/${branch.uuid}`"
                                    class="btn btn-falcon-default btn-sm py-1 px-2" style="font-size: 0.7rem;">
                                    Ver
                                </router-link>
                            </div>
                        </div>
                    </div>
                    <p v-else class="text-muted small mb-0">No hay sucursales registradas</p>
                </div>
            </div>
        </div>

        <div class="col-12 col-sm-12 col-md-6 col-lg-6">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-users text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Terceros Vinculados ({{
                        company.third_parties?.length || 0 }})</h6>
                </div>
                <div class="card-body py-3">
                    <div v-if="company.third_parties?.length" class="list-group list-group-flush small">
                        <div v-for="person in company.third_parties" :key="person.uuid"
                            class="list-group-item py-2 px-0 border-0">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <span class="fw-medium text-dark">{{ person.first_name }} {{ person.last_name
                                    }}</span>
                                    <small class="text-muted d-block">
                                        <i class="fad fa-envelope me-1"></i>{{ person.email || '—' }}
                                    </small>
                                </div>
                                <span class="badge bg-light border" style="font-size: 0.7rem;">
                                    {{ person.third_party_type }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <p v-else class="text-muted small mb-0">No hay terceros vinculados</p>
                </div>
            </div>
        </div>

        <!-- SECCIÓN 7: RESOLUCIONES Y RANGOS -->
        <div class="col-12 col-sm-12 col-md-6 col-lg-6">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-file-certificate text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Rangos de FUEC ({{
                        company.fire_ranges?.length || 0 }})</h6>
                </div>
                <div class="card-body py-3">
                    <div v-if="company.fire_ranges?.length" class="list-group list-group-flush small">
                        <div v-for="range in company.fire_ranges" :key="range.uuid"
                            class="list-group-item py-2 px-0 border-0">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <span class="fw-semibold text-primary">{{ range.type_range }} - {{ range.year
                                    }}</span>
                                    <small class="text-muted d-block">
                                        Rango: <span class="text-dark fw-medium">{{ range.initial_range }} - {{
                                            range.final_range }}</span>
                                    </small>
                                </div>
                                <div class="text-end">
                                    <span class="badge badge-subtle-info d-block mb-1" style="font-size: 0.65rem;">
                                        Actual: {{ range.current_number }}
                                    </span>
                                    <span v-if="range.status === 1" class="badge badge-subtle-success"
                                        style="font-size: 0.65rem;">Activo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p v-else class="text-muted small mb-0">No hay rangos configurados</p>
                </div>
            </div>
        </div>

        <div class="col-12 col-sm-12 col-md-6 col-lg-6">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-stamp text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Resoluciones de Habilitación</h6>
                </div>
                <div class="card-body py-3">
                    <div v-if="company.enabling_resolutions?.length" class="list-group list-group-flush small">
                        <div v-for="res in company.enabling_resolutions" :key="res.uuid"
                            class="list-group-item py-2 px-0 border-0">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <span class="fw-medium text-dark">Res. {{ res.resolution_number }}</span>
                                    <small class="text-muted d-block">Fecha: {{ formatDate(res.resolution_date)
                                        }}</small>
                                </div>
                                <span v-if="res.status === 1" class="badge badge-subtle-success align-self-center"
                                    style="font-size: 0.7rem;">Activa</span>
                            </div>
                        </div>
                    </div>
                    <p v-else class="text-muted small mb-0">No hay resoluciones registradas</p>
                </div>
            </div>
        </div>

        <div class="col-12 col-sm-12 col-md-6 col-lg-6">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center gap-2">
                    <i class="fad fa-file-invoice text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">Resoluciones de Facturación</h6>
                </div>
                <div class="card-body py-3">
                    <div v-if="company.billing_resolutions?.length" class="list-group list-group-flush small">
                        <div v-for="res in company.billing_resolutions" :key="res.uuid"
                            class="list-group-item py-2 px-0 border-0">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <span class="fw-medium text-dark">{{ res.prefix }} {{ res.resolution_number
                                        }}</span>
                                    <small class="text-muted d-block">Rango: {{ res.start_number }} - {{
                                        res.end_number }}</small>
                                </div>
                                <span v-if="res.is_active" class="badge badge-subtle-success align-self-center"
                                    style="font-size: 0.7rem;">Activa</span>
                            </div>
                        </div>
                    </div>
                    <p v-else class="text-muted small mb-0">No hay resoluciones registradas</p>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-14
 * @module {Features.Companies}
 * @resource {Company}
 */
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCompaniesStore } from '../store/companies.store.js';
import { usePermissionsStore } from '@store';
import Swal from 'sweetalert2';
import BasePageHeader from '@/components/BasePageHeader.vue';
import { getMediaUrl } from '@/utils/media.js';


/** Computed para BasePageHeader (evita expresiones complejas en el template) */
const pageTitle = computed(() => company.value?.business_name || 'Perfil de Empresa');
const pageSubtitle = computed(() => isViewLoading.value ? '' : (company.value?.trade_name || ''));

// ===== DEPENDENCIAS =====
const route = useRoute();
const router = useRouter();
const store = useCompaniesStore();
const permissionsStore = usePermissionsStore();
const can = (action, subject) => permissionsStore.can(action, subject);

// ===== ESTADO =====
const company = ref({});
const isViewLoading = ref(true);

// ===== COMPUTED =====
const breadcrumbs = computed(() => [
    { to: '/empresas', label: 'Empresas' },
    { label: company.value?.business_name || 'Detalle' }
]);

const cityLabel = computed(() => {
    const city = company.value.city;
    if (!city?.name) return '—';
    return city.department?.name ? `${city.name}, ${city.department.name}` : city.name;
});

const countryLabel = computed(() => {
    const countries = { CO: 'Colombia', PE: 'Perú', MX: 'México', AR: 'Argentina' };
    return countries[company.value.country_code] || company.value.country_code || '—';
});

const avatarInitials = computed(() => {
    const name = company.value.business_name || '';
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
});

// ===== UTILIDADES =====
const formatDate = (date) => {
    if (!date) return '—';
    try {
        return new Date(date).toLocaleString('es-CO', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch { return '—'; }
};

const formatDateShort = (date) => {
    if (!date) return '—';
    try {
        return new Date(date).toLocaleDateString('es-CO', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch { return '—'; }
};

const handleImageError = (e) => { e.target.style.display = 'none'; };

const truncateFileName = (path) => {
    if (!path) return '—';
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.length > 25 ? fileName.substring(0, 22) + '...' : fileName;
};

const getFileIcon = (file) => {
    const ext = file.path?.split('.').pop()?.toLowerCase();
    const icons = {
        pdf: 'fa-file-pdf text-danger', png: 'fa-file-image text-primary',
        jpg: 'fa-file-image text-primary', jpeg: 'fa-file-image text-primary',
        doc: 'fa-file-word text-primary', docx: 'fa-file-word text-primary',
        xls: 'fa-file-excel text-success', xlsx: 'fa-file-excel text-success'
    };
    return `fad ${icons[ext] || 'fa-file text-muted'}`;
};

// ===== NAVEGACIÓN =====
const goToEdit = () => {
    const id = company.value.uuid || company.value.id || route.params.id;
    if (id) router.push(`/empresa/editar/${id}`);
};
const goBack = () => router.push('/empresa/listas-empresa');

// ===== CARGA DE DATOS =====
const loadCompany = async () => {
    isViewLoading.value = true;
    try {
        const id = route.params.id;
        if (!id) { router.push('/empresa/listas-empresa'); return; }
        const data = await store.getProfile(id);
        if (data) {
            company.value = data;
        } else {
            await Swal.fire({ icon: 'warning', title: 'No encontrada', text: 'La empresa no existe.', confirmButtonText: 'Volver' });
            router.push('/empresa/listas-empresa');
        }
    } catch (error) {
        console.error('Error:', error);
        await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la empresa.', confirmButtonText: 'Reintentar' })
            .then(r => r.isConfirmed ? loadCompany() : router.push('/empresa/listas-empresa'));
    } finally {
        isViewLoading.value = false;
        initTooltips();
    }
};

// ===== TOOLTIPS =====
const initTooltips = () => {
    if (typeof window.bootstrap?.Tooltip !== 'undefined') {
        setTimeout(() => {
            document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
                const instance = window.bootstrap.Tooltip.getInstance(el);
                if (instance) instance.dispose();
                new window.bootstrap.Tooltip(el, { trigger: 'hover', delay: { show: 150, hide: 80 } });
            });
        }, 100);
    }
};

// ===== CICLO DE VIDA =====
onMounted(() => loadCompany());
onUnmounted(() => {
    if (typeof window.bootstrap?.Tooltip !== 'undefined') {
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            const instance = window.bootstrap.Tooltip.getInstance(el);
            if (instance) instance.dispose();
        });
    }
});
</script>

<style scoped>
/* ===== VARIABLES ===== */
:root {
    --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    --shadow-md: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    --transition: 150ms ease-in-out;
}

/* ===== ANIMACIONES ===== */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in-up {
    animation: fadeInUp 0.35s ease-out forwards;
}

/* ===== CARDS ===== */
.card {
    border-radius: 0.625rem !important;
    transition: box-shadow var(--transition);
}

.card:hover {
    box-shadow: var(--shadow-md) !important;
}

.card-header {
    border-radius: 0.625rem 0.625rem 0 0 !important;
    background: linear-gradient(135deg, #f8f9fa, #fff);
}

/* ===== TIPOGRAFÍA COMPACTA ===== */
.small {
    font-size: 0.85rem !important;
    line-height: 1.4;
}

.fw-medium {
    font-weight: 500 !important;
}

.fw-semibold {
    font-weight: 600 !important;
}

.font-monospace {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* ===== TABLA DE DATOS (DL) ===== */
dl.row {
    margin: 0;
}

dt {
    color: #6c757d !important;
}

dd {
    color: #212529 !important;
    margin-bottom: 0;
}

dt,
dd {
    padding: 0;
}

/* ===== BADGES FALCON ===== */
.badge-subtle-success {
    background: rgba(25, 135, 84, 0.1);
    color: #198754;
    border: 1px solid rgba(25, 135, 84, 0.2);
}

.badge-subtle-info {
    background: rgba(13, 110, 253, 0.1);
    color: #0d6efd;
    border: 1px solid rgba(13, 110, 253, 0.2);
}

.badge-subtle-danger {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    border: 1px solid rgba(220, 53, 69, 0.2);
}

.badge-subtle-warning {
    background: rgba(255, 193, 7, 0.1);
    color: #856404;
    border: 1px solid rgba(255, 193, 7, 0.2);
}

.badge.rounded-pill {
    font-weight: 500;
    transition: transform var(--transition);
}

.badge.rounded-pill:hover {
    transform: translateY(-1px);
}

/* ===== BOTONES ===== */
.btn {
    transition: all var(--transition);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
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

.btn-falcon-default:hover {
    background: #e9ecef;
    border-color: #dee2e6;
}

/* ===== LISTAS ===== */
.list-group-item {
    padding: 0.5rem 0 !important;
}

.list-group-item+.list-group-item {
    border-top: 1px dashed #e9ecef !important;
}

/* ===== SCROLLBAR PARA LISTAS ===== */
::-webkit-scrollbar {
    width: 4px;
    height: 4px;
}

::-webkit-scrollbar-track {
    background: #f1f3f5;
    border-radius: 2px;
}

::-webkit-scrollbar-thumb {
    background: #adb5bd;
    border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
    background: #6c757d;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
    .card-body {
        padding: 0.875rem !important;
    }

    dt.col-5,
    dd.col-7 {
        width: 100% !important;
    }

    dt {
        margin-top: 0.5rem !important;
    }

    .d-flex.gap-2.mt-2.mt-md-0 {
        width: 100%;
        justify-content: center;
    }

    .btn {
        flex: 1;
        max-width: 100px;
        font-size: 0.75rem !important;
        padding: 0.25rem 0.5rem !important;
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

a:focus {
    outline: 2px solid #0d6efd;
    outline-offset: 2px;
    border-radius: 2px;
}

/* ===== UTILIDADES ===== */
.bg-opacity-10 {
    --bs-bg-opacity: 0.1;
}

.text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>