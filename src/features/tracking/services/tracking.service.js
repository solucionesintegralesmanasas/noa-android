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
    getActiveDrivers() {
        return this.client.get('/tracking/active-drivers');
    },
    getLastLocation(uuid) {
        return this.client.get(`/tracking/last-location/${uuid}`);
    },
    getDriverHistory(uuid, params) {
        return this.client.get(`/tracking/driver/${uuid}/history`, { params });
    },
    getDriverStats(uuid) {
        return this.client.get(`/tracking/driver/${uuid}/stats`);
    },
    saveRouteMapCapture(data) {
        return this.client.post('/control-sheets/service-delivery-control-sheets/route-map-capture', data);
    },

    // Geocercas
    getGeofences(params) {
        return this.client.get('/tracking/geofences', { params });
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
