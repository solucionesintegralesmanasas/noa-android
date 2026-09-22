import { BaseService } from '@services/api/base.service.js';

/**
 * Servicio para la gestión de documentos de vehículos.
 * Extiende BaseService para manejar peticiones HTTP estandarizadas.
 */
class VehicleDocumentsService extends BaseService {
    constructor() {
        super({
            resourcePath: 'fleet-management/vehicle-documents',
            metadata: { module: 'vehicleDocuments', service: 'vehicleDocuments' },
        });
    }

    /**
     * Obtiene el listado paginado de documentos de vehículos.
     * @param {Object} params - Parámetros de búsqueda y paginación.
     * @returns {Promise<Object>} Respuesta con datos paginados.
     * {{BASE_URL}}/api/fleet/vehicle-documents?filter[company_uuid]=789e0123-e89b-12d3-a456-426614174000&filter[document_type]=SOAT&filter[third_party_uuid]=123e4567-e89b-12d3-a456-426614174000&search=ABC123&per_page=10&page=1
     */
    list(params = {}) {
        const { companyUuid, thirdPartyUuid, isAfiliado } = this._getUserContext();

        const perPage = params.per_page !== undefined ? params.per_page : 15;
        const page = params.page !== undefined ? params.page : 1;
        const search = params.search || '';
        const documentType = params.document_type || '';

        const cUuid = companyUuid || '';
        const tUuid = (isAfiliado && thirdPartyUuid) ? thirdPartyUuid : '';

        const route = `?per_page=${perPage}&page=${page}&search=${search}&company_uuid=${cUuid}&third_party_uuid=${tUuid}&document_type=${documentType}`;

        return this._request('GET', route);
    }

    /**
     * Obtiene un documento por su UUID.
     * @param {string} uuid - UUID del documento.
     * @returns {Promise<Object>} Datos del documento.
     */
    get(uuid) { return this._request('GET', `/${uuid}`); }

    /**
     * Obtiene todos los documentos (catálogo sin paginación) de un vehículo.
     * @param {string} vehicleUuid - UUID del vehículo.
     * @returns {Promise<Object>} Lista de documentos del vehículo.
     */
    getByVehicle(vehicleUuid) {
        return this._request('GET', '/list', { params: { vehicle_uuid: vehicleUuid } });
    }

    /**
     * Crea un nuevo documento de vehículo.
     * @param {Object} data - Datos del documento a crear.
     * @returns {Promise<Object>} Documento creado.
     */
    create(data) { return this._request('POST', '', { data }); }

    /**
     * Actualiza un documento existente.
     * @param {string} uuid - UUID del documento.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<Object>} Documento actualizado.
     */
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }

    /**
     * Elimina un documento.
     * @param {string} uuid - UUID del documento.
     * @returns {Promise<void>}
     */
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }

    /**
     * Obtiene el perfil detallado de un documento.
     * @param {string} uuid - UUID del documento.
     * @returns {Promise<Object>} Perfil del documento.
     */
    getProfile(uuid) { return this.get(uuid); }

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

        // Si es afiliado, agregamos el filtro manualmente a las URLs
        if (isAfiliado && thirdPartyUuid) {
            // Nota: Cambia 'third_party_uuid' por la columna que realmente relaciona al vehículo
            // con el afiliado en tu base de datos (ej. 'owner_uuid', 'propietario_id', etc.)
            vehicleQuery += `&filter[third_party_uuid]=${thirdPartyUuid}&third_party_uuid=${thirdPartyUuid || ''}`;
        }

        const [companies, vehicles] = await Promise.all([
            fetchSafe('administration/companies/list' + companyQuery),
            fetchSafe('fleet-management/vehicles/list' + vehicleQuery)
        ]);

        return { companies, vehicles };
    }
}

export default new VehicleDocumentsService();