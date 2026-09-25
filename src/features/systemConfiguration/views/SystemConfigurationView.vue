<template>
    <div class="row gx-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader title="Configuración de Sistema"
                subtitle="Administra los parámetros generales, alertas y políticas operativas de la empresa"
                icon="fad fa-sliders-h text-primary" :breadcrumbs="breadcrumbs" :show-back="false" />

            <!-- Pantalla de Carga -->
            <div v-if="isViewLoading" class="d-flex flex-column align-items-center justify-content-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="text-muted mt-3">Cargando configuración del sistema...</p>
            </div>

            <div v-else class="fade-in-up">
                <div class="row g-3 g-lg-4">
                    <!-- Navegación lateral (Desktop) / Barra superior (Móvil) -->
                    <div class="col-12 col-lg-3">
                        <div class="card border-0 shadow-sm p-2 bg-white sticky-top-lg mb-3 mb-lg-0">
                            <ul class="nav nav-pills flex-row flex-lg-column flex-nowrap overflow-x-auto gap-1 p-1 bg-light bg-lg-transparent rounded-3" id="configTabs" role="tablist" style="scrollbar-width: none; -ms-overflow-style: none;">
                                <li class="nav-item w-auto w-lg-100" role="presentation">
                                    <button
                                        class="nav-link active text-start d-flex align-items-center gap-2 py-2.5 px-3 w-100"
                                        id="fuec-tab" data-bs-toggle="pill" data-bs-target="#fuec-pane" type="button" role="tab">
                                        <i class="fad fa-file-certificate fs-5"></i>
                                        <span>Políticas FUEC</span>
                                    </button>
                                </li>
                                <li class="nav-item w-auto w-lg-100" role="presentation">
                                    <button
                                        class="nav-link text-start d-flex align-items-center gap-2 py-2.5 px-3 w-100"
                                        id="alerts-tab" data-bs-toggle="pill" data-bs-target="#alerts-pane" type="button" role="tab">
                                        <i class="fad fa-bell fs-5"></i>
                                        <span>Alertas de Documentos</span>
                                    </button>
                                </li>
                                <li class="nav-item w-auto w-lg-100" role="presentation">
                                    <button
                                        class="nav-link text-start d-flex align-items-center gap-2 py-2.5 px-3 w-100"
                                        id="maintenance-tab" data-bs-toggle="pill" data-bs-target="#maintenance-pane" type="button" role="tab">
                                        <i class="fad fa-wrench fs-5"></i>
                                        <span>Mantenimiento y Pagos</span>
                                    </button>
                                </li>
                                <li class="nav-item w-auto w-lg-100" role="presentation">
                                    <button
                                        class="nav-link text-start d-flex align-items-center gap-2 py-2.5 px-3 w-100"
                                        id="notifications-tab" data-bs-toggle="pill" data-bs-target="#notifications-pane" type="button" role="tab">
                                        <i class="fad fa-envelope-open-text fs-5"></i>
                                        <span>Notificaciones</span>
                                    </button>
                                </li>
                                <li class="nav-item w-auto w-lg-100" role="presentation">
                                    <button
                                        class="nav-link text-start d-flex align-items-center gap-2 py-2.5 px-3 w-100"
                                        id="pdf-tab" data-bs-toggle="pill" data-bs-target="#pdf-pane" type="button" role="tab">
                                        <i class="fad fa-file-pdf fs-5"></i>
                                        <span>Personalización PDF</span>
                                    </button>
                                </li>
                                <li class="nav-item w-auto w-lg-100" role="presentation">
                                    <button
                                        class="nav-link text-start d-flex align-items-center gap-2 py-2.5 px-3 w-100"
                                        id="fleet-tab" data-bs-toggle="pill" data-bs-target="#fleet-pane" type="button" role="tab">
                                        <i class="fad fa-bus-school fs-5"></i>
                                        <span>Flota y Pólizas</span>
                                    </button>
                                </li>
                                <li class="nav-item w-auto w-lg-100" role="presentation">
                                    <button
                                        class="nav-link text-start d-flex align-items-center gap-2 py-2.5 px-3 w-100"
                                        id="identity-tab" data-bs-toggle="pill" data-bs-target="#identity-pane" type="button" role="tab">
                                        <i class="fad fa-image fs-5"></i>
                                        <span>Identidad y Firmas</span>
                                    </button>
                                </li>
                                <li class="nav-item w-auto w-lg-100" role="presentation">
                                    <button
                                        class="nav-link text-start d-flex align-items-center gap-2 py-2.5 px-3 w-100"
                                        id="fees-tab" data-bs-toggle="pill" data-bs-target="#fees-pane" type="button" role="tab">
                                        <i class="fad fa-usd-circle fs-5"></i>
                                        <span>Tarifas de Plataforma</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <!-- Contenido (Formulario) -->
                    <div class="col-12 col-lg-9">
                        <!-- Formulario Principal -->
                        <form @submit.prevent="handleSubmit" novalidate>
                            <div class="tab-content" id="configTabsContent">

                        <!-- PANE: POLÍTICAS FUEC -->
                        <div class="tab-pane fade show active" id="fuec-pane" role="tabpanel" tabindex="0">
                            <div class="card border-0 shadow-sm">
                                <div class="card-body p-2 p-md-3 p-lg-4">
                                    <h5 class="fw-medium text-primary mb-3 d-flex align-items-center gap-2">
                                        <i class="fad fa-file-certificate"></i>
                                        Políticas para emisión de FUEC
                                    </h5>
                                    <p class="text-muted small mb-4">
                                        Configure los controles obligatorios que debe cumplir un vehículo y sus
                                        conductores antes de que el sistema permita generar una planilla FUEC.
                                    </p>

                                    <div class="row g-4">
                                        <!-- Control de Inspección Diaria -->
                                        <div class="col-12 col-md-6">
                                            <div
                                                class="p-3 rounded border bg-white d-flex align-items-start gap-3 h-100 switch-card">
                                                <div class="form-check form-switch flex-shrink-0 mt-1">
                                                    <input class="form-check-input" type="checkbox"
                                                        id="fuec_require_daily_inspections"
                                                        v-model="formData.fuec_require_daily_inspections" />
                                                </div>
                                                <div>
                                                    <label class="form-label fw-medium mb-1 cursor-pointer"
                                                        for="fuec_require_daily_inspections">
                                                        Inspección Preoperacional Diaria Obligatoria
                                                    </label>
                                                    <p class="text-muted small mb-0">
                                                        Si está activo, el sistema bloqueará la creación de un FUEC si
                                                        el vehículo no cuenta con su inspección preoperacional diaria
                                                        para el día actual.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Control de Seguridad Social -->
                                        <div class="col-12 col-md-6">
                                            <div
                                                class="p-3 rounded border bg-white d-flex align-items-start gap-3 h-100 switch-card">
                                                <div class="form-check form-switch flex-shrink-0 mt-1">
                                                    <input class="form-check-input" type="checkbox"
                                                        id="fuec_require_social_security"
                                                        v-model="formData.fuec_require_social_security" />
                                                </div>
                                                <div>
                                                    <label class="form-label fw-medium mb-1 cursor-pointer"
                                                        for="fuec_require_social_security">
                                                        Seguridad Social Obligatoria
                                                    </label>
                                                    <p class="text-muted small mb-0">
                                                        Si está activo, valida que todos los conductores asignados al
                                                        FUEC cuenten con su aporte a la seguridad social vigente
                                                        (pagado/aprobado) para el mes del viaje.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Vigencia Máxima del FUEC (Propiedad obsoleta eliminada en base de datos) -->
                                    </div>

                                    <!-- Parámetros de consecutivos y rangos removidos por simplificación del sistema -->
                                </div>
                            </div>
                        </div>

                        <!-- PANE: ALERTAS DE DOCUMENTOS -->
                        <div class="tab-pane fade" id="alerts-pane" role="tabpanel" tabindex="0">
                            <div class="card border-0 shadow-sm">
                                <div class="card-body p-2 p-md-3 p-lg-4">
                                    <h5 class="fw-medium text-primary mb-3 d-flex align-items-center gap-2">
                                        <i class="fad fa-bell"></i>
                                        Anticipación de alertas de vencimientos
                                    </h5>
                                    <p class="text-muted small mb-4">
                                        Defina con cuántos días de anticipación el sistema debe mostrar notificaciones
                                        tempranas y alertas visuales sobre el vencimiento de cada tipo de documento.
                                    </p>

                                    <div class="row g-4">
                                        <!-- Alerta SOAT -->
                                        <div class="col-12 col-md-6 col-lg-4">
                                            <div class="p-3 rounded border bg-white h-100 d-flex flex-column justify-content-between switch-card">
                                                <div>
                                                    <div class="d-flex align-items-center gap-2 mb-2">
                                                        <i class="fad fa-shield-check text-primary"></i>
                                                        <label class="form-label fw-medium mb-0 required" for="soat_alert_days">SOAT (Días)</label>
                                                    </div>
                                                    <p class="text-muted small mb-3">Días de anticipación para avisar sobre el vencimiento de la póliza de SOAT.</p>
                                                </div>
                                                <div>
                                                    <input id="soat_alert_days" v-model.number="formData.soat_alert_days"
                                                        type="number" class="form-control"
                                                        :class="{ 'is-invalid': validationErrors.soat_alert_days }" min="1" max="180" placeholder="Ej: 30" />
                                                    <div class="invalid-feedback" v-if="validationErrors.soat_alert_days">{{ validationErrors.soat_alert_days }}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Alerta RTM -->
                                        <div class="col-12 col-md-6 col-lg-4">
                                            <div class="p-3 rounded border bg-white h-100 d-flex flex-column justify-content-between switch-card">
                                                <div>
                                                    <div class="d-flex align-items-center gap-2 mb-2">
                                                        <i class="fad fa-cogs text-primary"></i>
                                                        <label class="form-label fw-medium mb-0 required" for="rtm_alert_days">Revisión Técnico-Mecánica (Días)</label>
                                                    </div>
                                                    <p class="text-muted small mb-3">Días previos para alertar sobre la necesidad de realizar la RTM obligatoria.</p>
                                                </div>
                                                <div>
                                                    <input id="rtm_alert_days" v-model.number="formData.rtm_alert_days"
                                                        type="number" class="form-control"
                                                        :class="{ 'is-invalid': validationErrors.rtm_alert_days }" min="1" max="180" placeholder="Ej: 30" />
                                                    <div class="invalid-feedback" v-if="validationErrors.rtm_alert_days">{{ validationErrors.rtm_alert_days }}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Alerta Tarjeta de Operación -->
                                        <div class="col-12 col-md-6 col-lg-4">
                                            <div class="p-3 rounded border bg-white h-100 d-flex flex-column justify-content-between switch-card">
                                                <div>
                                                    <div class="d-flex align-items-center gap-2 mb-2">
                                                        <i class="fad fa-id-card-alt text-primary"></i>
                                                        <label class="form-label fw-medium mb-0 required" for="operation_card_alert_days">Tarjeta de Operación (Días)</label>
                                                    </div>
                                                    <p class="text-muted small mb-3">Días de aviso para la renovación de la tarjeta habilitada por el Ministerio.</p>
                                                </div>
                                                <div>
                                                    <input id="operation_card_alert_days" v-model.number="formData.operation_card_alert_days"
                                                        type="number" class="form-control"
                                                        :class="{ 'is-invalid': validationErrors.operation_card_alert_days }" min="1" max="180" placeholder="Ej: 30" />
                                                    <div class="invalid-feedback" v-if="validationErrors.operation_card_alert_days">{{ validationErrors.operation_card_alert_days }}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Alerta Licencias -->
                                        <div class="col-12 col-md-6 col-lg-4">
                                            <div class="p-3 rounded border bg-white h-100 d-flex flex-column justify-content-between switch-card">
                                                <div>
                                                    <div class="d-flex align-items-center gap-2 mb-2">
                                                        <i class="fad fa-user-hard-hat text-primary"></i>
                                                        <label class="form-label fw-medium mb-0 required" for="license_alert_days">Licencias de Conducción (Días)</label>
                                                    </div>
                                                    <p class="text-muted small mb-3">Días de anticipación para reportar el vencimiento de licencias de conductores.</p>
                                                </div>
                                                <div>
                                                    <input id="license_alert_days" v-model.number="formData.license_alert_days"
                                                        type="number" class="form-control"
                                                        :class="{ 'is-invalid': validationErrors.license_alert_days }" min="1" max="180" placeholder="Ej: 30" />
                                                    <div class="invalid-feedback" v-if="validationErrors.license_alert_days">{{ validationErrors.license_alert_days }}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Alerta Otros Documentos -->
                                        <div class="col-12 col-md-6 col-lg-4">
                                            <div class="p-3 rounded border bg-white h-100 d-flex flex-column justify-content-between switch-card">
                                                <div>
                                                    <div class="d-flex align-items-center gap-2 mb-2">
                                                        <i class="fad fa-copy text-primary"></i>
                                                        <label class="form-label fw-medium mb-0 required" for="document_alert_days">Otros Documentos (Días)</label>
                                                    </div>
                                                    <p class="text-muted small mb-3">Días de gracia de alerta para pólizas extracontractuales y documentos de la flota.</p>
                                                </div>
                                                <div>
                                                    <input id="document_alert_days" v-model.number="formData.document_alert_days"
                                                        type="number" class="form-control"
                                                        :class="{ 'is-invalid': validationErrors.document_alert_days }" min="1" max="180" placeholder="Ej: 30" />
                                                    <div class="invalid-feedback" v-if="validationErrors.document_alert_days">{{ validationErrors.document_alert_days }}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- PANE: MANTENIMIENTO Y PAGOS -->
                        <div class="tab-pane fade" id="maintenance-pane" role="tabpanel" tabindex="0">
                            <div class="card border-0 shadow-sm">
                                <div class="card-body p-2 p-md-3 p-lg-4">
                                    <h5 class="fw-medium text-primary mb-3 d-flex align-items-center gap-2">
                                        <i class="fad fa-wrench"></i>
                                        Políticas de mantenimiento preventivo y fecha de cobros
                                    </h5>
                                    <p class="text-muted small mb-4">
                                        Establezca los parámetros de tiempo y fechas límites para el control mecánico y
                                        la recaudación administrativa mensual.
                                    </p>

                                    <div class="row g-4">
                                        <!-- Alerta Mantenimiento Preventivo (Días) -->
                                        <div class="col-12 col-md-6">
                                            <div class="p-3 rounded border bg-white h-100 d-flex flex-column justify-content-between switch-card">
                                                <div>
                                                    <div class="d-flex align-items-center gap-2 mb-2">
                                                        <i class="fad fa-calendar-alt text-primary"></i>
                                                        <label class="form-label fw-medium mb-0" for="maintenance_alert_days">Alerta Mantenimiento (Días)</label>
                                                    </div>
                                                    <p class="text-muted small mb-3">Días de anticipación para emitir alertas basadas en fecha del próximo mantenimiento mecánico.</p>
                                                </div>
                                                <div>
                                                    <input id="maintenance_alert_days" v-model.number="formData.maintenance_alert_days"
                                                        type="number" class="form-control" placeholder="Ej: 15 (Vacío para deshabilitar)" />
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Días Adicionales de Tolerancia -->
                                        <div class="col-12 col-md-6">
                                            <div class="p-3 rounded border bg-white h-100 d-flex flex-column justify-content-between switch-card">
                                                <div>
                                                    <div class="d-flex align-items-center gap-2 mb-2">
                                                        <i class="fad fa-hourglass-half text-primary"></i>
                                                        <label class="form-label fw-medium mb-0" for="maintenance_numbers_days">Días Adicionales de Tolerancia</label>
                                                    </div>
                                                    <p class="text-muted small mb-3">Días de gracia adicionales tras expirar el plazo estimado del mantenimiento programado.</p>
                                                </div>
                                                <div>
                                                    <input id="maintenance_numbers_days" v-model="formData.maintenance_numbers_days"
                                                        type="text" autocomplete="off" class="form-control" placeholder="Ej: 5 (Vacío para deshabilitar)" maxlength="3" />
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Alerta Mantenimiento (Kilómetros) -->
                                        <div class="col-12 col-md-6">
                                            <div class="p-3 rounded border bg-white h-100 d-flex flex-column justify-content-between switch-card">
                                                <div>
                                                    <div class="d-flex align-items-center gap-2 mb-2">
                                                        <i class="fad fa-tachometer-alt text-primary"></i>
                                                        <label class="form-label fw-medium mb-0" for="maintenance_alert_km">Alerta Mantenimiento (Kilómetros)</label>
                                                    </div>
                                                    <p class="text-muted small mb-3">Umbral de kilometraje acumulado para alertar sobre la necesidad de revisión mecánica preventiva.</p>
                                                </div>
                                                <div>
                                                    <input id="maintenance_alert_km" v-model.number="formData.maintenance_alert_km"
                                                        type="number" class="form-control" :class="{ 'is-invalid': validationErrors.maintenance_alert_km }"
                                                        placeholder="Ej: 5000 (Vacío para deshabilitar)" min="0" />
                                                    <div class="invalid-feedback" v-if="validationErrors.maintenance_alert_km">{{ validationErrors.maintenance_alert_km }}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Día de Corte de Pago Mensual -->
                                        <div class="col-12 col-md-6">
                                            <div class="p-3 rounded border bg-white h-100 d-flex flex-column justify-content-between switch-card">
                                                <div>
                                                    <div class="d-flex align-items-center gap-2 mb-2">
                                                        <i class="fad fa-usd-circle text-primary"></i>
                                                        <label class="form-label fw-medium mb-0 required" for="payment_cutoff_day">Día de Corte de Pago Mensual</label>
                                                    </div>
                                                    <p class="text-muted small mb-3">Día calendario límite mensual para la recaudación por concepto de administración de vehículos.</p>
                                                </div>
                                                <div>
                                                    <input id="payment_cutoff_day" v-model.number="formData.payment_cutoff_day"
                                                        type="number" min="1" max="31" class="form-control" :class="{ 'is-invalid': validationErrors.payment_cutoff_day }"
                                                        placeholder="Ej: 5" />
                                                    <div class="invalid-feedback" v-if="validationErrors.payment_cutoff_day">{{ validationErrors.payment_cutoff_day }}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- PANE: NOTIFICACIONES -->
                        <div class="tab-pane fade" id="notifications-pane" role="tabpanel" tabindex="0">
                            <div class="card border-0 shadow-sm">
                                <div class="card-body p-2 p-md-3 p-lg-4">
                                    <h5 class="fw-medium text-primary mb-3 d-flex align-items-center gap-2">
                                        <i class="fad fa-envelope-open-text"></i>
                                        Motor general de notificaciones
                                    </h5>
                                    <p class="text-muted small mb-4">
                                        Configure los canales de comunicación y alertas automatizadas que enviará el
                                        sistema para alertar a los administradores.
                                    </p>

                                    <div class="row g-4">
                                        <div class="col-12 col-md-6">
                                            <div
                                                class="p-3 rounded border bg-white d-flex align-items-start gap-3 h-100 switch-card">
                                                <div class="form-check form-switch flex-shrink-0 mt-1">
                                                    <input class="form-check-input" type="checkbox"
                                                        id="activate_notifications"
                                                        v-model="formData.activate_notifications" />
                                                </div>
                                                <div>
                                                    <label class="form-label fw-medium mb-1 cursor-pointer"
                                                        for="activate_notifications">
                                                        Activar Notificaciones
                                                    </label>
                                                    <p class="text-muted small mb-0">
                                                        Habilita o deshabilita por completo el envío y procesamiento de
                                                        notificaciones dentro de la plataforma.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-12 col-md-6">
                                            <div
                                                class="p-3 rounded border bg-white d-flex align-items-start gap-3 h-100 switch-card">
                                                <div class="form-check form-switch flex-shrink-0 mt-1">
                                                    <input class="form-check-input" type="checkbox" id="notify_by_email"
                                                        v-model="formData.notify_by_email"
                                                        :disabled="!formData.activate_notifications" />
                                                </div>
                                                <div>
                                                    <label class="form-label fw-medium mb-1 cursor-pointer"
                                                        for="notify_by_email">
                                                        Notificar por Correo Electrónico
                                                    </label>
                                                    <p class="text-muted small mb-0">
                                                        Permite al sistema disparar correos automáticos hacia la
                                                        dirección de contacto configurada a continuación.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-12"
                                            v-if="formData.notify_by_email && formData.activate_notifications">
                                            <div class="col-12 col-md-6">
                                                <label class="form-label required" for="notification_email">Correo
                                                    Electrónico Destinatario</label>
                                                <input id="notification_email" v-model="formData.notification_email"
                                                    type="email" class="form-control"
                                                    :class="{ 'is-invalid': validationErrors.notification_email }"
                                                    placeholder="Ej: alertas@empresa.com" />
                                                <div class="invalid-feedback"
                                                    v-if="validationErrors.notification_email">{{
                                                        validationErrors.notification_email }}</div>
                                            </div>
                                        </div>

                                        <div class="col-12">
                                            <div class="col-12 col-md-8">
                                                <label class="form-label" for="f-own_company_names">Nombres de la
                                                    empresa propia</label>
                                                <textarea id="f-own_company_names" v-model="ownCompanyNamesText" rows="3"
                                                    class="form-control"
                                                    :class="{ 'is-invalid': validationErrors.own_company_names }"
                                                    :aria-invalid="!!validationErrors.own_company_names"
                                                    :aria-describedby="validationErrors.own_company_names ? 'f-own_company_names-error' : undefined"
                                                    placeholder="Un nombre por línea. Ej: TRANSPORTES ESPECIALES SIN BARRERAS S.A.S." />
                                                <div class="invalid-feedback"
                                                    v-if="validationErrors.own_company_names"
                                                    id="f-own_company_names-error" role="alert">{{
                                                        validationErrors.own_company_names }}</div>
                                                <p class="text-muted small mb-0 mt-1">
                                                    Nombres que identifican a la empresa propia en las tarjetas de
                                                    operación. Las alertas de esos vehículos se marcan como
                                                    prioritarias. Si se deja vacío se usa el nombre registrado de la
                                                    empresa.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- PANE: PERSONALIZACIÓN PDF -->
                        <div class="tab-pane fade" id="pdf-pane" role="tabpanel" tabindex="0">
                            <div class="card border-0 shadow-sm">
                                <div class="card-body p-2 p-md-3 p-lg-4">
                                    <h5 class="fw-medium text-primary mb-3 d-flex align-items-center gap-2">
                                        <i class="fad fa-file-pdf"></i>
                                        Personalización de la Plantilla PDF FUEC
                                    </h5>
                                    <p class="text-muted small mb-4">
                                        Establezca qué elementos y secciones adicionales deben incluirse al momento de generar la representación impresa del FUEC.
                                    </p>

                                    <div class="row g-4">
                                        <!-- Mostrar Firmas Autorizadas -->
                                        <div class="col-12 col-md-6">
                                            <div class="p-3 rounded border bg-white d-flex align-items-start gap-3 h-100 switch-card">
                                                <div class="form-check form-switch flex-shrink-0 mt-1">
                                                    <input class="form-check-input" type="checkbox"
                                                        id="fuec_pdf_show_signatures"
                                                        v-model="formData.fuec_pdf_show_signatures" />
                                                </div>
                                                <div>
                                                    <label class="form-label fw-medium mb-1 cursor-pointer"
                                                        for="fuec_pdf_show_signatures">
                                                        Mostrar Firmas Autorizadas
                                                    </label>
                                                    <p class="text-muted small mb-0">
                                                        Habilita la impresión de las firmas digitales y firmas del representante legal registradas en el sistema.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Mostrar Detalles del Contratista -->
                                        <div class="col-12 col-md-6">
                                            <div class="p-3 rounded border bg-white d-flex align-items-start gap-3 h-100 switch-card">
                                                <div class="form-check form-switch flex-shrink-0 mt-1">
                                                    <input class="form-check-input" type="checkbox"
                                                        id="fuec_pdf_show_contractor_details"
                                                        v-model="formData.fuec_pdf_show_contractor_details" />
                                                </div>
                                                <div>
                                                    <label class="form-label fw-medium mb-1 cursor-pointer"
                                                        for="fuec_pdf_show_contractor_details">
                                                        Mostrar Detalles de Contratista
                                                    </label>
                                                    <p class="text-muted small mb-0">
                                                        Si está activo, se incluirá información tributaria y de contacto detallada del contratista en el documento impreso.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Mostrar Detalles de la Ruta -->
                                        <div class="col-12 col-md-6">
                                            <div class="p-3 rounded border bg-white d-flex align-items-start gap-3 h-100 switch-card">
                                                <div class="form-check form-switch flex-shrink-0 mt-1">
                                                    <input class="form-check-input" type="checkbox"
                                                        id="fuec_pdf_show_route_details"
                                                        v-model="formData.fuec_pdf_show_route_details" />
                                                </div>
                                                <div>
                                                    <label class="form-label fw-medium mb-1 cursor-pointer"
                                                        for="fuec_pdf_show_route_details">
                                                        Mostrar Detalles de Ruta
                                                    </label>
                                                    <p class="text-muted small mb-0">
                                                        Indica si se incluirán las paradas programadas y la descripción de la ruta o mapa detallado del viaje.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- PANE: FLOTA Y PÓLIZAS -->
                        <div class="tab-pane fade" id="fleet-pane" role="tabpanel" tabindex="0">
                            <div class="card border-0 shadow-sm">
                                <div class="card-body p-2 p-md-3 p-lg-4">
                                    <!-- Sección: Número Interno -->
                                    <h5 class="fw-medium text-primary mb-3 d-flex align-items-center gap-2">
                                        <i class="fad fa-bus-school"></i>
                                        Control de Números Internos de la Flota
                                    </h5>
                                    <p class="text-muted small mb-4">
                                        Parametrice la asignación automatizada de números internos para nuevos vehículos vinculados a la empresa.
                                    </p>

                                    <div class="row g-4 mb-4">
                                        <!-- Activar Asignación Automática -->
                                        <div class="col-12 col-md-6">
                                            <div class="p-3 rounded border bg-white d-flex align-items-start gap-3 h-100 switch-card">
                                                <div class="form-check form-switch flex-shrink-0 mt-1">
                                                    <input class="form-check-input" type="checkbox"
                                                        id="fuec_enable_auto_internal_number"
                                                        v-model="formData.fuec_enable_auto_internal_number" />
                                                </div>
                                                <div>
                                                    <label class="form-label fw-medium mb-1 cursor-pointer"
                                                        for="fuec_enable_auto_internal_number">
                                                        Auto-asignar Número Interno
                                                    </label>
                                                    <p class="text-muted small mb-0">
                                                        Si está activo, el sistema asignará de forma autoincremental el número interno a los vehículos nuevos.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Contador de Número Interno -->
                                        <div class="col-12 col-md-6" v-if="formData.fuec_enable_auto_internal_number">
                                            <div class="p-3 rounded border bg-white h-100 switch-card">
                                                <label class="form-label fw-medium required" for="vehicle_internal_number_counter">Consecutivo / Siguiente Número</label>
                                                <input id="vehicle_internal_number_counter" v-model.number="formData.vehicle_internal_number_counter"
                                                    type="number" min="1" class="form-control"
                                                    :class="{ 'is-invalid': validationErrors.vehicle_internal_number_counter }" placeholder="Ej: 101" />
                                                <div class="invalid-feedback" v-if="validationErrors.vehicle_internal_number_counter">{{ validationErrors.vehicle_internal_number_counter }}</div>
                                                <p class="text-muted small mb-0 mt-1">
                                                    Establece el número interno inicial o el siguiente a asignar en el consecutivo.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <hr class="my-4 text-muted opacity-25" />

                                    <!-- Sección: Pólizas Corporativas -->
                                    <h5 class="fw-medium text-primary mb-3 d-flex align-items-center gap-2">
                                        <i class="fad fa-shield-alt"></i>
                                        Pólizas de Seguros Corporativas (RCC y RCE)
                                    </h5>
                                    <p class="text-muted small mb-4">
                                        Defina pólizas globales que aplican colectivamente a toda la flota vinculada de la empresa (Resoluciones del Ministerio de Transporte).
                                    </p>

                                    <div class="row g-4">
                                        <!-- Utilizar Pólizas Corporativas -->
                                        <div class="col-12">
                                            <div class="p-3 rounded border bg-white d-flex align-items-start gap-3 switch-card">
                                                <div class="form-check form-switch flex-shrink-0 mt-1">
                                                    <input class="form-check-input" type="checkbox"
                                                        id="fuec_use_corporate_policies"
                                                        v-model="formData.fuec_use_corporate_policies" />
                                                </div>
                                                <div>
                                                    <label class="form-label fw-medium mb-1 cursor-pointer"
                                                        for="fuec_use_corporate_policies">
                                                        Utilizar Pólizas Corporativas Únicas
                                                    </label>
                                                    <p class="text-muted small mb-0">
                                                        Habilita el uso de las pólizas colectivas configuradas aquí para la validación del FUEC, omitiendo la exigencia de pólizas individuales por vehículo.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <template v-if="formData.fuec_use_corporate_policies">
                                            <!-- Aseguradora Única -->
                                            <div class="col-12 col-md-6">
                                                <div class="p-3 rounded border bg-white h-100 switch-card">
                                                    <label class="form-label fw-medium required" for="corporate_rcc_insurer">Aseguradora RCC y RCE Corporativa</label>
                                                    <input id="corporate_rcc_insurer" v-model="formData.corporate_rcc_insurer"
                                                        type="text" autocomplete="off" class="form-control" :class="{ 'is-invalid': validationErrors.corporate_rcc_insurer }" placeholder="Ej: Seguros del Estado / La Previsora" />
                                                    <div class="invalid-feedback" v-if="validationErrors.corporate_rcc_insurer">{{ validationErrors.corporate_rcc_insurer }}</div>
                                                    <p class="text-muted small mb-0 mt-1">Nombre de la entidad emisora de las pólizas colectivas de la empresa.</p>
                                                </div>
                                            </div>
                                            <!-- Vencimiento RCE -->
                                            <div class="col-12 col-md-6">
                                                <div class="p-3 rounded border bg-white h-100 switch-card">
                                                    <label class="form-label fw-medium required" for="corporate_rce_expiration">Fecha de Vencimiento Póliza RCE</label>
                                                    <input id="corporate_rce_expiration" v-model="formData.corporate_rce_expiration"
                                                        type="date" class="form-control" :class="{ 'is-invalid': validationErrors.corporate_rce_expiration }" />
                                                    <div class="invalid-feedback" v-if="validationErrors.corporate_rce_expiration">{{ validationErrors.corporate_rce_expiration }}</div>
                                                    <p class="text-muted small mb-0 mt-1">Fecha de expiración para la cobertura de Responsabilidad Civil Extracontractual.</p>
                                                </div>
                                            </div>
                                            <!-- Vencimiento RCC -->
                                            <div class="col-12 col-md-6">
                                                <div class="p-3 rounded border bg-white h-100 switch-card">
                                                    <label class="form-label fw-medium required" for="corporate_rcc_expiration">Fecha de Vencimiento Póliza RCC</label>
                                                    <input id="corporate_rcc_expiration" v-model="formData.corporate_rcc_expiration"
                                                        type="date" class="form-control" :class="{ 'is-invalid': validationErrors.corporate_rcc_expiration }" />
                                                    <div class="invalid-feedback" v-if="validationErrors.corporate_rcc_expiration">{{ validationErrors.corporate_rcc_expiration }}</div>
                                                    <p class="text-muted small mb-0 mt-1">Fecha de expiración para la cobertura de Responsabilidad Civil Contractual.</p>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- PANE: IDENTIDAD Y FIRMAS -->
                        <div class="tab-pane fade" id="identity-pane" role="tabpanel" tabindex="0">
                            <div class="card border-0 shadow-sm">
                                <div class="card-body p-2 p-md-3 p-lg-4">
                                    <h5 class="fw-medium text-primary mb-3 d-flex align-items-center gap-2">
                                        <i class="fad fa-image"></i>
                                        Identidad Corporativa y Firmas
                                    </h5>
                                    <p class="text-muted small mb-4">
                                        Suba y actualice el logotipo oficial de su empresa y la firma digitalizada del representante legal que se estampará en los documentos.
                                    </p>

                                    <div class="row g-4">
                                        <!-- Logo -->
                                        <div class="col-12 col-md-6 text-center border-end">
                                            <h6 class="fw-medium mb-3">Logotipo de la Empresa</h6>
                                            <div class="d-flex flex-column align-items-center gap-3">
                                                <div class="position-relative border rounded-3 p-2 bg-light d-flex align-items-center justify-content-center" style="width: 150px; height: 150px;">
                                                    <img :src="identityPreviews.logo || '/assets/img/team/default.png'" alt="Logotipo de la empresa" class="img-fluid rounded-3" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
                                                </div>
                                                <div class="w-100 px-3">
                                                    <label class="btn btn-sm btn-outline-primary px-3 rounded-pill cursor-pointer mt-1">
                                                        <i class="fad fa-cloud-upload-alt me-1"></i> Seleccionar Logo
                                                        <input type="file" @change="uploadCorporateFile($event, 'logo')" accept="image/*" class="d-none" />
                                                    </label>
                                                    <span class="fs-10 text-muted mt-2 d-block">Soporta PNG, JPG o WEBP.</span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Firma -->
                                        <div class="col-12 col-md-6 text-center">
                                            <h6 class="fw-medium mb-3">Firma Digital del Representante Legal</h6>
                                            <div class="d-flex flex-column align-items-center gap-3">
                                                <div class="position-relative border rounded-3 p-2 bg-light d-flex align-items-center justify-content-center" style="width: 150px; height: 150px;">
                                                    <img :src="identityPreviews.signature || '/assets/img/team/default.png'" alt="Firma digital del representante legal" class="img-fluid rounded-3" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
                                                </div>
                                                <div class="w-100 px-3">
                                                    <label class="btn btn-sm btn-outline-primary px-3 rounded-pill cursor-pointer mt-1">
                                                        <i class="fad fa-cloud-upload-alt me-1"></i> Seleccionar Firma
                                                        <input type="file" @change="uploadCorporateFile($event, 'signature')" accept="image/*" class="d-none" />
                                                    </label>
                                                    <span class="fs-10 text-muted mt-2 d-block">Soporta PNG transparente.</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr class="my-4 text-muted opacity-25" />

                                    <!-- Sección: Imágenes del PDF FUEC -->
                                    <h6 class="fw-medium text-primary mb-3 d-flex align-items-center gap-2">
                                        <i class="fad fa-file-pdf"></i>
                                        Imágenes para el PDF del FUEC
                                    </h6>
                                    <p class="text-muted small mb-4">
                                        Suba las imágenes institucionales que aparecerán en el encabezado del formato de Extracto de Contrato (FUEC).
                                    </p>

                                    <div class="row g-4">
                                        <!-- Logo Ministerio de Transporte -->
                                        <div class="col-12 col-md-4 text-center">
                                            <h6 class="fw-medium mb-3">Logo Ministerio de Transporte</h6>
                                            <div class="d-flex flex-column align-items-center gap-3">
                                                <div class="position-relative border rounded-3 p-2 bg-light d-flex align-items-center justify-content-center" style="width: 120px; height: 120px;">
                                                    <img :src="identityPreviews.ministry_logo || '/img/transporte.png'" alt="Logo Ministerio de Transporte" class="img-fluid rounded-3" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
                                                </div>
                                                <div class="w-100 px-2">
                                                    <label class="btn btn-sm btn-outline-primary px-3 rounded-pill cursor-pointer mt-1">
                                                        <i class="fad fa-cloud-upload-alt me-1"></i> Subir Logo
                                                        <input type="file" @change="uploadConfigFile($event, 'ministry_logo')" accept="image/*" class="d-none" />
                                                    </label>
                                                    <span class="fs-10 text-muted mt-2 d-block">PNG o JPG, máx. 2MB.</span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Logo Superintendencia -->
                                        <div class="col-12 col-md-4 text-center">
                                            <h6 class="fw-medium mb-3">Logo Superintendencia</h6>
                                            <div class="d-flex flex-column align-items-center gap-3">
                                                <div class="position-relative border rounded-3 p-2 bg-light d-flex align-items-center justify-content-center" style="width: 120px; height: 120px;">
                                                    <img :src="identityPreviews.super_logo || '/img/super2.png'" alt="Logo Superintendencia" class="img-fluid rounded-3" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
                                                </div>
                                                <div class="w-100 px-2">
                                                    <label class="btn btn-sm btn-outline-primary px-3 rounded-pill cursor-pointer mt-1">
                                                        <i class="fad fa-cloud-upload-alt me-1"></i> Subir Logo
                                                        <input type="file" @change="uploadConfigFile($event, 'super_logo')" accept="image/*" class="d-none" />
                                                    </label>
                                                    <span class="fs-10 text-muted mt-2 d-block">PNG o JPG, máx. 2MB.</span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Hoja Membretada -->
                                        <div class="col-12 col-md-4 text-center">
                                            <h6 class="fw-medium mb-3">Hoja Membretada</h6>
                                            <div class="d-flex flex-column align-items-center gap-3">
                                                <div class="position-relative border rounded-3 p-2 bg-light d-flex align-items-center justify-content-center" style="width: 120px; height: 120px;">
                                                    <img v-if="identityPreviews.letterhead" :src="identityPreviews.letterhead" alt="Hoja membretada" class="img-fluid rounded-3" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
                                                    <div v-else class="text-muted text-center">
                                                        <i class="fad fa-file-alt fs-2 mb-1"></i>
                                                        <p class="fs-10 mb-0">Sin membretada</p>
                                                    </div>
                                                </div>
                                                <div class="w-100 px-2">
                                                    <label class="btn btn-sm btn-outline-primary px-3 rounded-pill cursor-pointer mt-1">
                                                        <i class="fad fa-cloud-upload-alt me-1"></i> Subir Membretada
                                                        <input type="file" @change="uploadConfigFile($event, 'letterhead')" accept="image/*,.pdf" class="d-none" />
                                                    </label>
                                                    <span class="fs-10 text-muted mt-2 d-block">PNG, JPG o PDF, máx. 4MB.</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- PANE: TARIFAS DE PLATAFORMA -->
                        <div class="tab-pane fade" id="fees-pane" role="tabpanel" tabindex="0">
                            <div class="card border-0 shadow-sm">
                                <div class="card-body p-2 p-md-3 p-lg-4">
                                    <div class="d-flex align-items-center justify-content-between mb-3">
                                        <h5 class="fw-medium text-primary mb-0 d-flex align-items-center gap-2">
                                            <i class="fad fa-usd-circle"></i>
                                            Configuración de Tarifas de Plataforma
                                        </h5>
                                        <router-link to="/settings/platform-fees" class="btn btn-sm btn-outline-primary rounded-pill">
                                            <i class="fad fa-list-ul me-1"></i> Ver Listado Completo
                                        </router-link>
                                    </div>
                                    <p class="text-muted small mb-4">
                                        Defina los valores de cobro de plataforma aplicados a la flota de vehículos según su capacidad de pasajeros o su clase específica.
                                    </p>

                                    <div class="mb-4 p-3 border rounded bg-light">
                                        <label class="form-label fw-semibold mb-2">Criterio de Cobro de Plataforma</label>
                                        <div class="d-flex gap-4">
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" v-model="formData.platform_fee_type" value="VEHICLE_CLASS" id="feeTypeClass">
                                                <label class="form-check-label cursor-pointer" for="feeTypeClass">Por Clase de Vehículo</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" v-model="formData.platform_fee_type" value="PASSENGER_RANGE" id="feeTypeRange">
                                                <label class="form-check-label cursor-pointer" for="feeTypeRange">Por Rango de Pasajeros</label>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Tabla de Tarifas -->
                                    <div class="table-responsive">
                                        <table class="table table-bordered align-middle">
                                            <thead class="bg-light">
                                                <tr v-if="formData.platform_fee_type === 'PASSENGER_RANGE'">
                                                    <th class="py-2 px-3 text-dark fw-semibold" style="width: 30%;">Mín. Pasajeros</th>
                                                    <th class="py-2 px-3 text-dark fw-semibold" style="width: 30%;">Máx. Pasajeros</th>
                                                    <th class="py-2 px-3 text-dark fw-semibold" style="width: 30%;">Tarifa ($ COP)</th>
                                                    <th class="py-2 text-center" style="width: 10%;"></th>
                                                </tr>
                                                <tr v-else>
                                                    <th class="py-2 px-3 text-dark fw-semibold" style="width: 60%;">Clase de Vehículo</th>
                                                    <th class="py-2 px-3 text-dark fw-semibold" style="width: 30%;">Tarifa ($ COP)</th>
                                                    <th class="py-2 text-center" style="width: 10%;"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="(rate, index) in formData.platform_fee_rates" :key="index">
                                                    <!-- Rango de pasajeros -->
                                                    <template v-if="formData.platform_fee_type === 'PASSENGER_RANGE'">
                                                        <td class="p-2">
                                                            <input type="number" v-model.number="rate.min_passengers" class="form-control form-control-sm" min="0" required />
                                                        </td>
                                                        <td class="p-2">
                                                            <input type="number" v-model.number="rate.max_passengers" class="form-control form-control-sm" min="0" required />
                                                        </td>
                                                    </template>

                                                    <!-- Clase de vehículo -->
                                                    <template v-else>
                                                        <td class="p-2">
                                                            <select v-model="rate.vehicle_class_uuid" class="form-select form-select-sm" required>
                                                                <option value="">Seleccionar clase...</option>
                                                                <option v-for="vc in vehicleClasses" :key="vc.uuid" :value="vc.uuid">
                                                                    {{ vc.description }} ({{ vc.class_code_class }})
                                                                </option>
                                                            </select>
                                                        </td>
                                                    </template>

                                                    <!-- Tarifa común -->
                                                    <td class="p-2">
                                                        <input type="number" v-model.number="rate.fee" class="form-control form-control-sm" min="0" placeholder="Ej: 15000" required />
                                                    </td>
                                                    <td class="p-2 text-center">
                                                        <button type="button" @click="removeRateRow(index)" class="btn btn-sm btn-outline-danger border-0 rounded-circle">
                                                            <i class="fad fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                                <tr v-if="!formData.platform_fee_rates || formData.platform_fee_rates.length === 0">
                                                    <td colspan="4" class="text-center py-4 text-muted">
                                                        No hay tarifas configuradas para este criterio. Haga clic en "Agregar Tarifa" para registrar una.
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="d-flex justify-content-start mt-2">
                                        <button type="button" @click="addRateRow" class="btn btn-sm btn-outline-primary px-3 rounded-pill">
                                            <i class="fad fa-plus-circle me-1"></i> Agregar Tarifa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- Botón para Guardar -->
                    <div class="d-flex align-items-center justify-content-end gap-3 mt-4">
                        <button type="submit" class="btn btn-primary px-4 rounded-pill shadow-sm"
                            :disabled="submitting">
                            <i class="fad fa-save me-1" v-show="!submitting"></i>
                            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"
                                v-show="submitting"></span>
                            Guardar Configuración
                        </button>
                    </div>

                </form>
            </div> <!-- col-12 col-lg-9 -->
        </div> <!-- row g-3 g-lg-4 -->
    </div> <!-- v-else -->
</div> <!-- col-12 col-xxl-10 offset-xxl-1 col-xl-12 -->
</div> <!-- row gx-3 -->
</template>

<script setup>
/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-07-02
 * @module {Features.SystemConfiguration}
 * @resource {SystemConfiguration}
 */

import { ref, reactive, computed, onMounted } from 'vue';
import { useSystemConfigurationStore } from '../store/systemConfiguration.store.js';
import systemConfigurationService from '../services/systemConfiguration.service.js';
import { useAuthStore } from '@/features/auth/store/auth.store.js';
import { useUserStore } from '@/store/modules/user.js';
import { authService } from '@/features/auth/services/auth.service.js';
import companiesService from '@/features/companies/services/companies.service.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import Swal from 'sweetalert2';
import { toast } from '@/utils/toast.js';

// --- ESTADOS DE IDENTIDAD Y TARIFAS ---
const identityPreviews = reactive({
    logo: null,
    signature: null,
    ministry_logo: null,
    super_logo: null,
    letterhead: null,
});

const vehicleClasses = ref([]);

// --- STORES ---
const authStore = useAuthStore();
const userStore = useUserStore();
const systemConfigStore = useSystemConfigurationStore();

/**
 * Resuelve el UUID de la empresa activa cruzando los stores locales y la API.
 * @returns {Promise<string|null>} El UUID de la empresa o null si no se pudo resolver.
 */
const getOrFetchCompanyUuid = async () => {
    // 1. Intentar resolver de stores locales (cacheados)
    let companyUuid = authStore.currentTenant?.id || userStore.company_uuid || (userStore.companies && userStore.companies[0]?.uuid);
    if (companyUuid) return companyUuid;

    // 2. Si no se encuentra, refrescar el perfil de usuario desde el backend
    try {
        const profileData = await authService.getProfile();
        if (profileData && profileData.user) {
            userStore.setProfile(profileData.user);
            if (profileData.user.company_uuid) {
                if (!authStore.currentTenant) authStore.currentTenant = {};
                authStore.currentTenant.id = profileData.user.company_uuid;
                authStore.currentTenant.name = profileData.user.companies?.[0]?.name || 'Default';
                return profileData.user.company_uuid;
            }
            if (profileData.user.companies && profileData.user.companies.length > 0) {
                const firstCompanyUuid = profileData.user.companies[0].uuid;
                if (!authStore.currentTenant) authStore.currentTenant = {};
                authStore.currentTenant.id = firstCompanyUuid;
                authStore.currentTenant.name = profileData.user.companies[0].name;
                return firstCompanyUuid;
            }
        }
    } catch (error) {
        console.warn('Error al obtener el perfil de usuario actualizado:', error);
    }

    // 3. Si aún es nulo (ej: Superadmin sin empresa asociada), listar las empresas del sistema y tomar la primera
    try {
        const response = await companiesService.list();
        const companies = response.data?.data || response.data || [];
        if (companies && companies.length > 0) {
            const firstCompanyUuid = companies[0].uuid;
            // Guardar en el estado para evitar re-consultas
            if (!authStore.currentTenant) authStore.currentTenant = {};
            authStore.currentTenant.id = firstCompanyUuid;
            authStore.currentTenant.name = companies[0].business_name || companies[0].name;
            return firstCompanyUuid;
        }
    } catch (error) {
        console.warn('Error al listar las empresas de la aplicación:', error);
    }

    return null;
};

// --- ESTADOS ---
const isViewLoading = ref(true);
const submitting = ref(false);
const validationErrors = reactive({});

const breadcrumbs = computed(() => [
    { label: 'Configuración', to: '/settings/system-configuration' },
    { label: 'General' },
]);

const formData = reactive({
    fuec_require_daily_inspections: false,
    fuec_require_social_security: false,
    document_alert_days: 30,
    license_alert_days: 30,
    operation_card_alert_days: 30,
    soat_alert_days: 30,
    rtm_alert_days: 30,
    maintenance_alert_days: null,
    maintenance_numbers_days: null,
    maintenance_alert_km: null,
    payment_cutoff_day: 5,
    activate_notifications: false,
    notify_by_email: false,
    notification_email: '',
    fuec_pdf_show_signatures: true,
    fuec_pdf_show_contractor_details: true,
    fuec_pdf_show_route_details: true,
    vehicle_internal_number_counter: 1,
    fuec_enable_auto_internal_number: false,
    fuec_use_corporate_policies: false,
    corporate_rcc_insurer: '',
    corporate_rce_expiration: '',
    corporate_rcc_expiration: '',
    platform_fee_type: 'VEHICLE_CLASS',
    platform_fee_rates: [],
});

// --- VALIDACION Y SUBMIT ---
const ownCompanyNamesText = ref('');

const parseOwnCompanyNames = (text) => String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');

const formatOwnCompanyNames = (value) => {
    const clean = (list) => list.filter((v) => typeof v === 'string' && v.trim() !== '').join('\n');
    if (Array.isArray(value)) return clean(value);
    if (typeof value === 'string' && value.trim() !== '') {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return clean(parsed);
        } catch {
            return value;
        }
    }
    return '';
};

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => delete validationErrors[key]);

    const numericFields = [
        'document_alert_days',
        'license_alert_days',
        'operation_card_alert_days',
        'soat_alert_days',
        'rtm_alert_days'
    ];

    numericFields.forEach(field => {
        const val = formData[field];
        if (val === null || val === undefined || val === '') {
            validationErrors[field] = 'Este campo es obligatorio';
        } else if (typeof val !== 'number' || val < 1 || val > 180) {
            validationErrors[field] = 'Debe ser un número entre 1 y 180';
        }
    });

    if (formData.payment_cutoff_day === null || formData.payment_cutoff_day === undefined || formData.payment_cutoff_day === '') {
        validationErrors.payment_cutoff_day = 'El día de corte es obligatorio';
    } else if (typeof formData.payment_cutoff_day !== 'number' || formData.payment_cutoff_day < 1 || formData.payment_cutoff_day > 31) {
        validationErrors.payment_cutoff_day = 'Debe ser un día entre 1 y 31';
    }

    if (formData.maintenance_alert_km !== null && formData.maintenance_alert_km !== undefined && formData.maintenance_alert_km !== '') {
        if (typeof formData.maintenance_alert_km !== 'number' || formData.maintenance_alert_km < 0) {
            validationErrors.maintenance_alert_km = 'El kilometraje debe ser un número positivo';
        }
    }

    if (formData.activate_notifications && formData.notify_by_email) {
        if (!formData.notification_email) {
            validationErrors.notification_email = 'El correo electrónico es obligatorio';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.notification_email)) {
                validationErrors.notification_email = 'Ingrese un correo electrónico válido';
            }
        }
    }

    const tooLong = parseOwnCompanyNames(ownCompanyNamesText.value).filter((line) => line.length > 255);
    if (tooLong.length > 0) {
        validationErrors.own_company_names = 'Cada nombre debe tener máximo 255 caracteres';
    }

    // Validación de número interno
    if (formData.fuec_enable_auto_internal_number) {
        if (formData.vehicle_internal_number_counter === null || formData.vehicle_internal_number_counter === undefined || formData.vehicle_internal_number_counter === '') {
            validationErrors.vehicle_internal_number_counter = 'El consecutivo de número interno es obligatorio';
        } else if (typeof formData.vehicle_internal_number_counter !== 'number' || formData.vehicle_internal_number_counter < 1) {
            validationErrors.vehicle_internal_number_counter = 'Debe ser un número entero mayor o igual a 1';
        }
    }

    // Validación de pólizas corporativas
    if (formData.fuec_use_corporate_policies) {
        if (!formData.corporate_rcc_insurer) {
            validationErrors.corporate_rcc_insurer = 'La aseguradora corporativa es obligatoria';
        }
        if (!formData.corporate_rce_expiration) {
            validationErrors.corporate_rce_expiration = 'La fecha de vencimiento es obligatoria';
        }
        if (!formData.corporate_rcc_expiration) {
            validationErrors.corporate_rcc_expiration = 'La fecha de vencimiento es obligatoria';
        }
    }

    // Validación de Tarifas de Plataforma y Traslapes
    if (formData.platform_fee_type === 'PASSENGER_RANGE') {
        const ranges = formData.platform_fee_rates || [];
        for (let i = 0; i < ranges.length; i++) {
            const r1 = ranges[i];
            if (r1.min_passengers === null || r1.min_passengers === undefined || r1.min_passengers === '') {
                validationErrors[`rate_min_${i}`] = 'Obligatorio';
                Swal.fire('Error de Validación', `La fila ${i + 1} tiene el mínimo de pasajeros vacío.`, 'warning');
                return false;
            }
            if (r1.max_passengers === null || r1.max_passengers === undefined || r1.max_passengers === '') {
                validationErrors[`rate_max_${i}`] = 'Obligatorio';
                Swal.fire('Error de Validación', `La fila ${i + 1} tiene el máximo de pasajeros vacío.`, 'warning');
                return false;
            }
            if (Number(r1.min_passengers) < 0 || Number(r1.max_passengers) < 0) {
                Swal.fire('Error de Validación', `Los pasajeros en la fila ${i + 1} deben ser mayores o iguales a 0.`, 'warning');
                return false;
            }
            if (Number(r1.max_passengers) < Number(r1.min_passengers)) {
                Swal.fire('Error de Validación', `El valor máximo debe ser mayor o igual al mínimo en la fila ${i + 1}.`, 'warning');
                return false;
            }
            if (r1.fee === null || r1.fee === undefined || r1.fee === '' || Number(r1.fee) < 0) {
                Swal.fire('Error de Validación', `La tarifa en la fila ${i + 1} debe ser mayor o igual a 0.`, 'warning');
                return false;
            }
            // Check overlaps with other rows
            for (let j = i + 1; j < ranges.length; j++) {
                const r2 = ranges[j];
                const start1 = Number(r1.min_passengers);
                const end1 = Number(r1.max_passengers);
                const start2 = Number(r2.min_passengers);
                const end2 = Number(r2.max_passengers);
                if (start1 <= end2 && start2 <= end1) {
                    Swal.fire('Error de Validación', `Existe un traslape de rangos de pasajeros entre la fila ${i + 1} y la fila ${j + 1}.`, 'warning');
                    return false;
                }
            }
        }
    } else {
        const rates = formData.platform_fee_rates || [];
        const classUuids = new Set();
        for (let i = 0; i < rates.length; i++) {
            const r = rates[i];
            if (!r.vehicle_class_uuid) {
                Swal.fire('Error de Validación', `La fila ${i + 1} no tiene una clase de vehículo seleccionada.`, 'warning');
                return false;
            }
            if (r.fee === null || r.fee === undefined || r.fee === '' || Number(r.fee) < 0) {
                Swal.fire('Error de Validación', `La tarifa en la fila ${i + 1} debe ser mayor o igual a 0.`, 'warning');
                return false;
            }
            if (classUuids.has(r.vehicle_class_uuid)) {
                Swal.fire('Error de Validación', `La clase de vehículo de la fila ${i + 1} está duplicada.`, 'warning');
                return false;
            }
            classUuids.add(r.vehicle_class_uuid);
        }
    }

    return Object.keys(validationErrors).length === 0;
};

// --- MÉTODOS DE TARIFAS Y ARCHIVOS ---

/**
 * Procesa las tarifas de plataforma provenientes del backend, 
 * asegurando que se conviertan en un array de objetos con tipos numéricos correctos.
 * @param {any} rates - Datos crudos del backend (puede ser array, string JSON o null).
 * @returns {Array} Array de tarifas formateadas.
 */
const parsePlatformFeeRates = (rates) => {
    let parsedRates = [];
    if (Array.isArray(rates)) {
        parsedRates = rates;
    } else if (typeof rates === 'string') {
        try {
            parsedRates = JSON.parse(rates) || [];
        } catch (e) {
            console.error('Error parseando platform_fee_rates JSON:', e);
            parsedRates = [];
        }
    }

    if (!Array.isArray(parsedRates)) return [];

    return parsedRates.map(rate => ({
        min_passengers: rate.min_passengers !== undefined && rate.min_passengers !== null ? Number(rate.min_passengers) : 0,
        max_passengers: rate.max_passengers !== undefined && rate.max_passengers !== null ? Number(rate.max_passengers) : 0,
        vehicle_class_uuid: rate.vehicle_class_uuid || '',
        fee: rate.fee !== undefined && rate.fee !== null ? Number(rate.fee) : 0,
    }));
};

const addRateRow = () => {
    if (!formData.platform_fee_rates) {
        formData.platform_fee_rates = [];
    }
    if (formData.platform_fee_type === 'PASSENGER_RANGE') {
        formData.platform_fee_rates.push({ min_passengers: 0, max_passengers: 0, fee: 0 });
    } else {
        formData.platform_fee_rates.push({ vehicle_class_uuid: '', fee: 0 });
    }
};

const removeRateRow = (index) => {
    formData.platform_fee_rates.splice(index, 1);
};

const uploadCorporateFile = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const companyUuid = await getOrFetchCompanyUuid();
    if (!companyUuid) {
        return Swal.fire({
            title: 'Error',
            text: 'No se pudo determinar la empresa activa.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }

    // Mostrar loader
    Swal.fire({
        title: 'Subiendo archivo...',
        text: 'Por favor espere mientras se procesa la imagen.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        let response;
        if (type === 'logo') {
            response = await companiesService.uploadLogo(companyUuid, file);
        } else {
            response = await companiesService.uploadSignature(companyUuid, file);
        }

        const data = response?.data?.data || response?.data || response;
        
        // Actualizar previsualización local
        if (type === 'logo') {
            identityPreviews.logo = data.logo_url || URL.createObjectURL(file);
        } else {
            identityPreviews.signature = data.signature_url || URL.createObjectURL(file);
        }

        Swal.close();
        toast('¡Éxito!', `El ${type === 'logo' ? 'logo' : 'firma digital'} se ha actualizado correctamente.`, 'success');
    } catch (error) {
        Swal.close();
        console.error(`Error subiendo ${type}:`, error);
        Swal.fire({
            title: 'Error',
            text: `No se pudo subir el archivo de ${type === 'logo' ? 'logo' : 'firma'}.`,
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
};

/**
 * Sube imágenes de configuración del sistema (ministry_logo, super_logo, letterhead).
 */
const uploadConfigFile = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    let config = systemConfigStore.config;
    if (!config || !config.uuid) {
        try {
            const companyUuid = await getOrFetchCompanyUuid();
            if (!companyUuid) {
                return Swal.fire({
                    title: 'Error',
                    text: 'No se identificó el contexto de empresa activa.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
            config = await systemConfigStore.saveConfig(companyUuid, {
                company_uuid: companyUuid,
                payment_cutoff_day: 5,
                document_alert_days: 30,
                license_alert_days: 30,
                operation_card_alert_days: 30,
                soat_alert_days: 30,
                rtm_alert_days: 30,
                fuec_pdf_show_signatures: true,
                fuec_pdf_show_contractor_details: true,
                fuec_pdf_show_route_details: true,
                fuec_enable_auto_internal_number: false,
                fuec_use_corporate_policies: false,
                activate_notifications: false,
                notify_by_email: false,
                vehicle_internal_number_counter: 1,
            });
        } catch {
            return Swal.fire({
                title: 'Error',
                text: 'No se pudo crear la configuración del sistema automáticamente.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }

    if (!config || !config.uuid) {
        return Swal.fire({
            title: 'Error',
            text: 'No se pudo obtener la configuración del sistema.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }

    Swal.fire({
        title: 'Subiendo imagen...',
        text: 'Por favor espere mientras se procesa.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        let response;
        if (type === 'ministry_logo') {
            response = await systemConfigurationService.uploadMinistryLogo(config.uuid, file);
        } else if (type === 'super_logo') {
            response = await systemConfigurationService.uploadSuperLogo(config.uuid, file);
        } else if (type === 'letterhead') {
            response = await systemConfigurationService.uploadLetterhead(config.uuid, file);
        }

        const blobUrl = URL.createObjectURL(file);
        const serverUrl = response?.ministry_logo_url
            || response?.super_logo_url
            || response?.letterhead_url
            || response?.data?.ministry_logo_url
            || response?.data?.super_logo_url
            || response?.data?.letterhead_url
            || null;

        if (type === 'ministry_logo') {
            identityPreviews.ministry_logo = serverUrl || blobUrl;
        } else if (type === 'super_logo') {
            identityPreviews.super_logo = serverUrl || blobUrl;
        } else if (type === 'letterhead') {
            identityPreviews.letterhead = serverUrl || blobUrl;
        }

        Swal.close();
        toast('¡Éxito!', 'Imagen actualizada correctamente.', 'success');
    } catch (error) {
        Swal.close();
        console.error(`Error subiendo ${type}:`, error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo subir la imagen.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
};

const handleSubmit = async () => {
    if (!validateForm()) {
        const firstError = document.querySelector('.is-invalid');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return Swal.fire({
            title: 'Atención',
            text: 'Por favor complete todos los campos obligatorios con valores correctos.',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            customClass: {
                confirmButton: 'btn btn-warning px-4 rounded-pill'
            }
        });
    }

    try {
        submitting.value = true;
        const companyUuid = await getOrFetchCompanyUuid();

        if (!companyUuid) {
            throw new Error('No se identificó el contexto de empresa activa.');
        }

        const payload = { ...formData };

        // Formatear campos opcionales nulos o vacíos
        if (payload.maintenance_alert_days === '' || payload.maintenance_alert_days === null) {
            payload.maintenance_alert_days = null;
        }
        if (payload.maintenance_numbers_days === '' || payload.maintenance_numbers_days === null) {
            payload.maintenance_numbers_days = null;
        }
        if (payload.maintenance_alert_km === '' || payload.maintenance_alert_km === null) {
            payload.maintenance_alert_km = null;
        }

        if (!payload.activate_notifications || !payload.notify_by_email) {
            payload.notification_email = null;
        }

        // Nombres de empresa propia: del textarea (uno por línea) al arreglo.
        payload.own_company_names = parseOwnCompanyNames(ownCompanyNamesText.value);

        // Pólizas corporativas nulas si no se usan
        if (!payload.fuec_use_corporate_policies) {
            payload.corporate_rcc_insurer = null;
            payload.corporate_rce_expiration = null;
            payload.corporate_rcc_expiration = null;
        }

        // Número interno nulo si no se usa
        if (!payload.fuec_enable_auto_internal_number) {
            payload.vehicle_internal_number_counter = null;
        }

        // Formatear tarifas de plataforma
        if (payload.platform_fee_type === 'PASSENGER_RANGE') {
            payload.platform_fee_rates = (payload.platform_fee_rates || []).map(rate => ({
                min_passengers: Number(rate.min_passengers || 0),
                max_passengers: Number(rate.max_passengers || 0),
                fee: Number(rate.fee || 0),
            }));
        } else {
            payload.platform_fee_rates = (payload.platform_fee_rates || []).map(rate => ({
                vehicle_class_uuid: rate.vehicle_class_uuid || '',
                fee: Number(rate.fee || 0),
            }));
        }

        await systemConfigStore.saveConfig(companyUuid, payload);

        // Sincronizar el estado reactivo completo con la respuesta del backend
        const updatedConfig = systemConfigStore.config;
        if (updatedConfig) {
            Object.assign(formData, {
                fuec_require_daily_inspections: updatedConfig.fuec_require_daily_inspections === 1 || updatedConfig.fuec_require_daily_inspections === true,
                fuec_require_social_security: updatedConfig.fuec_require_social_security === 1 || updatedConfig.fuec_require_social_security === true,
                document_alert_days: Number(updatedConfig.document_alert_days ?? 30),
                license_alert_days: Number(updatedConfig.license_alert_days ?? 30),
                operation_card_alert_days: Number(updatedConfig.operation_card_alert_days ?? 30),
                soat_alert_days: Number(updatedConfig.soat_alert_days ?? 30),
                rtm_alert_days: Number(updatedConfig.rtm_alert_days ?? 30),
                maintenance_alert_days: updatedConfig.maintenance_alert_days != null ? Number(updatedConfig.maintenance_alert_days) : null,
                maintenance_numbers_days: updatedConfig.maintenance_numbers_days,
                maintenance_alert_km: updatedConfig.maintenance_alert_km != null ? Number(updatedConfig.maintenance_alert_km) : null,
                payment_cutoff_day: updatedConfig.payment_cutoff_day != null ? Number(updatedConfig.payment_cutoff_day) : 5,
                activate_notifications: updatedConfig.activate_notifications === 1 || updatedConfig.activate_notifications === true,
                notify_by_email: updatedConfig.notify_by_email === 1 || updatedConfig.notify_by_email === true,
                notification_email: updatedConfig.notification_email || '',
                fuec_pdf_show_signatures: updatedConfig.fuec_pdf_show_signatures === 1 || updatedConfig.fuec_pdf_show_signatures === true,
                fuec_pdf_show_contractor_details: updatedConfig.fuec_pdf_show_contractor_details === 1 || updatedConfig.fuec_pdf_show_contractor_details === true,
                fuec_pdf_show_route_details: updatedConfig.fuec_pdf_show_route_details === 1 || updatedConfig.fuec_pdf_show_route_details === true,
                vehicle_internal_number_counter: updatedConfig.vehicle_internal_number_counter != null ? Number(updatedConfig.vehicle_internal_number_counter) : 1,
                fuec_enable_auto_internal_number: updatedConfig.fuec_enable_auto_internal_number === 1 || updatedConfig.fuec_enable_auto_internal_number === true,
                fuec_use_corporate_policies: updatedConfig.fuec_use_corporate_policies === 1 || updatedConfig.fuec_use_corporate_policies === true,
                corporate_rcc_insurer: updatedConfig.corporate_rcc_insurer || '',
                corporate_rce_expiration: updatedConfig.corporate_rce_expiration ? String(updatedConfig.corporate_rce_expiration).split('T')[0] : '',
                corporate_rcc_expiration: updatedConfig.corporate_rcc_expiration ? String(updatedConfig.corporate_rcc_expiration).split('T')[0] : '',
                platform_fee_type: updatedConfig.platform_fee_type || 'VEHICLE_CLASS',
                platform_fee_rates: parsePlatformFeeRates(updatedConfig.platform_fee_rates),
            });
            ownCompanyNamesText.value = formatOwnCompanyNames(updatedConfig.own_company_names);

            // Sincronizar URLs de imágenes de configuración
            if (updatedConfig.ministry_logo_url) identityPreviews.ministry_logo = updatedConfig.ministry_logo_url;
            if (updatedConfig.super_logo_url) identityPreviews.super_logo = updatedConfig.super_logo_url;
            if (updatedConfig.letterhead_url) identityPreviews.letterhead = updatedConfig.letterhead_url;
        }
    } catch (error) {
        console.error('Error guardando configuración:', error);
    } finally {
        submitting.value = false;
    }
};

// --- CICLO DE VIDA ---
onMounted(async () => {
    isViewLoading.value = true;
    try {
        const companyUuid = await getOrFetchCompanyUuid();
        if (companyUuid) {
            try {
                const compRes = await companiesService.get(companyUuid);
                const company = compRes?.data?.data || compRes?.data || compRes;
                if (company) {
                    identityPreviews.logo = company.logo_url;
                    identityPreviews.signature = company.signature_url;
                }
            } catch (err) {
                console.warn('Error al cargar la identidad de la empresa:', err);
            }

            try {
                const vcRes = await companiesService._getInstance().get('catalogs/vehicle-classes/list');
                vehicleClasses.value = vcRes.data?.data || vcRes.data || [];
            } catch (err) {
                console.warn('Error al cargar catálogo de clases de vehículos:', err);
            }

            const data = await systemConfigStore.fetchByCompany(companyUuid);
            if (data) {
                Object.assign(formData, {
                    fuec_require_daily_inspections: data.fuec_require_daily_inspections === 1 || data.fuec_require_daily_inspections === true,
                    fuec_require_social_security: data.fuec_require_social_security === 1 || data.fuec_require_social_security === true,
                    document_alert_days: Number(data.document_alert_days ?? 30),
                    license_alert_days: Number(data.license_alert_days ?? 30),
                    operation_card_alert_days: Number(data.operation_card_alert_days ?? 30),
                    soat_alert_days: Number(data.soat_alert_days ?? 30),
                    rtm_alert_days: Number(data.rtm_alert_days ?? 30),
                    maintenance_alert_days: data.maintenance_alert_days !== null ? Number(data.maintenance_alert_days) : null,
                    maintenance_numbers_days: data.maintenance_numbers_days,
                    maintenance_alert_km: data.maintenance_alert_km !== null ? Number(data.maintenance_alert_km) : null,
                    payment_cutoff_day: data.payment_cutoff_day !== null && data.payment_cutoff_day !== undefined ? Number(data.payment_cutoff_day) : 5,
                    activate_notifications: data.activate_notifications === 1 || data.activate_notifications === true,
                    notify_by_email: data.notify_by_email === 1 || data.notify_by_email === true,
                    notification_email: data.notification_email || '',
                    fuec_pdf_show_signatures: data.fuec_pdf_show_signatures === 1 || data.fuec_pdf_show_signatures === true || data.fuec_pdf_show_signatures === undefined,
                    fuec_pdf_show_contractor_details: data.fuec_pdf_show_contractor_details === 1 || data.fuec_pdf_show_contractor_details === true || data.fuec_pdf_show_contractor_details === undefined,
                    fuec_pdf_show_route_details: data.fuec_pdf_show_route_details === 1 || data.fuec_pdf_show_route_details === true || data.fuec_pdf_show_route_details === undefined,
                    vehicle_internal_number_counter: data.vehicle_internal_number_counter !== null && data.vehicle_internal_number_counter !== undefined ? Number(data.vehicle_internal_number_counter) : 1,
                    fuec_enable_auto_internal_number: data.fuec_enable_auto_internal_number === 1 || data.fuec_enable_auto_internal_number === true,
                    fuec_use_corporate_policies: data.fuec_use_corporate_policies === 1 || data.fuec_use_corporate_policies === true,
                    corporate_rcc_insurer: data.corporate_rcc_insurer || '',
                    corporate_rce_expiration: data.corporate_rce_expiration ? String(data.corporate_rce_expiration).split('T')[0] : '',
                    corporate_rcc_expiration: data.corporate_rcc_expiration ? String(data.corporate_rcc_expiration).split('T')[0] : '',
                    platform_fee_type: data.platform_fee_type || 'VEHICLE_CLASS',
                    platform_fee_rates: parsePlatformFeeRates(data.platform_fee_rates),
                });
                ownCompanyNamesText.value = formatOwnCompanyNames(data.own_company_names);

                // Cargar imágenes de configuración del sistema (logos del PDF)
                if (data.ministry_logo_url) identityPreviews.ministry_logo = data.ministry_logo_url;
                if (data.super_logo_url) identityPreviews.super_logo = data.super_logo_url;
                if (data.letterhead_url) identityPreviews.letterhead = data.letterhead_url;
            }
        }
    } catch (e) {
        console.error('Error cargando configuración inicial:', e);
    } finally {
        isViewLoading.value = false;
    }
});
</script>

<style scoped>
/* ===== CARDS Y TABS ===== */
.card {
    border-radius: 1rem !important;
    border: 1px solid #e9ecef;
}

#configTabs {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

#configTabs::-webkit-scrollbar {
    display: none;
}

.nav-pills .nav-link {
    color: #495057 !important;
    font-weight: 500;
    font-size: 0.85rem;
    padding: 0.65rem 1rem !important;
    white-space: nowrap;
    transition: all 0.2s ease-in-out;
    border-radius: 0.5rem !important;
}

.nav-pills .nav-link.active {
    background-color: #0d6efd !important;
    color: #ffffff !important;
    box-shadow: 0 4px 10px rgba(13, 110, 253, 0.15) !important;
}

.nav-pills .nav-link:hover:not(.active) {
    background-color: rgba(13, 110, 253, 0.08) !important;
    color: #0d6efd !important;
}

/* Responsive configurations */
@media (max-width: 991.98px) {
    .nav-pills .nav-link {
        padding: 0.4rem 0.8rem !important;
        font-size: 0.8rem;
    }
}

@media (min-width: 992px) {
    .sticky-top-lg {
        position: sticky;
        top: 2rem;
        z-index: 1020;
    }
}

.switch-card {
    transition: all 0.15s ease-in-out;
}

.switch-card:hover {
    border-color: var(--bs-primary) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.cursor-pointer {
    cursor: pointer;
}

.required::after {
    content: " *";
    color: #dc3545;
    font-weight: 600;
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
