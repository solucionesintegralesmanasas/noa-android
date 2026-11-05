import { describe, expect, it } from 'vitest';
import { fechaHoyColombia } from '../utils/fechaColombia.js';

describe('fechaHoyColombia', () => {
    it('devuelve el día calendario de Bogotá, no el del instante en UTC', () => {
        // 2026-11-06T01:00:00Z = 2026-11-05 20:00 en Bogotá (UTC-5, sin DST).
        expect(fechaHoyColombia(new Date('2026-11-06T01:00:00Z'))).toBe('2026-11-05');
    });

    it('conserva la tarde/noche de Bogotá en su mismo día', () => {
        // 2026-11-05T23:00:00Z = 2026-11-05 18:00 en Bogotá.
        expect(fechaHoyColombia(new Date('2026-11-05T23:00:00Z'))).toBe('2026-11-05');
    });

    it('cambia de día al cruzar la medianoche de Bogotá', () => {
        // 2026-11-06T05:00:00Z = 2026-11-06 00:00 en Bogotá.
        expect(fechaHoyColombia(new Date('2026-11-06T05:00:00Z'))).toBe('2026-11-06');
    });
});
