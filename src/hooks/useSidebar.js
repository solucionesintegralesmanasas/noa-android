// src/hooks/useSidebar.js
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

// Mapa ordenado de rutas para despliegue automático de secciones en el Sidebar
const ROUTE_COLLAPSE_MAP = [
    { collapseId: 'informacion-tecnica', prefixes: ['/empresas/experiencias'] },
    { collapseId: 'informacion-financiera', prefixes: ['/empresas/registro-unico-de-proponentes', '/empresas/declaraciones-de-renta', '/empresas/estados-financieros'] },
    { collapseId: 'company', prefixes: ['/empresa', '/empresas'] },
];

export function useSidebar() {
    const route = useRoute();
    const openCollapseId = ref(null);

    const getCollapseForPath = (path) => {
        return ROUTE_COLLAPSE_MAP.find(entry =>
            entry.prefixes.some(prefix => path === prefix || path.startsWith(prefix + '/'))
        )?.collapseId ?? null;
    };

    watch(() => route.path, (path) => {
        openCollapseId.value = getCollapseForPath(path);
    }, { immediate: true });

    const toggleCollapse = (id) => { openCollapseId.value = openCollapseId.value === id ? null : id; };
    const isOpen = (id) => openCollapseId.value === id;
    
    /**
     * Comprueba si una ruta está activa.
     * @param {string} href Ruta base a evaluar
     * @param {boolean} [exact=false] Si es true, exige coincidencia exacta con route.path
     */
    const isActiveLink = (href, exact = false) => {
        if (exact) return route.path === href;
        return route.path === href || route.path.startsWith(href + '/');
    };

    return { toggleCollapse, isOpen, isActiveLink, openCollapseId };
}