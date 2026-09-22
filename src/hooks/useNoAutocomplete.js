/**
 * Desactiva las sugerencias del navegador en los inputs de un formulario.
 * Chrome ignora `autocomplete="off"`, así que además asigna un `name`
 * aleatorio por montaje: sin nombre estable no hay historial que sugerir.
 * Los selects (placa del vehículo) y los campos en `except`
 * (N° interno) quedan intactos.
 *
 * Ubicación: src/hooks/useNoAutocomplete.js
 */
import { onMounted } from 'vue';

/**
 * @param {Object} formRef - ref del elemento <form>
 * @param {Object} options - { except: string[] } ids a respetar
 */
export function useNoAutocomplete(formRef, options = {}) {
    const { except = [] } = options;

    const scrub = () => {
        const root = formRef?.value;
        if (!root?.querySelectorAll) return;
        root
            .querySelectorAll('input[type="text"], input[type="date"], input:not([type])')
            .forEach((el) => {
                if (except.includes(el.id)) return;
                el.setAttribute('autocomplete', 'off');
                el.setAttribute('name', `noa_${Math.random().toString(36).slice(2)}`);
            });
    };

    onMounted(scrub);

    return { scrub };
}
