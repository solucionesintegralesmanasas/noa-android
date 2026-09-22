import { BaseService } from '@services/api/base.service.js';

class EconomicActivitiesService extends BaseService {
    constructor() {
        super({
            resourcePath: '/administration/economic-activities',
            metadata: {
                module: 'economicActivities',
                service: 'economicActivities'
            },
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

        const fetchExternal = async (url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (err) {
                console.warn(`Error cargando catálogo externo: ${url}`, err.message);
                return [];
            }
        };

        const [companies, economicActivities] = await Promise.all([
            fetchSafe('administration/companies/list'),
            fetchExternal('https://www.datos.gov.co/resource/Elquincaceres.json'),
        ]);

        return {
            companies,
            economicActivities
        };
    }
}

export default new EconomicActivitiesService();