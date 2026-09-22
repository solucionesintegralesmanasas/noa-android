import { BaseService } from '@services/api/base.service.js';

/**
 * Servicio para la gestión de convenios de colaboración empresarial.
 * Extiende BaseService para manejar peticiones HTTP estandarizadas.
 */
class BusinessCollaborationAgreementsService extends BaseService {
    constructor() {
        super({
            resourcePath: 'fleet-management/business-collaboration-agreements',
            metadata: { module: 'businessCollaborationAgreements', service: 'businessCollaborationAgreements' },
        });
    }

    /**
     * Obtiene el listado paginado de convenios.
     * @param {Object} params - Parámetros de búsqueda y paginación.
     * @returns {Promise<Object>} Respuesta con datos paginados.
     */
    list(params = {}) { return this._request('GET', '', { params }); }

    /**
     * Obtiene el siguiente ID interno consecutivo para el acuerdo (4 dígitos).
     * @param {string} [companyUuid] - UUID de la empresa opcional.
     * @returns {Promise<Object>}
     */
    getNextConsecutive(companyUuid) {
        const query = companyUuid ? `?company_uuid=${companyUuid}` : '';
        return this._request('GET', `/next-consecutive${query}`);
    }

    /**
     * Obtiene un convenio por su UUID.
     * @param {string} uuid - UUID del convenio.
     * @returns {Promise<Object>} Datos del convenio.
     */
    get(uuid) { return this._request('GET', `/${uuid}`); }

    /**
     * Crea un nuevo convenio.
     * @param {Object} data - Datos del convenio a crear.
     * @returns {Promise<Object>} Convenio creado.
     */
    create(data) { return this._request('POST', '', { data }); }

    /**
     * Actualiza un convenio existente.
     * @param {string} uuid - UUID del convenio.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<Object>} Convenio actualizado.
     */
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }

    /**
     * Elimina un convenio.
     * @param {string} uuid - UUID del convenio.
     * @returns {Promise<void>}
     */
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }

    /**
     * Descarga el PDF del convenio de colaboración.
     * @param {string} uuid - UUID del convenio.
     */
    downloadPdf(uuid) {
        return this._downloadPdf(`/${uuid}/pdf`);
    }

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

        return { companies, vehicles };
    }
}

export default new BusinessCollaborationAgreementsService();