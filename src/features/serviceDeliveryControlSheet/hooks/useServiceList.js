/**
 * Lógica compartida del listado de Hojas de Control de Servicio.
 * Solo días cerrados cuando soloCerradas es true.
 */
export function formatRango(fecha) {
    if (!fecha) return '';
    const texto = String(fecha).trim();
    const m = texto.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return texto;
    return `${m[3]}/${m[2]}/${m[1]}`;
}

export function diasHijos(data, soloCerradas = true) {
    const raw = data?.children ?? data?.dias ?? [];
    const hijos = Array.isArray(raw) ? [...raw] : Object.values(raw ?? {});
    const l = hijos
        .filter((h) => h && (h.uuid || h.service_date))
        .sort((a, b) => String(a.service_date || '').localeCompare(String(b.service_date || '')));
    return soloCerradas ? l.filter((x) => !(x.is_active == 1 || x.is_active === true)) : l;
}

export function recorridosCount(data) {
    if (Array.isArray(data.routes)) return data.routes.length;
    if (data.routes_total) return Number(data.routes_total);
    return data.daily_route ? 1 : 0;
}

export function recorridosTexto(data) {
    if (Array.isArray(data.routes) && data.routes.length) {
        return data.routes.map((r) => `${r.origin || ''} - ${r.destination || ''}`.trim().replace(/^- | -$/g, '')).filter(Boolean).join(' · ');
    }
    return data.daily_route || '-';
}

export function esCerrado(data) {
    return !(data?.is_active == 1 || data?.is_active === true);
}

/**
 * Página destino de un evento de paginación.
 *
 * PrimeVue emite `{ first, rows, page }` con `page` en base 0; los botones
 * "Anterior/Siguiente" de la vista móvil emiten `{ page, rows }` también en
 * base 0. Acepta ambos formatos y devuelve la página (base 1) o `null` cuando
 * el evento no da para calcularla: con datos rotos no se navega, en lugar de
 * acabar en la página 1 o en `NaN`.
 *
 * @param {Object} evento - Evento de PrimeVue o de los botones móviles.
 * @param {number} filasActuales - Filas por página del store (respaldo).
 * @returns {number|null}
 */
export function paginaDestino(evento = {}, filasActuales = 10) {
    if (!evento || typeof evento !== 'object') return null;
    const filas = Number(evento.rows) > 0 ? Number(evento.rows) : Number(filasActuales);
    if (!Number.isFinite(filas) || filas <= 0) return null;

    if (evento.page !== undefined && evento.page !== null) {
        const destino = Number(evento.page);
        if (!Number.isFinite(destino) || destino < 0) return null;
        return destino + 1;
    }

    const first = Number(evento.first);
    if (!Number.isFinite(first) || first < 0) return null;
    return Math.floor(first / filas) + 1;
}

/**
 * true si la planilla pertenece a alguno de los conductores indicados.
 * La relación `internal_control.third_party_uuid` es el conductor de la hoja;
 * sin ese dato la planilla no se atribuye a nadie (nunca se muestra "por si acaso").
 *
 * @param {Object} planilla - Fila del listado o del catálogo.
 * @param {string[]} uuidsConductor - UUID del conductor y, si aplica, del afiliado.
 * @returns {boolean}
 */
export function esDeEstosConductores(planilla, uuidsConductor) {
    if (!Array.isArray(uuidsConductor) || !uuidsConductor.length) return false;
    const conductor = planilla?.internal_control?.third_party_uuid || '';
    return !!conductor && uuidsConductor.includes(conductor);
}

/**
 * Reproduce la regla del backend para "solo cerradas"
 * (`ServiceDeliveryControlSheetService::getAllServiceDeliveryControlSheetsWithPagination`):
 * padre cerrado sin hijos abiertos, o con al menos un hijo cerrado.
 *
 * Existe porque el filtro del conductor se aplica en el cliente sobre
 * `listAll()`, que no recibe ese parámetro.
 *
 * @param {Object} planilla
 * @returns {boolean}
 */
export function esParaSoloCerradas(planilla) {
    if (!planilla || typeof planilla !== 'object') return false;
    const hijos = Array.isArray(planilla?.children) ? planilla.children : [];
    // Un estado desconocido (sin `is_active`) nunca se afirma como cerrado:
    // coincide con el backend, que exige `is_active = false` explícito.
    const cerrado = (x) => x?.is_active === false || x?.is_active === 0 || x?.is_active === '0';
    const padreCerradoYSinHijosAbiertos = cerrado(planilla) && !hijos.some((h) => !cerrado(h));
    const algunHijoCerrado = hijos.some(cerrado);
    return padreCerradoYSinHijosAbiertos || algunHijoCerrado;
}

/**
 * Búsqueda local sobre lo visible en la tabla (conductor, ruta, placa y
 * proyecto). El `search` del servidor solo cubre responsable, ruta y proyecto,
 * así que este filtro añade la placa en vez de perderla.
 *
 * @param {Object} planilla
 * @param {string} texto - Texto libre del buscador.
 * @returns {boolean}
 */
export function coincideBusqueda(planilla, texto) {
    const consulta = String(texto ?? '').trim().toLowerCase();
    if (!consulta) return true;
    const campos = [
        planilla?.official_name_and_surname,
        planilla?.driver_name,
        planilla?.daily_route,
        planilla?.vehicle_license_plate,
        planilla?.project?.project_name,
    ];
    return campos.some((c) => typeof c === 'string' && c.toLowerCase().includes(consulta));
}

/**
 * Filtro combinado del modo conductor: solo sus planillas, más los filtros
 * que en el servidor irían en la query.
 *
 * @param {Array} planillas - Catálogo completo de la empresa (`listAll`).
 * @param {Object} filtros
 * @param {string[]} filtros.uuidsConductor
 * @param {string} [filtros.busqueda]
 * @param {string} [filtros.projectUuid]
 * @param {boolean} [filtros.soloCerradas]
 * @returns {Array}
 */
export function filtrarPlanillas(planillas, { uuidsConductor, busqueda = '', projectUuid = '', soloCerradas = false } = {}) {
    const lista = Array.isArray(planillas) ? planillas : [];
    return lista.filter((p) => esDeEstosConductores(p, uuidsConductor)
        && (!projectUuid || (p.project_uuid || p.project?.uuid) === projectUuid)
        && coincideBusqueda(p, busqueda)
        && (!soloCerradas || esParaSoloCerradas(p)));
}

/**
 * Texto del aviso de una descarga, según lo que de verdad ocurrió.
 *
 * `BaseService._downloadPdf`/`_downloadExcel` devuelven el estado:
 * - `guardado`: el archivo quedó en Descargas/NOA.
 * - `compartido`: se abrió el diálogo nativo para abrirlo o guardarlo.
 * - `web`: descarga normal del navegador.
 * - `cancelado`: el usuario cerró el diálogo (sin aviso de éxito).
 * - `fallido`: no se pudo guardar ni abrir y ya se mostró el aviso de error.
 *
 * Un éxito inventado es un error de peor caso primero: `null` significa
 * "no avises", no "di que salió bien".
 *
 * @param {string} etiqueta - Nombre humano del documento ("PDF diario").
 * @param {string} [estado] - Estado devuelto por la descarga.
 * @returns {string|null}
 */
export function mensajeDescarga(etiqueta, estado) {
    switch (estado) {
        case 'guardado': return `${etiqueta} guardado en tu dispositivo`;
        case 'compartido': return `${etiqueta} listo para abrir o compartir`;
        case 'web': return `${etiqueta} descargado`;
        case 'cancelado':
        case 'fallido': return null;
        default: return `${etiqueta} descargado`;
    }
}
