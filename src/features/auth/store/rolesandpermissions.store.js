import { defineStore } from "pinia";
import { rolesAndPermissionsService } from "../services/rolesandpermissions.service.js";
import { logger } from "@utils/logger.js";

export const useRolesAndPermissionsStore = defineStore("rolesAndPermissions", {
    state: () => ({
        roles: [],
        allPermissions: [],
        loading: false,
        error: null,
    }),

    actions: {
        /**
         * Carga los roles y permisos reales desde el servidor a través del servicio.
         */
        async fetchRoles() {
            this.loading = true;
            this.error = null;
            try {
                const response = await rolesAndPermissionsService.getRolesList();
                if (response && response.success) {
                    this.roles = response.data;
                    logger.debug("rolesAndPermissionsStore: Roles y permisos cargados exitosamente del servidor");
                } else {
                    throw new Error(response?.message || "Error al obtener roles");
                }
            } catch (err) {
                logger.error("rolesAndPermissionsStore: Error al cargar roles", { error: err.message });
                this.error = err.message;
                throw err;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Carga el catálogo completo de permisos del sistema.
         */
        async fetchAllPermissions() {
            this.loading = true;
            this.error = null;
            try {
                const response = await rolesAndPermissionsService.getPermissionsList();
                if (response && response.success) {
                    this.allPermissions = response.data;
                    logger.debug("rolesAndPermissionsStore: Todos los permisos cargados exitosamente del servidor");
                } else {
                    throw new Error(response?.message || "Error al obtener permisos");
                }
            } catch (err) {
                logger.error("rolesAndPermissionsStore: Error al cargar catálogo de permisos", { error: err.message });
                this.error = err.message;
                throw err;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Solicita la creación de un nuevo rol con sus permisos iniciales.
         * @param {Object} roleData Datos validados del rol a crear (name, guard_name, permissions).
         */
        async createRole(roleData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await rolesAndPermissionsService.createRole(roleData);
                if (response && response.success) {
                    logger.info("rolesAndPermissionsStore: Rol creado con éxito en el servidor");
                    await this.fetchRoles();
                    return response.data;
                } else {
                    throw new Error(response?.message || "Error al crear rol");
                }
            } catch (err) {
                logger.error("rolesAndPermissionsStore: Error al crear rol", { error: err.message });
                this.error = err.message;
                throw err;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Actualiza el nombre y los permisos de un rol existente.
         * @param {number|string} id Identificador único del rol.
         * @param {Object} roleData Datos del rol (name, guard_name, permissions).
         */
        async updateRole(id, roleData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await rolesAndPermissionsService.updateRole(id, roleData);
                if (response && response.success) {
                    logger.info("rolesAndPermissionsStore: Rol actualizado con éxito en el servidor");
                    await this.fetchRoles();
                    return response.data;
                } else {
                    throw new Error(response?.message || "Error al actualizar rol");
                }
            } catch (err) {
                logger.error("rolesAndPermissionsStore: Error al actualizar rol", { error: err.message });
                this.error = err.message;
                throw err;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Elimina un rol existente de la base de datos.
         * @param {number|string} id Identificador único del rol.
         */
        async deleteRole(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await rolesAndPermissionsService.deleteRole(id);
                if (response && response.success) {
                    logger.info("rolesAndPermissionsStore: Rol eliminado con éxito en el servidor");
                    await this.fetchRoles();
                    return response.data;
                } else {
                    throw new Error(response?.message || "Error al eliminar rol");
                }
            } catch (err) {
                logger.error("rolesAndPermissionsStore: Error al eliminar rol", { error: err.message });
                this.error = err.message;
                throw err;
            } finally {
                this.loading = false;
            }
        }
    }
});
