import apiClient from "@services/api/client.js";
import { logger } from "@utils/logger.js";

export const rolesAndPermissionsService = {
    /**
     * Obtiene el listado completo de todos los roles con sus permisos asociados.
     * @returns {Promise<Object>} Respuesta estructurada del backend.
     */
    async getRolesList() {
        logger.debug("rolesAndPermissionsService: Obteniendo listado de roles con sus permisos");
        const response = await apiClient.global.get("/auth/roles/list");
        return response.data;
    },

    /**
     * Obtiene el catálogo completo de todos los permisos registrados en el sistema.
     * @returns {Promise<Object>} Respuesta estructurada del backend.
     */
    async getPermissionsList() {
        logger.debug("rolesAndPermissionsService: Obteniendo catálogo completo de todos los permisos");
        const response = await apiClient.global.get("/auth/permissions/list");
        return response.data;
    },

    /**
     * Crea un nuevo rol en el servidor.
     * @param {Object} data Objeto con name, guard_name y permissions.
     * @returns {Promise<Object>} Respuesta estructurada del backend.
     */
    async createRole(data) {
        logger.info("rolesAndPermissionsService: Solicitando creación de rol", { name: data.name });
        const response = await apiClient.global.post("/auth/roles", data);
        return response.data;
    },

    /**
     * Actualiza un rol existente con su nombre y permisos asignados.
     * @param {number|string} id Identificador único del rol en la base de datos.
     * @param {Object} data Objeto con name, guard_name y permissions.
     * @returns {Promise<Object>} Respuesta estructurada del backend.
     */
    async updateRole(id, data) {
        logger.info("rolesAndPermissionsService: Solicitando actualización de rol", { id, name: data.name });
        const response = await apiClient.global.put(`/auth/roles/${id}`, data);
        return response.data;
    },

    /**
     * Elimina un rol por su ID numérico.
     * @param {number|string} id Identificador único del rol.
     * @returns {Promise<Object>} Respuesta estructurada del backend.
     */
    async deleteRole(id) {
        logger.info("rolesAndPermissionsService: Solicitando eliminación de rol", { id });
        const response = await apiClient.global.delete(`/auth/roles/${id}`);
        return response.data;
    }
};

export default rolesAndPermissionsService;
