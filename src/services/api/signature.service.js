import { BaseService } from '@services/api/base.service.js'
import { useGeolocation } from '@/hooks/useGeolocation.js'

/**
 * SignatureService
 *
 * Gestiona el ciclo de vida completo de las firmas digitales (PNG base64).
 *
 * Cambios respecto a la versión anterior:
 * - Integra `useGeolocation` para capturar coords, speed e isMoving
 *   automáticamente antes de cada escritura.
 * - Enriquece los payloads de `store` y `replace` con los campos de
 *   auditoría geoespacial que el backend ahora persiste:
 *     · latitude, longitude, speed, state, ip_address
 * - Expone `startTracking` / `stopTracking` para que el componente pueda
 *   activar el seguimiento GPS antes de que el usuario firme.
 * - La geolocalización es opcional: si el usuario deniega el permiso o el
 *   navegador no la soporta, los campos de geo se envían como null y el
 *   backend los acepta (todos son nullable en la migración).
 */
class SignatureService extends BaseService {
    constructor(tenantId = null) {
        super({
            resourcePath: 'signatures',
            tenantId,
            metadata: { module: 'signatures', service: 'signature' }
        })

        // Instanciar el hook de geolocalización internamente.
        // startTracking / stopTracking quedan expuestos para que el
        // componente los controle en su ciclo de vida.
        const geo = useGeolocation()
        this._geo = geo
    }

    // ----------------------------------------------------------------
    // API pública de geolocalización (delegada al hook)
    // ----------------------------------------------------------------

    /**
     * Inicia el seguimiento GPS continuo.
     * Llámalo en onMounted del componente de firma.
     *
     * @param {function|null} onUpdateCallback  Callback opcional con {lat, lng, speed, isMoving}
     */
    startTracking(onUpdateCallback = null) {
        this._geo.startTracking(onUpdateCallback)
    }

    /** Detiene el watchPosition. Llámalo en onUnmounted. */
    stopTracking() {
        this._geo.stopTracking()
    }

    /** Coords reactivas actuales (ref Vue). */
    get coords() { return this._geo.coords }

    /** Velocidad reactiva en km/h (ref Vue). */
    get speed() { return this._geo.speed }

    /** Booleano reactivo: ¿está el dispositivo en movimiento? (ref Vue). */
    get isMoving() { return this._geo.isMoving }

    /** Error de geolocalización (ref Vue). */
    get geoError() { return this._geo.error }

    /** Mensaje de error de geolocalización (ref Vue). */
    get geoErrorMsg() { return this._geo.errorMsg }

    // ----------------------------------------------------------------
    // Helpers privados
    // ----------------------------------------------------------------

    /**
     * Construye el bloque de auditoría geoespacial a partir del estado
     * actual del hook de geolocalización.
     *
     * @returns {object}
     */
    _buildGeoMeta() {
        const { latitude, longitude } = this._geo.coords.value
        return {
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            speed: String(this._geo.speed.value ?? ''),
            // "EN MOVIMIENTO" si speed > 0, "DETENIDO" si no hay movimiento.
            state: this._geo.isMoving.value ? 'EN MOVIMIENTO' : 'DETENIDO',
            // ip_address: el backend la obtiene de request()->ip(), pero se
            // puede forzar desde el cliente para contextos SSE / proxy.
            ip_address: null
        }
    }

    // ----------------------------------------------------------------
    // Escritura
    // ----------------------------------------------------------------

    /**
     * Guarda una firma nueva enriquecida con metadatos geoespaciales.
     *
     * @param {object} payload
     * @param {string} payload.entity_type  - Tipo de entidad (vehicle, driver, contract)
     * @param {number} payload.entity_id    - ID numérico de la entidad
     * @param {string} payload.signature    - data:image/png;base64,...
     * @param {string|null} [payload.ip_address] - Opcional: IP pública del cliente
     * @returns {Promise}
     */
    store(payload) {
        const enriched = {
            ...payload,
            ...this._buildGeoMeta(),
            // Permitir override explícito de ip_address si el llamador lo provee.
            ip_address: payload.ip_address ?? null
        }
        return this._request('POST', '', { data: enriched })
    }

    /**
     * Retorna la firma más reciente para una entidad.
     *
     * @param {string} entityType
     * @param {number} entityId
     * @returns {Promise}
     */
    getLatest(entityType, entityId) {
        return this._request('GET', '/latest', {
            params: { entity_type: entityType, entity_id: entityId }
        })
    }

    /**
     * Reemplaza la firma activa de una entidad, conservando metadatos
     * geoespaciales del momento del reemplazo.
     *
     * @param {string} uuid
     * @param {string} base64Png   - data:image/png;base64,...
     * @param {object} [extra]     - Campos opcionales para override (entity_type, entity_id, ip_address)
     * @returns {Promise}
     */
    replace(uuid, base64Png, extra = {}) {
        const payload = {
            signature: base64Png,
            ...this._buildGeoMeta(),
            ...extra
        }
        return this._request('PUT', `/${uuid}`, { data: payload })
    }

    /**
     * Elimina una firma por UUID.
     *
     * @param {string} uuid
     * @returns {Promise}
     */
    destroy(uuid) {
        return this._request('DELETE', `/${uuid}`)
    }
}

// ----------------------------------------------------------------
// Singleton con soporte multi-tenant
// ----------------------------------------------------------------

const instances = new Map()

/**
 * Retorna (o crea) el singleton del SignatureService para el tenant dado.
 *
 * @param {string|null} tenantId
 * @returns {SignatureService}
 */
export function useSignatureService(tenantId = null) {
    const key = tenantId ?? '__default__'
    if (!instances.has(key)) {
        instances.set(key, new SignatureService(tenantId))
    }
    return instances.get(key)
}