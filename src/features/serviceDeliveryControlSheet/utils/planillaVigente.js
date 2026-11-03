/**
 * Reglas del día vigente para las hojas de control de servicio.
 *
 * Solo la planilla del día calendario actual se puede diligenciar: los días
 * anteriores quedan bloqueados aunque sigan abiertos y no se arrastran a la
 * jornada de hoy. La fecha llega como `YYYY-MM-DD` para comparar sin zonas
 * horarias, y `hoy` se recibe como parámetro para poder probar la regla sin
 * depender del reloj del equipo.
 */

/** Fecha (YYYY-MM-DD) de una planilla diaria. */
export const fechaDeDia = (planilla) => String(planilla?.service_date || '').substring(0, 10);

/** Una planilla está abierta mientras no se haya cerrado. */
export const estaAbierta = (planilla) => planilla?.is_active == 1 || planilla?.is_active === true;

/** ¿La planilla corresponde al día vigente? */
export const esDiaVigente = (planilla, hoy) => {
    const fecha = fechaDeDia(planilla);
    return !!fecha && fecha === hoy;
};

/** ¿La planilla es de un día anterior al vigente? */
export const esDiaVencido = (planilla, hoy) => {
    const fecha = fechaDeDia(planilla);
    return !!fecha && fecha < hoy;
};

/**
 * Estado visible del desglose diario: distingue el día de hoy del resto y
 * marca como vencidos los días pasados que quedaron sin cerrar.
 */
export const estadoDiaPlanilla = (planilla, hoy) => {
    if (!estaAbierta(planilla)) {
        return { clase: 'bg-secondary bg-opacity-25 text-muted', texto: 'Cerrado' };
    }
    if (esDiaVencido(planilla, hoy)) {
        return { clase: 'bg-warning text-dark', texto: 'Día vencido' };
    }
    if (esDiaVigente(planilla, hoy)) {
        return { clase: 'bg-primary text-white', texto: 'Hoy' };
    }
    return { clase: 'bg-success text-white', texto: 'Pendiente / Abierto' };
};

/**
 * Única planilla operable: la hoja abierta del día vigente.
 *
 * - Sin hijos diarios, la propia hoja solo sirve si su fecha es hoy.
 * - Con hijos, se toma el hijo de hoy y solo si sigue abierto; los días
 *   anteriores abiertos se ignoran a propósito.
 *
 * @param {object|null} servicio Hoja padre (o única) seleccionada.
 * @param {Array<object>} dias Hijos diarios de la hoja.
 * @param {string} hoy Fecha vigente en formato `YYYY-MM-DD`.
 * @returns {object|null} Planilla operable o `null` si no hay la de hoy.
 */
export const seleccionarPlanillaVigente = (servicio, dias, hoy) => {
    if (!servicio) return null;
    const lista = Array.isArray(dias) ? dias : [];
    if (!lista.length) return esDiaVigente(servicio, hoy) ? servicio : null;
    const deHoy = lista.find((dia) => esDiaVigente(dia, hoy));
    return deHoy && estaAbierta(deHoy) ? deHoy : null;
};
