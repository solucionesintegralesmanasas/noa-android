import { BaseService } from '@services/api/base.service.js';

/**
 * Servicio para la gestión de tarjetas de operación.
 * Extiende BaseService para manejar peticiones HTTP estandarizadas.
 */
class OperationCardsService extends BaseService {
    constructor() {
        super({
            resourcePath: 'fleet-management/operation-cards',
            metadata: { module: 'operationCards', service: 'operationCards' },
        });
    }

    /**
     * Obtiene el listado paginado de tarjetas de operación.
     * @param {Object} params - Parámetros de búsqueda y paginación.
     * @returns {Promise<Object>} Respuesta con datos paginados.
     */
    list(params = {}) { return this._request('GET', '', { params }); }

    /**
     * Obtiene una tarjeta por su UUID.
     * @param {string} uuid - UUID de la tarjeta.
     * @returns {Promise<Object>} Datos de la tarjeta.
     */
    get(uuid) { return this._request('GET', `/${uuid}`); }

    /**
     * Crea una nueva tarjeta de operación.
     * @param {Object} data - Datos de la tarjeta a crear.
     * @returns {Promise<Object>} Tarjeta creada.
     */
    create(data) { return this._request('POST', '', { data }); }

    /**
     * Actualiza una tarjeta existente.
     * @param {string} uuid - UUID de la tarjeta.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<Object>} Tarjeta actualizada.
     */
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }

    /**
     * Elimina una tarjeta.
     * @param {string} uuid - UUID de la tarjeta.
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

        if (isAfiliado && thirdPartyUuid) {
            vehicleQuery += `&filter[third_party_uuid]=${thirdPartyUuid}&third_party_uuid=${thirdPartyUuid || ''}`;
        }

        const [companies, vehicles] = await Promise.all([
            fetchSafe('administration/companies/list' + companyQuery),
            fetchSafe('fleet-management/vehicles/list' + vehicleQuery)
        ]);

        // Deduplica los vehículos por uuid/placa para evitar opciones repetidas en el desplegable
        const seenVehicles = new Set();
        const uniqueVehicles = (vehicles || []).filter((v) => {
            const key = v?.uuid ?? v?.vehicle_license_plate;
            if (!key || seenVehicles.has(key)) return false;
            seenVehicles.add(key);
            return true;
        });

        return { companies, vehicles: uniqueVehicles };
    }
}

export default new OperationCardsService();