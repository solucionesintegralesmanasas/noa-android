import { describe, expect, it } from 'vitest';
import {
    estadoDiaPlanilla,
    esDiaVencido,
    esDiaVigente,
    fechaDeDia,
    seleccionarPlanillaVigente,
} from '../utils/planillaVigente.js';

const HOY = '2026-11-03';

const dia = (fecha, abierta = true) => ({
    uuid: `uuid-${fecha}`,
    service_date: fecha,
    is_active: abierta ? 1 : 0,
});

describe('planillaVigente', () => {
    it('extrae la fecha de una planilla aunque venga con hora', () => {
        expect(fechaDeDia({ service_date: '2026-11-03 00:00:00' })).toBe('2026-11-03');
        expect(fechaDeDia({ service_date: '2026-11-03' })).toBe('2026-11-03');
        expect(fechaDeDia(null)).toBe('');
    });

    it('distingue el día vigente del vencido', () => {
        expect(esDiaVigente(dia(HOY), HOY)).toBe(true);
        expect(esDiaVigente(dia('2026-11-02'), HOY)).toBe(false);
        expect(esDiaVencido(dia('2026-11-02'), HOY)).toBe(true);
        expect(esDiaVencido(dia(HOY), HOY)).toBe(false);
        expect(esDiaVencido(dia('2026-11-04'), HOY)).toBe(false);
    });

    it('marca el estado visible de cada día sin depender del color solo', () => {
        expect(estadoDiaPlanilla(dia(HOY), HOY)).toMatchObject({ texto: 'Hoy' });
        expect(estadoDiaPlanilla(dia('2026-11-02', true), HOY)).toMatchObject({ texto: 'Día vencido' });
        expect(estadoDiaPlanilla(dia('2026-11-02', false), HOY)).toMatchObject({ texto: 'Cerrado' });
        expect(estadoDiaPlanilla(dia('2026-11-04'), HOY)).toMatchObject({ texto: 'Pendiente / Abierto' });
    });

    it('elige la planilla de hoy aunque existan días anteriores abiertos', () => {
        const servicio = { uuid: 'padre', service_date: '2026-10-30' };
        const dias = [dia('2026-11-01'), dia('2026-11-02'), dia(HOY)];

        expect(seleccionarPlanillaVigente(servicio, dias, HOY)?.service_date).toBe(HOY);
    });

    it('no arrastra un día vencido cuando no hay planilla de hoy', () => {
        const servicio = { uuid: 'padre', service_date: '2026-10-30' };
        const dias = [dia('2026-11-01'), dia('2026-11-02')];

        expect(seleccionarPlanillaVigente(servicio, dias, HOY)).toBeNull();
    });

    it('no opera la planilla de hoy si ya está cerrada', () => {
        const servicio = { uuid: 'padre', service_date: '2026-10-30' };
        const dias = [dia('2026-11-02'), dia(HOY, false)];

        expect(seleccionarPlanillaVigente(servicio, dias, HOY)).toBeNull();
    });

    it('la hoja única solo se opera el día de su fecha', () => {
        expect(seleccionarPlanillaVigente(dia(HOY), [], HOY)?.service_date).toBe(HOY);
        expect(seleccionarPlanillaVigente(dia('2026-11-02'), [], HOY)).toBeNull();
        expect(seleccionarPlanillaVigente(null, [], HOY)).toBeNull();
    });

    it('sin datos no explota y no devuelve planilla', () => {
        expect(seleccionarPlanillaVigente(undefined, undefined, HOY)).toBeNull();
        expect(seleccionarPlanillaVigente({ uuid: 'x' }, null, HOY)).toBeNull();
    });
});
