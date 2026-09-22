/**
 * Configuración de seguridad unificada.
 * Ubicación: src/utils/security.js
 */

import env from "@utils/env.js";

export const SECURITY_CONFIG = Object.freeze({
    LOGGING: {
        minLevel: env.NODE_ENV === 'production' ? 'warn' : 'debug',
        maskFields: ["password", "token", "authorization", "secret"]
    },
    XSS_HEADERS: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY"
    },
    INPUT_VALIDATION: {
        MAX_LENGTH: 2000,
        ALLOWED_PROTOCOLS: ["https:", "mailto:", "tel:"]
    }
});