<script setup>
import { computed } from 'vue';

const props = defineProps({
    stats: { type: Object, default: null },
    loading: { type: Boolean, default: false },
});

const statsData = computed(() => props.stats?.today || {});

const displayValue = (value, suffix = '') =>
    value !== null && value !== undefined ? `${value}${suffix}` : '—';
</script>

<template>
    <div class="bg-white rounded-xl shadow p-5">
        <h3 class="font-semibold text-gray-700 mb-4">Estadísticas del día</h3>

        <div v-if="loading" class="py-6 text-center text-gray-400">
            <i class="fas fa-spinner fa-spin text-2xl" aria-hidden="true"></i>
        </div>

        <div v-else-if="statsData.total_points" class="grid grid-cols-2 gap-4">
            <div>
                <div class="text-3xl font-bold text-gray-800">
                    {{ displayValue(statsData.total_distance_km) }}
                </div>
                <div class="text-xs text-gray-500 mt-1">km recorridos</div>
            </div>
            <div>
                <div class="text-3xl font-bold text-gray-800">
                    {{ displayValue(statsData.total_points) }}
                </div>
                <div class="text-xs text-gray-500 mt-1">puntos GPS</div>
            </div>
            <div>
                <div class="text-3xl font-bold text-gray-800">
                    {{ displayValue(statsData.avg_speed_kmh) }}
                </div>
                <div class="text-xs text-gray-500 mt-1">km/h promedio</div>
            </div>
            <div>
                <div class="text-3xl font-bold text-gray-800">
                    {{ displayValue(statsData.max_speed_kmh) }}
                </div>
                <div class="text-xs text-gray-500 mt-1">km/h máximo</div>
            </div>
            <div>
                <div class="text-3xl font-bold text-gray-800">
                    {{ displayValue(statsData.duration_minutes, 'm') }}
                </div>
                <div class="text-xs text-gray-500 mt-1">tiempo activo</div>
            </div>
        </div>

        <div v-else class="py-6 text-center text-gray-400 text-sm">
            <i class="fas fa-chart-line text-2xl block mb-2" aria-hidden="true"></i>
            Selecciona un conductor para ver sus estadísticas
        </div>
    </div>
</template>