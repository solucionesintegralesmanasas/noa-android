/**
 * Detección pura de problemas de ubicación del teléfono.
 * Ubicación: src/utils/ubicacion.js
 *
 * Sin Pinia, sin DOM y sin Capacitor: el plugin de geolocalización lanza
 * `OS-PLUG-GLOC-0007` cuando la ubicación del sistema está apagada y
 * `OS-PLUG-GLOC-0003` cuando el permiso fue denegado. Distinguirlos permite
 * ofrecer el ajuste correcto en lugar de un reintento genérico.
 */

export const CODIGO_SERVICIOS_DESACTIVADOS = 'OS-PLUG-GLOC-0007';
export const CODIGO_PERMISO_DENEGADO = 'OS-PLUG-GLOC-0003';

export const MENSAJE_UBICACION_DESACTIVADA =
    'La ubicación del teléfono está desactivada. Actívala para registrar tu ruta.';
export const MENSAJE_PERMISO_DENEGADO =
    'Permiso de ubicación denegado. Habilítalo en los ajustes de la aplicación.';

const PATRON_SERVICIOS = /location services are not enabled|ubicación.*desactivad/i;
const PATRON_PERMISO = /location permission request was denied|permiso de ubicación denegado/i;

function textoDelError(error) {
    if (typeof error === 'string') return error;
    const mensaje = error?.message;
    return typeof mensaje === 'string' ? mensaje : '';
}

/** true si el error indica que la ubicación del sistema está apagada. */
export function esErrorServiciosDesactivados(error) {
    if (!error) return false;
    if (error.code === CODIGO_SERVICIOS_DESACTIVADOS) return true;
    return PATRON_SERVICIOS.test(textoDelError(error));
}

/** true si el error indica que el permiso de ubicación fue denegado. */
export function esErrorPermisoDenegado(error) {
    if (!error) return false;
    if (error.code === CODIGO_PERMISO_DENEGADO) return true;
    return PATRON_PERMISO.test(textoDelError(error));
}
