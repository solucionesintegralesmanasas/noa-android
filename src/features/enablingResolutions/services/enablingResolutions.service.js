/**
 * @file enablingResolutions.service.js
 * @description Servicio API para el módulo de Resoluciones de Habilitación.
 * Extiende BaseService para operaciones CRUD estándar.
 * @module enablingResolutions/service
 */

import { BaseService } from '@services/api/base.service.js';

/**
 * Clase que gestiona las peticiones HTTP relacionadas con las Resoluciones de Habilitación.
 * Proporciona métodos CRUD y carga de catálogos (empresas).
 * @extends BaseService
 */
class EnablingResolutionsService extends BaseService {
    /**
     * Crea una instancia del servicio configurando el resourcePath y metadata.
     */
    constructor() {
        super({
            resourcePath: '/administration/enabling-resolutions',
            metadata: { module: 'enablingResolutions', service: 'enablingResolutions' },
        });
    }

    /**
     * Obtiene el listado paginado de resoluciones de habilitación.
     * @param {Object} params - Parámetros de consulta (page, per_page, search, filters).
     * @returns {Promise<Object>} Respuesta con datos paginados.
     */
    list(params = {}) {
        return this._request('GET', '', { params });
    }

    /**
     * Obtiene una resolución de habilitación por su UUID.
     * @param {string} uuid - UUID de la resolución.
     * @returns {Promise<Object>} Datos de la resolución.
     */
    get(uuid) {
        return this._request('GET', `/${uuid}`);
    }

    /**
     * Crea una nueva resolución de habilitación.
     * @param {Object} data - Datos del formulario.
     * @returns {Promise<Object>} Registro creado.
     */
    create(data) {
        return this._request('POST', '', { data });
    }

    /**
     * Actualiza una resolución de habilitación existente.
     * @param {string} uuid - UUID de la resolución.
     * @param {Object} data - Datos actualizados.
     * @returns {Promise<Object>} Registro actualizado.
     */
    update(uuid, data) {
        return this._request('PUT', `/${uuid}`, { data });
    }

    /**
     * Elimina una resolución de habilitación por su UUID.
     * @param {string} uuid - UUID de la resolución.
     * @returns {Promise<Object>} Resultado de la eliminación.
     */
    delete(uuid) {
        return this._request('DELETE', `/${uuid}`);
    }

    /**
     * Obtiene el perfil completo de una resolución de habilitación.
     * @param {string} uuid - UUID de la resolución.
     * @returns {Promise<Object>} Datos completos del perfil.
     */
    getProfile(uuid) {
        return this.get(uuid);
    }

    /**
     * Carga las opciones de los catálogos necesarios para el formulario.
     * Utiliza endpoints que terminan en "/list" para obtener listados completos
     * y evitar la estructura paginada.
     * @returns {Promise<Object>} Objeto con los catálogos cargados.
     * @property {Array<Object>} companies - Listado de empresas (uuid, business_name).
     */
    async getFormOptions() {
        /**
         * Realiza una petición segura a un endpoint de catálogo.
         * @param {string} url - URL del endpoint.
         * @returns {Promise<Array<Object>>} Arreglo de opciones o arreglo vacío en caso de error.
         */
        const fetchSafe = async (url) => {
            try {
                const res = await this._getInstance().get(url);
                return res.data?.data ?? res.data ?? [];
            } catch (err) {
                console.warn(`Error cargando catálogo: ${url}`, err.message);
                return [];
            }
        };

        const [companies] = await Promise.all([
            fetchSafe('administration/companies/list'),
        ]);

        return {
            companies,
        };
    }
}

export default new EnablingResolutionsService();