import { defineStore } from "pinia";
import { authService } from "../services/auth.service.js";
import { useUserStore } from "@store/modules/user.js";
import { usePermissionsStore } from "@store/modules/permissions.js";
import { logger } from "@utils/logger.js";
import { tokenManager } from "@services/security/token-manager.js";
import { secureStorage } from "@services/security/secure-storage.js";
import { authPersistencePlugin } from "@store/plugins/persistence.js";

/** Router inyectado desde plugins.js para evitar dependencia circular */
let _router = null;
export const setAuthRouter = (r) => { _router = r; };

export const useAuthStore = defineStore("auth", {
    state: () => ({
        isAuthenticated: false,
        accessToken: null, // Simplificado para Sanctum (PAT)
        currentTenant: { id: null, name: null, role: null },
        isHydrated: false,
    }),

    getters: {
        tenantId: (state) => state.currentTenant.id,
    },

    actions: {
        /**
         * Login con Laravel Sanctum
         */
        async login(credentials) {
            try {
                logger.info("Login attempt", { email: credentials.email });

                // authService.login retorna { user, token }
                const { user, token } = await authService.login(credentials);

                // 1. Sincronizar Stores
                useUserStore().setProfile(user);
                usePermissionsStore().setUser(user);

                // 2. Estado local
                this.isAuthenticated = true;
                this.accessToken = token;

                // 3. Persistir en TokenManager (Sanctum)
                await tokenManager.setToken(token);

                // 4. Tenant
                this.currentTenant = {
                    id: credentials.tenantId || user.tenantId || user.company_uuid,
                    name: user.tenantName || "Default",
                    role: user.role || "user",
                };

                return user;
            } catch (e) {
                logger.error("Login failed", { error: e.message });
                throw e;
            }
        },

        /**
         * Obtiene el perfil actualizado (incluyendo permisos) y refresca los stores.
         */
        async fetchProfile() {
            if (!this.isAuthenticated) return null;
            try {
                const user = await authService.getProfile();
                
                useUserStore().setProfile(user);
                usePermissionsStore().setUser(user);
                
                this.currentTenant = {
                    id: user.tenantId || user.company_uuid,
                    name: user.tenantName || "Default",
                    role: user.role || "user",
                };
                
                logger.info("Session silently refreshed via /me endpoint");
                return user;
            } catch (e) {
                logger.error("Silent session refresh failed", { error: e.message });
                throw e;
            }
        },

        /**
         * Cierre de sesión: redirección inmediata al login, limpieza en segundo plano.
         * Flag _isLoggingOut previene cascadas cuando el interceptor 401
         * detecta otra respuesta 401 durante el logout (ej: POST /logout sin token).
         */
        async logout({ redirect = true } = {}) {
            if (this._isLoggingOut) return;
            this._isLoggingOut = true;

            try {
                // 0. Cierre ordenado del GPS: POST /tracking/session/stop con el
                // token aún válido, luego clearWatch. Evita sesiones huérfanas.
                try {
                    const { useDriverTrackingStore } = await import("../../tracking/store/driverTracking.store.js");
                    await useDriverTrackingStore().stopGpsSession();
                } catch { /* no bloquear el logout por fallo GPS */ }

                // 1. Redirigir al login de forma inmediata
                if (redirect && _router) {
                    _router.push("/login");
                }

                const token = this.accessToken;

                // 2. Revocar token en el servidor (el 401 se atrapa silenciosamente)
                if (token) {
                    authService.logout().catch(() => {});
                }

                // 3. Limpiar estado reactivo en memoria
                this.$reset();
                useUserStore().clear();
                usePermissionsStore().clear();

                // 4. Limpiar almacenamiento físico garantizado (después de que Pinia intente reescribir estados vacíos)
                setTimeout(async () => {
                    try {
                        await tokenManager.clearTokens();
                        await secureStorage.clear();
                    } catch (e) {
                        logger.error("Error limpiando almacenamiento físico", e);
                    }
                }, 100);

            } finally {
                setTimeout(() => { this._isLoggingOut = false; }, 3000);
            }
        },

        setHydrated(val) {
            this.isHydrated = val;
        }
    },

    // Plugin de persistencia para mantener sesión al recargar
    persist: {
        plugins: [authPersistencePlugin]
    }
});
