/**
 * "Hoy" en el calendario de Colombia (America/Bogota), independiente de la zona
 * horaria o del reloj del equipo. Coincide con `Carbon::today()` del backend
 * (configurado en America/Bogota), para que el móvil y el servidor decidan igual
 * qué planilla es la del día vigente y no se rechace la de hoy como vencida.
 *
 * @param {Date} [ahora=new Date()] Instante de referencia (inyectable en pruebas).
 * @returns {string} Fecha en formato `YYYY-MM-DD`.
 */
export const fechaHoyColombia = (ahora = new Date()) => {
    const partes = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(ahora);
    const valor = (tipo) => partes.find((p) => p.type === tipo)?.value ?? '';
    return `${valor('year')}-${valor('month')}-${valor('day')}`;
};
