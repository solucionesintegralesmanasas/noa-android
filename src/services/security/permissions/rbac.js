// Sistema de control de acceso basado en roles (RBAC)
export const rbac = {
    user: null,
    setUser(user) {
        this.user = user;
    },
    clearUser() {
        this.user = null;
    },
    hasRole(role) {
        return this.user?.roles?.includes(role) || false;
    },
    can(action, target) {
        // Implementar lógica detallada de permisos
        return this.user?.permissions?.includes(`${action}_${target}`) || false;
    }
};
