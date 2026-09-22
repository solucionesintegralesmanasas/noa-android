/** @author Darwin Montes @version 1.0.0 @created_at 2026-06-13 @module {systemConfiguration} @resource {systemConfiguration} */
import { BaseService } from '@services/api/base.service.js';

class SystemConfigurationService extends BaseService {
    constructor() {
        super({
            resourcePath: 'settings/system-configurations',
            metadata: { module: 'settings', service: 'systemConfiguration' },
        });
    }

    list(params = {}) {
        return this._request('GET', '', { params });
    }

    get(uuid) {
        return this._request('GET', `/${uuid}`);
    }

    getByCompany(companyUuid) {
        return this._request('GET', `/company/${companyUuid}`);
    }

    create(data) {
        return this._request('POST', '', { data });
    }

    update(uuid, data) {
        return this._request('PUT', `/${uuid}`, { data });
    }

    delete(uuid) {
        return this._request('DELETE', `/${uuid}`);
    }

    // ============================================================================
    // MÉTODOS DE SUBIDA DE IMÁGENES
    // ============================================================================

    uploadMinistryLogo(uuid, file) {
        const form = new FormData();
        form.append('ministry_logo', file);
        return this._multipart('POST', `/${uuid}/ministry-logo`, form);
    }

    uploadSuperLogo(uuid, file) {
        const form = new FormData();
        form.append('super_logo', file);
        return this._multipart('POST', `/${uuid}/super-logo`, form);
    }

    uploadLetterhead(uuid, file) {
        const form = new FormData();
        form.append('letterhead', file);
        return this._multipart('POST', `/${uuid}/letterhead`, form);
    }
}

export default new SystemConfigurationService();
