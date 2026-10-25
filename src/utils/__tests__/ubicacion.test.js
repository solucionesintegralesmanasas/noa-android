import { describe, it, expect } from 'vitest';
import {
    esErrorServiciosDesactivados,
    esErrorPermisoDenegado,
    CODIGO_SERVICIOS_DESACTIVADOS,
    CODIGO_PERMISO_DENEGADO,
} from '../ubicacion.js';

function errorConCodigo(message, code) {
    const error = new Error(message);
    error.code = code;
    return error;
}

describe('esErrorServiciosDesactivados', () => {
    it('reconoce el código del plugin de Capacitor', () => {
        const error = errorConCodigo('Algo distinto', CODIGO_SERVICIOS_DESACTIVADOS);
        expect(esErrorServiciosDesactivados(error)).toBe(true);
    });

    it('reconoce el mensaje en inglés del plugin aunque no traiga código', () => {
        expect(esErrorServiciosDesactivados(new Error('Location services are not enabled.'))).toBe(true);
    });

    it('reconoce el texto en español', () => {
        expect(esErrorServiciosDesactivados(new Error('La ubicación del teléfono está desactivada.'))).toBe(true);
    });

    it('no confunde un permiso denegado con servicios apagados', () => {
        const error = errorConCodigo('Location permission request was denied.', CODIGO_PERMISO_DENEGADO);
        expect(esErrorServiciosDesactivados(error)).toBe(false);
    });

    it('no reacciona a un error de red ni a un error vacío', () => {
        expect(esErrorServiciosDesactivados(new Error('Network Error'))).toBe(false);
        expect(esErrorServiciosDesactivados(null)).toBe(false);
        expect(esErrorServiciosDesactivados(undefined)).toBe(false);
        expect(esErrorServiciosDesactivados({})).toBe(false);
    });

    it('acepta errores lanzados como texto', () => {
        expect(esErrorServiciosDesactivados('Location services are not enabled.')).toBe(true);
    });
});

describe('esErrorPermisoDenegado', () => {
    it('reconoce el código de permiso denegado', () => {
        const error = errorConCodigo('x', CODIGO_PERMISO_DENEGADO);
        expect(esErrorPermisoDenegado(error)).toBe(true);
    });

    it('reconoce el mensaje del plugin', () => {
        expect(esErrorPermisoDenegado(new Error('Location permission request was denied.'))).toBe(true);
    });

    it('no marca como denegado un GPS apagado', () => {
        const error = errorConCodigo('Location services are not enabled.', CODIGO_SERVICIOS_DESACTIVADOS);
        expect(esErrorPermisoDenegado(error)).toBe(false);
    });

    it('ante un error sin datos devuelve false', () => {
        expect(esErrorPermisoDenegado(null)).toBe(false);
        expect(esErrorPermisoDenegado({})).toBe(false);
    });
});
