import { BaseService } from '@services/api/base.service.js';

/**
 * Servicio para la gestión de estados financieros.
 * Extiende BaseService para operaciones CRUD y catálogos.
 */
class FinancialStatementsService extends BaseService {
    constructor() {
        super({
            resourcePath: '/administration/financial-statements',
            metadata: { module: 'financialStatements', service: 'financialStatements' },
        });
    }

    /**
     * Obtiene lista paginada de estados financieros.
     * @param {Object} params - Parámetros de paginación y filtros.
     * @returns {Promise}
     */
    list(params = {}) {
        return this._request('GET', '', { params });
    }

    /**
     * Obtiene un estado financiero por UUID.
     * @param {string} uuid
     * @returns {Promise}
     */
    get(uuid) {
        return this._request('GET', `/${uuid}`);
    }

    /**
     * Crea un nuevo estado financiero.
     * @param {Object} data
     * @returns {Promise}
     */
    create(data) {
        return this._request('POST', '', { data });
    }

    /**
     * Actualiza un estado financiero existente.
     * (No maneja archivos, se usa PUT normal)
     * @param {string} uuid
     * @param {Object} data
     * @returns {Promise}
     */
    update(uuid, data) {
        return this._request('PUT', `/${uuid}`, { data });
    }

    /**
     * Elimina un estado financiero.
     * @param {string} uuid
     * @returns {Promise}
     */
    delete(uuid) {
        return this._request('DELETE', `/${uuid}`);
    }

    /**
     * Obtiene el perfil completo (mismo que get).
     * @param {string} uuid
     * @returns {Promise}
     */
    getProfile(uuid) {
        return this.get(uuid);
    }

    /**
     * Carga los catálogos necesarios para el formulario.
     * @returns {Promise<Object>} Objeto con listas de opciones (empresas, etc.)
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

        const companies = await fetchSafe('administration/companies/list');

        return {
            companies: companies.map(c => ({ uuid: c.uuid, business_name: c.business_name })),
        };
    }
}

export default new FinancialStatementsService();