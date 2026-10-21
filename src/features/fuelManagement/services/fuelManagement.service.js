import { BaseService } from '@services/api/base.service.js';

/**
 * Servicio para la gestión de Control de Combustible, Kilometraje y Saldos.
 * Extiende BaseService para manejar peticiones HTTP estandarizadas.
 *
 * Recurso API: /fleet-management/fuel-logs
 * Permisos:    fuel_logs.index | .create | .update | .delete
 */
class FuelManagementService extends BaseService {
    constructor() {
        super({
            resourcePath: '/fleet-management/fuel-logs',
            metadata: { module: 'fuelManagement', service: 'fuel_logs' },
        });
    }

    /**
     * Listado paginado de registros de combustible.
     * @param {Object} params - Búsqueda y paginación.
     * @returns {Promise<Object>} Respuesta paginada.
     */
    list(params = {}) { return this._request('GET', '', { params }); }

    /**
     * Detalle de un registro por UUID.
     * @param {string} uuid
     * @returns {Promise<Object>}
     */
    get(uuid) { return this._request('GET', `/${uuid}`); }

    /**
     * Estado por vehículo: km recorridos desde el último tanqueo, tope
     * estimado, km restantes y clasificación (OK, PRÓXIMO, EXCEDIDO, SIN DATOS).
     * @param {Object} params
     * @returns {Promise<Object>}
     */
    async getStatus(params = {}) {
        const response = await this._request('GET', '/status', { params: { limit: 500, ...params } });
        return response?.data?.data ?? response?.data ?? response;
    }

    /**
     * Crea un registro de combustible.
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    create(data) { return this._request('POST', '', { data }); }

    /**
     * Actualiza un registro por UUID.
     * @param {string} uuid
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }

    /**
     * Elimina un registro por UUID.
     * @param {string} uuid
     * @returns {Promise<void>}
     */
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }

    /**
     * Precarga el contexto de un vehículo para una fecha:
     *  - initial_odometer: kilometraje final del último registro anterior.
     *  - initial_balance: saldo de galones heredado (final_balance anterior).
     *  - average_performance: rendimiento promedio del vehículo (km/gal).
     *  - previous_date: fecha del registro anterior, si existe.
     *
     * @param {string} vehicleUuid
     * @param {string} [date] Fecha destino (YYYY-MM-DD).
     * @returns {Promise<Object>}
     */
    async getContext(vehicleUuid, date) {
        const params = { vehicle_uuid: vehicleUuid };
        if (date) params.date = date;
        const response = await this._request('GET', '/context', { params });
        return response?.data?.data ?? response?.data ?? response;
    }

    /**
     * Catálogos básicos para el formulario (vehículos y conductores/terceros).
     * Degrada a listas vacías si un catálogo falla.
     * @returns {Promise<Object>}
     */
    async getFormOptions() {
        const fetchSafe = async (url) => {
            try {
                const res = await this._getInstance().get(url);
                return res.data?.data ?? res.data ?? [];
            } catch (err) {
                return [];
            }
        };

        const { companyUuid, thirdPartyUuid, isAfiliado } = this._getUserContext();

        let vehicleQuery = `?company_uuid=${companyUuid || ''}&companyUuid=${companyUuid || ''}`;
        // Solo conductores en el selector de conductor.
        let thirdPartyQuery = `?company_uuid=${companyUuid || ''}&companyUuid=${companyUuid || ''}&type=is_driver`;

        if (isAfiliado && thirdPartyUuid) {
            vehicleQuery += `&third_party_uuid=${thirdPartyUuid}`;
            thirdPartyQuery += `&third_party_uuid=${thirdPartyUuid}`;
        }

        const [vehicles, thirdParties] = await Promise.all([
            fetchSafe('fleet-management/vehicles/list' + vehicleQuery),
            fetchSafe('third-parties/list' + thirdPartyQuery),
        ]);

        return { vehicles, thirdParties };
    }
}

export default new FuelManagementService();
