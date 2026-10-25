import { logger } from "@utils/logger.js";
import apiClient from "@services/api/client.js";
import { useUserStore } from "@store/modules/user.js";
import { usePermissionsStore } from "@store/modules/permissions.js";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

// Guarda archivos en Descargas/NOA (plugin nativo propio). En web queda como
// proxy de Capacitor: solo se usa cuando isNativePlatform() es true.
const NoaFiles = registerPlugin("NoaFiles");

const ROLES = Object.freeze({
    SUPERADMIN: 'SUPERADMIN',
    CONDUCTOR: 'CONDUCTOR',
    AFILIADO: 'AFILIADO',
    EMPLEADO: 'EMPLEADO',
});
export class BaseService {
    constructor({ resourcePath, tenantId = null, metadata = {} }) {
        this.resourcePath = resourcePath.replace(/^\/+/, '').replace(/\/+$/, '');
        this.tenantId = tenantId;
        this.metadata = { module: "api", resource: resourcePath, ...metadata };
    }

    _getInstance() {
        return this.tenantId ? apiClient.forTenant(this.tenantId) : apiClient.global;
    }

    /**
     * Obtiene el contexto del usuario actual (Empresa y Tercero) 
     * validando si es SUPERADMIN (retorna null para omitir filtros).
     */
    _getUserContext() {
        const userStore = useUserStore();
        const permissionsStore = usePermissionsStore();

        const isSuperAdmin = permissionsStore.hasRole(ROLES.SUPERADMIN);
        const isConductor = permissionsStore.hasRole(ROLES.CONDUCTOR);
        const hasAfiliadoRole = permissionsStore.hasRole(ROLES.AFILIADO);
        const hasEmpleadoRole = permissionsStore.hasRole(ROLES.EMPLEADO);

        // "isAfiliado" = tiene acceso de tipo afiliado (afiliado, empleado o conductor)
        const isAfiliado = hasAfiliadoRole || hasEmpleadoRole || isConductor;

        // Con el nuevo ajuste del backend:
        // - userStore.third_party_uuid = UUID del Afiliado (dueño de los vehículos)
        // - userStore.uuid_driver = UUID original del Conductor
        const thirdPartyUuid = isSuperAdmin ? null : userStore.third_party_uuid;
        const uuidDriver = isSuperAdmin
            ? null
            : (userStore.uuid_driver || userStore.third_party_uuid);

        return {
            companyUuid: isSuperAdmin ? null : userStore.company_uuid,
            thirdPartyUuid,
            uuidDriver,
            isSuperAdmin,
            isAfiliado,
            isConductor,
            isAfiliadoRole: hasAfiliadoRole, // se mantiene el nombre original de salida
        };
    }
    _checkPermission(action, subject) {
        const permissionsStore = usePermissionsStore();
        const actionMap = { 'read': 'index', 'create': 'create', 'update': 'update', 'delete': 'delete' };
        const backendAction = actionMap[action] || action;
        const target = subject ?? this.metadata.service ?? this.metadata.resource.replace(/^\/+/, "");

        if (!permissionsStore.can(backendAction, target)) {
            throw new Error(`Permission denied: ${target}.${backendAction}`);
        }
    }

    async _request(method, url, { data, params, config = {} } = {}) {
        const fullUrl = url.startsWith("http") ? url : `${this.resourcePath}${url}`;

        // Inyectar filtro automáticamente si es AFILIADO y es una petición GET
        const requestParams = { ...params };
        if (method.toUpperCase() === 'GET') {
            const { isAfiliado, thirdPartyUuid } = this._getUserContext();
            if (isAfiliado && thirdPartyUuid) {
                // Se envía a nivel plano en lugar de anidado en 'filter'
                // Esto evita que Axios lo envíe como [object Object] y que Spatie QueryBuilder 
                // explote con un error 400 (InvalidFilterQuery) en catálogos que no lo admiten.
                requestParams.third_party_uuid = thirdPartyUuid;
            }
        }

        try {
            const response = await this._getInstance()({ method, url: fullUrl, data, params: requestParams, ...config });
            return response.data;
        } catch (error) {
            logger.error(`💥 ${method} Failed`, { url: fullUrl, message: error.message });
            throw error;
        }
    }

    // ─── Helpers multipart ────────────────────────────────────────────────

    /**
     * Convierte un objeto plano a FormData.
     * Si prepend es true, agrega _method=PUT para Laravel.
     */
    _toFormData(data, { methodOverride } = {}) {
        const form = new FormData();
        if (methodOverride) form.append("_method", methodOverride);

        for (const [key, value] of Object.entries(data)) {
            if (value == null) continue;
            if (value instanceof Blob) form.append(key, value);
            else if (typeof value === "boolean") form.append(key, value ? "1" : "0");
            else if (typeof value === "object") form.append(key, JSON.stringify(value));
            else form.append(key, value);
        }
        return form;
    }

    async _multipart(method, url, formData) {
        const instance = this._getInstance();

        const response = await instance({
            method,
            url: `${this.resourcePath}${url}`,
            data: formData,
            // Forzar multipart: quitar el Content-Type "application/json" que
            // trae por defecto client.js, para que axios establezca el boundary.
            headers: { 'Content-Type': undefined },
            transformRequest: [(data) => data],
        });
        return response.data;
    }

    // ─── Helpers PDF ──────────────────────────────────────────────────────

    /**
     * Convierte un Blob a base64 (sin el prefijo data:...).
     */
    _blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                const base64 = typeof result === 'string' && result.includes(',')
                    ? result.split(',')[1]
                    : result;
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Guarda un blob en la carpeta Descargas/NOA del dispositivo mediante el
     * plugin nativo `NoaFiles`. Solo en plataforma nativa: en web el navegador
     * gestiona su propia descarga y no tiene sentido escribir en disco.
     *
     * @param {Blob} blob - Contenido del archivo.
     * @param {string} filename - Nombre con el que queda guardado.
     * @param {string} mime - Tipo MIME del archivo.
     * @returns {Promise<boolean>} true si el archivo ya está en el dispositivo.
     */
    async _guardarEnDescargas(blob, filename, mime) {
        if (!Capacitor.isNativePlatform()) return false;
        try {
            const data = await this._blobToBase64(blob);
            const guardado = await NoaFiles.saveToDownloads({ name: filename, data, mime });
            logger.info(`[_guardarEnDescargas] Guardado en ${guardado?.path ?? filename}`);
            return true;
        } catch (err) {
            // Respeta el peor caso primero: si Descargas no está disponible
            // (permiso denegado, almacenamiento lleno…) el llamador usa su
            // respaldo en lugar de dejar el archivo perdido.
            logger.warn('[_guardarEnDescargas] No se pudo guardar en Descargas:', err);
            return false;
        }
    }

    /**
     * Respaldo de las descargas nativas: escribe en la caché de la app y abre
     * el diálogo nativo para abrir o compartir el archivo.
     * Relanza los errores (incluida la cancelación) para que el llamador decida.
     */
    async _compartirEnCache(blob, filename, dialogTitle) {
        const base64Data = await this._blobToBase64(blob);
        await Filesystem.writeFile({
            path: filename,
            data: base64Data,
            directory: Directory.Cache,
            recursive: true,
        });
        const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
        await Share.share({
            title: filename,
            url: uri,
            dialogTitle,
        });
    }

    _esCancelDeShare(err) {
        return !!(err?.message?.includes('Share canceled') || err?.errorMessage?.includes('canceled'));
    }

    /**
     * Helper genérico para visualizar/descargar archivos PDF.
     * Devuelve el estado de la descarga (`guardado` | `compartido` |
     * `cancelado` | `fallido` | `web`) para que el llamador avise con verdad.
     * - Web: abre el PDF en una nueva pestaña.
     * - Android/iOS: guarda en Descargas/NOA y, si no es posible, en caché con
     *   el diálogo nativo (Share API).
     */
    async _downloadPdf(url, filename = 'documento.pdf') {
        const instance = this._getInstance();
        const fullUrl = url.startsWith('http') ? url : `${this.resourcePath}${url}`;
        const cleanFileName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

        let response;
        try {
            response = await instance.get(fullUrl, { responseType: 'blob' });
        } catch (err) {
            throw await this._blobErrorToMessage(err);
        }
        const blob = new Blob([response.data], { type: 'application/pdf' });

        // ─── PLATAFORMA NATIVA (Android + iOS) ────────────────────────────
        if (Capacitor.isNativePlatform()) {
            // 1) Descarga directa: el archivo queda en Descargas/NOA.
            if (await this._guardarEnDescargas(blob, cleanFileName, 'application/pdf')) return 'guardado';

            // 2) Respaldo: caché + abrir/compartir con la app nativa.
            try {
                await this._compartirEnCache(blob, cleanFileName, 'Abrir o compartir PDF');
                return 'compartido';
            } catch (err) {
                logger.warn('[_downloadPdf] Error abriendo PDF nativo:', err);
                // El usuario cerró el diálogo: no hay nada que avisar
                if (this._esCancelDeShare(err)) return 'cancelado';
                // Aviso de error (carga diferida); el llamador ve `fallido`
                // y no inventa un éxito.
                const { toast } = await import("@utils/toast.js");
                await toast('Error al abrir PDF', 'No se pudo guardar ni abrir el archivo PDF. Asegúrese de tener una app lectora de PDFs instalada.', 'error');
                return 'fallido';
            }
        }

        // ─── NAVEGADOR WEB ────────────────────────────────────────────────
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.target = '_blank';
        link.download = cleanFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        return 'web';
    }

    /**
     * Descarga un archivo Excel: en el navegador con el enlace habitual y en
     * Android guardándolo en Descargas/NOA (o compartiéndolo desde caché si
     * Descargas no está disponible). Devuelve el mismo estado que `_downloadPdf`.
     */
    async _downloadExcel(url, filename = 'reporte.xlsx') {
        const instance = this._getInstance();
        const fullUrl = url.startsWith('http') ? url : `${this.resourcePath}${url}`;
        let response;
        try {
            response = await instance.get(fullUrl, { responseType: 'blob' });
        } catch (err) {
            throw await this._blobErrorToMessage(err);
        }
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        if (Capacitor.isNativePlatform()) {
            const mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            if (await this._guardarEnDescargas(blob, filename, mime)) return 'guardado';
            try {
                await this._compartirEnCache(blob, filename, 'Abrir o compartir reporte');
                return 'compartido';
            } catch (err) {
                if (this._esCancelDeShare(err)) return 'cancelado';
                logger.warn('[_downloadExcel] No se pudo guardar ni compartir el Excel:', err);
                // En la WebView `link.click()` no guarda nada: no se finge éxito.
                const { toast } = await import("@utils/toast.js");
                await toast('Error al descargar', 'No se pudo guardar el archivo en el dispositivo. Inténtalo de nuevo.', 'error');
                return 'fallido';
            }
        }

        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        return 'web';
    }

    /**
     * Convierte un error blob del backend en un Error con mensaje legible.
     * Maneja respuestas inesperadas (como errores de servidor HTML) que no son PDFs.
     */
    async _blobErrorToMessage(err) {
        try {
            const data = err?.response?.data;
            if (data instanceof Blob) {
                const texto = await data.text();
                // Filtrar mensajes que no son errores de PDF (ej. propiedades CSS aleatorias)
                if (texto && texto.length < 500) {
                    const textoLimpo = texto.trim();
                    // Evitar mostrar propiedades CSS u otros ruidos del servidor como mensaje de error
                    const patronesNoValidos = [
                        /object.fit/i,
                        /not a recognized CSS property/i,
                    ];
                    const esMensajeNoValido = patronesNoValidos.some(p => p.test(textoLimpo));
                    if (!esMensajeNoValido) {
                        try {
                            const json = JSON.parse(textoLimpo);
                            const msg = json?.message || json?.error;
                            if (msg) {
                                const e = new Error(msg);
                                e.response = err.response;
                                return e;
                            }
                        } catch {
                            // Si no es JSON válido, usar el texto crudo (pero ya filtrado)
                            const e = new Error(textoLimpo);
                            e.response = err.response;
                            return e;
                        }
                    }
                }
                // Si el mensaje es inválido o ocurrió un error, intentar parseo JSON completo
                try {
                    const json = JSON.parse(texto || '');
                    const msg = json?.message || json?.error;
                    if (msg) {
                        const e = new Error(msg);
                        e.response = err.response;
                        return e;
                    }
                } catch {
                    // Ignorar y caer al error original
                }
            }
        } catch {
            // cae al error original
        }
        return err;
    }

    // ─── CRUD base ────────────────────────────────────────────────────────

    async list(params = {}, config = {}) {
        this._checkPermission("read");
        return this._request("GET", "", { params, config });
    }

    async create(data, config = {}) {
        this._checkPermission("create");
        return this._request("POST", "", { data, config });
    }
}