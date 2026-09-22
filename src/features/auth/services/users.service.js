import { BaseService } from '@services/api/base.service.js';

/**
 * Servicio para gestión de usuarios y sus roles RBAC.
 * Backend: App\Http\Controllers\Api\V1\Auth\UserController y ModelHasRole
 * @extends BaseService
 */
class UsersService extends BaseService {
    constructor() {
        super({
            resourcePath: '/auth/users',
            metadata: { module: 'auth', service: 'users' },
        });
    }

    list(params = {}) { return this._request('GET', '', { params }); }
    get(uuid) { return this._request('GET', `/${uuid}`); }
    create(data) { return this._request('POST', '', { data }); }
    update(uuid, data) { return this._request('PUT', `/${uuid}`, { data }); }
    delete(uuid) { return this._request('DELETE', `/${uuid}`); }

    /**
     * Sincroniza roles del usuario. Envía array completo deseado.
     * Permite quitar un rol enviando el array sin ese rol.
     * @param {string} uuid - UUID del usuario
     * @param {string[]} roles - Nombres de roles deseados (ej: ['ADMIN_EMPRESA','CONDUCTOR'])
     */
    async syncRoles(uuid, roles) {
        return this.update(uuid, { roles });
    }

    /**
     * Quita un rol específico del usuario.
     * @param {string} uuid - UUID del usuario
     * @param {string} roleToRemove - Nombre del rol a quitar
     * @param {string[]} currentRoles - Roles actuales del usuario
     */
    async removeRole(uuid, roleToRemove, currentRoles = []) {
        const nextRoles = currentRoles.filter(r => r !== roleToRemove);
        return this.syncRoles(uuid, nextRoles);
    }

    /**
     * Obtiene catálogo de roles disponibles
     */
    async getRolesCatalog() {
        const res = await this._getInstance().get('/auth/roles/list');
        return res.data?.data ?? res.data ?? [];
    }
}

export default new UsersService();
