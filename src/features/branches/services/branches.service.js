import { BaseService } from '@services/api/base.service.js';

class BranchesService extends BaseService {
    constructor() {
        super({
            resourcePath: '/administration/branches',
            metadata: { module: 'branches', service: 'branches' },
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

        const [companies, municipalities] = await Promise.all([
            fetchSafe('administration/companies/list'),
            fetchSafe('catalogs/cities/list'),
        ]);

        return {
            companies,
            municipalities,
        };
    }
}

export default new BranchesService();