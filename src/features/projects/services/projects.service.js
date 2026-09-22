import { BaseService } from '@services/api/base.service.js';

/**
 * Servicio para la gestión de proyectos y sus asignaciones de conductores y vehículos.
 * @extends BaseService
 */
class ProjectsService extends BaseService {
    constructor() {
        super({
            resourcePath: '/projects',
            metadata: { module: 'projects', service: 'projects' },
        });
    }

    /**
     * Obtiene el listado paginado de proyectos.
     * @param {Object} params - Parámetros de consulta (page, per_page, search, third_party_uuid).
     * @returns {Promise<Object>} Respuesta con datos paginados.
     */
    list(params = {}) { return this._request('GET', '', { params }); }

    /**
     * Obtiene el catálogo de proyectos.
     * @param {string} companyUuid - UUID de la empresa.
     * @returns {Promise<Object>} Respuesta con los proyectos.
     */
    getList(companyUuid = '') {
        const query = companyUuid ? `?company_uuid=${companyUuid}` : '';
        return this._getInstance()({ method: 'GET', url: `/projects/list${query}` });
    }

    /**
     * Obtiene un proyecto específico por su UUID.
     * @param {string} uuid - UUID del proyecto.
     * @returns {Promise<Object>} Datos del proyecto.
     */
    get(uuid) { return this._request('GET', `/${uuid}`); }

    /**
     * Crea un nuevo proyecto con sus conductores y vehículos.
     * Si incluye una orden de compra (archivo), se envía como multipart.
     * @param {Object} data - Datos del proyecto.
     * @returns {Promise<Object>} Proyecto creado.
     */
    create(data) {
        const hasFile = data?.purchase_order_file instanceof Blob;
        if (hasFile) {
            return this._multipart('POST', '', this._toFormData(data));
        }
        if (data?.purchase_order_file != null) delete data.purchase_order_file;
        return this._request('POST', '', { data });
    }

    /**
     * Actualiza un proyecto existente y sus asignaciones.
     * Si incluye una orden de compra (archivo) o la bandera de eliminación,
     * se envía como multipart (Laravel recibe el método real vía _method).
     * @param {string} uuid - UUID del proyecto.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<Object>} Proyecto actualizado.
     */
    update(uuid, data) {
        const hasFile = data?.purchase_order_file instanceof Blob;
        const removing = data?.remove_purchase_order !== undefined;
        if (hasFile || removing) {
            return this._multipart('PUT', `/${uuid}`, this._toFormData(data, { methodOverride: 'PUT' }));
        }
        if (data?.purchase_order_file != null) delete data.purchase_order_file;
        return this._request('PUT', `/${uuid}`, { data });
    }

    /**
     * Elimina un proyecto.
     * @param {string} uuid - UUID del proyecto.
     * @returns {Promise<void>}
     */
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }

    /**
     * Obtiene las opciones de formularios (catálogos de conductores y vehículos).
     * @returns {Promise<Object>} Objeto con los catálogos cargados.
     */
    async getFormOptions() {
        const { companyUuid } = this._getUserContext();
        const company = companyUuid || '';
        const companyParam = company ? `&company_uuid=${company}` : '';

        const fetchSafe = async (url) => {
            try {
                const res = await this._getInstance().get(url);
                return res.data?.data ?? res.data ?? [];
            } catch (err) {
                console.warn(`Error cargando catálogo: ${url}`, err.message);
                return [];
            }
        };

        const [drivers, vehicles] = await Promise.all([
            fetchSafe(`third-parties/list?type=is_driver${companyParam}`),
            fetchSafe(`fleet-management/vehicles/list?type=all${companyParam}`),
        ]);

        return { drivers, vehicles };
    }
}

export default new ProjectsService();