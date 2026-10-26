import { describe, it, expect } from 'vitest';
import {
    paginaDestino,
    esDeEstosConductores,
    uuidsDelConductor,
    esParaSoloCerradas,
    coincideBusqueda,
    filtrarPlanillas,
    mensajeDescarga,
} from '../hooks/useServiceList.js';

describe('paginaDestino', () => {
    it('traduce el evento de PrimeVue (page en base 0)', () => {
        expect(paginaDestino({ first: 20, rows: 10, page: 2 })).toBe(3);
        expect(paginaDestino({ first: 0, rows: 10, page: 0 })).toBe(1);
    });

    it('acepta los botones móviles que solo envían page y rows', () => {
        expect(paginaDestino({ page: 1, rows: 10 })).toBe(2);
        expect(paginaDestino({ page: 0, rows: 10 })).toBe(1);
    });

    it('si page viene ausente calcula desde first', () => {
        expect(paginaDestino({ first: 40, rows: 25 })).toBe(2);
        expect(paginaDestino({ first: 24, rows: 25 })).toBe(1);
    });

    it('con rows inválido usa las filas del store', () => {
        expect(paginaDestino({ first: 10, rows: 0 }, 10)).toBe(2);
        expect(paginaDestino({ first: 10 }, 10)).toBe(2);
    });

    it('ante un evento roto devuelve null en vez de NaN o la página 1', () => {
        expect(paginaDestino()).toBeNull();
        expect(paginaDestino(null)).toBeNull();
        expect(paginaDestino('página 2')).toBeNull();
        expect(paginaDestino({})).toBeNull();
        expect(paginaDestino({ first: 'x', rows: 10 })).toBeNull();
        expect(paginaDestino({ page: 'x', rows: 10 })).toBeNull();
        expect(paginaDestino({ first: -10, rows: 10 })).toBeNull();
        expect(paginaDestino({ first: 10 }, 0)).toBeNull();
    });
});

describe('uuidsDelConductor', () => {
    const empresa = { uuid: 'empresa-1', third_party_uuid: 'emp-1' };

    it('junta el conductor, el tercero del usuario y el de la empresa activa', () => {
        expect(uuidsDelConductor({
            company_uuid: 'empresa-1',
            uuid_driver: 'cond-1',
            third_party_uuid: 'afiliado-1',
            companies: [empresa, { uuid: 'empresa-2', third_party_uuid: 'otra-empresa' }],
        })).toEqual(['cond-1', 'afiliado-1', 'emp-1']);
    });

    it('sirve cuando la sesión no trae uuid_driver', () => {
        expect(uuidsDelConductor({
            company_uuid: 'empresa-1',
            uuid_driver: null,
            third_party_uuid: null,
            companies: [empresa],
        })).toEqual(['emp-1']);
    });

    it('no repite UUIDs ni toma el de una empresa distinta', () => {
        expect(uuidsDelConductor({
            company_uuid: 'empresa-1',
            uuid_driver: 'cond-1',
            third_party_uuid: 'cond-1',
            companies: [empresa, { uuid: 'empresa-2', third_party_uuid: 'empresa-2' }],
        })).toEqual(['cond-1', 'emp-1']);
    });

    it('sin sesión devuelve lista vacía en vez de romperse', () => {
        expect(uuidsDelConductor(null)).toEqual([]);
        expect(uuidsDelConductor({})).toEqual([]);
        expect(uuidsDelConductor({ uuid_driver: '', third_party_uuid: null })).toEqual([]);
    });
});

describe('esDeEstosConductores', () => {
    const planilla = { internal_control: { third_party_uuid: 'cond-1' } };

    it('coincide con el conductor de la hoja', () => {
        expect(esDeEstosConductores(planilla, ['cond-1'])).toBe(true);
    });

    it('acepta la lista conductor + afiliado', () => {
        expect(esDeEstosConductores(planilla, ['afiliado-1', 'cond-1'])).toBe(true);
    });

    it('rechaza la hoja de otro conductor', () => {
        expect(esDeEstosConductores(planilla, ['cond-2'])).toBe(false);
    });

    it('una hoja sin conductor no se atribuye a nadie', () => {
        expect(esDeEstosConductores({ internal_control: {} }, ['cond-1'])).toBe(false);
        expect(esDeEstosConductores({}, ['cond-1'])).toBe(false);
        expect(esDeEstosConductores({ internal_control: { third_party_uuid: '' } }, ['cond-1'])).toBe(false);
    });

    it('sin identidad de conductor no se muestra nada', () => {
        expect(esDeEstosConductores(planilla, [])).toBe(false);
        expect(esDeEstosConductores(planilla, null)).toBe(false);
        expect(esDeEstosConductores(planilla, undefined)).toBe(false);
    });

    it('acepta la hoja cuando el conductor está en uno de sus días hijos', () => {
        const multiDia = {
            internal_control: { third_party_uuid: 'cond-2' },
            children: [
                { internal_control: { third_party_uuid: 'cond-2' } },
                { internal_control: { third_party_uuid: 'cond-1' } },
            ],
        };
        expect(esDeEstosConductores(multiDia, ['cond-1'])).toBe(true);
    });

    it('la hoja sin control propio ni de sus hijos sigue sin atribuirse', () => {
        expect(esDeEstosConductores({ children: [{ internal_control: null }, {}] }, ['cond-1'])).toBe(false);
        expect(esDeEstosConductores({ children: 'roto' }, ['cond-1'])).toBe(false);
    });
});

describe('esParaSoloCerradas', () => {
    it('un solo día cerrado entra', () => {
        expect(esParaSoloCerradas({ is_active: false, children: [] })).toBe(true);
    });

    it('un solo día abierto queda fuera', () => {
        expect(esParaSoloCerradas({ is_active: true, children: [] })).toBe(false);
    });

    it('multi-día entra si al menos un hijo está cerrado', () => {
        expect(esParaSoloCerradas({ is_active: true, children: [{ is_active: true }, { is_active: false }] })).toBe(true);
    });

    it('multi-día con todos los hijos abiertos queda fuera aunque el padre esté cerrado', () => {
        // Regla del backend: el padre cerrado con hijos abiertos no cuenta.
        expect(esParaSoloCerradas({ is_active: false, children: [{ is_active: true }] })).toBe(false);
    });

    it('sin hijos y sin datos de estado queda fuera', () => {
        expect(esParaSoloCerradas({})).toBe(false);
        expect(esParaSoloCerradas(null)).toBe(false);
    });
});

describe('coincideBusqueda', () => {
    const planilla = {
        official_name_and_surname: 'JUAN PEREZ',
        daily_route: 'CALI - BUGA',
        vehicle_license_plate: 'ABC123',
        project: { project_name: 'PROYECTO NORTE' },
    };

    it('encuentra por conductor, ruta, placa y proyecto', () => {
        expect(coincideBusqueda(planilla, 'juan')).toBe(true);
        expect(coincideBusqueda(planilla, 'buga')).toBe(true);
        expect(coincideBusqueda(planilla, 'abc123')).toBe(true);
        expect(coincideBusqueda(planilla, 'norte')).toBe(true);
    });

    it('es insensible a mayúsculas y a los espacios del extremo', () => {
        expect(coincideBusqueda(planilla, '  JuaN ')).toBe(true);
    });

    it('con texto vacío no filtra', () => {
        expect(coincideBusqueda(planilla, '')).toBe(true);
        expect(coincideBusqueda(planilla, '   ')).toBe(true);
        expect(coincideBusqueda(planilla, undefined)).toBe(true);
    });

    it('si no coincide no pasa', () => {
        expect(coincideBusqueda(planilla, 'MANAUS')).toBe(false);
    });

    it('una planilla incompleta no revienta la búsqueda', () => {
        expect(coincideBusqueda({}, 'cualquier cosa')).toBe(false);
        expect(coincideBusqueda(null, 'x')).toBe(false);
        expect(coincideBusqueda({ driver_name: null }, 'x')).toBe(false);
    });
});

describe('filtrarPlanillas', () => {
    const base = (extra) => ({
        uuid: extra.uuid,
        internal_control: { third_party_uuid: extra.conductor },
        project_uuid: extra.proyecto ?? 'proj-1',
        daily_route: extra.ruta ?? 'CALI - POPAYAN',
        vehicle_license_plate: extra.placa ?? 'AAA111',
        is_active: extra.abierta === true,
        children: [],
        ...extra.campos,
    });

    const planillas = [
        base({ uuid: 'a', conductor: 'cond-1', placa: 'AAA111' }),
        base({ uuid: 'b', conductor: 'cond-2', placa: 'BBB222' }),
        base({ uuid: 'c', conductor: 'cond-1', proyecto: 'proj-2', placa: 'CCC333' }),
        base({ uuid: 'd', conductor: null, placa: 'DDD444' }),
    ];

    it('deja solo las planillas del conductor', () => {
        const res = filtrarPlanillas(planillas, { uuidsConductor: ['cond-1'] });
        expect(res.map((p) => p.uuid)).toEqual(['a', 'c']);
    });

    it('combina con proyecto, búsqueda y solo cerradas', () => {
        const res = filtrarPlanillas(planillas, {
            uuidsConductor: ['cond-1'],
            projectUuid: 'proj-2',
            busqueda: 'ccc',
            soloCerradas: true,
        });
        expect(res.map((p) => p.uuid)).toEqual(['c']);
    });

    it('con identidad de conductor ausente no devuelve nada', () => {
        expect(filtrarPlanillas(planillas, { uuidsConductor: [] })).toEqual([]);
        expect(filtrarPlanillas(planillas, { uuidsConductor: undefined })).toEqual([]);
    });

    it('con "solo cerradas" descarta los días aún abiertos', () => {
        const lista = [
            base({ uuid: 'ab', conductor: 'cond-1', abierta: true }),
            base({ uuid: 'ce', conductor: 'cond-1' }),
        ];
        const conFiltro = filtrarPlanillas(lista, { uuidsConductor: ['cond-1'], soloCerradas: true });
        expect(conFiltro.map((p) => p.uuid)).toEqual(['ce']);
        // Sin el filtro siguen estando las dos: la regla no se aplica sola.
        expect(filtrarPlanillas(lista, { uuidsConductor: ['cond-1'] })).toHaveLength(2);
    });

    it('un proyecto que no coincide devuelve vacío', () => {
        expect(filtrarPlanillas(planillas, { uuidsConductor: ['cond-1'], projectUuid: 'proj-99' })).toEqual([]);
        // La placa de un proyecto ajeno tampoco se cuela por la búsqueda.
        expect(filtrarPlanillas(planillas, { uuidsConductor: ['cond-1'], projectUuid: 'proj-99', busqueda: 'aaa111' })).toEqual([]);
    });

    it('con una respuesta vacía o mal formada devuelve lista', () => {
        expect(filtrarPlanillas([], { uuidsConductor: ['cond-1'] })).toEqual([]);
        expect(filtrarPlanillas(null, { uuidsConductor: ['cond-1'] })).toEqual([]);
        expect(filtrarPlanillas(undefined, {})).toEqual([]);
    });
});

describe('mensajeDescarga', () => {
    it('describe lo que de verdad ocurrió', () => {
        expect(mensajeDescarga('PDF diario', 'guardado')).toBe('PDF diario guardado en tu dispositivo');
        expect(mensajeDescarga('PDF diario', 'compartido')).toBe('PDF diario listo para abrir o compartir');
        expect(mensajeDescarga('PDF diario', 'web')).toBe('PDF diario descargado');
    });

    it('no avisa éxito cuando la descarga se canceló o falló', () => {
        expect(mensajeDescarga('PDF diario', 'cancelado')).toBeNull();
        expect(mensajeDescarga('Reporte mensual (PDF)', 'fallido')).toBeNull();
    });

    it('con un estado desconocido avisa con el texto genérico', () => {
        expect(mensajeDescarga('Reporte', undefined)).toBe('Reporte descargado');
        expect(mensajeDescarga('Reporte', '')).toBe('Reporte descargado');
        expect(mensajeDescarga('Reporte', 'otro')).toBe('Reporte descargado');
    });

    it('con etiqueta vacía no revienta', () => {
        expect(mensajeDescarga('', 'guardado')).toBe(' guardado en tu dispositivo');
        expect(mensajeDescarga(undefined, null)).toBe('undefined descargado');
    });
});
