import { defineStore } from 'pinia';
import { runStoreAction, extractStoreErrorMessage } from '@store/helpers/runStoreAction.js';
import fuelRequestsService from '../services/fuelRequests.service.js';

const MENSAJE_VEHICULOS = 'No se pudieron cargar tus vehículos. Revisa la conexión e inténtalo de nuevo.';

/**
 * El cuerpo de /qr es { success, message, data: { data, url, qr_data, qr_url } }.
 * `data` dentro del QR es el texto, por eso no se desempaqueta dos veces.
 * Devuelve null si la respuesta no trae las imágenes.
 */
export function extraerQr(response) {
    const payload = response?.data ?? response;
    return payload?.qr_url || payload?.qr_data ? payload : null;
}

export const useFuelRequestsStore = defineStore('fuelRequests', {
    state: () => ({
        items: [],
        total: 0,
        qr: null,
        loading: false,
        error: null,
        vehiculos: [],
        vehiculosLoading: false,
        vehiculosError: null,
    }),

    actions: {
        async fetchItems() {
            return runStoreAction(this, async () => {
                const response = await fuelRequestsService.list({ per_page: 50 });
                const p = response?.data ?? response;
                this.items = Array.isArray(p?.data) ? p.data : [];
                this.total = Number.isFinite(p?.total) ? p.total : this.items.length;
                return this.items;
            }, 'No se pudieron cargar tus solicitudes de tanqueo.');
        },

        async fetchVehiculos() {
            this.vehiculosLoading = true;
            this.vehiculosError = null;
            try {
                this.vehiculos = await fuelRequestsService.getVehiculos();
            } catch (error) {
                this.vehiculos = [];
                this.vehiculosError = error?.response?.data?.message || MENSAJE_VEHICULOS;
            } finally {
                this.vehiculosLoading = false;
            }
            return this.vehiculos;
        },

        async crear(vehicleUuid, notes = null) {
            return runStoreAction(this, async () => {
                const response = await fuelRequestsService.create({ vehicle_uuid: vehicleUuid, notes });
                const item = response?.data ?? response;
                await this.fetchItems().catch(() => {});
                return item;
            }, 'No se pudo crear la solicitud de tanqueo.');
        },

        async aprobar(uuid) {
            return runStoreAction(this, async () => {
                await fuelRequestsService.approve(uuid);
                await this.fetchItems().catch(() => {});
            }, 'No se pudo aprobar la solicitud.');
        },

        async rechazar(uuid, reason = null) {
            return runStoreAction(this, async () => {
                await fuelRequestsService.reject(uuid, { reason });
                await this.fetchItems().catch(() => {});
            }, 'No se pudo rechazar la solicitud.');
        },

        async anular(uuid) {
            return runStoreAction(this, async () => {
                await fuelRequestsService.cancel(uuid);
                await this.fetchItems().catch(() => {});
            }, 'No se pudo anular la solicitud.');
        },

        async cargarQr(uuid) {
            const response = await fuelRequestsService.qr(uuid);
            this.qr = extraerQr(response);
            return this.qr;
        },
    },
});
