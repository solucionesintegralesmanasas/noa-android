// src/hooks/usePlatform.js
// Detección centralizada de plataforma Capacitor.
// Patrón ya usado en backgroundTracking.service.js y useGeolocation.js,
// aquí unificado para la capa de presentación (layout móvil solo Android).
import { computed, ref } from 'vue';
import { Capacitor } from '@capacitor/core';

function leerPlataforma() {
    try {
        return Capacitor.getPlatform() || 'web';
    } catch {
        return 'web';
    }
}

function leerEsNativo() {
    try {
        return Capacitor.isNativePlatform();
    } catch {
        return false;
    }
}

function verificarEsAndroidNativo(plataforma = leerPlataforma(), nativo = leerEsNativo()) {
    return nativo === true && plataforma === 'android';
}

export { verificarEsAndroidNativo as esAndroidNativo };

export function usePlatform() {
    const plataforma = ref(leerPlataforma());
    const nativo = ref(leerEsNativo());

    const plataformaActual = computed(() => plataforma.value);
    const esNativo = computed(() => nativo.value);
    const esAndroidNativoRef = computed(() => verificarEsAndroidNativo(plataforma.value, nativo.value));
    const esIosNativo = computed(() => nativo.value === true && plataforma.value === 'ios');

    function refrescar() {
        plataforma.value = leerPlataforma();
        nativo.value = leerEsNativo();
    }

    return { plataforma: plataformaActual, esNativo, esAndroidNativo: esAndroidNativoRef, esIosNativo, refrescar };
}

export default usePlatform;
