/**
 * Store de detección de nueva versión (auto-update).
 * Ubicación: src/features/versionUpdate/store/versionUpdate.store.js
 *
 * Throttle de 6 horas en localStorage: la app no consulta GitHub
 * más de una vez por ventana. "Después" oculta el banner sin
 * descartar la versión (vuelve a ofrecerse en el próximo check).
 */

import { defineStore } from "pinia";
import { checkForUpdate } from "@services/versionUpdate.service.js";
import { logger } from "@utils/logger.js";

const CACHE_KEY = "noa_version_check";
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

function readCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function writeCache(payload) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
        /* almacenamiento lleno o bloqueado: el check sigue funcionando */
    }
}

export const useVersionUpdateStore = defineStore("versionUpdate", {
    state: () => ({
        latestVersion: null,
        currentVersion: null,
        hasUpdate: false,
        apkUrl: null,
        releaseUrl: "",
        dismissedFor: null, // versión que el usuario descartó con "Después"
        isChecking: false,
        lastCheck: null,
    }),

    getters: {
        /** El banner solo se ofrece si hay update y no fue descartado. */
        shouldOffer: (state) => state.hasUpdate && state.dismissedFor !== state.latestVersion,
    },

    actions: {
        async check({ force = false } = {}) {
            if (this.isChecking) return;
            const cached = readCache();
            if (!force && cached && Date.now() - (cached.timestamp || 0) < CHECK_INTERVAL_MS) {
                this.hasUpdate = !!cached.hasUpdate;
                this.latestVersion = cached.latestVersion || null;
                this.currentVersion = cached.currentVersion || null;
                this.apkUrl = cached.apkUrl || null;
                this.releaseUrl = cached.releaseUrl || "";
                this.lastCheck = cached.timestamp;
                return;
            }
            this.isChecking = true;
            try {
                const result = await checkForUpdate();
                if (!result.latestVersion && cached && cached.hasUpdate) {
                    // Sin red o GitHub inaccesible al abrir: se conserva el
                    // aviso cacheado para que la alerta salga de una vez.
                    this.hasUpdate = true;
                    this.latestVersion = cached.latestVersion || null;
                    this.currentVersion = result.currentVersion;
                    this.apkUrl = cached.apkUrl || null;
                    this.releaseUrl = cached.releaseUrl || "";
                    this.lastCheck = cached.timestamp;
                    return;
                }
                this.hasUpdate = result.hasUpdate;
                this.latestVersion = result.latestVersion;
                this.currentVersion = result.currentVersion;
                this.apkUrl = result.apkUrl;
                this.releaseUrl = result.releaseUrl;
                this.lastCheck = Date.now();
                writeCache({
                    timestamp: this.lastCheck,
                    hasUpdate: this.hasUpdate,
                    latestVersion: this.latestVersion,
                    currentVersion: this.currentVersion,
                    apkUrl: this.apkUrl,
                    releaseUrl: this.releaseUrl,
                });
                logger.info("VersionUpdate: check completado", {
                    hasUpdate: this.hasUpdate,
                    latestVersion: this.latestVersion,
                });
            } finally {
                this.isChecking = false;
            }
        },

        dismiss() {
            this.dismissedFor = this.latestVersion;
        },

        reset() {
            this.$reset();
            try {
                localStorage.removeItem(CACHE_KEY);
            } catch {
                /* noop */
            }
        },
    },
});
