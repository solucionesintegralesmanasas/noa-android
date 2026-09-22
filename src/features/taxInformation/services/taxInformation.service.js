import { BaseService } from '@services/api/base.service.js';

class TaxInformationService extends BaseService {
    constructor() {
        super({
            resourcePath: '/administration/tax-informations',
            metadata: { module: 'taxInformation', service: 'taxInformation' },
        });
    }

    list(params = {}) { return this._request('GET', '', { params }); }
    get(uuid) { return this._request('GET', `/${uuid}`); }
    create(data) { return this._request('POST', '', { data }); }
    update(uuid, data) { return this._multipart('POST', `/${uuid}`, this._toFormData(data, { methodOverride: 'PUT' })); }
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }
    getProfile(uuid) { return this.get(uuid); }

    // Uploads — Estados Financieros
    _uploadFinancialStatements(uuid, file) {
        const form = new FormData();
        form.append('financial_statements_path', file);
        return this._multipart('POST', `/${uuid}/financial-statements`, form);
    }

    // Uploads — Certificado de Tamaño Empresarial
    _uploadCompanySizeCertificate(uuid, file) {
        const form = new FormData();
        form.append('company_size_certificate_path', file);
        return this._multipart('POST', `/${uuid}/company-size-certificate`, form);
    }

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

        const [companies] = await Promise.all([
            fetchSafe('administration/companies/list'),
        ]);

        return {
            companies,
        };
    }
}

export default new TaxInformationService();