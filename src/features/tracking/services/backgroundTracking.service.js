// src/features/tracking/services/backgroundTracking.service.js
// Puente JS <-> TrackingForegroundService nativo (Android).
// El servicio sigue transmitiendo GPS aunque la app esté minimizada
// o cerrada con swipe. En web o si el plugin no existe, devuelve
// available:false y el store usa watchPosition como antes.
import { Capacitor, registerPlugin } from '@capacitor/core';
import { env } from '@/utils/env.js';
import tokenManager from '@/services/security/token-manager.js';

let plugin = null;
try {
    plugin = registerPlugin('NoaTracking');
} catch {
    plugin = null;
}

function isNativeAndroid() {
    try {
        return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
    } catch {
        return false;
    }
}

async function buildContext({ sessionUuid = null, vehicleUuid = null, projectUuid = null, thirdPartyUuid = null, plate = '' } = {}) {
    // Base absoluta para el POST nativo (el WebView usa /api/v1 relativo con proxy,
    // el servicio nativo necesita URL completa).
    let base = env.API_NATIVE_URL || '';
    // En desarrollo contra IP local, VITE_API_NATIVE_URL puede apuntar al dominio
    // público; si la app corre en http local se respeta igual la nativa configurada.
    if (!base.endsWith('/')) base += '/';
    let token = '';
    try {
        token = (await tokenManager.getAccessToken()) || '';
    } catch {
        token = '';
    }
    return { baseUrl: base, token, sessionUuid, vehicleUuid, projectUuid, thirdPartyUuid, plate };
}

const backgroundTracking = {
    get available() {
        return isNativeAndroid() && !!plugin;
    },

    async start(ctx = {}) {
        if (!this.available) return { started: false, reason: 'no-native' };
        const payload = await buildContext(ctx);
        return plugin.start(payload);
    },

    async updateContext(ctx = {}) {
        if (!this.available) return { updated: false };
        const payload = await buildContext(ctx);
        return plugin.updateContext(payload);
    },

    async refreshToken() {
        if (!this.available) return;
        try {
            const token = (await tokenManager.getAccessToken()) || '';
            await plugin.updateContext({ token });
        } catch { /* el servicio reintenta con la cola */ }
    },

    async stop() {
        if (!this.available) return { stopped: false };
        try {
            return await plugin.stop();
        } catch {
            return { stopped: false };
        }
    },

    async getStatus() {
        if (!this.available) return { tracking: false };
        try {
            return await plugin.getStatus();
        } catch {
            return { tracking: false };
        }
    },

    async isBatteryExempt() {
        if (!this.available) return true;
        try {
            const r = await plugin.isBatteryExempt();
            return r?.exempt !== false;
        } catch {
            return true;
        }
    },

    async requestBatteryExemption() {
        if (!this.available) return;
        try {
            await plugin.requestBatteryExemption();
        } catch { /* ajuste manual */ }
    },

    async openAppSettings() {
        if (!this.available) return;
        try {
            await plugin.openAppSettings();
        } catch { /* nada */ }
    },
};

export default backgroundTracking;
