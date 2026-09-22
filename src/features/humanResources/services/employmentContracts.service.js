import { BaseService } from '@services/api/base.service.js';

class EmploymentContractsService extends BaseService {
    constructor() {
        super({
            resourcePath: '/employment-contracts',
            metadata: { module: 'employmentContracts', service: 'employmentContracts' },
        });
    }

    list(params = {}) { return this._request('GET', '', { params }); }
    get(uuid) { return this._request('GET', `/${uuid}`); }
    create(data) { return this._request('POST', '', { data }); }
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }
    getProfile(uuid) { return this._request('GET', `/${uuid}/profile`); }

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

        const [thirdParties] = await Promise.all([
            fetchSafe('third-parties/list?is_employee=true'),
        ]);

        return {
            thirdParties,
        };
    }
}

export default new EmploymentContractsService();