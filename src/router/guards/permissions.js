import { usePermissionsStore } from "@store/modules/permissions.js";
import { useAuthStore } from "@store/modules/auth.js";

export async function permissionsGuard(to, from, next) {
    const { roles, permissions, any } = to.meta;
    if (!roles?.length && !permissions?.length) return next();

    const authStore = useAuthStore();
    const permStore = usePermissionsStore();

    if (!authStore.isAuthenticated || !authStore.accessToken) return next();
    if (!permStore.isLoaded) {
        try {
            await permStore.load();
        } catch {
            return next({ path: "/401", replace: true });
        }
    }

    // Administradores y Super Administradores tienen acceso global
    // (hasRole normaliza separadores: cubre super-admin, super_admin, SUPERADMIN, etc.)
    if (permStore.hasRole('superadmin') || permStore.hasRole('administrador')) {
        return next();
    }

    const check = (list, fn) => list.every(item => fn(item));
    const hasAccess = any
        ? roles?.some(r => permStore.hasRole(r)) || permissions?.some(p => permStore.can(p))
        : (roles ? check(roles, r => permStore.hasRole(r)) : true) &&
        (permissions ? check(permissions, p => permStore.can(p)) : true);

    hasAccess ? next() : next({ path: "/401", replace: true });
}