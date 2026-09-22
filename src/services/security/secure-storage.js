/**
 * Almacenamiento seguro con AES-GCM (WebCrypto API)
 * Ubicación: src/services/security/secure-storage.js
 */

import { logger } from "@utils/logger.js";
import env from "@utils/env.js";
import { Preferences } from "@capacitor/preferences";

// Helpers binarios optimizados
const b64 = (u8) => btoa(String.fromCharCode(...u8));
const ub64 = (str) => Uint8Array.from(atob(str), c => c.charCodeAt(0));

/**
 * Devuelve true solo si estamos en un contexto seguro (HTTPS / localhost)
 * donde la Web Crypto API (subtle) está disponible.
 */
const _isSecureContext = () => !!(window?.crypto?.subtle);

class SecureStorage {
    constructor(prefix = '') {
        this.prefix = prefix;
        this.secret = env.ENCRYPTION_KEY;
        this._derivedKeys = new Map();
        this._derivationPromises = new Map();
    }

    /**
     * Obtiene o genera un salt único por cliente.
     * Usa window.crypto (no el global `crypto`) para compatibilidad con HTTP.
     * Si no hay contexto seguro, usa un salt fijo derivado de la clave de entorno.
     */
    async _getClientSalt() {
        let { value: saltStr } = await Preferences.get({ key: 'sec_client_salt' });
        if (!saltStr) {
            if (_isSecureContext()) {
                // Contexto seguro (HTTPS): generamos salt aleatorio verdadero
                const randomSalt = window.crypto.getRandomValues(new Uint8Array(16));
                saltStr = b64(randomSalt);
            } else {
                // Contexto inseguro (HTTP): salt determinístico basado en la clave de entorno
                // No es ideal criptográficamente, pero permite que la app funcione en HTTP
                const encoder = new TextEncoder();
                const keyBytes = encoder.encode((this.secret || 'fallback').padEnd(16, '0').slice(0, 16));
                saltStr = b64(keyBytes);
                logger.warn('[SecureStorage] Contexto no seguro (HTTP): usando salt determinístico. Se recomienda HTTPS.');
            }
            await Preferences.set({ key: 'sec_client_salt', value: saltStr });
        }
        return ub64(saltStr);
    }

    /**
     * Derivación de clave PBKDF2 (Caché por salt)
     */
    async _deriveKey(salt) {
        if (!_isSecureContext()) return null;

        const saltKey = b64(salt);
        if (this._derivedKeys.has(saltKey)) return this._derivedKeys.get(saltKey);

        if (!this._derivationPromises.has(saltKey)) {
            const promise = (async () => {
                const material = await window.crypto.subtle.importKey(
                    "raw", new TextEncoder().encode(this.secret),
                    { name: "PBKDF2" }, false, ["deriveKey"]
                );
                const derived = await window.crypto.subtle.deriveKey(
                    { name: "PBKDF2", salt, iterations: 10000, hash: "SHA-256" },
                    material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
                );
                this._derivedKeys.set(saltKey, derived);
                return derived;
            })();
            this._derivationPromises.set(saltKey, promise);
        }
        return this._derivationPromises.get(saltKey);
    }

    /**
     * Pre-calienta la derivación de clave para que las siguientes ops sean rápidas.
     * Llamar una vez antes de hidratar múltiples stores reduce el tiempo total.
     */
    async warmKey() {
        if (!_isSecureContext()) {
            logger.warn('[SecureStorage] warmKey omitido: crypto.subtle no disponible (se requiere HTTPS).');
            return;
        }
        const salt = await this._getClientSalt();
        await this._deriveKey(salt);
    }

    async _encrypt(text) {
        if (!_isSecureContext()) {
            return `raw:${btoa(encodeURIComponent(text))}`;
        }
        const salt = await this._getClientSalt();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const key = await this._deriveKey(salt);
        const ct = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text));
        return `v1:${b64(salt)}.${b64(iv)}.${b64(new Uint8Array(ct))}`;
    }

    async _decrypt(encrypted) {
        if (!encrypted) return null;
        if (encrypted.startsWith("raw:")) {
            try {
                return decodeURIComponent(atob(encrypted.slice(4)));
            } catch (e) {
                return null;
            }
        }
        if (!encrypted.startsWith("v1:")) return null; // Solo soportamos v1 por seguridad
        if (!_isSecureContext()) return null;

        const [saltB64, ivB64, ctB64] = encrypted.slice(3).split(".");
        const key = await this._deriveKey(ub64(saltB64));
        if (!key) return null;
        const pt = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: ub64(ivB64) }, key, ub64(ctB64));
        return new TextDecoder().decode(pt);
    }

    async setItem(key, value) {
        try {
            const encrypted = await this._encrypt(JSON.stringify(value));
            await Preferences.set({ key: `${this.prefix}secure_${key}`, value: encrypted });
        } catch (e) {
            logger.error("SecureStorage setItem failed", { key, error: e.message });
        }
    }

    async getItem(key) {
        try {
            const { value: encrypted } = await Preferences.get({ key: `${this.prefix}secure_${key}` });
            if (!encrypted) return null;
            return JSON.parse(await this._decrypt(encrypted));
        } catch (e) {
            logger.warn("SecureStorage getItem failed", { key });
            return null;
        }
    }

    async removeItem(key) {
        try {
            await Preferences.remove({ key: `${this.prefix}secure_${key}` });
        } catch (e) {
            logger.error("SecureStorage removeItem failed", { key, error: e.message });
        }
    }

    async clear() {
        const { keys } = await Preferences.keys();
        for (const k of keys) {
            if (k.startsWith(`${this.prefix}secure_`)) {
                await Preferences.remove({ key: k });
            }
        }
        await Preferences.remove({ key: 'sec_client_salt' });
    }
}

export const secureStorage = new SecureStorage('');
export const secureSessionStorage = new SecureStorage('session_');
export default secureStorage;