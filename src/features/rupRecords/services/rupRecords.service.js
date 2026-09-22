import { BaseService } from '@services/api/base.service.js';

/**
 * Servicio para la gestión del Registro Único de Proponentes (RUP).
 * Extiende BaseService para manejar peticiones REST y subida de archivos.
 */
class RupRecordsService extends BaseService {
    constructor() {
        super({
            resourcePath: '/administration/rup',
            metadata: { module: 'rupRecords', service: 'rupRecords' },
        });
    }

    /**
     * Obtiene el listado paginado de registros RUP.
     * @param {Object} params - Parámetros de consulta (page, per_page, search).
     * @returns {Promise<Object>} Respuesta con datos paginados.
     */
    list(params = {}) { return this._request('GET', '', { params }); }

    /**
     * Obtiene un registro RUP específico por su UUID.
     * @param {string} uuid - UUID del registro.
     * @returns {Promise<Object>} Datos del registro.
     */
    get(uuid) { return this._request('GET', `/${uuid}`); }

    /**
     * Crea un nuevo registro RUP.
     * @param {Object} data - Datos del formulario.
     * @returns {Promise<Object>} Registro creado.
     */
    create(data) { return this._request('POST', '', { data }); }

    /**
     * Actualiza un registro RUP existente. Usa multipart/form-data debido a la posible subida de archivos.
     * @param {string} uuid - UUID del registro.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<Object>} Registro actualizado.
     */
    update(uuid, data) { 
        return this._multipart('POST', `/${uuid}`, this._toFormData(data, { methodOverride: 'PUT' })); 
    }

    /**
     * Elimina un registro RUP.
     * @param {string} uuid - UUID del registro.
     * @returns {Promise<void>}
     */
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }

    /**
     * Obtiene el perfil/detalle completo de un registro RUP.
     * @param {string} uuid - UUID del registro.
     * @returns {Promise<Object>} Datos del perfil.
     */
    getProfile(uuid) { return this.get(uuid); }

    /**
     * Sube o actualiza el archivo del certificado RUP.
     * @param {string} uuid - UUID del registro.
     * @param {string} field - Nombre del campo (ej: rup_certificate_path).
     * @param {File} file - Archivo a subir.
     * @returns {Promise<Object>} Resultado de la subida.
     */
    _uploadFile(uuid, field, file) {
        const form = new FormData();
        form.append(field, file);
        return this._multipart('POST', `/${uuid}/${field}`, form);
    }

    /**
     * Obtiene las opciones de los catálogos necesarios para los selects del formulario.
     * @returns {Promise<Object>} Objeto con las listas de opciones.
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

export default new RupRecordsService();