import { BaseService } from '@services/api/base.service.js';

/**
 * Servicio para la gestión de Cargos Administrativos de Afiliados.
 * Extiende BaseService para manejar peticiones RESTful estándar.
 */
class AffiliateAdminChargesService extends BaseService {
    constructor() {
        super({
            resourcePath: '/fleet-management/affiliate-admin-charges',
            metadata: { module: 'affiliateAdminCharges', service: 'affiliateAdminCharges' },
        });
    }

    /**
     * Obtiene el listado paginado de cargos.
     * @param {Object} params - Parámetros de consulta (page, per_page, search).
     * @returns {Promise<Object>} Respuesta con datos paginados.
     */
    list(params = {}) { return this._request('GET', '', { params }); }

    /**
     * Obtiene un cargo específico por su UUID.
     * @param {string} uuid - UUID del cargo.
     * @returns {Promise<Object>} Datos del cargo.
     */
    get(uuid) { return this._request('GET', `/${uuid}`); }

    /**
     * Crea un nuevo cargo administrativo.
     * @param {Object} data - Datos del formulario.
     * @returns {Promise<Object>} Registro creado.
     */
    create(data) { return this._request('POST', '', { data }); }

    /**
     * Actualiza un cargo existente.
     * @param {string} uuid - UUID del cargo.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<Object>} Registro actualizado.
     */
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }

    /**
     * Elimina lógicamente un cargo.
     * @param {string} uuid - UUID del cargo.
     * @returns {Promise<void>}
     */
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }

    /**
     * Aplica el pago de mensualidad y auto-genera el próximo mes (Backend).
     * @param {string} uuid - UUID del cargo.
     * @param {Object} data - Datos del pago (payment_date, bank_reference, notes).
     * @returns {Promise<Object>} Registro actualizado.
     */
    applyMonthlyPayment(uuid, data) { return this._request('POST', `/${uuid}/apply-monthly-payment`, { data }); }

    /**
     * Obtiene el resumen consolidado de cargos.
     */
    getSummary(params = {}) { return this._request('GET', '/summary', { params }); }

    /**
     * Obtiene el historial de cobros por su referencia de pago.
     */
    getPaymentHistory(paymentReference) { return this._request('GET', `/history/${paymentReference}`); }

    /**
     * Obtiene el cobro pendiente más antiguo de una referencia.
     */
    getPendingCharge(paymentReference) { return this._request('GET', `/pending/${paymentReference}`); }

    /**
     * Obtiene los cobros asociados a un vehículo.
     */
    getByVehicle(vehicleUuid) { return this._request('GET', `/vehicle/${vehicleUuid}`); }

    /**
     * Obtiene la fecha de próximo vencimiento de un vehículo.
     */
    getNextDueDate(vehicleUuid) { return this._request('GET', `/vehicle/${vehicleUuid}/next-due`); }

    /**
     * Actualiza el estado o información de un cargo directamente.
     */
    updateStatus(uuid, data) { return this._request('PATCH', `/${uuid}/update-status`, { data }); }

    /**
     * Alias para obtener el perfil/detalle completo.
     * @param {string} uuid - UUID del cargo.
     * @returns {Promise<Object>}
     */
    getProfile(uuid) { return this.get(uuid); }

    /**
     * Descarga el recibo de pago en formato PDF y lo abre en una nueva pestaña.
     */
    async downloadReceipt(uuid) {
        return this._downloadPdf(`/${uuid}/receipt-pdf`);
    }

    /**
     * Obtiene las opciones de los catálogos relacionados (Empresas y Vehículos).
     * Utiliza fetchSafe para evitar errores si algún catálogo falla.
     * @returns {Promise<Object>} Objeto con arrays de empresas y vehículos.
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

        const [companies, vehicles] = await Promise.all([
            fetchSafe('administration/companies/list'),
            fetchSafe('fleet-management/vehicles/list')
        ]);

        return { companies, vehicles };
    }
}

export default new AffiliateAdminChargesService();