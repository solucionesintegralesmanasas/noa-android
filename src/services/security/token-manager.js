/**
 * Token Manager: Manejo de Laravel Sanctum (PAT)
 * Ubicación: src/services/security/token-manager.js
 */

import { secureStorage } from "@services/security/secure-storage.js";
import { logger } from "@utils/logger.js";

// Estado privado del módulo
const state = {
    token: null,
    initialized: false
};

// Singleton para asegurar una única carga inicial
let initPromise = null;

async function _loadFromStorage() {
    try {
        const stored = await secureStorage.getItem("auth_token");
        state.token = stored || null;
        state.initialized = true;
        return state.token;
    } catch (error) {
        logger.error("TokenManager: Error crítico al cargar token", { error: error.message });
        return null;
    }
}

export const tokenManager = {
    /**
     * Inicialización del manager. Se invoca desde los plugins.
     */
    async init() {
        if (!initPromise) initPromise = _loadFromStorage();
        return initPromise;
    },

    /**
     * Retorna el token actual. Asegura que el manager esté listo.
     */
    async getAccessToken() {
        if (!state.initialized) await this.init();
        return state.token;
    },

    /**
     * Persistencia segura del token
     */
    async setToken(token) {
        state.token = token;
        await secureStorage.setItem("auth_token", token);
        logger.debug("TokenManager: Token de Sanctum persistido.");
    },

    /**
     * Limpieza total de sesión (Logout)
     */
    async clearTokens() {
        state.token = null;
        state.initialized = false;
        initPromise = null;
        await secureStorage.removeItem("auth_token");
        logger.debug("TokenManager: Estado de sesión limpiado.");
    }
};

export default tokenManager;