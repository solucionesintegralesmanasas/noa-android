import { BaseService } from '@services/api/base.service.js';

/**
 * Servicio para la gestión de terceros (clientes, proveedores, empleados).
 * @extends BaseService
 */
class ThirdPartiesService extends BaseService {
    constructor() {
        super({
            resourcePath: '/third-parties',
            metadata: { module: 'thirdParties', service: 'thirdParties' },
        });
    }

    /**
     * Obtiene el listado paginado de terceros.
     * @param {Object} params - Parámetros de consulta (page, per_page, search, type).
     * @returns {Promise<Object>} Respuesta con datos paginados.
     */
    list(params = {}) { return this._request('GET', '', { params }); }

    /**
     * Obtiene un tercero específico por su UUID.
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
     * Obtiene el perfil detallado de un tercero.
     * @param {string} uuid - UUID del tercero.
     * @returns {Promise<Object>} Perfil del tercero.
     */
    getProfile(uuid) { return this.get(uuid); }

    /**
     * Descarga la ficha técnica del tercero en formato PDF.
     * @param {string} uuid - UUID del tercero.
     * @param {string} companyUuid - UUID de la compañía (opcional).
     * @returns {Promise<void>}
     */
    async downloadTechnicalSheet(uuid, companyUuid = '') {
        const query = companyUuid ? `?company_uuid=${companyUuid}` : '';
        return this._downloadPdf(`/${uuid}/technical-sheet/pdf${query}`);
    }

    /**
     * Sube o actualiza la foto de perfil del tercero.
     * @param {string} uuid - UUID del tercero.
     * @param {File} file - Archivo de imagen.
     * @returns {Promise<Object>} Respuesta con la URL de la foto.
     */
    uploadPhoto(uuid, file) {
        const formData = new FormData();
        formData.append('photo', file);
        return this._getInstance()({
            method: 'POST',
            url: `/third-parties/${uuid}/photo`,
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }

    /**
     * Obtiene las opciones de formularios (catálogos).
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
        const { companyUuid } = this._getUserContext();

        const [companies, documentTypes, cities, taxResponsibilities, affiliate, roles] = await Promise.all([
            fetchSafe(`administration/companies/list?companyUuid=${companyUuid || ''}`),
            fetchSafe('catalogs/type-of-documents/list'),
            fetchSafe('catalogs/cities/list'),
            fetchSafe('catalogs/tax-responsibilities/list'),
            fetchSafe(`third-parties/list?type=is_affiliate&companyUuid=${companyUuid || ''}`),
            fetchSafe('auth/roles/list'),
        ]);

        return {
            companies,
            documentTypes,
            cities,
            taxResponsibilities,
            affiliate,
            roles,
        };
    }

    /**
     * Obtiene el historial de licencias de un conductor.
     * @param {string} thirdPartyUuid - UUID del conductor.
     * @returns {Promise<Object>} Respuesta con las licencias.
     */
    getDriverLicenses(thirdPartyUuid) {
        return this._getInstance()({ method: 'GET', url: `/fleet-management/driver-licenses/list?third_party_uuid=${thirdPartyUuid || ''}` });
    }

    /**
     * Crea una nueva licencia de conducción.
     * @param {Object} data - Datos de la licencia.
     * @returns {Promise<Object>}
     */
    createDriverLicense(data) {
        return this._getInstance()({ method: 'POST', url: `/fleet-management/driver-licenses`, data: { driver_license: data } });
    }

    /**
     * Actualiza una licencia de conducción existente.
     * @param {string} uuid - UUID de la licencia.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<Object>}
     */
    updateDriverLicense(uuid, data) {
        return this._getInstance()({
            method: 'PUT',
            url: `/fleet-management/driver-licenses/${uuid}`,
            data: { driver_license: data },
        });
    }

    /**
     * Obtiene el historial de aportes de seguridad social de un tercero.
     * @param {string} thirdPartyUuid - UUID del tercero (conductor o empleado).
     * @returns {Promise<Object>} Respuesta con los aportes.
     */
    getSocialSecurityContributions(thirdPartyUuid) {
        return this._getInstance()({
            method: 'GET',
            url: `/fleet-management/social-security-contributions/list?third_party_uuid=${thirdPartyUuid || ''}`,
        });
    }

    /**
     * Crea un nuevo aporte de seguridad social.
     * @param {Object} data - Datos del aporte.
     * @returns {Promise<Object>}
     */
    createSocialSecurityContribution(data) {
        return this._getInstance()({
            method: 'POST',
            url: `/fleet-management/social-security-contributions`,
            data,
        });
    }

    /**
     * Actualiza un aporte de seguridad social.
     * @param {string} uuid - UUID del aporte.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<Object>}
     */
    updateSocialSecurityContribution(uuid, data) {
        return this._getInstance()({
            method: 'PUT',
            url: `/fleet-management/social-security-contributions/${uuid}`,
            data,
        });
    }
}

export default new ThirdPartiesService();