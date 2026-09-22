import { BaseService } from '@services/api/base.service.js';
import { logger } from '@utils/logger.js';
import { useAuthStore } from '@store/modules/auth.js';

/**
 * Servicio para la gestión de FUEC (Formulario Único Electrónico de Carga).
 * Extiende BaseService para manejar peticiones REST estándar.
 */
class FuecService extends BaseService {
    constructor() {
        super({
            resourcePath: 'contract-extract/fuecs',
            metadata: { module: 'fuec', service: 'fuec' },
        });
    }

    /**
     * Obtiene el listado paginado de FUECs.
     * @param {Object} params - Parámetros de consulta (page, per_page, search).
     * @returns {Promise<Object>} Respuesta con datos paginados.
     */
    list(params = {}) { return this._request('GET', '', { params }); }

    /**
     * Obtiene un FUEC específico por su UUID.
     * @param {string} uuid - UUID del FUEC.
     * @returns {Promise<Object>} Datos del FUEC.
     */
    get(uuid) { return this._request('GET', `/${uuid}`); }

    /**
     * Crea un nuevo FUEC.
     * @param {Object} data - Datos del formulario.
     * @returns {Promise<Object>} Registro creado.
     */
    create(data) { return this._request('POST', '', { data }); }

    /**
     * Actualiza un FUEC existente.
     * @param {string} uuid - UUID del FUEC.
     * @param {Object} data - Datos a actualizar.
     * @returns {Promise<Object>} Registro actualizado.
     */
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }

    /**
     * Elimina un FUEC.
     * @param {string} uuid - UUID del FUEC.
     * @returns {Promise<void>}
     */
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }

    /**
     * Obtiene el perfil/detalle completo de un FUEC.
     * @param {string} uuid - UUID del FUEC.
     * @returns {Promise<Object>} Detalle del FUEC.
     */
    getProfile(uuid) { return this.get(uuid); }

    /**
     * Obtiene el próximo consecutivo del contrato para una empresa.
     * @param {string} companyUuid - UUID de la empresa.
     * @param {number|null} [year] - Año opcional.
     * @returns {Promise<Object>} Próximo consecutivo.
     */
    async getNextContractConsecutive(companyUuid, year = null) {
        const params = { company_uuid: companyUuid };
        if (year) params.year = year;
        const res = await this._request('GET', '/../contractors/next-consecutive', { params });
        return res?.data ?? res;
    }

    /**
     * Asigna un vehículo a un contrato y genera la estructura completa del FUEC (23 dígitos).
     * @param {string} contractUuid - UUID del contrato (modelo Contractor).
     * @returns {Promise<Object>} Estructura del FUEC generado y metadatos.
     */
    async assignVehicleToContract(contractUuid) {
        const res = await this._request('POST', `/${contractUuid}/assign-vehicle`);
        return res?.data ?? res;
    }

    /**
     * Obtiene el listado de contratistas asociados a un vehículo.
     * @param {string} vehicleUuid - UUID del vehículo.
     * @returns {Promise<Array>} Lista de contratistas.
     */
    async getContractorsByVehicle(vehicleUuid) {
        const authStore = useAuthStore();
        const companyUuid = authStore.currentTenant?.id;
        const params = {
            vehicle_uuid: vehicleUuid,
            per_page: 10
        };
        if (companyUuid) params.company_uuid = companyUuid;
        const res = await this._request('GET', '/../contractors', { params });
        return res?.data?.data ?? res?.data ?? [];
    }

    /**
     * Obtiene las opciones de los catálogos necesarios para los selects del formulario.
     * Normaliza a arreglos y garantiza etiquetas no nulas: PrimeVue Select
     * revienta con "Cannot read properties of null (reading 'length')" cuando
     * la opción seleccionada tiene su campo de etiqueta en null.
     * @returns {Promise<Object>} Objeto con arrays de opciones por catálogo.
     */
    async getFormOptions() {
        const authStore = useAuthStore();
        const { companyUuid: ctxCompanyUuid, thirdPartyUuid, isAfiliado } = this._getUserContext();

        const toArray = (value) => {
            if (Array.isArray(value)) return value;
            if (value && Array.isArray(value.data)) return value.data;
            if (value && typeof value === 'object') {
                if (value.uuid || value.id) return [value];
                return [];
            }
            return [];
        };

        // Garantiza que el campo de etiqueta nunca sea null/undefined.
        const withLabel = (items, labelField, fallbacks = []) =>
            toArray(items).map((item) => {
                if (!item || typeof item !== 'object') return item;
                let label = item[labelField];
                for (const fb of fallbacks) {
                    if (label !== null && label !== undefined && String(label).trim() !== '') break;
                    label = typeof fb === 'function' ? fb(item) : item[fb];
                }
                if (label === null || label === undefined || String(label).trim() === '') {
                    label = 'Sin nombre';
                }
                if (item[labelField] !== label) {
                    return { ...item, [labelField]: String(label) };
                }
                return item;
            });

        const fetchSafe = async (url, params = {}) => {
            try {
                const res = await this._getInstance().get(url, { params });
                return toArray(res.data?.data ?? res.data ?? []);
            } catch (err) {
                logger.warn(`Error cargando catálogo: ${url}`, err.message);
                return [];
            }
        };

        const companiesRaw = await fetchSafe('administration/companies/list');
        const companies = withLabel(companiesRaw, 'business_name', ['company_name', 'name']);

        let companyUuid = ctxCompanyUuid || authStore.currentTenant?.id;

        // Fallback to the first company UUID if currentTenant is not set (e.g. for super admin)
        if (!companyUuid && companies && companies.length > 0) {
            companyUuid = companies[0].uuid;
        }

        const vehicleParams = {};
        if (companyUuid) vehicleParams.company_uuid = companyUuid;
        if (isAfiliado && thirdPartyUuid) vehicleParams.third_party_uuid = thirdPartyUuid;

        const driverParams = { type: 'is_driver' };
        if (companyUuid) driverParams.company_uuid = companyUuid;

        const [vehicles, drivers, objectsContracts, documentTypes, nextContractNumber] = await Promise.all([
            fetchSafe('fleet-management/vehicles/list', vehicleParams),
            fetchSafe('third-parties/list', driverParams),
            fetchSafe('contract-extract/objects-contracts/list'),
            fetchSafe('catalogs/type-of-documents/list'),
            companyUuid ? this.getNextContractConsecutive(companyUuid).catch(() => null) : Promise.resolve(null)
        ]);

        return {
            companies,
            vehicles: withLabel(vehicles, 'vehicle_license_plate', ['license_plate', 'plate']),
            drivers: withLabel(drivers, 'first_name', ['company_name', 'document_number']),
            objectsContracts: withLabel(objectsContracts, 'name', ['description']),
            documentTypes: withLabel(documentTypes, 'name', ['description', 'prefix']),
            nextContractNumber
        };
    }

    /**
     * Obtiene una vista previa del número FUEC de 23 dígitos.
     * @param {string} companyUuid - UUID de la empresa
     * @param {string|null} contractorUuid - UUID del contratista (opcional)
     * @param {string|null} contractNumber - Número de contrato (opcional)
     * @returns {Promise<string>} Vista previa del número FUEC
     */
    async getPreviewFuecNumber(companyUuid, contractorUuid = null, contractNumber = null) {
        const params = { company_uuid: companyUuid };
        if (contractorUuid) params.contractor_uuid = contractorUuid;
        if (contractNumber) params.contract_number = contractNumber;
        const res = await this._getInstance()({
            method: 'GET',
            url: '/contract-extract/fuecs/preview-number',
            params
        });
        return res.data?.data?.preview_number ?? '';
    }

    /**
     * Obtiene el detalle de un vehículo por su UUID.
     * @param {string} uuid - UUID del vehículo.
     * @returns {Promise<Object>} Datos del vehículo con relaciones.
     */
    async getVehicle(uuid) {
        const res = await this._getInstance()({
            method: 'GET',
            url: `/fleet-management/vehicles/${uuid}`
        });
        return res.data?.data ?? res.data ?? res;
    }

    /**
     * Obtiene las licencias de conducción de un conductor.
     * @param {string} driverUuid - UUID del conductor.
     * @returns {Promise<Array>} Lista de licencias.
     */
    async getDriverLicenses(driverUuid) {
        const res = await this._getInstance()({
            method: 'GET',
            url: '/fleet-management/driver-licenses/list',
            params: { third_party_uuid: driverUuid }
        });
        return res.data?.data ?? res.data ?? res ?? [];
    }

    /**
     * Obtiene los cobros de administración por vehículo.
     * @param {string} vehicleUuid - UUID del vehículo.
     * @returns {Promise<Array>} Lista de cobros.
     */
    async getVehicleAdminCharges(vehicleUuid) {
        const res = await this._getInstance()({
            method: 'GET',
            url: `/fleet-management/affiliate-admin-charges/vehicle/${vehicleUuid}`
        });
        return res.data?.data ?? res.data ?? res ?? [];
    }

    /**
     * Obtiene el PDF generado por el servidor.
     * @param {string} uuid - UUID del FUEC.
     */
    async downloadPdf(uuid) {
        return this._downloadPdf(`/${uuid}/pdf`);
    }

    /**
     * Obtiene el Blob del PDF generado por el servidor (útil para iframes).
     * @param {string} uuid - UUID del FUEC.
     * @returns {Promise<Blob>} Archivo PDF binario.
     */
    async getRawPdf(uuid) {
        return this._request('GET', `/${uuid}/pdf`, {
            config: { responseType: 'blob' }
        });
    }

    /**
     * Valida la autenticidad de un FUEC por su ID o código (Público).
     * @param {string} id - UUID o código del FUEC.
     * @returns {Promise<Object>} Datos del FUEC.
     */
    async validate(id) {
        try {
            const res = await this._getInstance()({
                method: 'GET',
                url: `/public/fuecs/${id}`
            });
            return res;
        } catch (error) {
            logger.warn('Endpoint público no encontrado o fallido. Intentando endpoint privado...', error?.message);
            return this._getInstance()({
                method: 'GET',
                url: `/contract-extract/fuecs/${id}`
            });
        }
    }

    /**
     * Genera y descarga el PDF de un FUEC con opciones adicionales.
     * @param {string} uuid - UUID del FUEC.
     * @param {Object} options - Opciones de generación (e.g. includeVerificationQR).
     */
    async generatePDF(uuid, options = {}) {
        const queryParams = new URLSearchParams(options).toString();
        const queryStr = queryParams ? `?${queryParams}` : '';
        return this._downloadPdf(`/${uuid}/pdf${queryStr}`);
    }
}

export default new FuecService();