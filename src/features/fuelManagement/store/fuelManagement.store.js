import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import fuelManagementService from '../services/fuelManagement.service.js';

/**
 * Store Pinia para el Control de Combustible, Kilometraje y Saldos.
 * Paginación server-side, carga de catálogos, contexto de vehículo y CRUD.
 */
export const useFuelManagementStore = defineStore('fuelManagement', {
    state: () => ({
        items: [],
        selectedItem: null,
        loading: false,
        error: null,
        catalogs: { vehicles: [], thirdParties: [] },
        context: null,
        status: [],
        statusSummary: { total: 0, excedidos: 0, proximos: 0, sin_datos: 0, sin_tanqueo: 0, ok: 0 },
        statusProjects: [],
        statusLoading: false,
        statusError: false,
        pagination: { currentPage: 1, itemsPerPage: 10, totalItems: 0, totalPages: 0 },
        search: '',
    }),

    getters: {
        filteredItems: (state) => state.items,
        paginatedItems: (state) => state.items,
    },

    actions: {
        /**
         * Carga el listado paginado (server-side).
         * @returns {Promise<void>}
         */
        async fetchItems() {
            return runStoreAction(this, async () => {
                const response = await fuelManagementService.list({
                    page: this.pagination.currentPage,
                    per_page: this.pagination.itemsPerPage,
                    search: this.search || undefined,
                });
                const p = response?.data ?? response;
                this.items = p.data ?? [];
                this.pagination.currentPage = p.current_page ?? 1;
                this.pagination.totalItems = p.total ?? 0;
                this.pagination.totalPages = p.last_page ?? 1;
                this.pagination.itemsPerPage = p.per_page ?? this.pagination.itemsPerPage;
            }, 'Error al cargar los registros de combustible');
        },

        /**
         * Obtiene un registro por UUID.
         * @param {string} uuid
         * @returns {Promise<Object>}
         */
        async fetchProfileById(uuid) {
            return runStoreAction(this, async () => {
                const response = await fuelManagementService.get(uuid);
                return response?.data?.data ?? response?.data ?? response;
            }, 'Error al cargar el registro');
        },

        /**
         * Carga los catálogos del formulario.
         * @returns {Promise<Object>}
         */
        async loadCatalogs() {
            try {
                this.catalogs = await fuelManagementService.getFormOptions();
                return this.catalogs;
            } catch (error) {
                await toast('Advertencia', 'No se pudieron cargar algunas opciones del formulario', 'warning');
                throw error;
            }
        },
        loadFormOptions() { return this.loadCatalogs(); },

        /**
         * Estado de combustible por vehículo (km recorridos, tope y restantes).
         * Es informativo: si falla, el listado sigue funcionando.
         * @returns {Promise<void>}
         */
        async fetchStatus() {
            this.statusLoading = true;
            this.statusError = false;
            try {
                const data = await fuelManagementService.getStatus();
                this.status = data?.items ?? [];
                this.statusSummary = data?.summary ?? {
                    total: 0, excedidos: 0, proximos: 0, sin_datos: 0, sin_tanqueo: 0, ok: 0,
                };
                this.statusProjects = data?.projects ?? [];
            } catch (error) {
                this.status = [];
                this.statusError = true;
            } finally {
                this.statusLoading = false;
            }
        },

        /**
         * Precarga el contexto (kilometraje inicial y saldo anterior) del vehículo.
         * @param {string} vehicleUuid
         * @param {string} [date]
         * @returns {Promise<Object>}
         */
        async loadContext(vehicleUuid, date) {
            if (!vehicleUuid) { this.context = null; return null; }
            try {
                this.context = await fuelManagementService.getContext(vehicleUuid, date);
                return this.context;
            } catch (error) {
                this.context = null;
                return null;
            }
        },

        /** @private */
        _patchLocal(uuid, patch) {
            const i = this.items.findIndex(item => item.uuid === uuid);
            if (i !== -1) this.items[i] = { ...this.items[i], ...patch };
        },

        /** @private */
        async _afterCreate(response) {
            const item = response?.data?.data ?? response?.data ?? response;
            await toast('¡Éxito!', 'Registro de combustible creado correctamente', 'success');
            this.pagination.currentPage = 1;
            await this.fetchItems();
            return item;
        },

        /**
         * Crea un registro.
         * @param {Object} data
         * @returns {Promise<Object>}
         */
        createItem(data) {
            return runStoreAction(
                this,
                () => fuelManagementService.create(data).then(r => this._afterCreate(r)),
                'Error al crear el registro'
            );
        },

        /**
         * Actualiza un registro.
         * @param {string} uuid
         * @param {Object} data
         * @returns {Promise<Object>}
         */
        updateItem(uuid, data) {
            return runStoreAction(this, async () => {
                const response = await fuelManagementService.update(uuid, data);
                const updated = response?.data?.data ?? response?.data ?? response;
                this._patchLocal(uuid, updated);
                await toast('¡Éxito!', 'Registro actualizado correctamente', 'success');
                return updated;
            }, 'Error al actualizar el registro');
        },

        /**
         * Elimina un registro.
         * @param {string} uuid
         * @returns {Promise<void>}
         */
        async deleteItem(uuid) {
            return runStoreAction(this, async () => {
                await fuelManagementService.delete(uuid);
                await toast('¡Eliminado!', 'El registro ha sido eliminado', 'success');
                if (this.items.length === 1 && this.pagination.currentPage > 1) {
                    this.pagination.currentPage -= 1;
                }
                await this.fetchItems();
            }, 'Error al eliminar el registro');
        },

        setPage(page) { this.pagination.currentPage = page; return this.fetchItems(); },
        setGlobalFilter(query) { this.search = query; this.pagination.currentPage = 1; return this.fetchItems(); },
        clearFilters() { this.search = ''; this.pagination.currentPage = 1; return this.fetchItems(); },
    },
});
