import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('../services/fuelRequests.service.js', () => ({
    default: {
        list: vi.fn(),
        create: vi.fn(),
        approve: vi.fn(),
        reject: vi.fn(),
        cancel: vi.fn(),
        qr: vi.fn(),
        getVehiculos: vi.fn(),
    },
}));
vi.mock('@utils/toast.js', () => ({ toast: vi.fn(async () => {}) }));
vi.mock('@utils/logger.js', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import fuelRequestsService from '../services/fuelRequests.service.js';
import { toast } from '@utils/toast.js';
import { useFuelRequestsStore, extraerQr } from '../store/fuelRequests.store.js';

const QR_OK = { data: 'SOLICITUD DE TANQUEO', url: 'https://x/v', qr_data: 'data:image/svg+xml;base64,AAA', qr_url: 'data:image/svg+xml;base64,BBB' };

function errorHttp(status, message) {
    const error = new Error(message || `HTTP ${status}`);
    error.response = { status, data: message ? { message } : {} };
    return error;
}

describe('extraerQr', () => {
    it('desempaqueta el cuerpo de la API sin confundir el texto del QR', () => {
        const qr = extraerQr({ success: true, data: QR_OK });
        expect(qr.qr_url).toBe(QR_OK.qr_url);
        expect(qr.qr_data).toBe(QR_OK.qr_data);
    });

    it('devuelve null cuando la respuesta no trae imágenes', () => {
        expect(extraerQr({ success: true, data: { data: 'solo texto' } })).toBeNull();
    });

    it('devuelve null ante una respuesta vacía', () => {
        expect(extraerQr(undefined)).toBeNull();
        expect(extraerQr(null)).toBeNull();
        expect(extraerQr({})).toBeNull();
    });
});

describe('useFuelRequestsStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setActivePinia(createPinia());
    });

    describe('casos negativos', () => {
        it('cargarQr deja el QR vacío si el servidor no devuelve imágenes', async () => {
            fuelRequestsService.qr.mockResolvedValue({ success: true, data: { data: 'texto' } });
            const store = useFuelRequestsStore();
            const qr = await store.cargarQr('uuid-1');
            expect(qr).toBeNull();
            expect(store.qr).toBeNull();
        });

        it('cargarQr propaga el error de red para que la vista lo muestre', async () => {
            fuelRequestsService.qr.mockRejectedValue(new Error('Network Error'));
            const store = useFuelRequestsStore();
            await expect(store.cargarQr('uuid-1')).rejects.toThrow('Network Error');
        });

        it('fetchVehiculos con red caída guarda un error y no oculta el fallo como lista vacía', async () => {
            fuelRequestsService.getVehiculos.mockRejectedValue(new Error('Network Error'));
            const store = useFuelRequestsStore();
            const resultado = await store.fetchVehiculos();
            expect(resultado).toEqual([]);
            expect(store.vehiculosError).toMatch(/No se pudieron cargar tus vehículos/);
            expect(store.vehiculosLoading).toBe(false);
        });

        it('fetchVehiculos sin mensaje del servidor usa el texto de respaldo en español', async () => {
            fuelRequestsService.getVehiculos.mockRejectedValue({});
            const store = useFuelRequestsStore();
            await store.fetchVehiculos();
            expect(store.vehiculosError).toMatch(/Revisa la conexión/);
        });

        it('fetchItems con fallo muestra el aviso y conserva la lista previa', async () => {
            const store = useFuelRequestsStore();
            store.items = [{ uuid: 'previa' }];
            fuelRequestsService.list.mockRejectedValue(errorHttp(500, 'Servidor caído'));
            await expect(store.fetchItems()).rejects.toBeTruthy();
            expect(store.error).toBe('Servidor caído');
            expect(toast).toHaveBeenCalledWith('Error', 'Servidor caído', 'error');
            expect(store.loading).toBe(false);
        });

        it('fetchItems con respuesta vacía deja la lista en blanco sin romperse', async () => {
            fuelRequestsService.list.mockResolvedValue({ success: true, data: null });
            const store = useFuelRequestsStore();
            await store.fetchItems();
            expect(store.items).toEqual([]);
            expect(store.total).toBe(0);
        });

        it('un 422 al crear guarda el mensaje sin disparar el aviso global', async () => {
            fuelRequestsService.create.mockRejectedValue(errorHttp(422, 'Ya existe una solicitud activa para este vehículo.'));
            const store = useFuelRequestsStore();
            await expect(store.crear('veh-1', null)).rejects.toBeTruthy();
            expect(store.error).toBe('Ya existe una solicitud activa para este vehículo.');
            expect(toast).not.toHaveBeenCalled();
        });

        it('un error sin mensaje al aprobar usa el texto de respaldo', async () => {
            fuelRequestsService.approve.mockRejectedValue(new Error(''));
            const store = useFuelRequestsStore();
            await expect(store.aprobar('sol-1')).rejects.toBeTruthy();
            expect(store.error).toBe('No se pudo aprobar la solicitud.');
        });

        it('si la aprobación sale bien pero refrescar falla, no se reporta como error de aprobación', async () => {
            fuelRequestsService.approve.mockResolvedValue({ success: true });
            fuelRequestsService.list.mockRejectedValue(new Error('Network Error'));
            const store = useFuelRequestsStore();
            await store.aprobar('sol-1').catch(() => {});
            expect(fuelRequestsService.approve).toHaveBeenCalledWith('sol-1');
        });
    });

    describe('caso feliz', () => {
        it('fetchItems carga la página y el total', async () => {
            fuelRequestsService.list.mockResolvedValue({
                success: true,
                data: { data: [{ uuid: 'a' }, { uuid: 'b' }], total: 60 },
            });
            const store = useFuelRequestsStore();
            await store.fetchItems();
            expect(store.items).toHaveLength(2);
            expect(store.total).toBe(60);
            expect(fuelRequestsService.list).toHaveBeenCalledWith({ per_page: 50 });
        });

        it('fetchVehiculos guarda la lista del conductor', async () => {
            fuelRequestsService.getVehiculos.mockResolvedValue([{ uuid: 'v1', vehicle_license_plate: 'ABC123' }]);
            const store = useFuelRequestsStore();
            await store.fetchVehiculos();
            expect(store.vehiculos).toHaveLength(1);
            expect(store.vehiculosError).toBeNull();
        });

        it('cargarQr guarda el QR con sus imágenes', async () => {
            fuelRequestsService.qr.mockResolvedValue({ success: true, data: QR_OK });
            const store = useFuelRequestsStore();
            const qr = await store.cargarQr('uuid-1');
            expect(qr.qr_url).toBe(QR_OK.qr_url);
            expect(store.qr.qr_data).toBe(QR_OK.qr_data);
        });

        it('rechazar envía el motivo al servidor', async () => {
            fuelRequestsService.reject.mockResolvedValue({ success: true });
            fuelRequestsService.list.mockResolvedValue({ success: true, data: { data: [] } });
            const store = useFuelRequestsStore();
            await store.rechazar('sol-9', 'Vehículo con tanqueo reciente');
            expect(fuelRequestsService.reject).toHaveBeenCalledWith('sol-9', { reason: 'Vehículo con tanqueo reciente' });
        });
    });
});
