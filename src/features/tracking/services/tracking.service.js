import apiClient from '@/services/api/client';

export default {
    get client() {
        return apiClient.global;
    },

    // Conductor
    sendLocation(data) {
        return this.client.post('/tracking/location', data);
    },
    startSession(data) {
        return this.client.post('/tracking/session/start', data);
    },
    stopSession(sessionUuid) {
        return this.client.post('/tracking/session/stop', { session_uuid: sessionUuid });
    },

    // Admin
    getActiveDrivers({ signal } = {}) {
        return this.client.get('/tracking/active-drivers', { signal });
    },
    getLastLocation(uuid) {
        return this.client.get(`/tracking/last-location/${uuid}`);
    },
    getDriverHistory(uuid, params) {
        return this.client.get(`/tracking/driver/${uuid}/history`, { params });
    },
    getDriverStats(uuid, params = {}) {
        return this.client.get(`/tracking/driver/${uuid}/stats`, { params });
    },
    saveRouteMapCapture(data) {
        return this.client.post('/control-sheets/service-delivery-control-sheets/route-map-capture', data);
    },

    // Geocercas
    getGeofences(params = {}, { signal } = {}) {
        return this.client.get('/tracking/geofences', { params, signal });
    },
    getGeofence(uuid) {
        return this.client.get(`/tracking/geofences/${uuid}`);
    },
    createGeofence(data) {
        return this.client.post('/tracking/geofences', data);
    },
    updateGeofence(uuid, data) {
        return this.client.put(`/tracking/geofences/${uuid}`, data);
    },
    deleteGeofence(uuid) {
        return this.client.delete(`/tracking/geofences/${uuid}`);
    },

    // Alertas
    getAlerts(params) {
        return this.client.get('/tracking/alerts', { params });
    },
    markAlertRead(uuid) {
        return this.client.patch(`/tracking/alerts/${uuid}/read`);
    },
};
