import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

const estado = vi.hoisted(() => ({ nativo: true }));

vi.mock('@capacitor/core', () => ({
    Capacitor: { isNativePlatform: () => estado.nativo, getPlatform: () => 'android' },
    registerPlugin: () => ({}),
}));
vi.mock('@capacitor/geolocation', () => ({
    Geolocation: {
        checkPermissions: vi.fn(),
        requestPermissions: vi.fn(),
        watchPosition: vi.fn(),
        getCurrentPosition: vi.fn(),
        clearWatch: vi.fn(),
    },
}));
vi.mock('../services/backgroundTracking.service', () => ({
    default: {
        available: false,
        isLocationEnabled: vi.fn(),
        openLocationSettings: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        refreshToken: vi.fn(),
        updateContext: vi.fn(),
        getStatus: vi.fn(),
        isBatteryExempt: vi.fn(),
        requestBatteryExemption: vi.fn(),
    },
}));
vi.mock('../services/tracking.service', () => ({
    default: { startSession: vi.fn(), sendLocation: vi.fn(), stopSession: vi.fn() },
}));
vi.mock('@store', () => ({
    useUserStore: () => ({ uuid_driver: 'tercero-1', third_party_uuid: null }),
}));
vi.mock('@utils/logger.js', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import { Geolocation } from '@capacitor/geolocation';
import backgroundTracking from '../services/backgroundTracking.service';
import trackingService from '../services/tracking.service';
import { useDriverTrackingStore } from '../store/driverTracking.store.js';
import { MENSAJE_UBICACION_DESACTIVADA } from '@utils/ubicacion.js';

function errorConCodigo(message, code) {
    const error = new Error(message);
    error.code = code;
    return error;
}

const ERROR_GPS_APAGADO = () => errorConCodigo('Location services are not enabled.', 'OS-PLUG-GLOC-0007');

describe('driverTracking: ubicación del sistema', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        estado.nativo = true;
        backgroundTracking.available = false;
        backgroundTracking.isLocationEnabled.mockResolvedValue(null);
        setActivePinia(createPinia());
    });

    describe('casos negativos', () => {
        it('con el GPS apagado no crea la sesión en el servidor', async () => {
            backgroundTracking.available = true;
            backgroundTracking.isLocationEnabled.mockResolvedValue(false);
            const store = useDriverTrackingStore();

            const sesion = await store.ensureTracking({ vehicleUuid: 'veh-1' });

            expect(sesion).toBeNull();
            expect(store.errorMsg).toBe(MENSAJE_UBICACION_DESACTIVADA);
            expect(trackingService.startSession).not.toHaveBeenCalled();
        });

        it('si el puente nativo no existe, el error del plugin también marca el GPS apagado', async () => {
            Geolocation.checkPermissions.mockRejectedValue(ERROR_GPS_APAGADO());
            const store = useDriverTrackingStore();

            await store.checkLocationEnabled();

            expect(store.locationEnabled).toBe(false);
        });

        it('pedir el permiso con el GPS apagado lanza el mensaje en español', async () => {
            Geolocation.requestPermissions.mockRejectedValue(ERROR_GPS_APAGADO());
            const store = useDriverTrackingStore();

            await expect(store.solicitarPermisoNativo()).rejects.toThrow(MENSAJE_UBICACION_DESACTIVADA);
            expect(store.locationEnabled).toBe(false);
        });

        it('un permiso denegado no se confunde con el GPS apagado', async () => {
            Geolocation.checkPermissions.mockResolvedValue({ location: 'denied' });
            Geolocation.requestPermissions.mockResolvedValue({ location: 'denied' });
            const store = useDriverTrackingStore();

            await store.checkPermission();
            expect(store.permissionState).toBe('denied');
            expect(store.locationEnabled).not.toBe(false);

            await expect(store.solicitarPermisoNativo()).rejects.toThrow(/permiso de ubicación denegado/i);
            expect(store.locationEnabled).not.toBe(false);
        });

        it('un fallo desconocido del plugin no marca el GPS como apagado', async () => {
            Geolocation.checkPermissions.mockRejectedValue(new Error('Otro fallo'));
            const store = useDriverTrackingStore();

            await store.checkLocationEnabled();

            expect(store.locationEnabled).toBeNull();
        });
    });

    describe('caso feliz', () => {
        it('al volver a la app con el GPS ya encendido reanuda el rastreo', async () => {
            backgroundTracking.available = true;
            backgroundTracking.isLocationEnabled
                .mockResolvedValueOnce(false)
                .mockResolvedValue(true);
            Geolocation.checkPermissions.mockResolvedValue({ location: 'granted' });
            const store = useDriverTrackingStore();
            store.vehicleUuid = 'veh-1';
            store.ensureTracking = vi.fn(async () => null);

            await store.checkLocationEnabled();
            await store.alVolverALaApp();

            expect(store.locationEnabled).toBe(true);
            expect(store.ensureTracking).toHaveBeenCalledTimes(1);
        });

        it('al volver sin cambios no reinicia el rastreo', async () => {
            backgroundTracking.available = true;
            backgroundTracking.isLocationEnabled.mockResolvedValue(true);
            Geolocation.checkPermissions.mockResolvedValue({ location: 'granted' });
            const store = useDriverTrackingStore();
            store.vehicleUuid = 'veh-1';
            store.ensureTracking = vi.fn(async () => null);

            await store.alVolverALaApp();

            expect(store.ensureTracking).not.toHaveBeenCalled();
        });

        it('el botón de ajustes delega en el puente nativo', async () => {
            backgroundTracking.openLocationSettings.mockResolvedValue(true);
            const store = useDriverTrackingStore();

            await expect(store.abrirAjustesUbicacion()).resolves.toBe(true);
            expect(backgroundTracking.openLocationSettings).toHaveBeenCalledTimes(1);
        });
    });
});
