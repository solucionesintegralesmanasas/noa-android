import { BaseService } from '@services/api/base.service.js';

/**
 * Solicitudes de tanqueo del conductor.
 * Recurso API: /fleet-management/fuel-requests
 */
class FuelRequestsService extends BaseService {
    constructor() {
        super({
            resourcePath: '/fleet-management/fuel-requests',
            metadata: { module: 'fuelRequests', service: 'fuel_requests' },
        });
    }

    list(params = {}) { return this._request('GET', '', { params }); }
    get(uuid) { return this._request('GET', `/${uuid}`); }
    create(data) { return this._request('POST', '', { data }); }
    approve(uuid) { return this._request('POST', `/${uuid}/approve`); }
    reject(uuid, data = {}) { return this._request('POST', `/${uuid}/reject`, { data }); }
    cancel(uuid) { return this._request('POST', `/${uuid}/cancel`); }
    qr(uuid) { return this._request('GET', `/${uuid}/qr`); }

    async getVehiculos() {
        try {
            const response = await this._getInstance().get('fleet-management/vehicles/list');
            return response.data?.data ?? response.data ?? [];
        } catch {
            return [];
        }
    }
}

export default new FuelRequestsService();
