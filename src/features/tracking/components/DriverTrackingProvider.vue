<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { useDriverTrackingStore } from '../store/driverTracking.store';
import { usePermissionsStore } from '@store';

const driverTracking = useDriverTrackingStore();
const permissionsStore = usePermissionsStore();

function alVolverAVisible() {
    if (document.visibilityState === 'visible') {
        driverTracking.alVolverALaApp().catch(() => {});
    }
}

onMounted(async () => {
    try {
        if (!permissionsStore.hasRole('CONDUCTOR')) return;
        await driverTracking.checkPermission();
        document.addEventListener('visibilitychange', alVolverAVisible);
        // El vehículo se define cuando el Dashboard o el Control Operativo
        // llaman a ensureTracking/updateContext. Aquí no se fuerza sesión
        // sin vehículo para no crear sesiones huérfanas.
    } catch (e) {
        console.warn('[DriverTrackingProvider]', e?.message);
    }
});

onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', alVolverAVisible);
});
</script>

<template>
    <!-- Proveedor invisible: mantiene viva la instancia del store, sin UI ni mapa. -->
    <span style="display:none" aria-hidden="true"></span>
</template>
