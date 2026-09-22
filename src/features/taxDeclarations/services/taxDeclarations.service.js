/**
 * @fileoverview Servicio API para el módulo de Declaraciones de Renta.
 * @module services/taxDeclarationsService
 */

import { BaseService } from '@services/api/base.service.js';

/**
 * Servicio para gestionar las declaraciones de renta.
 * @class TaxDeclarationsService
 * @extends BaseService
 */
class TaxDeclarationsService extends BaseService {
    /**
     * Constructor del servicio.
     */
    constructor() {
        super({
            resourcePath: '/administration/tax-declarations',
            metadata: { module: 'taxDeclarations', service: 'TaxDeclarations' },
        });
    }

    /**
     * Obtiene el listado de declaraciones de renta.
     * @param {Object} params - Parámetros de consulta (paginación, búsqueda, etc.).
     * @returns {Promise} Promesa con la respuesta del servidor.
     */
    list(params = {}) { return this._request('GET', '', { params }); }

    /**
     * Obtiene una declaración de renta por su UUID.
     * @param {string} uuid - UUID de la declaración.
     * @returns {Promise} Promesa con la respuesta del servidor.
     */
    get(uuid) { return this._request('GET', `/${uuid}`); }

    /**
     * Crea una nueva declaración de renta.
     * @param {Object} data - Datos de la declaración.
     * @returns {Promise} Promesa con la respuesta del servidor.
     */
    create(data) { return this._request('POST', '', { data }); }

    /**
     * Actualiza una declaración de renta existente.
     * @param {string} uuid - UUID de la declaración.
     * @param {Object} data - Datos actualizados.
     * @returns {Promise} Promesa con la respuesta del servidor.
     */
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }

    /**
     * Elimina una declaración de renta.
     * @param {string} uuid - UUID de la declaración.
     * @returns {Promise} Promesa con la respuesta del servidor.
     */
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }

    /**
     * Obtiene el perfil de una declaración de renta.
     * @param {string} uuid - UUID de la declaración.
     * @returns {Promise} Promesa con la respuesta del servidor.
     */
    getProfile(uuid) { return this.get(uuid); }

    /**
     * Obtiene las opciones para los campos de catálogo (empresas).
     * @returns {Promise<Object>} Promesa con las opciones de catálogo.
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

        return {
            companies: await fetchSafe('administration/companies/list'),
        };
    }
}

export default new TaxDeclarationsService();