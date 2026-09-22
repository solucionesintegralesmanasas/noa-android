/**
 * Hook unificado para gestionar tablas con paginación server-side,
 * filtros y búsqueda con debounce.
 *
 * Ubicación: src/hooks/useTable.js
 */
import { ref, reactive } from 'vue';

/**
 * @param {object}   initialParams  - Parámetros iniciales: { page, rows, filters }
 * @param {Function} fetchCallback  - Función a ejecutar al cambiar página / filtro
 */
export function useTable(initialParams = {}, fetchCallback = null) {
    const page    = ref(initialParams.page ?? 1);
    const rows    = ref(initialParams.rows ?? 10);
    const filters = reactive(initialParams.filters ?? { globalFilter: '' });
    const loading = ref(false);

    let _debounceTimer = null;

    /** Búsqueda con retraso para no sobrecargar la API */
    const debouncedSearch = (delay = 350) => {
        clearTimeout(_debounceTimer);
        _debounceTimer = setTimeout(() => {
            page.value = 1;
            if (fetchCallback) fetchCallback();
        }, delay);
    };

    /** Limpia filtros y recarga */
    const clearFilters = () => {
        Object.keys(filters).forEach(key => {
            filters[key] = key === 'globalFilter' ? '' : null;
        });
        page.value = 1;
        if (fetchCallback) fetchCallback();
    };

    /**
     * Manejador de cambio de página compatible con PrimeVue lazy DataTable.
     * PrimeVue emite { first, rows } → convertimos a número de página (1-indexed).
     */
    const onPage = (event) => {
        page.value  = event.page !== undefined
            ? event.page + 1
            : Math.floor(event.first / event.rows) + 1;
        rows.value = event.rows;
        if (fetchCallback) fetchCallback();
    };

    return { page, rows, filters, loading, onPage, debouncedSearch, clearFilters };
}