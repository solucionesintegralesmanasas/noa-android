import { BaseService } from '@services/api/base.service.js';

/**
 * Servicio para la gestión de terceros desde el módulo de mantenimiento.
 * Extiende BaseService para manejar peticiones HTTP estandarizadas.
 */
class MaintenanceService extends BaseService {
    constructor() {
        super({
            resourcePath: '/fleet-management/maintenances',
            metadata: { module: 'maintenance', service: 'maintenance' },
        });
    }

    /**
     * Obtiene el listado paginado de terceros.
     * @param {Object} params - Parámetros de búsqueda y paginación.
     * @returns {Promise<Object>} Respuesta con datos paginados.
     */
    list(params = {}) { return this._request('GET', '', { params }); }

    /**
     * Obtiene un tercero por su UUID.
     * @param {string} uuid - UUID del tercero.
     * @returns {Promise<Object>} Datos del tercero.
     */
    get(uuid) { return this._request('GET', `/${uuid}`); }

    /**
     * Crea un nuevo tercero.
     * @param {Object} data - Datos del tercero a crear.
     * @returns {Promise<Object>} Tercero creado.
     */
    create(data) { return this._request('POST', '', { data }); }

    /**
     * Actualiza un tercero existente.
     * @param {string} uuid - UUID del tercero.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<Object>} Tercero actualizado.
     */
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }

    /**
     * Elimina un tercero.
     * @param {string} uuid - UUID del tercero.
     * @returns {Promise<void>}
     */
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }

    /**
     * Obtiene las opciones para los selects del formulario (catálogos).
     * @returns {Promise<Object>} Objeto con los catálogos cargados.
     */
    async getFormOptions() {
        const fetchSafe = async (url) => {
            try {
                const res = await this._getInstance().get(url);
                return res.data?.data ?? res.data ?? [];
            } catch (err) {
                console.warn(`Error cargando catálogo: ${url}`, err.message);
                return [];
            }
        };

        const { companyUuid, thirdPartyUuid, isAfiliado } = this._getUserContext();

        // Base query parameters
        let companyQuery = `?company_uuid=${companyUuid || ''}&companyUuid=${companyUuid || ''}`;
        let vehicleQuery = `?company_uuid=${companyUuid || ''}&companyUuid=${companyUuid || ''}`;
        let thirdPartyQuery = `?company_uuid=${companyUuid || ''}&companyUuid=${companyUuid || ''}`;

        if (isAfiliado && thirdPartyUuid) {
            vehicleQuery += `&filter[third_party_uuid]=${thirdPartyUuid}&third_party_uuid=${thirdPartyUuid || ''}`;
            thirdPartyQuery += `&filter[third_party_uuid]=${thirdPartyUuid}&third_party_uuid=${thirdPartyUuid || ''}`;
        }

        const [companies, vehicles, thirdParties] = await Promise.all([
            fetchSafe('administration/companies/list' + companyQuery),
            fetchSafe('fleet-management/vehicles/list' + vehicleQuery),
            fetchSafe('third-parties/list' + thirdPartyQuery),
        ]);

        return {
            companies,
            vehicles,
            thirdParties,
        };
    }
}

export default new MaintenanceService();