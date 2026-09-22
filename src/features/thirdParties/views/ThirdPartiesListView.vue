<template>
    <BasePageHeader :title="'Listado de ' + (pageTitle === 'Listado' ? 'Terceros' : pageTitle)"
        description="Gestión del módulo en el sistema." icon="fad fa-clipboard-list text-primary" :show-refresh="true"
        :show-create="canCreate" :show-bg="true" :loading="isViewLoading || store.loading" :compact="true"
        :breadcrumbs="[{ label: 'Terceros' }, { label: pageTitle === 'Listado' ? 'Todos' : pageTitle }]"
        @refresh="refreshTable" @create="goToCreate" />

    <!-- BARRA DE BÚSQUEDA -->
    <div class="card border-0 shadow-sm mb-3 fade-in-up" style="animation-delay: 0.1s;">
        <div class="bg-holder d-none d-lg-block bg-card"
            style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />
        <div class="card-body position-relative py-2">
            <div
                class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 g-2 g-md-3">

                <!-- Izquierda: título + input -->
                <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 flex-grow-1 g-2 g-md-3">
                    <h6 class="mb-0 fw-medium text-nowrap">Búsqueda</h6>
                    <div class="input-group input-group-sm w-100" style="max-width: 420px;">
                        <span class="input-group-text bg-light border-end-0">
                            <i class="fad fa-search text-muted" />
                        </span>
                        <input v-model="searchQuery" class="form-control form-control-sm border-start-0 shadow-none"
                            type="search" placeholder="Buscar..." aria-label="Buscar tercero" @input="debouncedSearch" />
                        <button v-if="searchQuery" class="btn btn-outline-secondary border-start-0" type="button"
                            title="Limpiar búsqueda" @click="clearSearch">
                            <i class="fad fa-times" />
                        </button>
                    </div>
                </div>

                <!-- Derecha: contador -->
                <div v-if="!isViewLoading && !store.loading" class="text-muted text-lg-end text-nowrap">
                    <small>
                        <i class="fad fa-filter me-1" />
                        {{ store.pagination.totalItems }} resultado{{ store.pagination.totalItems !== 1 ? 's' : '' }}
                        <span v-if="store.search"> para "{{ store.search }}"</span>
                    </small>
                </div>

            </div>
        </div>
    </div>

    <!-- TABLA -->
    <div class="row gx-3 fade-in-up" style="animation-delay: 0.2s;">
        <div class="col-12 col-xxl-12">
            <div class="card border-0 shadow-sm">
                <div class="bg-holder d-none d-lg-block bg-card"
                    style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />

                <!-- SKELETON -->
                <div v-if="isViewLoading" class="card-body p-0">
                    <div class="table-responsive scrollbar">
                        <table class="table table-sm mb-0">
                            <thead>
                                <tr>
                                    <th v-for="w in ['30%', '20%', '20%', '15%', '15%']" :key="w"
                                        style="padding:12px 8px">
                                        <div class="skeleton-text" :style="`height:16px;width:${w}`" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="n in store.pagination.itemsPerPage" :key="`sk-${n}`">
                                    <td v-for="i in 4" :key="i">
                                        <div class="skeleton-text" style="height:18px;width:75%;" />
                                    </td>
                                    <td>
                                        <div class="d-flex justify-content-center gap-1">
                                            <div v-for="j in 3" :key="j" class="skeleton-icon"
                                                style="height:28px;width:28px;" />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- DATATABLE (Paginación Server-Side) -->
                <div v-else class="card-body p-0">
                    <div class="table-responsive scrollbar">
                        <DataTable :value="store.items" lazy :paginator="true" :rows="store.pagination.itemsPerPage"
                            :totalRecords="store.pagination.totalItems" :first="(store.pagination.currentPage - 1) *
                                store.pagination.itemsPerPage
                                " :loading="store.loading" :rowsPerPageOptions="[10, 25, 50, 100]"
                            responsiveLayout="scroll" tableStyle="min-width: 50rem"
                            class="table table-sm mb-0 professional-table"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                            emptyMessage="No se encontraron registros" @page="onPageChange">
                            <Column field="document_number" header="Documento" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark">{{ data.document_number || '-' }}</span>
                                </template>
                            </Column>

                            <Column field="trade_name" header="Nombre/Razón Social" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark">
                                        {{ data.full_name || data.trade_name || data.company_name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || '-' }}
                                    </span>
                                </template>
                            </Column>

                            <Column field="email" header="Email" sortable>
                                <template #body="{ data }">
                                    <span class="text-dark">{{ data.email || '-' }}</span>
                                </template>
                            </Column>

                            <Column field="is_active" header="Estado" sortable class="text-center"
                                style="width: 120px;">
                                <template #body="{ data }">
                                    <span class="badge rounded-pill badge-subtle" :class="data.is_active
                                        ? 'badge-subtle-success'
                                        : 'badge-subtle-warning'
                                        ">
                                        <i :class="data.is_active
                                            ? 'fad fa-check-circle me-1'
                                            : 'fad fa-circle me-1'
                                            " style="font-size:10px;" />
                                        {{ data.is_active ? "Activo" : "Inactivo" }}
                                    </span>
                                </template>
                            </Column>

                            <Column header="Acciones" class="text-center" style="min-width:190px; width: 190px;">
                                <template #body="{ data }">
                                    <div class="btn-group btn-group-sm" role="group">
                                        <button v-if="canView" class="btn btn-falcon-default" type="button"
                                            title="Ver detalle" :aria-label="`Ver detalle de ${data.trade_name}`" @click="goToDetail(data.uuid)">
                                            <i class="fad fa-eye text-primary" style="font-size:14px;" />
                                        </button>
                                        <button v-if="canUpdate" class="btn btn-falcon-default" type="button"
                                            title="Editar" :aria-label="`Editar ${data.trade_name}`" @click="goToEdit(data.uuid)">
                                            <i class="fad fa-edit text-warning" style="font-size:14px;" />
                                        </button>
                                        <button
                                            v-if="store.typeFilter === 'is_driver' || data.is_driver || (data.roles && data.roles.includes('is_driver'))"
                                            class="btn btn-falcon-default" type="button" title="Gestión de Licencias" :aria-label="`Gestionar licencias de ${data.trade_name}`"
                                            @click="openLicensesModal(data.uuid, data.company_uuid)">
                                            <!-- Icono dinámico basado en las licencias cargadas (eager loaded) -->
                                            <i v-if="!data.driver_licenses || data.driver_licenses.length === 0"
                                                class="fad fa-id-card text-secondary" style="font-size:14px;"
                                                title="Sin licencias registradas" />
                                            <i v-else-if="data.driver_licenses.some(l => l.status === 'ACTIVA')"
                                                class="fad fa-id-card text-info" style="font-size:14px;"
                                                title="Licencia Activa" />
                                            <i v-else class="fad fa-exclamation-triangle text-danger"
                                                style="font-size:14px;" title="Licencia Vencida o Inactiva" />
                                        </button>
                                        <button
                                            v-if="store.typeFilter === 'is_driver' || store.typeFilter === 'is_employee' || data.is_driver || data.is_employee"
                                            class="btn btn-falcon-default" type="button" title="Seguridad Social" :aria-label="`Seguridad social de ${data.trade_name}`"
                                            @click="openSocialSecurityModal(data.uuid, data.company_uuid)">
                                            <i class="fad fa-shield-alt text-success" style="font-size:14px;" />
                                        </button>
                                        <button
                                            v-if="store.typeFilter === 'is_driver' || data.is_driver || (data.roles && data.roles.includes('is_driver'))"
                                            class="btn btn-falcon-default" type="button" title="Ver Ficha Técnica" :aria-label="`Ver ficha técnica de ${data.trade_name}`"
                                            @click="goToTechnicalSheet(data.uuid, data.company_uuid)">
                                            <i class="fad fa-file-pdf text-danger" style="font-size:14px;" />
                                        </button>
                                        <button
                                            v-if="store.typeFilter === 'is_driver' || data.is_driver || (data.roles && data.roles.includes('is_driver'))"
                                            class="btn btn-falcon-default" type="button" title="Proyectos" :aria-label="`Proyectos de ${data.trade_name}`"
                                            @click="goToProjects(data)">
                                            <i class="fad fa-briefcase text-primary" style="font-size:14px;" />
                                        </button>
                                        <button v-if="canDelete" class="btn btn-falcon-default" type="button"
                                            title="Eliminar" :aria-label="`Eliminar ${data.trade_name}`" @click="handleDelete(data)">
                                            <i class="fad fa-trash text-danger" style="font-size:14px;" />
                                        </button>
                                    </div>
                                </template>
                            </Column>
                            <!-- Loading state -->
                            <template #loading>
                                <NoaTableSpinner message="Cargando terceros..." />
                            </template>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Historial de Licencias -->
    <div class="modal fade" id="driverLicensesListModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header border-bottom-0"
                    style="background: linear-gradient(135deg,#0dcaf0 0%,#0a8fa6 100%);">
                    <h5 class="modal-title fw-bold text-white">
                        <i class="fad fa-id-card me-2" />Historial de Licencias del Conductor
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                        aria-label="Cerrar" />
                </div>
                <div class="modal-body p-0">
                    <!-- Formulario nueva licencia / edición -->
                    <div v-if="showNewLicenseForm || editingLicense" class="p-4 border-bottom"
                        :class="editingLicense ? 'bg-warning bg-opacity-10' : 'bg-light'">
                        <div class="d-flex align-items-center mb-3">
                            <h6 class="mb-0" :class="editingLicense ? 'text-warning' : 'text-primary'">
                                <i class="fas me-1" :class="editingLicense ? 'fa-edit' : 'fa-plus-circle'" />
                                {{ editingLicense ? 'Editando Licencia' : 'Registrar Nueva Licencia' }}
                            </h6>
                            <button v-if="editingLicense" type="button" class="btn btn-sm btn-outline-secondary ms-3"
                                @click="cancelEditLicense">
                                <i class="fas fa-times me-1" />Cancelar edición
                            </button>
                        </div>
                        <form @submit.prevent="editingLicense ? submitEditLicense() : submitNewLicense()">
                            <div class="row gx-2 gy-2">
                                <div class="col-12 col-md-3">
                                    <label class="form-label mb-1 small text-muted">Número de Licencia *</label>
                                    <input v-model="newLicense.number" class="form-control form-control-sm" required
                                        placeholder="Ej: 123456789" />
                                </div>
                                <div class="col-12 col-md-2">
                                    <label class="form-label mb-1 small text-muted">Categoría *</label>
                                    <select v-model="newLicense.category" class="form-select form-select-sm w-100"
                                        required>
                                        <option value="" disabled>Selec...</option>
                                        <option value="A1">A1</option>
                                        <option value="A2">A2</option>
                                        <option value="B1">B1</option>
                                        <option value="B2">B2</option>
                                        <option value="B3">B3</option>
                                        <option value="C1">C1</option>
                                        <option value="C2">C2</option>
                                        <option value="C3">C3</option>
                                    </select>
                                </div>
                                <div class="col-12 col-md-2">
                                    <label class="form-label mb-1 small text-muted">Estado *</label>
                                    <select v-model="newLicense.status" class="form-select form-select-sm w-100"
                                        required>
                                        <option value="ACTIVA">ACTIVA</option>
                                        <option value="SUSPENDIDA">SUSPENDIDA</option>
                                        <option value="VENCIDA">VENCIDA</option>
                                        <option value="CANCELADA">CANCELADA</option>
                                    </select>
                                </div>
                                <div class="col-12 col-md-2">
                                    <label class="form-label mb-1 small text-muted">Fecha Expedición *</label>
                                    <input type="date" v-model="newLicense.issue_date"
                                        class="form-control form-control-sm" required placeholder="YYYY-MM-DD" />
                                </div>
                                <div class="col-12 col-md-2">
                                    <label class="form-label mb-1 small text-muted">Fecha Vencimiento *</label>
                                    <input type="date" v-model="newLicense.expiration_date"
                                        class="form-control form-control-sm" required placeholder="YYYY-MM-DD" />
                                </div>
                                <div class="col-12 col-md-1 d-flex align-items-end">
                                    <button type="submit" class="btn btn-sm w-100" :disabled="isSubmittingLicense"
                                        :class="editingLicense ? 'btn-warning' : 'btn-primary'" title="Guardar">
                                        <i class="fas"
                                            :class="isSubmittingLicense ? 'fa-spinner fa-spin' : 'fa-save'" />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- Banner: licencia vigente (formulario oculto) -->
                    <div v-if="!showNewLicenseForm && !editingLicense && !isLoadingLicenses && driverLicenses.length > 0"
                        class="px-4 py-3 border-bottom d-flex align-items-center gap-2"
                        style="background: rgba(13,202,240,0.06);">
                        <i class="fas fa-check-circle text-info fa-lg" />
                        <div>
                            <span class="fw-semibold text-info">Licencia vigente</span>
                            <span class="text-muted small ms-2">La licencia más reciente está <strong>Activa</strong>.
                                No se
                                requiere registrar una nueva.</span>
                        </div>
                    </div>

                    <!-- Lista de licencias -->
                    <div v-if="isLoadingLicenses" class="p-5 text-center">
                        <div class="spinner-border text-info" role="status" />
                        <p class="mt-2 text-muted">Cargando licencias...</p>
                    </div>
                    <div v-else-if="driverLicenses.length === 0" class="p-5 text-center">
                        <i class="fad fa-id-card fa-3x text-muted mb-3" />
                        <h6 class="text-muted">No hay licencias registradas para este conductor.</h6>
                    </div>
                    <div v-else class="table-responsive">
                        <table class="table table-hover table-sm mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Número</th>
                                    <th>Categoría</th>
                                    <th>Expedición</th>
                                    <th>Vencimiento</th>
                                    <th>Estado</th>
                                    <th class="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="lic in driverLicenses" :key="lic.uuid"
                                    :class="{ 'table-warning': editingLicense && editingLicense.uuid === lic.uuid }">
                                    <td class="fw-medium">{{ lic.number }}</td>
                                    <td><span class="badge bg-secondary">{{ lic.category }}</span></td>
                                    <td>{{ lic.issue_date ? lic.issue_date.split(/[T ]/)[0] : '-' }}</td>
                                    <td>{{ lic.expiration_date ? lic.expiration_date.split(/[T ]/)[0] : '-' }}</td>
                                    <td>
                                        <span class="badge" :class="{
                                            'bg-success': lic.status === 'ACTIVA',
                                            'bg-warning text-dark': lic.status === 'SUSPENDIDA',
                                            'bg-danger': lic.status === 'VENCIDA',
                                            'bg-dark': lic.status === 'CANCELADA'
                                        }">{{ lic.status }}</span>
                                    </td>
                                    <td class="text-center">
                                        <!-- Botón editar SOLO para licencias ACTIVAS -->
                                        <button v-if="lic.status === 'ACTIVA'" class="btn btn-sm btn-falcon-default"
                                            title="Editar licencia" @click="startEditLicense(lic)">
                                            <i class="fad fa-edit text-warning" style="font-size:13px;" />
                                        </button>
                                        <span v-else class="text-muted small">—</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer bg-light border-top-0">
                    <button type="button" class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Seguridad Social -->
    <div class="modal fade" id="socialSecurityModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header border-bottom-0"
                    style="background: linear-gradient(135deg,#198754 0%,#0f5132 100%);">
                    <h5 class="modal-title fw-bold text-white">
                        <i class="fad fa-shield-alt me-2" />Seguridad Social (PILA)
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                        aria-label="Cerrar" />
                </div>
                <div class="modal-body p-0">
                    <!-- Botón para mostrar formulario -->
                    <div v-if="!showForm && !editingContribution" class="p-3 border-bottom text-center">
                        <button type="button" class="btn btn-success btn-sm rounded-pill px-4"
                            @click="showForm = true">
                            <i class="fas fa-plus-circle me-1" />Registrar nuevo aporte
                        </button>
                    </div>
                    <!-- Formulario nuevo aporte / edición -->
                    <div v-if="showForm || editingContribution" class="p-4 border-bottom"
                        :class="editingContribution ? 'bg-warning bg-opacity-10' : 'bg-light'">
                        <div class="d-flex align-items-center mb-3">
                            <h6 class="mb-0" :class="editingContribution ? 'text-warning' : 'text-success'">
                                <i class="fas me-1" :class="editingContribution ? 'fa-edit' : 'fa-plus-circle'" />
                                {{ editingContribution ? 'Editando Aporte' : 'Registrar Nuevo Aporte' }}
                            </h6>
                            <button v-if="editingContribution" type="button"
                                class="btn btn-sm btn-outline-secondary ms-3" @click="cancelEditContribution">
                                <i class="fas fa-times me-1" />Cancelar edición
                            </button>
                            <button v-else-if="showForm" type="button"
                                class="btn btn-sm btn-outline-secondary ms-3" @click="showForm = false">
                                <i class="fas fa-times me-1" />Cerrar
                            </button>
                        </div>
                        <form @submit.prevent="editingContribution ? submitEditContribution() : submitSocialSecurity()">
                            <div class="row gx-2 gy-2">
                                <div class="col-12 col-md-2">
                                    <label class="form-label mb-1 small text-muted">Periodo Facturación *</label>
                                    <input type="date" v-model="newContribution.billing_period"
                                        class="form-control form-control-sm" required placeholder="YYYY-MM" />
                                </div>
                                <div class="col-12 col-md-2">
                                    <label class="form-label mb-1 small text-muted">PIN PILA *</label>
                                    <input v-model="newContribution.pila_pin" class="form-control form-control-sm"
                                        required placeholder="Ej: 123456" maxlength="50" />
                                </div>
                                <div class="col-12 col-md-2">
                                    <label class="form-label mb-1 small text-muted">Tipo Aporte *</label>
                                    <select v-model="newContribution.contribution_type" class="form-select form-select-sm w-100"
                                        required>
                                        <option value="E">E – Empleado</option>
                                        <option value="Y">Y – Independiente</option>
                                        <option value="I">I – Integral</option>
                                        <option value="S">S – Sin Ingresos</option>
                                    </select>
                                </div>
                                <div class="col-12 col-md-2">
                                    <label class="form-label mb-1 small text-muted">IBC ($)</label>
                                    <input type="number" v-model="newContribution.ibc_amount"
                                        class="form-control form-control-sm" placeholder="0.00" min="0" step="0.01" />
                                </div>
                                <div class="col-12 col-md-2">
                                    <label class="form-label mb-1 small text-muted">Fecha Pago</label>
                                    <input type="date" v-model="newContribution.payment_date"
                                        class="form-control form-control-sm" placeholder="YYYY-MM-DD" />
                                </div>
                                <div class="col-12 col-md-2">
                                    <label class="form-label mb-1 small text-muted">Estado *</label>
                                    <select v-model="newContribution.status" class="form-select form-select-sm w-100"
                                        required>
                                        <option value="">Auto (según fecha)</option>
                                        <option value="PAGADO Y FINALIZADO">Pagado y Finalizado</option>
                                        <option value="PAGADO Y EN CURSO">Pagado y En Curso</option>
                                        <option value="EN MORA">En Mora</option>
                                    </select>
                                </div>
                                <!-- Entidades y Fechas de Afiliación -->
                                <div class="col-12 col-md-3 mt-2">
                                    <label class="form-label mb-1 small text-muted">EPS</label>
                                    <input type="text" autocomplete="off" v-model="newContribution.eps_name"
                                        class="form-control form-control-sm" placeholder="Nombre de la EPS"
                                        maxlength="100" />
                                </div>
                                <div class="col-12 col-md-3 mt-2">
                                    <label class="form-label mb-1 small text-muted">Fecha Afiliación EPS</label>
                                    <input type="date" v-model="newContribution.eps_affiliation_date"
                                        class="form-control form-control-sm" placeholder="YYYY-MM-DD" />
                                </div>
                                <div class="col-12 col-md-3 mt-2">
                                    <label class="form-label mb-1 small text-muted">Fondo de Pensión</label>
                                    <input type="text" autocomplete="off" v-model="newContribution.pension_name"
                                        class="form-control form-control-sm" placeholder="Fondo de Pensión"
                                        maxlength="100" />
                                </div>
                                <div class="col-12 col-md-3 mt-2">
                                    <label class="form-label mb-1 small text-muted">Fecha Afiliación Pensión</label>
                                    <input type="date" v-model="newContribution.pension_affiliation_date"
                                        class="form-control form-control-sm" placeholder="YYYY-MM-DD" />
                                </div>
                                <div class="col-12 col-md-3 mt-2">
                                    <label class="form-label mb-1 small text-muted">ARL (Riesgos Laborales)</label>
                                    <input type="text" autocomplete="off" v-model="newContribution.risk_labor_name"
                                        class="form-control form-control-sm" placeholder="ARL" maxlength="100" />
                                </div>
                                <div class="col-12 col-md-3 mt-2">
                                    <label class="form-label mb-1 small text-muted">Fecha Afiliación ARL</label>
                                    <input type="date" v-model="newContribution.risk_labor_affiliation_date"
                                        class="form-control form-control-sm" placeholder="YYYY-MM-DD" />
                                </div>
                                <div class="col-12 col-md-3 mt-2">
                                    <label class="form-label mb-1 small text-muted">Caja de Compensación</label>
                                    <input type="text" autocomplete="off" v-model="newContribution.compensation_fund_name"
                                        class="form-control form-control-sm" placeholder="Caja de compensación"
                                        maxlength="100" />
                                </div>
                                <div class="col-12 col-md-3 mt-2">
                                    <label class="form-label mb-1 small text-muted">Fecha Afiliación Caja</label>
                                    <input type="date" v-model="newContribution.compensation_fund_affiliation_date"
                                        class="form-control form-control-sm" placeholder="YYYY-MM-DD" />
                                </div>
                                <!-- Checkboxes coberturas -->
                                <div class="col-12">
                                    <div class="d-flex flex-wrap gap-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="ss_health"
                                                v-model="newContribution.health_paid" />
                                            <label class="form-check-label small" for="ss_health">Salud</label>
                                        </div>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="ss_pension"
                                                v-model="newContribution.pension_paid" />
                                            <label class="form-check-label small" for="ss_pension">Pensión</label>
                                        </div>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="ss_risk"
                                                v-model="newContribution.risk_labor_paid" />
                                            <label class="form-check-label small" for="ss_risk">Riesgos Lab.</label>
                                        </div>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="ss_fund"
                                                v-model="newContribution.compensation_fund_paid" />
                                            <label class="form-check-label small" for="ss_fund">Fondo Comp.</label>
                                        </div>
                                        <div class="ms-auto">
                                            <button type="submit" class="btn btn-sm px-4"
                                                :disabled="isSubmittingContribution"
                                                :class="editingContribution ? 'btn-warning' : 'btn-success'">
                                                <i class="fas"
                                                    :class="isSubmittingContribution ? 'fa-spinner fa-spin' : (editingContribution ? 'fa-save' : 'fa-save')" />
                                                {{ isSubmittingContribution ? 'Guardando...' : (editingContribution ?
                                                    'Actualizar' : 'Guardar') }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- Banner: aportes al día -->
                    <div v-if="socialSecurityContributions.some(c => c.status === 'PAGADO Y EN CURSO')"
                        class="px-4 py-3 border-bottom d-flex align-items-center gap-2"
                        style="background: rgba(25,135,84,0.06);">
                        <i class="fas fa-check-circle text-success fa-lg" />
                        <div>
                            <span class="fw-semibold text-success">Seguridad social al día</span>
                            <span class="text-muted small ms-2">El mes actual tiene un aporte <strong>Pagado</strong>.</span>
                        </div>
                    </div>

                    <!-- Lista de aportes -->
                    <div v-if="isLoadingContributions" class="p-5 text-center">
                        <div class="spinner-border text-success" role="status" />
                        <p class="mt-2 text-muted">Cargando aportes...</p>
                    </div>
                    <div v-else-if="socialSecurityContributions.length === 0" class="p-5 text-center">
                        <i class="fad fa-shield-alt fa-3x text-muted mb-3" />
                        <h6 class="text-muted">No hay aportes de seguridad social registrados.</h6>
                    </div>
                    <div v-else class="table-responsive">
                        <table class="table table-hover table-sm mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Periodo</th>
                                    <th>PIN PILA</th>
                                    <th>Tipo</th>
                                    <th>IBC</th>
                                    <th class="text-center">Salud</th>
                                    <th class="text-center">Pensión</th>
                                    <th class="text-center">Riesgos</th>
                                    <th class="text-center">F. Comp.</th>
                                    <th>F. Pago</th>
                                    <th>Estado</th>
                                    <th class="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="c in socialSecurityContributions" :key="c.uuid"
                                    :class="{ 'table-warning': editingContribution && editingContribution.uuid === c.uuid }">
                                    <td class="fw-medium">{{ c.billing_period ? c.billing_period.split(/[T ]/)[0] : '-'
                                    }}
                                    </td>
                                    <td>{{ c.pila_pin }}</td>
                                    <td><span class="badge bg-secondary">{{ c.contribution_type }}</span></td>
                                    <td>{{ c.ibc_amount ? '$' + Number(c.ibc_amount).toLocaleString('es-CO') : '-' }}
                                    </td>
                                    <td class="text-center"><i :title="`${c.eps_name || 'Sin especificar EPS'}${c.eps_affiliation_date ? ' (Afiliación: ' + c.eps_affiliation_date.split(/[T ]/)[0] + ')' : ''}`"
                                            :class="c.health_paid ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-danger'" />
                                    </td>
                                    <td class="text-center"><i :title="`${c.pension_name || 'Sin especificar Pensión'}${c.pension_affiliation_date ? ' (Afiliación: ' + c.pension_affiliation_date.split(/[T ]/)[0] + ')' : ''}`"
                                            :class="c.pension_paid ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-danger'" />
                                    </td>
                                    <td class="text-center"><i :title="`${c.risk_labor_name || 'Sin especificar ARL'}${c.risk_labor_affiliation_date ? ' (Afiliación: ' + c.risk_labor_affiliation_date.split(/[T ]/)[0] + ')' : ''}`"
                                            :class="c.risk_labor_paid ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-danger'" />
                                    </td>
                                    <td class="text-center"><i
                                            :title="`${c.compensation_fund_name || 'Sin especificar Caja'}${c.compensation_fund_affiliation_date ? ' (Afiliación: ' + c.compensation_fund_affiliation_date.split(/[T ]/)[0] + ')' : ''}`"
                                            :class="c.compensation_fund_paid ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-danger'" />
                                    </td>
                                    <td>{{ c.payment_date ? c.payment_date.split(/[T ]/)[0] : '-' }}</td>
                                    <td>
                                        <span class="badge" :class="{
                                            'bg-success': c.status === 'PAGADO Y FINALIZADO',
                                            'bg-info text-dark': c.status === 'PAGADO Y EN CURSO',
                                            'bg-danger': c.status === 'EN MORA'
                                        }">{{ c.status || 'Pendiente' }}</span>
                                    </td>
                                    <td class="text-center">
                                        <button class="btn btn-sm btn-falcon-default" title="Editar"
                                            @click="startEditContribution(c)">
                                            <i class="fad fa-edit text-warning" style="font-size:13px;" />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer bg-light border-top-0">
                    <button type="button" class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useThirdPartiesStore } from '../store/thirdParties.store.js';
import ThirdPartiesService from '../services/thirdParties.service.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useTable } from '@/hooks/useTable.js';
import { toast } from '@/utils/toast.js';
import { useTableActions } from '@/hooks/useTableActions.js';
import apiClient from '@/services/api/client.js';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import BasePageHeader from '@/components/BasePageHeader.vue';
import NoaTableSpinner from '@/components/NoaTableSpinner.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const route = useRoute();
const router = useRouter();
const store = useThirdPartiesStore();
const permissionsStore = usePermissionsStore();
const userStore = useUserStore();

const pageTitle = computed(() => {
    return route.meta.title || 'Terceros';
});

const isViewLoading = ref(true);
const searchQuery = ref('');

const { debouncedSearch } = useTable({}, () => store.setGlobalFilter(searchQuery.value));
const { confirmDelete, initTooltips, destroyTooltips } = useTableActions(store, router);

const can = (action) => permissionsStore.can(action);

const canCreate = computed(() => {
    const path = route.path;
    if (path.includes('/clientes')) return can('customer.create');
    if (path.includes('/proveedores')) return can('supplier.create');
    if (path.includes('/empleados')) return can('employee.create');
    if (path.includes('/afiliados')) return can('affiliate.create');
    if (path.includes('/conductores')) return can('driver.create');
    return can('third_parties.create');
});

const canView = computed(() => {
    const path = route.path;
    if (path.includes('/clientes')) return can('customer.profile');
    if (path.includes('/proveedores')) return can('supplier.profile');
    if (path.includes('/empleados')) return can('employee.profile');
    if (path.includes('/afiliados')) return can('affiliate.profile');
    if (path.includes('/conductores')) return can('driver.profile');
    return can('third_parties.profile');
});

const canUpdate = computed(() => {
    const path = route.path;
    if (path.includes('/clientes')) return can('customer.update');
    if (path.includes('/proveedores')) return can('supplier.update');
    if (path.includes('/empleados')) return can('employee.update');
    if (path.includes('/afiliados')) return can('affiliate.update');
    if (path.includes('/conductores')) return can('driver.update');
    return can('third_parties.update');
});

const canDelete = computed(() => {
    const path = route.path;
    if (path.includes('/clientes')) return can('customer.delete');
    if (path.includes('/proveedores')) return can('supplier.delete');
    if (path.includes('/empleados')) return can('employee.delete');
    if (path.includes('/afiliados')) return can('affiliate.delete');
    if (path.includes('/conductores')) return can('driver.delete');
    return can('third_parties.delete');
});

const clearSearch = async () => { searchQuery.value = ''; await store.clearFilters(); };
const refreshTable = () => store.fetchItems();
const onPageChange = async (event) => {
    const { first, rows } = event;
    if (rows !== store.pagination.itemsPerPage) {
        store.pagination.itemsPerPage = rows;
    }
    await store.setPage(Math.floor(first / rows) + 1);
};

const goToCreate = () => {
    const path = route.path;
    if (path.includes('/clientes')) return router.push('/terceros/cliente/crear');
    if (path.includes('/proveedores')) return router.push('/terceros/proveedor/crear');
    if (path.includes('/empleados')) return router.push('/terceros/empleado/crear');
    if (path.includes('/afiliados')) return router.push('/terceros/afiliado/crear');
    if (path.includes('/conductores')) return router.push('/terceros/conductor/crear');
    return router.push('/terceros/crear');
};
const goToEdit = (uuid) => {
    const path = route.path;
    if (path.includes('/clientes')) return router.push(`/terceros/cliente/editar/${uuid}`);
    if (path.includes('/proveedores')) return router.push(`/terceros/proveedor/editar/${uuid}`);
    if (path.includes('/empleados')) return router.push(`/terceros/empleado/editar/${uuid}`);
    if (path.includes('/afiliados')) return router.push(`/terceros/afiliado/editar/${uuid}`);
    if (path.includes('/conductores')) return router.push(`/terceros/conductor/editar/${uuid}`);
    return router.push(`/terceros/editar/${uuid}`);
};

const goToDetail = (uuid) => {
    const path = route.path;
    if (path.includes('/clientes')) return router.push(`/terceros/cliente/perfil/${uuid}`);
    if (path.includes('/proveedores')) return router.push(`/terceros/proveedor/perfil/${uuid}`);
    if (path.includes('/empleados')) return router.push(`/terceros/empleado/perfil/${uuid}`);
    if (path.includes('/afiliados')) return router.push(`/terceros/afiliado/perfil/${uuid}`);
    if (path.includes('/conductores')) return router.push(`/terceros/conductor/perfil/${uuid}`);
    return router.push(`/terceros/perfil/${uuid}`);
};

const goToTechnicalSheet = async (uuid, companyUuid) => {
    try {
        isViewLoading.value = true;
        const finalCompanyUuid = companyUuid || userStore?.company_uuid || store?.items?.[0]?.company_uuid;
        await ThirdPartiesService.downloadTechnicalSheet(uuid, finalCompanyUuid);
    } catch (error) {
        console.error('Error generando PDF', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo generar el PDF de la ficha técnica.'
        });
    } finally {
        isViewLoading.value = false;
    }
};

const handleDelete = (item) => confirmDelete(item, {
    title: '¿Eliminar registro?',
    nameField: 'trade_name',
});

const determineTypeFromRoute = () => {
    const path = route.path;
    if (path.includes('/clientes')) return 'is_customer';
    if (path.includes('/proveedores')) return 'is_supplier';
    if (path.includes('/empleados')) return 'is_employee';
    if (path.includes('/afiliados')) return 'is_affiliate';
    if (path.includes('/conductores')) return 'is_driver';
    if (path.includes('/otros')) return 'is_others';
    return null;
};

const driverLicenses = ref([]);
const isLoadingLicenses = ref(false);
const isSubmittingLicense = ref(false);
const currentDriverUuid = ref(null);
const editingLicense = ref(null); // licencia en modo edición
const newLicense = ref({
    company_uuid: null,
    third_party_uuid: null,
    number: '',
    category: '',
    issue_date: '',
    expiration_date: '',
    status: 'ACTIVA'
});

/**
 * Muestra el formulario SOLO cuando no hay licencias
 * o cuando NINGUNA licencia está ACTIVA (todas vencidas / suspendidas / canceladas).
 * Si existe al menos una ACTIVA el formulario permanece oculto.
 */
const showNewLicenseForm = computed(() => {
    if (driverLicenses.value.length === 0) return true;
    const hasActive = driverLicenses.value.some(l => l.status === 'ACTIVA');
    return !hasActive;
});

// ── Seguridad Social ──────────────────────────────────────────
const socialSecurityContributions = ref([]);
const isLoadingContributions = ref(false);
const isSubmittingContribution = ref(false);
const currentSocialSecurityUuid = ref(null);
const showForm = ref(false); // controla visibilidad del form de nuevo aporte
const editingContribution = ref(null); // registro en modo edición
const newContribution = ref({
    third_party_uuid: null,
    billing_period: '',
    pila_pin: '',
    contribution_type: 'E',
    ibc_amount: null,
    health_paid: true,
    pension_paid: true,
    risk_labor_paid: true,
    compensation_fund_paid: true,
    eps_name: '',
    eps_affiliation_date: '',
    pension_name: '',
    pension_affiliation_date: '',
    risk_labor_name: '',
    risk_labor_affiliation_date: '',
    compensation_fund_name: '',
    compensation_fund_affiliation_date: '',
    payment_date: '',
    status: '',
});

/**
 * Muestra el formulario de registro cuando no hay aportes
 * o cuando el último aporte no es del mes actual.
 */
const showContributionForm = computed(() => {
    if (socialSecurityContributions.value.length === 0) return true;
    const latest = socialSecurityContributions.value[0];
    if (!latest.billing_period) return true;
    const latestPeriod = latest.billing_period.substring(0, 7);
    const currentMonth = dayjs().format('YYYY-MM');
    return latestPeriod !== currentMonth;
});

const loadLicensesForModal = async (uuid) => {
    isLoadingLicenses.value = true;
    try {
        driverLicenses.value = await store.fetchDriverLicenses(uuid);
    } catch (err) {
        console.error('Error cargando licencias', err);
    } finally {
        isLoadingLicenses.value = false;
    }
};

const openLicensesModal = async (uuid, companyUuid) => {
    currentDriverUuid.value = uuid;
    const resolvedCompanyUuid = companyUuid 
        || store.items?.find(i => i.uuid === uuid)?.company_uuid 
        || userStore?.company_uuid 
        || store.items[0]?.company_uuid;

    newLicense.value = {
        company_uuid: resolvedCompanyUuid,
        third_party_uuid: uuid,
        number: '',
        category: '',
        issue_date: '',
        expiration_date: '',
        status: 'ACTIVA'
    };

    const modalEl = document.getElementById('driverLicensesListModal');
    if (window.bootstrap && window.bootstrap.Modal) {
        window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }

    await loadLicensesForModal(uuid);
};

const submitNewLicense = async () => {
    if (!newLicense.value.company_uuid) {
        newLicense.value.company_uuid = store.items?.find(i => i.uuid === currentDriverUuid.value)?.company_uuid 
            || userStore?.company_uuid 
            || store.items[0]?.company_uuid;
    }
    isSubmittingLicense.value = true;
    try {
        await store.createDriverLicense(newLicense.value);
        await loadLicensesForModal(currentDriverUuid.value);
    } catch (err) {
        console.error('Error guardando licencia', err);
    } finally {
        isSubmittingLicense.value = false;
    }
};

/** Carga una licencia existente en el formulario para editarla */
const startEditLicense = (license) => {
    editingLicense.value = license;
    newLicense.value = {
        company_uuid: license.company_uuid,
        third_party_uuid: license.third_party_uuid,
        number: license.number,
        category: license.category,
        issue_date: license.issue_date ? license.issue_date.split(/[T ]/)[0] : '',
        expiration_date: license.expiration_date ? license.expiration_date.split(/[T ]/)[0] : '',
        status: license.status,
    };
};

/** Cancela el modo edición y resetea el formulario */
const cancelEditLicense = () => {
    editingLicense.value = null;
    newLicense.value = {
        company_uuid: null,
        third_party_uuid: currentDriverUuid.value,
        number: '',
        category: '',
        issue_date: '',
        expiration_date: '',
        status: 'ACTIVA',
    };
};

/** Guarda los cambios de la licencia en edición */
const submitEditLicense = async () => {
    isSubmittingLicense.value = true;
    try {
        await store.updateDriverLicense(editingLicense.value.uuid, { ...newLicense.value });
        await loadLicensesForModal(currentDriverUuid.value);
        cancelEditLicense();
    } catch (err) {
        console.error('Error actualizando licencia', err);
    } finally {
        isSubmittingLicense.value = false;
    }
};

const loadContributionsForModal = async (uuid) => {
    isLoadingContributions.value = true;
    try {
        socialSecurityContributions.value = await store.fetchSocialSecurityContributions(uuid);
    } catch (err) {
        console.error('Error cargando aportes de seguridad social', err);
    } finally {
        isLoadingContributions.value = false;
    }
};

const openSocialSecurityModal = async (uuid, companyUuid) => {
    currentSocialSecurityUuid.value = uuid;
    showForm.value = false;
    editingContribution.value = null;
    newContribution.value = {
        third_party_uuid: uuid,
        billing_period: '',
        pila_pin: '',
        contribution_type: 'E',
        ibc_amount: null,
        health_paid: true,
        pension_paid: true,
        risk_labor_paid: true,
        compensation_fund_paid: true,
        eps_name: '',
        eps_affiliation_date: '',
        pension_name: '',
        pension_affiliation_date: '',
        risk_labor_name: '',
        risk_labor_affiliation_date: '',
        compensation_fund_name: '',
        compensation_fund_affiliation_date: '',
        payment_date: '',
        status: '',
    };

    const modalEl = document.getElementById('socialSecurityModal');
    if (window.bootstrap && window.bootstrap.Modal) {
        window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }

    await loadContributionsForModal(uuid);
    if (socialSecurityContributions.value.length === 0) {
        showForm.value = true;
    }
};

const submitSocialSecurity = async () => {
    isSubmittingContribution.value = true;
    try {
        const payload = { ...newContribution.value };
        if (!payload.payment_date) payload.payment_date = null;
        if (!payload.ibc_amount) payload.ibc_amount = null;
        if (!payload.eps_affiliation_date) payload.eps_affiliation_date = null;
        if (!payload.pension_affiliation_date) payload.pension_affiliation_date = null;
        if (!payload.risk_labor_affiliation_date) payload.risk_labor_affiliation_date = null;
        if (!payload.compensation_fund_affiliation_date) payload.compensation_fund_affiliation_date = null;
        await store.createSocialSecurityContribution(payload);
        await loadContributionsForModal(currentSocialSecurityUuid.value);
        // Reset form fields (keep third_party_uuid)
        newContribution.value.billing_period = '';
        newContribution.value.pila_pin = '';
        newContribution.value.ibc_amount = null;
        newContribution.value.payment_date = '';
        newContribution.value.eps_name = '';
        newContribution.value.eps_affiliation_date = '';
        newContribution.value.pension_name = '';
        newContribution.value.pension_affiliation_date = '';
        newContribution.value.risk_labor_name = '';
        newContribution.value.risk_labor_affiliation_date = '';
        newContribution.value.compensation_fund_name = '';
        newContribution.value.compensation_fund_affiliation_date = '';
        newContribution.value.status = '';
    } catch (err) {
        console.error('Error guardando aporte de seguridad social', err);
    } finally {
        isSubmittingContribution.value = false;
    }
};

/** Carga un aporte existente en el formulario para editarlo */
const startEditContribution = (contribution) => {
    editingContribution.value = contribution;
    newContribution.value = {
        third_party_uuid: contribution.third_party_uuid,
        billing_period: contribution.billing_period ? contribution.billing_period.split(/[T ]/)[0] : '',
        pila_pin: contribution.pila_pin,
        contribution_type: contribution.contribution_type,
        ibc_amount: contribution.ibc_amount,
        health_paid: !!contribution.health_paid,
        pension_paid: !!contribution.pension_paid,
        risk_labor_paid: !!contribution.risk_labor_paid,
        compensation_fund_paid: !!contribution.compensation_fund_paid,
        eps_name: contribution.eps_name || '',
        eps_affiliation_date: contribution.eps_affiliation_date ? contribution.eps_affiliation_date.split(/[T ]/)[0] : '',
        pension_name: contribution.pension_name || '',
        pension_affiliation_date: contribution.pension_affiliation_date ? contribution.pension_affiliation_date.split(/[T ]/)[0] : '',
        risk_labor_name: contribution.risk_labor_name || '',
        risk_labor_affiliation_date: contribution.risk_labor_affiliation_date ? contribution.risk_labor_affiliation_date.split(/[T ]/)[0] : '',
        compensation_fund_name: contribution.compensation_fund_name || '',
        compensation_fund_affiliation_date: contribution.compensation_fund_affiliation_date ? contribution.compensation_fund_affiliation_date.split(/[T ]/)[0] : '',
        payment_date: contribution.payment_date ? contribution.payment_date.split(/[T ]/)[0] : '',
        status: contribution.status,
    };
};

/** Cancela el modo edición y resetea el formulario */
const cancelEditContribution = () => {
    editingContribution.value = null;
    newContribution.value = {
        third_party_uuid: currentSocialSecurityUuid.value,
        billing_period: '',
        pila_pin: '',
        contribution_type: 'E',
        ibc_amount: null,
        health_paid: true,
        pension_paid: true,
        risk_labor_paid: true,
        compensation_fund_paid: true,
        eps_name: '',
        eps_affiliation_date: '',
        pension_name: '',
        pension_affiliation_date: '',
        risk_labor_name: '',
        risk_labor_affiliation_date: '',
        compensation_fund_name: '',
        compensation_fund_affiliation_date: '',
        payment_date: '',
        status: '',
    };
};

/** Guarda los cambios del aporte en edición */
const submitEditContribution = async () => {
    isSubmittingContribution.value = true;
    try {
        const payload = { ...newContribution.value };
        if (!payload.payment_date) payload.payment_date = null;
        if (!payload.ibc_amount) payload.ibc_amount = null;
        if (!payload.eps_affiliation_date) payload.eps_affiliation_date = null;
        if (!payload.pension_affiliation_date) payload.pension_affiliation_date = null;
        if (!payload.risk_labor_affiliation_date) payload.risk_labor_affiliation_date = null;
        if (!payload.compensation_fund_affiliation_date) payload.compensation_fund_affiliation_date = null;
        await store.updateSocialSecurityContribution(editingContribution.value.uuid, payload);
        await loadContributionsForModal(currentSocialSecurityUuid.value);
        cancelEditContribution();
    } catch (err) {
        console.error('Error actualizando aporte', err);
    } finally {
        isSubmittingContribution.value = false;
    }
};

const isDownloadingPdf = ref({});

const downloadTechnicalSheetPdf = async (data) => {
    const uuid = data.uuid;
    const companyUuid = data.company_uuid;
    isDownloadingPdf.value[uuid] = true;
    try {
        await ThirdPartiesService.downloadTechnicalSheet(uuid, companyUuid);
    } catch (error) {
        console.error(error);
        toast('Error', 'No se pudo generar o descargar el documento.', 'error');
    } finally {
        isDownloadingPdf.value[uuid] = false;
    }
};

// ── Proyectos ──────────────────────────────────
/**
 * Navega al módulo independiente de proyectos filtrado por el conductor.
 * @param {Object} driver - Conductor seleccionado.
 */
const goToProjects = (driver) => {
    router.push({ path: '/proyectos', query: { third_party_uuid: driver.uuid } });
};

onMounted(async () => {
    try {
        searchQuery.value = store.search;
        store.typeFilter = determineTypeFromRoute();
        await store.fetchItems();
    } finally {
        isViewLoading.value = false;
        initTooltips();
    }
});

watch(() => route.path, async () => {
    isViewLoading.value = true;
    store.typeFilter = determineTypeFromRoute();
    await store.setPage(1);
    isViewLoading.value = false;
    initTooltips();
});

onUnmounted(() => destroyTooltips());
</script>

<style scoped>
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

/* Tabla Estilo Profesional Falcon */
:deep(.professional-table .p-datatable-thead > tr > th) {
    padding: 0.625rem 0.75rem !important;
    font-size: 0.75rem !important;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #495057;
    border-bottom: 2px solid #e9ecef !important;
    background: #f8f9fa;
}

:deep(.professional-table .p-datatable-tbody > tr > td) {
    padding: 0.625rem 0.75rem !important;
    vertical-align: middle;
    border-bottom: 1px solid #e9ecef;
    font-size: 0.825rem !important;
    color: #212529;
    transition: background-color 150ms ease-in-out;
}

:deep(.professional-table .p-datatable-tbody > tr:hover) {
    background: #f8f9fa !important;
}

:deep(.professional-table .p-datatable-tbody > tr:last-child > td) {
    border-bottom: none;
}

/* Paginador */
:deep(.p-paginator) {
    padding: 0.5rem 1rem !important;
    background: #f8f9fa !important;
    border-top: 1px solid #e9ecef !important;
    border-radius: 0 0 0.75rem 0.75rem !important;
}

:deep(.p-paginator .p-paginator-page) {
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 0.25rem !important;
    margin: 0 0.125rem;
    font-size: 0.75rem;
    transition: all 150ms ease-in-out;
}

:deep(.p-paginator .p-paginator-page.p-highlight) {
    background: #0d6efd !important;
    border-color: #0d6efd !important;
    color: #fff !important;
}

:deep(.p-paginator .p-paginator-page:not(.p-highlight):hover) {
    background: #e9ecef !important;
}

:deep(.p-paginator .p-paginator-current) {
    font-size: 0.75rem;
    color: #6c757d;
}

:deep(.p-paginator .p-dropdown) {
    min-height: auto !important;
    height: 26px !important;
    font-size: 0.75rem !important;
}

:deep(.p-paginator .p-dropdown .p-dropdown-label) {
    font-size: 0.725rem !important;
    padding: 0 0.25rem !important;
}

:deep(.p-paginator .p-dropdown .p-dropdown-trigger) {
    width: 18px !important;
}

/* Badges */
.badge-subtle {
    font-weight: 500;
    font-size: 0.75rem;
    padding: 0.35em 0.6em;
    transition: all 150ms ease-in-out;
    white-space: nowrap;
}

.badge-subtle-success {
    background: rgba(25, 135, 84, 0.1);
    color: #198754;
    border: 1px solid rgba(25, 135, 84, 0.2);
}

.badge-subtle-secondary {
    background: rgba(108, 117, 125, 0.1);
    color: #6c757d;
    border: 1px solid rgba(108, 117, 125, 0.2);
}

.badge-subtle-info {
    background: rgba(13, 202, 240, 0.1);
    color: #0dcaf0;
    border: 1px solid rgba(13, 202, 240, 0.2);
}

.badge-subtle-warning {
    background: rgba(255, 193, 7, 0.1);
    color: #856404;
    border: 1px solid rgba(255, 193, 7, 0.2);
}

.badge-subtle:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Botones Acciones */
:deep(.btn-group .btn) {
    padding: 0.25rem 0.45rem;
    transition: all 150ms ease-in-out;
}

:deep(.btn-group .btn:hover) {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    z-index: 1;
}
</style>