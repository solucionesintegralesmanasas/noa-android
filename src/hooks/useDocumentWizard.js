/**
 * Orquestador del asistente de documentos del vehículo.
 * Define los pasos (SOAT → Pólizas → Tecnomecánica → Tarjeta → Resumen),
 * resuelve rutas, filtra por permisos y calcula documentos pendientes.
 *
 * Ubicación: src/hooks/useDocumentWizard.js
 */
import vehicleDocumentsService from '@/features/vehicleDocuments/services/vehicleDocuments.service.js';
import operationCardsService from '@/features/operationCards/services/operationCards.service.js';
import businessCollaborationAgreementsService from '@/features/businessCollaborationAgreements/services/businessCollaborationAgreements.service.js';
import vehiclesService from '@/features/vehicles/services/vehicles.service.js';

export const WIZARD_STEPS = [
    { key: 'vehiculo', label: 'Vehículo', icon: 'fad fa-car', permission: 'vehicles.create', hint: 'Registra los datos del vehículo y el afiliado; luego seguirás con sus documentos' },
    { key: 'soat', label: 'SOAT', icon: 'fad fa-file-invoice', permission: 'vehicle_documents.create', hint: 'Ten a la mano el número de SOAT, la entidad emisora y las fechas de vigencia' },
    { key: 'poliza', label: 'Pólizas RCE/RCC', icon: 'fad fa-file-contract', permission: 'vehicle_documents.create', hint: 'Consulta los números de póliza RCE y RCC, el tomador y la aseguradora' },
    { key: 'tecnomecanica', label: 'Tecnomecánica', icon: 'fad fa-industry', permission: 'vehicle_documents.create', hint: 'Consulta el número de revisión y el CDA que la expidió' },
    { key: 'tarjeta', label: 'Tarjeta de operación', icon: 'fad fa-car-bus', permission: 'operation_cards.create', hint: 'Ten a la mano el número de tarjeta y sus fechas de expedición y vencimiento' },
];

/**
 * Normaliza respuestas paginadas o planas a arreglo.
 * @param {*} resp
 * @returns {Array}
 */
const toList = (resp) => {
    const data = resp?.data ?? resp ?? [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
};

export function useDocumentWizard() {
    /**
     * Ruta del paso indicado para un vehículo.
     * @param {string} stepKey
     * @param {string} vehicleUuid
     * @returns {{path:string, query:Object}}
     */
    const stepRoute = (stepKey, vehicleUuid) => {
        if (stepKey === 'tarjeta') {
            return { path: '/tarjetas-de-operacion/crear', query: { wizard: vehicleUuid } };
        }
        return { path: `/vehiculos-documentos/${stepKey}/crear`, query: { wizard: vehicleUuid } };
    };

    const canRunStep = (step, permissionsStore) => {
        if (!step.permission) return true;
        try {
            return permissionsStore.can(step.permission);
        } catch {
            return true;
        }
    };

    /**
     * Pasos ejecutables para el usuario actual.
     * @param {Object} permissionsStore
     * @returns {Array}
     */
    const availableSteps = (permissionsStore) =>
        WIZARD_STEPS.filter((s) => canRunStep(s, permissionsStore));

    /**
     * Primer paso ejecutable tras crear el vehículo (null si no hay ninguno).
     * @param {Object} permissionsStore
     * @returns {Object|null} step
     */
    const firstStep = (permissionsStore) =>
        availableSteps(permissionsStore).find((s) => s.key !== 'vehiculo') ?? null;

    /**
     * Ruta de salida del asistente: perfil del vehículo (las alertas cubren pendientes).
     * @param {string} vehicleUuid
     * @returns {{path:string, query:Object}}
     */
    const exitRoute = (vehicleUuid) => ({ path: `/vehiculos/perfil/${vehicleUuid}`, query: {} });

    /**
     * Paso siguiente al actual, saltando los no permitidos (sale al perfil al final).
     * @param {string} currentKey
     * @param {string} vehicleUuid
     * @param {Object} permissionsStore
     * @returns {{path:string, query:Object}}
     */
    const nextStepRoute = (currentKey, vehicleUuid, permissionsStore) => {
        const idx = WIZARD_STEPS.findIndex((s) => s.key === currentKey);
        for (let i = idx + 1; i < WIZARD_STEPS.length; i++) {
            if (canRunStep(WIZARD_STEPS[i], permissionsStore)) {
                return stepRoute(WIZARD_STEPS[i].key, vehicleUuid);
            }
        }
        return exitRoute(vehicleUuid);
    };

    /**
     * Paso anterior al actual, saltando los no permitidos.
     * Desde SOAT vuelve al perfil; el formulario de vehículo vuelve al listado.
     * @param {string} currentKey
     * @param {string} vehicleUuid
     * @param {Object} permissionsStore
     * @returns {{path:string, query:Object}}
     */
    const prevStepRoute = (currentKey, vehicleUuid, permissionsStore) => {
        const idx = WIZARD_STEPS.findIndex((s) => s.key === currentKey);
        for (let i = idx - 1; i >= 0; i--) {
            if (WIZARD_STEPS[i].key === 'vehiculo') return exitRoute(vehicleUuid);
            if (canRunStep(WIZARD_STEPS[i], permissionsStore)) {
                return stepRoute(WIZARD_STEPS[i].key, vehicleUuid);
            }
        }
        return exitRoute(vehicleUuid);
    };

    /**
     * Progreso de la sesión (inmediato, sin esperar al backend).
     * Garantiza checks secuenciales al avanzar entre pasos.
     */
    const sessionKey = (vehicleUuid) => `noa-wizard-done-${vehicleUuid}`;

    const getSessionDone = (vehicleUuid) => {
        try {
            return JSON.parse(sessionStorage.getItem(sessionKey(vehicleUuid))) ?? [];
        } catch {
            return [];
        }
    };

    const markStepDone = (vehicleUuid, stepKey) => {
        try {
            const done = new Set([...getSessionDone(vehicleUuid), 'vehiculo', stepKey]);
            sessionStorage.setItem(sessionKey(vehicleUuid), JSON.stringify([...done]));
        } catch {
            // Almacenamiento no disponible: el fetch cubre el estado
        }
    };

    const clearSessionDone = (vehicleUuid) => {
        try {
            sessionStorage.removeItem(sessionKey(vehicleUuid));
        } catch {
            // Nada que limpiar
        }
    };

    /**
     * Consulta qué documentos ya existen para el vehículo.
     * @param {string} vehicleUuid
     * @param {{ strict?: boolean }} [options] Si `strict` es true, un fallo de la
     *   consulta principal se propaga en lugar de tratarse como "sin documentos".
     * @returns {Promise<{soat:Object|null, rce:Object|null, rcc:Object|null, rtm:Object|null, tarjeta:Object|null, convenio:Object|null}>}
     */
    const fetchExistingDocs = async (vehicleUuid, { strict = false } = {}) => {
        const found = { soat: null, rce: null, rcc: null, rtm: null, tarjeta: null, convenio: null };
        if (!vehicleUuid) return found;

        try {
            const docs = toList(await vehicleDocumentsService.getByVehicle(vehicleUuid));
            found.soat = docs.find((d) => d.document_type === 'SOAT') ?? null;
            found.rce = docs.find((d) => d.document_type === 'RCE') ?? null;
            found.rcc = docs.find((d) => d.document_type === 'RCC') ?? null;
            found.rtm = docs.find((d) => d.document_type === 'RTM') ?? null;
        } catch (error) {
            // Un fallo real no debe interpretarse como "documento inexistente".
            if (strict) throw error;
        }

        try {
            // El endpoint de tarjetas ignora el filtro vehicle_uuid: verificar en cliente
            const cards = toList(await operationCardsService.list({ vehicle_uuid: vehicleUuid }));
            found.tarjeta = cards.find((c) => c.vehicle_uuid === vehicleUuid || c.vehicle?.uuid === vehicleUuid) ?? null;
        } catch {
            // Sin tarjeta aún
        }

        if (!found.tarjeta) {
            // Fallback: el perfil del vehículo trae operation_cards embebidas
            // (el listado paginado puede no incluir la tarjeta del vehículo)
            try {
                const resp = await vehiclesService.getProfile(vehicleUuid);
                const profile = resp?.data?.data ?? resp?.data ?? resp ?? {};
                const cards = Array.isArray(profile.operation_cards) ? profile.operation_cards : [];
                if (cards.length) {
                    const now = new Date();
                    const vigentes = cards.filter((c) => c.expiration_date && new Date(c.expiration_date) > now);
                    const pool = vigentes.length ? vigentes : cards;
                    pool.sort((a, b) => new Date(b.expiration_date ?? 0) - new Date(a.expiration_date ?? 0));
                    found.tarjeta = pool[0] ?? null;
                }
            } catch {
                // Sin tarjeta aún
            }
        }

        try {
            // Convenio del vehículo (el más reciente por vencimiento).
            const agreements = toList(await businessCollaborationAgreementsService.list({ vehicle_uuid: vehicleUuid }));
            const mine = agreements.filter((a) => a.vehicle_uuid === vehicleUuid);
            if (mine.length) {
                mine.sort((a, b) => new Date(b.expiry_date ?? 0) - new Date(a.expiry_date ?? 0));
                found.convenio = mine[0] ?? null;
            }
        } catch {
            // Sin convenio registrado
        }

        return found;
    };

    /**
     * Normaliza una fecha a YYYY-MM-DD para inputs type="date".
     * @param {*} value
     * @returns {string}
     */
    const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

    return { WIZARD_STEPS, stepRoute, exitRoute, canRunStep, availableSteps, firstStep, nextStepRoute, prevStepRoute, fetchExistingDocs, getSessionDone, markStepDone, clearSessionDone, toDateInput };
}
