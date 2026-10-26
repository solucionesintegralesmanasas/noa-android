import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('../services/serviceDeliveryControlSheet.service.js', () => ({
    default: {
        list: vi.fn(),
        listAll: vi.fn(),
        getFormOptions: vi.fn(),
        downloadDailyPdf: vi.fn(),
        downloadMonthlyPdf: vi.fn(),
        downloadReport: vi.fn(),
    },
}));
vi.mock('@utils/toast.js', () => ({ toast: vi.fn(async () => {}) }));
// El store lee la sesión desde `@store`; se sustituye por una fija para poder
// cambiar de rol/identidad entre pruebas sin tocar la app.
vi.mock('@store', () => ({
    usePermissionsStore: vi.fn(),
    useUserStore: vi.fn(),
}));

import serviceDeliveryControlSheetService from '../services/serviceDeliveryControlSheet.service.js';
import { toast } from '@utils/toast.js';
import { usePermissionsStore, useUserStore } from '@store';
import { useServiceDeliveryControlSheetStore } from '../store/serviceDeliveryControlSheet.store.js';

/** Fija la sesión: roles + UUIDs del usuario. */
function sesion({ roles = ['ADMIN_EMPRESA'], uuidDriver = null, thirdParty = null } = {}) {
    usePermissionsStore.mockReturnValue({ hasRole: (r) => roles.includes(r) });
    useUserStore.mockReturnValue({
        company_uuid: 'empresa-1',
        uuid_driver: uuidDriver,
        third_party_uuid: thirdParty,
    });
}

/** Respuesta con la misma forma que devuelve `BaseService` para un listado. */
function paginaServidor(filas, { total = 100, page = 1, perPage = 10 } = {}) {
    return { success: true, data: { data: filas, total, current_page: page, last_page: Math.ceil(total / perPage), per_page: perPage } };
}

const HOJA = (uuid, conductor) => ({
    uuid,
    internal_control: { third_party_uuid: conductor },
    project_uuid: 'proj-1',
    is_active: false,
    children: [],
});

describe('serviceDeliveryControlSheet store', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setActivePinia(createPinia());
        sesion();
    });

    describe('modo administrador (paginación del servidor)', () => {
        it('pide la página al servidor con sus filtros', async () => {
            serviceDeliveryControlSheetService.list.mockResolvedValue(paginaServidor([HOJA('a', 'cond-1')]));
            const store = useServiceDeliveryControlSheetStore();
            store.search = 'cali';
            await store.fetchItems();

            expect(serviceDeliveryControlSheetService.list).toHaveBeenCalledWith(expect.objectContaining({
                page: 1,
                per_page: 10,
                search: 'cali',
            }));
            expect(store.items).toHaveLength(1);
            expect(store.pagination.totalItems).toBe(100);
            expect(store.modoConductor).toBe(false);
        });

        it('una respuesta vacía deja la lista en blanco sin romperse', async () => {
            serviceDeliveryControlSheetService.list.mockResolvedValue({ success: true, data: null });
            const store = useServiceDeliveryControlSheetStore();
            await store.fetchItems();
            expect(store.items).toEqual([]);
            expect(store.pagination.totalItems).toBe(0);
        });

        it('un fallo de red se propaga con el aviso de error y loading apagado', async () => {
            serviceDeliveryControlSheetService.list.mockRejectedValue(new Error('Network Error'));
            const store = useServiceDeliveryControlSheetStore();
            await expect(store.fetchItems()).rejects.toThrow('Network Error');
            expect(store.error).toBe('Network Error');
            expect(store.loading).toBe(false);
            expect(toast).toHaveBeenCalledWith('Error', 'Network Error', 'error');
        });
    });

    describe('modo conductor (filtrado en el cliente)', () => {
        it('solo muestra las planillas de su vehículo y no usa el endpoint paginado', async () => {
            sesion({ roles: ['CONDUCTOR'], thirdParty: 'cond-1' });
            serviceDeliveryControlSheetService.listAll.mockResolvedValue({
                success: true,
                data: { data: [HOJA('a', 'cond-1'), HOJA('b', 'cond-2'), HOJA('c', 'cond-1')] },
            });
            const store = useServiceDeliveryControlSheetStore();
            await store.fetchItems();

            expect(serviceDeliveryControlSheetService.list).not.toHaveBeenCalled();
            expect(store.modoConductor).toBe(true);
            expect(store.items.map((i) => i.uuid)).toEqual(['a', 'c']);
            expect(store.pagination.totalItems).toBe(2);
        });

        it('sin identidad de conductor no se muestra ninguna fila', async () => {
            sesion({ roles: ['CONDUCTOR'] });
            serviceDeliveryControlSheetService.listAll.mockResolvedValue({
                success: true,
                data: { data: [HOJA('a', 'cond-1')] },
            });
            const store = useServiceDeliveryControlSheetStore();
            await store.fetchItems();

            expect(store.items).toEqual([]);
            expect(store.pagination.totalItems).toBe(0);
        });

        it('una respuesta mal formada no revienta el filtrado', async () => {
            sesion({ roles: ['CONDUCTOR'], thirdParty: 'cond-1' });
            serviceDeliveryControlSheetService.listAll.mockResolvedValue({ success: true, data: 'no es una lista' });
            const store = useServiceDeliveryControlSheetStore();
            await store.fetchItems();

            expect(store.items).toEqual([]);
            expect(store.pagination.totalItems).toBe(0);
        });

        it('la página fuera de rango se recorta a la última', async () => {
            sesion({ roles: ['CONDUCTOR'], thirdParty: 'cond-1' });
            serviceDeliveryControlSheetService.listAll.mockResolvedValue({
                success: true,
                data: { data: Array.from({ length: 15 }, (_, i) => HOJA(`p${i}`, 'cond-1')) },
            });
            const store = useServiceDeliveryControlSheetStore();
            await store.fetchItems();
            expect(store.pagination.totalPages).toBe(2);

            await store.setPage(99);
            expect(store.pagination.currentPage).toBe(2);
            expect(store.items).toHaveLength(5);
        });

        it('un cambio de sesión recarga el catálogo en vez de filtrar con los UUIDs del usuario anterior', async () => {
            sesion({ roles: ['CONDUCTOR'], thirdParty: 'cond-1' });
            serviceDeliveryControlSheetService.listAll.mockResolvedValue({
                success: true,
                data: { data: [HOJA('a', 'cond-1'), HOJA('b', 'cond-2')] },
            });
            const store = useServiceDeliveryControlSheetStore();
            await store.fetchItems();
            expect(store.items.map((i) => i.uuid)).toEqual(['a']);

            // Entra otro conductor sin recargar la pantalla.
            sesion({ roles: ['CONDUCTOR'], thirdParty: 'cond-2' });
            serviceDeliveryControlSheetService.listAll.mockResolvedValue({
                success: true,
                data: { data: [HOJA('a', 'cond-1'), HOJA('b', 'cond-2')] },
            });
            await store.setGlobalFilter('');

            expect(serviceDeliveryControlSheetService.listAll).toHaveBeenCalledTimes(2);
            expect(store.items.map((i) => i.uuid)).toEqual(['b']);
        });

        it('al cambiar a rol administrador se vuelve a la paginación del servidor', async () => {
            sesion({ roles: ['CONDUCTOR'], thirdParty: 'cond-1' });
            serviceDeliveryControlSheetService.listAll.mockResolvedValue({
                success: true,
                data: { data: [HOJA('a', 'cond-1')] },
            });
            const store = useServiceDeliveryControlSheetStore();
            await store.fetchItems();
            expect(store.modoConductor).toBe(true);

            sesion({ roles: ['ADMIN_EMPRESA'] });
            serviceDeliveryControlSheetService.list.mockResolvedValue(paginaServidor([HOJA('x', 'cond-9')]));
            await store.fetchItems();

            expect(store.modoConductor).toBe(false);
            expect(store.planillasConductor).toEqual([]);
            expect(serviceDeliveryControlSheetService.list).toHaveBeenCalledTimes(1);
            expect(store.items.map((i) => i.uuid)).toEqual(['x']);
        });
    });

    describe('filas por página', () => {
        it('cambia las filas y vuelve a la primera página', async () => {
            sesion({ roles: ['CONDUCTOR'], thirdParty: 'cond-1' });
            serviceDeliveryControlSheetService.listAll.mockResolvedValue({
                success: true,
                data: { data: Array.from({ length: 12 }, (_, i) => HOJA(`p${i}`, 'cond-1')) },
            });
            const store = useServiceDeliveryControlSheetStore();
            await store.fetchItems();
            await store.setPage(2);

            await store.setItemsPerPage(25);
            expect(store.pagination.itemsPerPage).toBe(25);
            expect(store.pagination.currentPage).toBe(1);
            expect(store.items).toHaveLength(12);
        });

        it('valores inválidos o repetidos no tocan la paginación', async () => {
            serviceDeliveryControlSheetService.list.mockResolvedValue(paginaServidor([HOJA('a', 'cond-1')]));
            const store = useServiceDeliveryControlSheetStore();
            await store.fetchItems();

            await store.setItemsPerPage(0);
            await store.setItemsPerPage(-5);
            await store.setItemsPerPage(2.5);
            await store.setItemsPerPage('veinte');
            await store.setItemsPerPage(null);
            expect(store.pagination.itemsPerPage).toBe(10);

            await store.setItemsPerPage(10);
            expect(store.pagination.itemsPerPage).toBe(10);
            expect(serviceDeliveryControlSheetService.list).toHaveBeenCalledTimes(1);
        });
    });

    describe('agrupación por proyecto', () => {
        const conProyecto = (uuid, project) => ({ ...HOJA(uuid, 'cond-1'), project });

        it('en modo administrador pide la agrupación al servidor y la omite al apagarla', async () => {
            serviceDeliveryControlSheetService.list.mockResolvedValue(paginaServidor([HOJA('a', 'cond-1')]));
            const store = useServiceDeliveryControlSheetStore();
            await store.fetchItems();
            expect(serviceDeliveryControlSheetService.list.mock.calls.at(-1)[0].agrupar_proyecto).toBe(true);

            serviceDeliveryControlSheetService.list.mockResolvedValue(paginaServidor([HOJA('a', 'cond-1')]));
            await store.setAgruparPorProyecto(false);
            expect(serviceDeliveryControlSheetService.list.mock.calls.at(-1)[0].agrupar_proyecto).toBeUndefined();
        });

        it('en modo conductor ordena por proyecto para que los grupos queden juntos', async () => {
            sesion({ roles: ['CONDUCTOR'], thirdParty: 'cond-1' });
            serviceDeliveryControlSheetService.listAll.mockResolvedValue({
                success: true,
                // Sin proyecto, con proyecto vacío y con nombre: los dos primeros
                // casos negativos no revientan y quedan agrupados al principio.
                data: { data: [conProyecto('z', { project_name: 'Zulu' }), conProyecto('a', { project_name: 'Alfa' }), conProyecto('b', { project_name: 'Alfa' }), conProyecto('s', undefined), conProyecto('e', {})] },
            });
            const store = useServiceDeliveryControlSheetStore();
            await store.fetchItems();

            expect(store.items.map((i) => i.uuid)).toEqual(['s', 'e', 'a', 'b', 'z']);
        });

        it('al apagar la agrupación se respeta el orden original del catálogo', async () => {
            sesion({ roles: ['CONDUCTOR'], thirdParty: 'cond-1' });
            serviceDeliveryControlSheetService.listAll.mockResolvedValue({
                success: true,
                data: { data: [conProyecto('z', { project_name: 'Zulu' }), conProyecto('a', { project_name: 'Alfa' })] },
            });
            const store = useServiceDeliveryControlSheetStore();
            store.agruparPorProyecto = false;
            await store.fetchItems();

            expect(store.items.map((i) => i.uuid)).toEqual(['z', 'a']);
        });

        it('al agrupar se vuelve a la primera página', async () => {
            sesion({ roles: ['CONDUCTOR'], thirdParty: 'cond-1' });
            serviceDeliveryControlSheetService.listAll.mockResolvedValue({
                success: true,
                data: { data: Array.from({ length: 12 }, (_, i) => conProyecto(`p${i}`, { project_name: 'Alfa' })) },
            });
            const store = useServiceDeliveryControlSheetStore();
            store.agruparPorProyecto = false;
            await store.fetchItems();
            await store.setPage(2);

            await store.setAgruparPorProyecto(true);
            expect(store.pagination.currentPage).toBe(1);
        });
    });

    describe('avisos de descarga', () => {
        it('avisa "guardado en tu dispositivo" cuando el archivo se guardó', async () => {
            serviceDeliveryControlSheetService.downloadDailyPdf.mockResolvedValue('guardado');
            const store = useServiceDeliveryControlSheetStore();
            await store.downloadDailyPdf('uuid-1');
            expect(toast).toHaveBeenCalledWith('¡Éxito!', 'PDF diario guardado en tu dispositivo', 'success');
        });

        it('si el usuario canceló el diálogo no se avisa éxito', async () => {
            serviceDeliveryControlSheetService.downloadDailyPdf.mockResolvedValue('cancelado');
            const store = useServiceDeliveryControlSheetStore();
            await store.downloadDailyPdf('uuid-1');
            expect(toast).not.toHaveBeenCalled();
        });

        it('si la descarga falló no se inventa un éxito', async () => {
            serviceDeliveryControlSheetService.downloadMonthlyPdf.mockResolvedValue('fallido');
            const store = useServiceDeliveryControlSheetStore();
            await store.downloadMonthlyPdf({ vehicle_uuid: 'v1' });
            expect(toast).not.toHaveBeenCalled();
        });

        it('un error de red sigue avisando con el mensaje de respaldo', async () => {
            serviceDeliveryControlSheetService.downloadReport.mockRejectedValue(new Error('Network Error'));
            const store = useServiceDeliveryControlSheetStore();
            await expect(store.downloadReport('rango', {}, 'pdf')).rejects.toThrow('Network Error');
            expect(toast).toHaveBeenCalledWith('Error', 'Network Error', 'error');
        });
    });
});
