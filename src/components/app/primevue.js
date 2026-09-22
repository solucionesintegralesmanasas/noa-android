/**
 * Configuración de PrimeVue para FactusNext
 * Ubicación: src/components/app/primevue.js
 */

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import Menu from 'primevue/menu';

const primeVueOptions = {
    ripple: true,
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: '.system-never'
        },
    },
    // Tu locale ya estaba muy completo, lo mantengo intacto
    locale: {
        startsWith: 'Empieza con',
        contains: 'Contiene',
        notContains: 'No contiene',
        endsWith: 'Termina con',
        equals: 'Igual a',
        notEquals: 'Distinto de',
        noFilter: 'Sin filtro',
        clear: 'Limpiar',
        apply: 'Aplicar',
        accept: 'Aceptar',
        reject: 'Cancelar',
        emptyMessage: 'Sin opciones',
        emptyFilterMessage: 'Sin resultados',
    },
};

export function installPrimeVue(app) {
    app.use(PrimeVue, primeVueOptions);

    // Registro global de componentes base para evitar imports repetitivos en vistas
    // (solo los usados en varias vistas; Dialog se importa directo donde se usa)
    app.component('DataTable', DataTable);
    app.component('Column', Column);
    app.component('PrimeSelect', Select);
    app.component('PrimeMultiSelect', MultiSelect);
    app.component('PButton', Button);
    app.component('Menu', Menu);
}