import { secureStorage } from "@services/security/secure-storage.js";
import { tokenManager } from "@services/security/token-manager.js";
import { logger } from "@utils/logger.js";

// Pre-calienta la clave criptográfica en paralelo para que todos los stores
// se beneficien del cache. Se ejecuta solo la primera vez.
let _keyWarmed = false;
async function _warmKeyOnce() {
    if (!_keyWarmed) { _keyWarmed = true; await secureStorage.warmKey(); }
}

// Helper genérico para persistir un store de forma segura y reactiva
async function configurePersistence(store, key) {
    if (typeof window === "undefined") {
        store.isHydrated = true;
        return;
    }

    // Pre-calienta la clave para acelerar descifrado concurrente
    await _warmKeyOnce();

    try {
        const stored = await secureStorage.getItem(key);
        if (stored) {
            store.$patch(stored);
            logger.debug(`Store [${store.$id}] hidratado desde almacenamiento seguro.`);
        }
    } catch (e) {
        logger.error(`Error de hidratación en Store [${store.$id}]:`, e);
    } finally {
        if (typeof store.setHydrated === 'function') {
            store.setHydrated(true);
        } else if (typeof store.$patch === 'function') {
            store.$patch({ isHydrated: true });
        } else {
            store.isHydrated = true;
        }
    }

    // Suscribirse a cambios para persistir el estado automáticamente
    store.$subscribe(async (mutation, state) => {
        try {
            // Filtrar campos volátiles que no queremos persistir si existen
            const dataToPersist = { ...state };
            delete dataToPersist.isHydrated;
            
            await secureStorage.setItem(key, dataToPersist);
        } catch (e) {
            logger.error(`Error al persistir Store [${store.$id}]:`, e);
        }
    });
}

export const authPersistencePlugin = ({ store }) => {
    store.isHydrated = false;

    configurePersistence(store, "auth").then(async () => {
        // Sincronizar token con tokenManager de Sanctum
        try {
            const token = await tokenManager.getAccessToken();
            if (token) {
                store.accessToken = token;
                store.isAuthenticated = true;
            }
        } catch (e) {
            logger.warn("Error sincronizando token de Sanctum:", e);
        }
    });
};

export const permissionsPersistencePlugin = ({ store }) => {
    store.isHydrated = false;
    configurePersistence(store, "permissions");
};

export const uiPersistencePlugin = ({ store }) => {
    store.isHydrated = false;
    configurePersistence(store, "ui");
};

export const userProfilePersistencePlugin = ({ store }) => {
    store.isHydrated = false;
    configurePersistence(store, "user_profile");
};
