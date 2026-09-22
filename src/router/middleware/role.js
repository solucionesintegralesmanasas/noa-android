import { usePermissionsStore } from "@store/modules/permissions.js";
import { logger } from "@utils/logger.js";

export function createRoleMiddleware(roles, any = false) {
    return async ({ to, from, next }) => {
        const store = usePermissionsStore();
        const roleList = Array.isArray(roles) ? roles : [roles];

        if (!store.isLoaded) await store.load();

        const hasAccess = any
            ? roleList.some(r => store.hasRole(r))
            : roleList.every(r => store.hasRole(r));

        if (hasAccess) {
            next();
        } else {
            logger.warn("Role check failed", { required: roles });
            next({ path: "/403" });
        }
    };
}