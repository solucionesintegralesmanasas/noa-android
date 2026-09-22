/**
 * Enmascaramiento eficiente de datos.
 * Ubicación: src/utils/mask.js
 */

const SENSITIVE = new Set(['token', 'password', 'secret', 'authorization', 'otp']);

export function maskSensitiveFields(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) return obj.map(maskSensitiveFields);

    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        result[key] = SENSITIVE.has(key.toLowerCase())
            ? "***"
            : (typeof value === 'object' ? maskSensitiveFields(value) : value);
    }
    return result;
}

export const maskRequestData = maskSensitiveFields;
export const maskResponseData = maskSensitiveFields;