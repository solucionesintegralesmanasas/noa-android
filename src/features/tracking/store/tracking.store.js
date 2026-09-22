import { defineStore } from 'pinia';
import trackingService from '../services/tracking.service';

export const useTrackingStore = defineStore('tracking', {
    state: () => ({
        activeDrivers: [],
        selectedDriver: null,
        driverHistory: [],
        geofences: [],
        alerts: [],
        alertCount: 0,
        stats: null,
        isTracking: false,
        currentSession: null,
        loading: false,
        error: null,
    }),

    getters: {
        unreadAlertCount: (state) => state.alerts.filter((a) => !a.is_read).length,
    },

    actions: {
        async fetchActiveDrivers() {
            this.loading = true;
            this.error = null;
            try {
                const response = await trackingService.getActiveDrivers();
                this.activeDrivers = response.data?.data || response.data || [];
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        async fetchDriverHistory(uuid, startDate, endDate) {
            this.loading = true;
            this.error = null;
            try {
                const response = await trackingService.getDriverHistory(uuid, {
                    start_date: startDate,
                    end_date: endDate,
                });
                this.driverHistory = response.data?.data || response.data || [];
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        async fetchDriverStats(uuid) {
            try {
                const response = await trackingService.getDriverStats(uuid);
                this.stats = response.data?.data || response.data || null;
            } catch (err) {
                this.error = err.message;
            }
        },

        async attachRouteMap(driverUuid, serviceDate, imageBase64) {
            const response = await trackingService.saveRouteMapCapture({
                third_party_uuid: driverUuid,
                service_date: serviceDate,
                image_base64: imageBase64,
            });
            return response.data?.data || response.data;
        },

        async fetchGeofences() {
            this.loading = true;
            try {
                const response = await trackingService.getGeofences({ per_page: 100 });
                this.geofences = response.data?.data || response.data || [];
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        async createGeofence(data) {
            const response = await trackingService.createGeofence(data);
            const newGeofence = response.data?.data || response.data;
            this.geofences.push(newGeofence);
            return newGeofence;
        },

        async updateGeofence(uuid, data) {
            const response = await trackingService.updateGeofence(uuid, data);
            const updated = response.data?.data || response.data;
            const index = this.geofences.findIndex((g) => g.uuid === uuid);
            if (index !== -1) {
                this.geofences[index] = updated;
            }
            return updated;
        },

        async deleteGeofence(uuid) {
            await trackingService.deleteGeofence(uuid);
            this.geofences = this.geofences.filter((g) => g.uuid !== uuid);
        },

        async fetchAlerts(params = {}) {
            try {
                const response = await trackingService.getAlerts(params);
                this.alerts = response.data?.data || [];
            } catch (err) {
                this.error = err.message;
            }
        },

        async markAlertRead(uuid) {
            await trackingService.markAlertRead(uuid);
            const alert = this.alerts.find((a) => a.uuid === uuid);
            if (alert) {
                alert.is_read = true;
            }
        },

        async sendMyLocation(data) {
            try {
                await trackingService.sendLocation(data);
            } catch (err) {
                console.error('Error sending location:', err);
            }
        },

        async startTracking(data) {
            try {
                const response = await trackingService.startSession(data);
                this.currentSession = response.data?.data || response.data;
                this.isTracking = true;
                return this.currentSession;
            } catch (err) {
                this.error = err.message;
                return null;
            }
        },

        async stopTracking() {
            if (this.currentSession) {
                try {
                    await trackingService.stopSession(this.currentSession.uuid);
                } catch (err) {
                    console.error('Error stopping session:', err);
                }
            }
            this.currentSession = null;
            this.isTracking = false;
        },

        selectDriver(driver) {
            this.selectedDriver = driver;
        },

        clearSelection() {
            this.selectedDriver = null;
            this.driverHistory = [];
            this.stats = null;
        },
    },
});
