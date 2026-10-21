/**
 * Cálculos puros del estado de combustible por vehículo.
 * Ubicación: src/features/fuelManagement/utils/estadoCombustible.js
 *
 * Sin Pinia, DOM ni Capacitor: se prueban con Vitest y los usa
 * FuelStatusDialog para pintar el gauge, el texto restante y los filtros.
 */

/** Formato de kilómetros usado en la UI (es-CO, sin decimales). */
export function formatearKm(valor) {
    if (valor === null || valor === undefined || valor === '') return '—';
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return '—';
    return numero.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

/**
 * Porcentaje de alcance consumido, acotado a 0–100.
 * Acepta `percentage` ya calculado por la API; si falta o no es numérico, 0.
 * @param {{percentage?: number|string}|null|undefined} item
 * @returns {number}
 */
export function progresoAlcance(item) {
    const valor = Number(item?.percentage ?? 0);
    if (!Number.isFinite(valor)) return 0;
    return Math.min(100, Math.max(0, valor));
}

/**
 * Texto de kilómetros restantes o excedidos.
 * @param {{km_remaining?: number|string|null}} item
 * @param {(valor: number|string) => string} [formatear]
 * @returns {string} "—" sin dato, "Excedido X km" si es negativo, "X km" si resta.
 */
export function textoRestante(item, formatear = formatearKm) {
    const valor = item?.km_remaining;
    if (valor === null || valor === undefined || valor === '') return '—';
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return '—';
    if (numero < 0) return `Excedido ${formatear(Math.abs(numero))} km`;
    return `${formatear(numero)} km`;
}

/**
 * Filtra vehículos del estado de combustible por búsqueda, clasificación y proyecto.
 * @param {Array<object>} items
 * @param {{busqueda?: string, clasificacion?: string, proyecto?: string}} filtros
 * @returns {Array<object>}
 */
export function filtrarEstado(items, filtros = {}) {
    const lista = Array.isArray(items) ? items : [];
    const busqueda = String(filtros.busqueda ?? '').trim().toLowerCase();
    const clasificacion = filtros.clasificacion ?? 'todos';
    const proyecto = filtros.proyecto ?? '';

    return lista.filter((item) => {
        if (proyecto === 'sin_proyecto' && (item?.projects?.length ?? 0) > 0) return false;
        if (proyecto && proyecto !== 'sin_proyecto'
            && !(item?.projects ?? []).some((p) => p.uuid === proyecto)) {
            return false;
        }
        if (clasificacion === 'con_datos' && item?.status === 'SIN_TANQUEO') return false;
        if (clasificacion === 'alertas' && !['EXCEDIDO', 'PROXIMO'].includes(item?.status)) return false;
        if (!busqueda) return true;
        return `${item?.vehicle_license_plate ?? ''} ${item?.internal_number ?? ''}`
            .toLowerCase()
            .includes(busqueda);
    });
}
