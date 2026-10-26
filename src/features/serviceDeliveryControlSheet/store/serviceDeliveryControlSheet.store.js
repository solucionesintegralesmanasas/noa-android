import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import { usePermissionsStore, useUserStore } from '@store';
import { filtrarPlanillas, mensajeDescarga, uuidsDelConductor } from '../hooks/useServiceList.js';
import serviceDeliveryControlSheetService from '../services/serviceDeliveryControlSheet.service.js';

/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-19
 * @module {Features.Fleet}
 * @resource {ServiceDeliveryControlSheet}
 */

export const useServiceDeliveryControlSheetStore = defineStore('serviceDeliveryControlSheet', {
    state: () => ({
        items: [],
        selectedItem: null,
        loading: false,
        error: null,
        catalogs: {},
        projects: [],
        projectDetail: null,
        projectFilter: '',
        soloCerradas: false,
        agruparPorProyecto: true,
        pagination: { currentPage: 1, itemsPerPage: 10, totalItems: 0, totalPages: 0 },
        search: '',
        // Modo conductor: el backend no filtra por conductor en este listado,
        // así que se carga el catálogo de la empresa, se acotan las suyas y la
        // paginación se calcula en el cliente.
        modoConductor: false,
        conductorCargado: false,
        planillasConductor: [],
        // UUIDs con los que se cargó `planillasConductor`: si la sesión cambia
        // (conductor ↔ administrador, u otro conductor) no se sigue filtrando
        // con los datos del usuario anterior.
        uuidsCargados: null,
    }),

    getters: {
        filteredItems: (state) => state.items,
        paginatedItems: (state) => state.items,
    },

    actions: {
        /**
         * Ejecuta una acción asíncrona manejando estados de carga y errores.
         * @param {Function} action - Función asíncrona a ejecutar.
         * @param {string} errorMsg - Mensaje de error por defecto.
         * @returns {Promise<any>} Resultado de la acción.
         * @private
         */
        async _run(action, errorMsg) {
            return runStoreAction(this, action, errorMsg);
        },

        /**
         * Carga el listado. El conductor trabaja sobre el catálogo completo
         * (el endpoint paginado no acepta filtro por conductor) y el resto
         * sigue con paginación del servidor.
         * @returns {Promise<void>}
         */
        async fetchItems() {
            // El rol puede cambiar entre sesiones sin recrear el store: se
            // recalcula en cada carga y el estado del modo anterior se descarta.
            const esConductor = this._esConductor();
            if (this.modoConductor !== esConductor) {
                this.modoConductor = esConductor;
                this.conductorCargado = false;
                this.planillasConductor = [];
                this.uuidsCargados = null;
            }
            if (esConductor) return this._fetchPlanillasConductor();
            return this._run(async () => {
                const response = await serviceDeliveryControlSheetService.list({
                    page: this.pagination.currentPage,
                    per_page: this.pagination.itemsPerPage,
                    search: this.search || undefined,
                    project_uuid: this.projectFilter || undefined,
                    solo_cerradas: this.soloCerradas ? true : undefined,
                    agrupar_proyecto: this.agruparPorProyecto ? true : undefined,
                });
                const p = response?.data ?? response;
                this.items = p.data ?? [];
                this.pagination.currentPage = p.current_page ?? 1;
                this.pagination.totalItems = p.total ?? 0;
                this.pagination.totalPages = p.last_page ?? 1;
                this.pagination.itemsPerPage = p.per_page ?? this.pagination.itemsPerPage;
            }, 'Error al cargar los datos');
        },

        /**
         * true cuando la sesión es de conductor: solo debe ver sus planillas.
         * Falla en falso si los permisos aún no cargaron (no se ocultan datos
         * por un error de roles).
         * @returns {boolean}
         * @private
         */
        _esConductor() {
            try {
                return usePermissionsStore().hasRole('CONDUCTOR');
            } catch {
                return false;
            }
        },

        /**
         * UUIDs que identifican al conductor logueado (conductor, tercero
         * vinculado y tercero de la empresa activa: el pivote puede guardar
         * cualquiera de ellos). La regla vive en la función pura
         * `uuidsDelConductor` para que la vista y el listado filtren igual.
         * @returns {string[]}
         * @private
         */
        _uuidsConductor() {
            try {
                return uuidsDelConductor(useUserStore());
            } catch {
                return [];
            }
        },

        /**
         * Descarga el catálogo de la empresa y lo acota a las planillas del
         * conductor. Sin identidad de conductor no se muestra ninguna fila.
         * @returns {Promise<void>}
         * @private
         */
        async _fetchPlanillasConductor() {
            return this._run(async () => {
                const response = await serviceDeliveryControlSheetService.listAll();
                const cuerpo = response?.data?.data ?? response?.data ?? response;
                this.planillasConductor = Array.isArray(cuerpo) ? cuerpo : [];
                this.uuidsCargados = this._uuidsConductor();
                this.conductorCargado = true;
                this._aplicarFiltrosConductor();
            }, 'Error al cargar los datos');
        },

        /**
         * Filtra por conductor (más búsqueda, proyecto y "solo cerradas") y
         * pagina en el cliente sobre el resultado.
         * @private
         */
        _aplicarFiltrosConductor() {
            let filtradas = filtrarPlanillas(this.planillasConductor, {
                uuidsConductor: this._uuidsConductor(),
                busqueda: this.search,
                projectUuid: this.projectFilter,
                soloCerradas: this.soloCerradas,
            });
            if (this.agruparPorProyecto) {
                // Agrupar por proyecto: orden por nombre para que cada grupo quede contiguo.
                filtradas = [...filtradas].sort((a, b) => (a.project?.project_name || '').localeCompare(b.project?.project_name || '', 'es'));
            }
            const total = filtradas.length;
            const porPagina = this.pagination.itemsPerPage || 10;
            const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
            if (this.pagination.currentPage > totalPaginas) this.pagination.currentPage = totalPaginas;
            const inicio = (this.pagination.currentPage - 1) * porPagina;
            this.items = filtradas.slice(inicio, inicio + porPagina);
            this.pagination.totalItems = total;
            this.pagination.totalPages = totalPaginas;
        },

        /**
         * Recarga respetando el modo: en conductor no se vuelve a pedir la red
         * por cada tecla o cambio de página, y si la primera carga falló se
         * reintenta contra el servidor. Si la identidad del conductor cambió
         * (cambio de sesión), el catálogo cargado ya no sirve y se vuelve a
         * pedir en lugar de filtrar con los UUIDs de otro usuario.
         * @returns {Promise<void>}
         * @private
         */
        _refrescar() {
            if (this.modoConductor && this.conductorCargado && this._mismoConductorCargado()) {
                this._aplicarFiltrosConductor();
                return Promise.resolve();
            }
            return this.fetchItems();
        },

        /**
         * true si los UUIDs con los que se cargó el catálogo siguen siendo
         * los del usuario actual (comparación por conjunto, sin importar el
         * orden ni duplicados).
         * @returns {boolean}
         * @private
         */
        _mismoConductorCargado() {
            const cargados = [...new Set(this.uuidsCargados || [])].sort();
            const actuales = [...new Set(this._uuidsConductor())].sort();
            // Sin identidad a ningún lado el resultado es el mismo (0 filas):
            // no hay nada que recargar y no se martillea la red.
            if (!cargados.length || !actuales.length) return cargados.length === actuales.length;
            return cargados.length === actuales.length
                && cargados.every((u, i) => u === actuales[i]);
        },

        /**
         * Cambia las filas por página (el desplegable del paginador) y vuelve
         * a la primera página con el modo que corresponda.
         * @param {number} filas - Nuevas filas por página.
         * @returns {Promise<void>}
         */
        setItemsPerPage(filas) {
            const cantidad = Number(filas);
            if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad === this.pagination.itemsPerPage) {
                return Promise.resolve();
            }
            this.pagination.itemsPerPage = cantidad;
            this.pagination.currentPage = 1;
            return this._refrescar();
        },

        /**
         * Carga los catálogos necesarios para los formularios.
         * @returns {Promise<Object>} Catálogos cargados.
         */
        async loadCatalogs(companyUuid, thirdPartyUuid = null) {
            this.loading = true;
            try {
                const catalogs = await serviceDeliveryControlSheetService.getFormOptions(companyUuid, thirdPartyUuid);
                this.catalogs = catalogs;
                // Asignar siempre (incluso vacío): evita mostrar proyectos
                // obsoletos de otra sesión cuando el conductor no tiene ninguno.
                if (Array.isArray(catalogs.projects)) this.projects = catalogs.projects;
                return catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar algunas opciones del formulario.', 'warning');
                return {};
            } finally {
                this.loading = false;
            }
        },

        async loadProjects(companyUuid, thirdPartyUuid = null) {
            try {
                const list = await serviceDeliveryControlSheetService.listProjects(companyUuid, thirdPartyUuid);
                this.projects = Array.isArray(list) ? list : [];
                return this.projects;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar los proyectos.', 'warning');
                return [];
            }
        },

        async loadProjectDetail(uuid) {
            if (!uuid) { this.projectDetail = null; return null; }
            try {
                this.projectDetail = await serviceDeliveryControlSheetService.getProjectDetail(uuid);
                return this.projectDetail;
            } catch (error) {
                this.projectDetail = null;
                return null;
            }
        },
        loadFormOptions(companyUuid, thirdPartyUuid = null) { return this.loadCatalogs(companyUuid, thirdPartyUuid); },
        setProjectFilter(uuid) { this.projectFilter = uuid || ''; this.pagination.currentPage = 1; return this._refrescar(); },

        /**
         * Actualiza un elemento localmente en el array de items.
         * @param {string} uuid - UUID del elemento.
         * @param {Object} patch - Datos parciales a fusionar.
         * @private
         */
        _patchLocal(uuid, patch) {
            const i = this.items.findIndex(item => item.uuid === uuid);
            if (i !== -1) this.items[i] = { ...this.items[i], ...patch };
        },

        /**
         * Acciones posteriores a la creación exitosa.
         * @param {Object} response - Respuesta del servidor.
         * @returns {Object} El elemento creado.
         * @private
         */
        async _afterCreate(response) {
            const item = response?.data?.data ?? response?.data ?? response;
            await toast('¡Éxito!', 'Registro creado correctamente', 'success');
            this.pagination.currentPage = 1;
            await this.fetchItems();
            return item;
        },

        /**
         * Crea un nuevo registro.
         * @param {Object} data - Datos del formulario.
         * @returns {Promise<Object>} Registro creado.
         */
        createItem(data) {
            return this._run(
                () => serviceDeliveryControlSheetService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el registro'
            );
        },

        /**
         * Actualiza un registro existente.
         * @param {string} uuid - UUID del registro.
         * @param {Object} data - Datos actualizados.
         * @returns {Promise<Object>} Registro actualizado.
         */
        updateItem(uuid, data) {
            return this._run(async () => {
                const response = await serviceDeliveryControlSheetService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Registro actualizado correctamente', 'success');
                return updated;
            }, 'Error al actualizar el registro');
        },

        /**
         * Inicia un servicio.
         * @param {string} uuid - UUID del registro.
         * @param {Object} data - Datos de inicio.
         * @returns {Promise<Object>} Registro actualizado.
         */
        startService(uuid, data) {
            return this._run(async () => {
                const response = await serviceDeliveryControlSheetService.startService(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Servicio iniciado correctamente', 'success');
                return updated;
            }, 'Error al iniciar el servicio');
        },

        /**
         * Finaliza un servicio.
         * @param {string} uuid - UUID del registro.
         * @param {Object} data - Datos de finalización.
         * @returns {Promise<Object>} Registro actualizado.
         */
        closeService(uuid, data) {
            return this._run(async () => {
                const response = await serviceDeliveryControlSheetService.closeService(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Servicio finalizado correctamente', 'success');
                return updated;
            }, 'Error al finalizar el servicio');
        },

        /**
         * Guarda el cierre de un solo recorrido (cierre parcial por recorrido).
         * @param {string} uuid - UUID del registro.
         * @param {Object} data - Datos de cierre del recorrido (route_uuid/route_index + campos + firmas).
         * @returns {Promise<Object>} Respuesta con planilla y route actualizados.
         */
        closeRoute(uuid, data) {
            return this._run(async () => {
                const response = await serviceDeliveryControlSheetService.closeRoute(uuid, data);
                const result = response?.data?.data ?? response?.data ?? response;
                if (result?.planilla) {
                    this._patchLocal(uuid, result.planilla);
                }
                await toast('¡Éxito!', 'Cierre del recorrido guardado correctamente', 'success');
                return result;
            }, 'Error al guardar el cierre del recorrido');
        },

        /**
         * Elimina un registro.
         * @param {string} uuid - UUID del registro a eliminar.
         * @returns {Promise<void>}
         */
        async deleteItem(uuid) {
            return this._run(async () => {
                await serviceDeliveryControlSheetService.delete(uuid);
                await toast('¡Eliminado!', 'El registro ha sido eliminado', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar el registro');
        },

        /**
         * Obtiene el perfil detallado de un registro.
         * @param {string} uuid - UUID del registro.
         * @returns {Promise<Object>} Datos del perfil.
         */
        getProfile(uuid) {
            return this._run(async () => {
                const r = await serviceDeliveryControlSheetService.getProfile(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al obtener el perfil');
        },

        /**
         * Carga un registro por su ID para edición o visualización.
         * @param {string} uuid - UUID del registro.
         * @returns {Promise<Object>} Datos del registro.
         */
        fetchProfileById(uuid) {
            return this._run(async () => {
                const r = await serviceDeliveryControlSheetService.get(uuid);
                this.selectedItem = r?.data?.data ?? r?.data ?? r;
                return this.selectedItem;
            }, 'Error al cargar el registro');
        },

        setPage(page) {
            this.pagination.currentPage = page;
            return this._refrescar();
        },
        setGlobalFilter(query) { this.search = query; this.pagination.currentPage = 1; return this._refrescar(); },
        clearFilters() { this.search = ''; this.pagination.currentPage = 1; return this._refrescar(); },
        setAgruparPorProyecto(value) { this.agruparPorProyecto = !!value; this.pagination.currentPage = 1; return this._refrescar(); },
        setSoloCerradas(value) { this.soloCerradas = !!value; this.pagination.currentPage = 1; return this._refrescar(); },

        /**
         * Descarga el PDF diario de un registro (en Android queda en
         * Descargas/NOA; en el navegador se descarga normalmente).
         * @param {string} uuid - UUID del registro.
         * @returns {Promise<void>}
         */
        async downloadDailyPdf(uuid) {
            return this._run(async () => {
                const estado = await serviceDeliveryControlSheetService.downloadDailyPdf(uuid);
                const aviso = mensajeDescarga('PDF diario', estado);
                if (aviso) await toast('¡Éxito!', aviso, 'success');
            }, 'Error al descargar el PDF diario');
        },

        /**
         * Descarga el PDF mensual consolidado (en Android queda en
         * Descargas/NOA; en el navegador se descarga normalmente).
         * @param {Object} params - Parámetros: vehicle_uuid, year, month.
         * @returns {Promise<void>}
         */
        async downloadMonthlyPdf(params) {
            return this._run(async () => {
                const estado = await serviceDeliveryControlSheetService.downloadMonthlyPdf(params);
                const aviso = mensajeDescarga('PDF mensual', estado);
                if (aviso) await toast('¡Éxito!', aviso, 'success');
            }, 'Error al descargar el PDF mensual');
        },

        /**
         * Descarga un reporte filtrado solo con días cerrados en PDF o Excel
         * (en Android queda en Descargas/NOA).
         * @param {string} tipo - rango|vehiculo|conductor|dia|mensual.
         * @param {Object} params - Filtros del reporte.
         * @param {string} formato - pdf|excel.
         */
        async downloadReport(tipo, params = {}, formato = 'pdf') {
            return this._run(async () => {
                const estado = await serviceDeliveryControlSheetService.downloadReport(tipo, params, formato);
                const etiqueta = `Reporte ${tipo} (${formato.toUpperCase()})`;
                const aviso = mensajeDescarga(etiqueta, estado);
                if (aviso) await toast('¡Éxito!', aviso, 'success');
            }, 'Error al descargar el reporte');
        },

        /**
         * Genera el enlace público temporal para la firma del coordinador (1 hora).
         * @param {string} uuid - UUID de la planilla.
         * @returns {Promise<Object>} Datos con { url, expires_at }.
         */
        async generateCoordinatorSignUrl(uuid) {
            return this._run(async () => {
                const response = await serviceDeliveryControlSheetService.generateCoordinatorSignUrl(uuid);
                return response?.data?.data ?? response?.data ?? response;
            }, 'Error al generar el enlace de firma');
        },
    },
});