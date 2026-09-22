import { BaseService } from '@services/api/base.service.js';

class BankDetailsService extends BaseService {
    constructor() {
        super({
            resourcePath: '/administration/bank-details',
            metadata: { module: 'bankDetails', service: 'bankDetails' },
        });
    }

    list(params = {}) { return this._request('GET', '', { params }); }
    get(uuid) { return this._request('GET', `/${uuid}`); }
    create(data) { return this._request('POST', '', { data }); }
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }
    getProfile(uuid) { return this.get(uuid); }

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

export default new BankDetailsService();