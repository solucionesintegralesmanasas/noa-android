/**
 * Monitor de Conectividad Proactivo
 * Ubicación: src/utils/connectivity.js
 */

import { logger } from "@utils/logger.js";
import apiClient from "@services/api/client.js";

const STATE = {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isApiReachable: true,
    lastCheck: null
};

// Suscriptores
const listeners = new Set();
let toastHandler = null;

export const setToastHandler = (fn) => { toastHandler = fn; };

/**
 * Verifica salud real de la API usando el apiClient (ya configurado con timeout)
 */
export async function checkApiHealth() {
    try {
        // Usamos la instancia global, que debe tener un timeout corto (ej: 5s)
        await apiClient.global.get("/health");
        return true;
    } catch {
        return false;
    }
}

/**
 * Funcionalidad PROACTIVA: 
 * Verifica si es seguro proceder con una acción de red.
 */
export async function verifyConnection() {
    const online = typeof navigator !== "undefined" ? navigator.onLine : true;
    if (!online) {
        notify("Error de red: Dispositivo desconectado", "error");
        return false;
    }

    const reachable = await checkApiHealth();
    if (!reachable) {
        notify("Servidor no responde. Intente más tarde.", "warning");
        return false;
    }

    return true;
}

/**
 * Notificación interna
 */
function notify(message, type) {
    if (toastHandler) toastHandler({ message, type });
    logger.warn(`[Connectivity] ${message}`);
}

/**
 * Suscripción para cambios de estado (Útil para bloquear UI)
 */
export function subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

// Escuchadores de eventos nativos
if (typeof window !== "undefined") {
    window.addEventListener("online", async () => {
        STATE.isOnline = true;
        const reachable = await checkApiHealth();
        STATE.isApiReachable = reachable;
        listeners.forEach(fn => fn({ online: true, reachable }));
        if (reachable) notify("Conexión restaurada", "success");
    });

    window.addEventListener("offline", () => {
        STATE.isOnline = false;
        STATE.isApiReachable = false;
        listeners.forEach(fn => fn({ online: false, reachable: false }));
        notify("Modo sin conexión activado", "error");
    });
}

export const connectivity = {
    verifyConnection,
    subscribe,
    setToastHandler,
    status: () => ({ ...STATE })
};

export default connectivity;