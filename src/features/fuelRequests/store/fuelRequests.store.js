import { defineStore } from 'pinia';
import { runStoreAction } from '@store/helpers/runStoreAction.js';
import fuelRequestsService from '../services/fuelRequests.service.js';

export const useFuelRequestsStore = defineStore('fuelRequests', {
    state: () => ({
        items: [],
        vehiculos: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchItems() {
            return runStoreAction(this, async () => {
                const response = await fuelRequestsService.list({ per_page: 50 });
                const p = response?.data ?? response;
                this.items = p.data ?? [];
                return this.items;
            }, 'No se pudieron cargar tus solicitudes de tanqueo.');
        },

        async fetchVehiculos() {
            const vehiculos = await fuelRequestsService.getVehiculos();
            this.vehiculos = Array.isArray(vehiculos) ? vehiculos : [];
            return this.vehiculos;
        },

        async crear(vehicleUuid, notes = null) {
            return runStoreAction(this, async () => {
                const response = await fuelRequestsService.create({
                    vehicle_uuid: vehicleUuid,
                    notes,
                });
                const item = response?.data?.data ?? response?.data ?? response;
                await this.fetchItems();
                return item;
            }, 'No se pudo crear la solicitud de tanqueo.');
        },

        async anular(uuid) {
            return runStoreAction(this, async () => {
                await fuelRequestsService.cancel(uuid);
                await this.fetchItems();
            }, 'No se pudo anular la solicitud.');
        },

        async aprobar(uuid) {
            return runStoreAction(this, async () => {
                await fuelRequestsService.approve(uuid);
                await this.fetchItems();
            }, 'No se pudo aprobar la solicitud.');
        },

        async rechazar(uuid, reason = null) {
            return runStoreAction(this, async () => {
                await fuelRequestsService.reject(uuid, { reason });
                await this.fetchItems();
            }, 'No se pudo rechazar la solicitud.');
        },

        async cargarQr(uuid) {
            const response = await fuelRequestsService.qr(uuid);
            return response?.data?.data ?? response?.data ?? response;
        },
    },
});
