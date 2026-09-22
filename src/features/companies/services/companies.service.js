import { BaseService } from '@/services/api/base.service.js';

class CompaniesService extends BaseService {
    constructor() {
        super({
            resourcePath: '/administration/companies',
            metadata: { module: 'business', service: 'companies' },
        });
    }

    list(params = {}) { return this._request('GET', '', { params }); }
    get(uuid) { return this._request('GET', `/${uuid}`); }
    create(data) { return this._request('POST', '', { data }); }
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }
    toggleStatus(uuid) { return this._request('PATCH', `/${uuid}/toggle-status`); }
    getProfile(uuid) { return this._request('GET', `/${uuid}/profile`); }

    createWithFiles(data) { return this._multipart('POST', '', this._toFormData(data)); }
    update(uuid, data) { return this._multipart('POST', `/${uuid}`, this._toFormData(data, { methodOverride: 'PUT' })); }

    // Upload de un solo archivo — patrón genérico
    _uploadFile(uuid, field, file) {
        const form = new FormData();
        form.append(field, file);
        return this._multipart('POST', `/${uuid}/${field}`, form);
    }

    uploadLogo(uuid, file) { return this._uploadFile(uuid, 'logo', file); }
    uploadSignature(uuid, file) { return this._uploadFile(uuid, 'signature', file); }

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

        const [documentTypes, municipalities, taxRegimes] = await Promise.all([
            fetchSafe('catalogs/type-of-documents/list'),
            fetchSafe('catalogs/cities/list'),
            fetchSafe('catalogs/tax-regimes/list'),
        ]);

        return { documentTypes, municipalities, taxRegimes };
    }
}

export default new CompaniesService();