<script setup>
import { computed } from 'vue';

const props = defineProps({
    route: { type: Array, default: () => [] },
});

const hasRoute = computed(() => props.route && props.route.length >= 2);

const totalDistance = computed(() => {
    if (!hasRoute.value) return 0;

    let distance = 0;
    for (let i = 1; i < props.route.length; i++) {
        const [lat1, lng1] = props.route[i - 1];
        const [lat2, lng2] = props.route[i];
        distance += haversine(lat1, lng1, lat2, lng2);
    }
    return (distance / 1000).toFixed(2);
});

const duration = computed(() => {
    if (!hasRoute.value) return '00:00';
    const first = new Date(props.route[0][2]);
    const last = new Date(props.route[props.route.length - 1][2]);
    const diff = Math.max(0, last - first);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
});

function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
</script>

<template>
    <div v-if="hasRoute" class="grid grid-cols-2 gap-3 mt-3">
        <div class="bg-gray-50 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-gray-800">{{ totalDistance }} <span class="text-sm font-normal">km</span></div>
            <div class="text-xs text-gray-500 mt-1">Distancia recorrida</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-gray-800">{{ duration }}</div>
            <div class="text-xs text-gray-500 mt-1">Tiempo de ruta</div>
        </div>
    </div>
    <div v-else class="mt-3 text-sm text-gray-400 text-center py-2">
        Sin puntos de ruta para el período seleccionado.
    </div>
</template>