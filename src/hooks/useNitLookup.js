/**
 * @author Darwin Montes
 * @version 1.1.0
 * @created_at 2026-06-14
 * @module {Hooks}
 * @resource {NitLookup}
 */

import { ref } from 'vue';

/** URL base de la API pública del RUES — Registros y Entidades Sin Ánimo de Lucro */
const RUES_API = 'https://www.datos.gov.co/resource/c82u-588k.json';

/**
 * Estados de matrícula que se consideran vigentes/activos para la selección automática.
 * Se prioriza el registro que NO esté cancelado/cerrado.
 */
const ESTADOS_INACTIVOS = [
    'MATRÍCULA CANCELADA POR TRASLADO DE DOMICILIO',
    'MATRÍCULA CANCELADA',
    'CANCELADA',
    'CERRADA',
];

/**
 * Verifica si un registro tiene matrícula inactiva/cancelada.
 * @param {Object} reg
 * @returns {boolean}
 */
export function esCancelado(reg) {
    return ESTADOS_INACTIVOS.some(e =>
        (reg.estado_matricula || '').toUpperCase().includes(e.toUpperCase())
    );
}

/**
 * Hook para consultar el NIT en el RUES y gestionar el estado de los resultados.
 *
 * @returns {{
 *   lookingUpNit: import('vue').Ref<boolean>,
 *   registros: import('vue').Ref<Array<Object>>,
 *   searched: import('vue').Ref<boolean>,
 *   lastNit: import('vue').Ref<string>,
 *   tieneSoloInactivos: import('vue').Ref<boolean>,
 *   lookupNit: Function,
 *   resetLookup: Function
 * }}
 */
export function useNitLookup() {
    /** @type {import('vue').Ref<boolean>} Indica si la consulta está en progreso */
    const lookingUpNit = ref(false);

    /** @type {import('vue').Ref<Array>} Registros encontrados en el RUES */
    const registros = ref([]);

    /** @type {import('vue').Ref<boolean>} Indica si ya se realizó al menos una búsqueda */
    const searched = ref(false);

    /** @type {import('vue').Ref<string>} Último NIT consultado */
    const lastNit = ref('');

    /** @type {import('vue').Ref<boolean>} True si todos los registros encontrados estaban cancelados */
    const tieneSoloInactivos = ref(false);

    /**
     * Consulta el NIT en el RUES y actualiza los estados reactivos.
     *
     * @param {string} nit - Número de identificación tributaria a consultar.
     * @returns {Promise<void>}
     */
    async function lookupNit(nit) {
        const nitClean = String(nit || '').trim().replace(/[^0-9]/g, '');
        if (!nitClean || nitClean.length < 6) return;

        try {
            lookingUpNit.value = true;
            searched.value = false;
            registros.value = [];
            tieneSoloInactivos.value = false;
            lastNit.value = nitClean;

            const url = `${RUES_API}?nit=${encodeURIComponent(nitClean)}`;
            const response = await fetch(url, {
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            if (!data || data.length === 0) {
                registros.value = [];
                return;
            }

            // Separar y priorizar registros vigentes
            const vigentes = data.filter(r => !esCancelado(r));

            if (vigentes.length > 0) {
                // Ordenar vigentes por año de renovación desc
                registros.value = vigentes.sort(
                    (a, b) => parseInt(b.ultimo_ano_renovado || 0) - parseInt(a.ultimo_ano_renovado || 0)
                );
                tieneSoloInactivos.value = false;
            } else {
                // Todos cancelados → mostrar todos de todas formas con aviso
                registros.value = data.sort(
                    (a, b) => parseInt(b.ultimo_ano_renovado || 0) - parseInt(a.ultimo_ano_renovado || 0)
                );
                tieneSoloInactivos.value = true;
            }
        } catch (error) {
            console.error('[useNitLookup] Error al consultar RUES:', error);
            registros.value = [];
        } finally {
            lookingUpNit.value = false;
            searched.value = true;
        }
    }

    /**
     * Limpia el estado de la búsqueda.
     */
    function resetLookup() {
        registros.value = [];
        searched.value = false;
        lastNit.value = '';
        tieneSoloInactivos.value = false;
    }

    return {
        lookingUpNit,
        registros,
        searched,
        lastNit,
        tieneSoloInactivos,
        lookupNit,
        resetLookup,
    };
}
