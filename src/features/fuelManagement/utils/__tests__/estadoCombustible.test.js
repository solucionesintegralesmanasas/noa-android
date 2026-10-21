import { describe, it, expect } from 'vitest';
import {
    formatearKm,
    progresoAlcance,
    textoRestante,
    filtrarEstado,
} from '../estadoCombustible.js';

describe('formatearKm', () => {
    it('formatea números y deja el separador de miles colombiano', () => {
        expect(formatearKm(1234.6)).toBe('1.235');
    });
    it('devuelve raya para valores ausentes o vacíos', () => {
        expect(formatearKm(null)).toBe('—');
        expect(formatearKm(undefined)).toBe('—');
        expect(formatearKm('')).toBe('—');
    });
    it('devuelve raya para un valor no numérico en vez de NaN', () => {
        expect(formatearKm('sin dato')).toBe('—');
    });
});

describe('progresoAlcance', () => {
    it('usa el porcentaje de la API', () => {
        expect(progresoAlcance({ percentage: 42.6 })).toBe(42.6);
    });
    it('acota por encima de 100 y por debajo de 0', () => {
        expect(progresoAlcance({ percentage: 160 })).toBe(100);
        expect(progresoAlcance({ percentage: -8 })).toBe(0);
    });
    it('cae a 0 sin item o con un valor inválido', () => {
        expect(progresoAlcance(null)).toBe(0);
        expect(progresoAlcance({ percentage: 'NaN' })).toBe(0);
    });
});

describe('textoRestante', () => {
    it('muestra los kilómetros que faltan', () => {
        expect(textoRestante({ km_remaining: 120.4 })).toBe('120 km');
    });
    it('marca el exceso con valor absoluto', () => {
        expect(textoRestante({ km_remaining: -35 })).toBe('Excedido 35 km');
    });
    it('muestra 0 km cuando se agotó exactamente el alcance', () => {
        expect(textoRestante({ km_remaining: 0 })).toBe('0 km');
    });
    it('devuelve raya sin dato o con texto inválido', () => {
        expect(textoRestante({})).toBe('—');
        expect(textoRestante({ km_remaining: 'n/d' })).toBe('—');
        expect(textoRestante(null)).toBe('—');
    });
});

const flota = [
    { vehicle_license_plate: 'ABC123', internal_number: '10', status: 'EXCEDIDO', projects: [{ uuid: 'p1', name: 'Ruta Norte' }] },
    { vehicle_license_plate: 'XYZ789', internal_number: '20', status: 'OK', projects: [] },
    { vehicle_license_plate: 'DEF456', internal_number: '30', status: 'SIN_TANQUEO', projects: [{ uuid: 'p2', name: 'Ruta Sur' }] },
    { vehicle_license_plate: 'GHI000', internal_number: '40', status: 'PROXIMO', projects: [{ uuid: 'p1', name: 'Ruta Norte' }] },
];

describe('filtrarEstado', () => {
    it('sin filtros devuelve la flota completa', () => {
        expect(filtrarEstado(flota)).toHaveLength(4);
    });
    it('busca por placa o número interno sin distinguir mayúsculas', () => {
        expect(filtrarEstado(flota, { busqueda: 'abc' }).map((i) => i.internal_number)).toEqual(['10']);
        expect(filtrarEstado(flota, { busqueda: ' 40 ' }).map((i) => i.vehicle_license_plate)).toEqual(['GHI000']);
    });
    it('filtra por proyecto y por "sin proyecto"', () => {
        expect(filtrarEstado(flota, { proyecto: 'p1' })).toHaveLength(2);
        expect(filtrarEstado(flota, { proyecto: 'sin_proyecto' }).map((i) => i.internal_number)).toEqual(['20']);
    });
    it('excluye los vehículos sin tanqueo en "con datos"', () => {
        expect(filtrarEstado(flota, { clasificacion: 'con_datos' })).toHaveLength(3);
    });
    it('en "alertas" solo deja excedidos y próximos', () => {
        expect(filtrarEstado(flota, { clasificacion: 'alertas' }).map((i) => i.status)).toEqual(['EXCEDIDO', 'PROXIMO']);
    });
    it('combina búsqueda y clasificación', () => {
        expect(filtrarEstado(flota, { busqueda: 'ruta', clasificacion: 'alertas' })).toHaveLength(0);
        expect(filtrarEstado(flota, { busqueda: 'DEF', clasificacion: 'alertas' })).toHaveLength(0);
    });
    it('tolera listas o elementos vacíos sin lanzar', () => {
        expect(filtrarEstado(null)).toEqual([]);
        expect(filtrarEstado([null, undefined], { busqueda: 'x' })).toEqual([]);
    });
});
