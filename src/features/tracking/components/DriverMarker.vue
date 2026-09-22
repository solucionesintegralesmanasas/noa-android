<script setup>
import { computed } from 'vue';

const props = defineProps({
    driver: { type: Object, required: true },
});

const emit = defineEmits(['open-history', 'show-location']);

const driverName = computed(() => {
    const d = props.driver;
    const tp = d.driver || d.third_party || {};
    const name = tp.first_name || d.first_name || 'Conductor';
    const lastName = tp.last_name || d.last_name || '';
    return `${name} ${lastName}`.trim();
});

const documentNumber = computed(() => props.driver.driver?.document_number || props.driver.document_number || '—');

const plate = computed(() => {
    const v = props.driver.vehicle || {};
    return v.vehicle_license_plate || props.driver.vehicle_license_plate || 'Sin vehículo';
});

const speed = computed(() => Math.round(props.driver.speed ?? props.driver.last_location?.speed ?? 0));

const isMoving = computed(() => props.driver.is_moving ?? props.driver.last_location?.is_moving ?? false);

const initials = computed(() => {
    const name = driverName.value.trim();
    const parts = name.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.charAt(0).toUpperCase();
});

const lastSeen = computed(() => {
    const date = props.driver.recorded_at || props.driver.last_location?.recorded_at;
    if (!date) return null;
    return new Intl.DateTimeFormat('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(new Date(date));
});

const projectName = computed(() =>
    props.driver.project?.project_name || props.driver.planilla_dia?.project_name || null
);

const routes = computed(() => props.driver.planilla_dia?.routes || []);

const funcionarioText = computed(() => {
    const first = routes.value.find((r) => r.funcionario_nombre || r.funcionario_cc);
    if (!first) return null;
    const extra = routes.value.length > 1 ? ` +${routes.value.length - 1}` : '';
    return `${first.funcionario_nombre || 'Funcionario'}${first.funcionario_cc ? ` · CC ${first.funcionario_cc}` : ''}${extra}`;
});

const rutaText = computed(() => {
    if (!routes.value.length) return null;
    const first = routes.value[0];
    const base = `${first.origin || '?'} → ${first.destination || '?'}`;
    const resto = routes.value.length > 1 ? ` · +${routes.value.length - 1}` : '';
    const esHoy = props.driver.planilla_dia?.es_planilla_hoy !== false;
    if (esHoy) return `${base}${resto}`;
    const fecha = props.driver.planilla_dia?.service_date
        ? new Date(props.driver.planilla_dia.service_date).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })
        : '';
    return `(${fecha}) ${base}${resto}`;
});
</script>

<template>
    <div
        class="driver-card"
        :class="{ 'driver-card--moving': isMoving }"
        @click="emit('show-location', driver)"
    >
        <!-- Zona izquierda: avatar + datos -->
        <div class="driver-card__left">
            <!-- Avatar: clase propia, sin conflicto Bootstrap -->
            <div class="driver-avatar" :class="isMoving ? 'driver-avatar--moving' : 'driver-avatar--stopped'">
                {{ initials }}
            </div>

            <!-- Datos del conductor -->
            <div class="driver-info">
                <!-- Fila 1: Nombre -->
                <div class="driver-info__name">{{ driverName }}</div>

                <!-- Fila 2: Placa · CC -->
                <div class="driver-info__sub">
                    <i class="fas fa-car me-1 opacity-50" style="font-size:10px;"></i>
                    {{ plate }}
                    <span class="mx-1 opacity-40">·</span>
                    {{ documentNumber }}
                </div>

                <!-- Separador + datos secundarios -->
                <div v-if="projectName || funcionarioText || rutaText" class="driver-info__secondary">
                    <div v-if="projectName" class="driver-info__badge-project">
                        <i class="fas fa-building me-1" style="font-size:9px;"></i>
                        {{ projectName }}
                    </div>
                    <div v-if="funcionarioText" class="driver-info__detail">
                        <i class="fas fa-user-tie me-1 opacity-60" style="font-size:9px;"></i>
                        {{ funcionarioText }}
                    </div>
                    <div v-if="rutaText" class="driver-info__detail">
                        <i class="fas fa-route me-1 opacity-60" style="font-size:9px;"></i>
                        {{ rutaText }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Zona derecha: velocidad + hora + estado + historial -->
        <div class="driver-card__right">
            <div class="driver-card__speed" :class="isMoving ? 'driver-card__speed--moving' : 'driver-card__speed--stopped'">
                {{ speed }} <span style="font-size:9px;font-weight:500;">km/h</span>
            </div>
            <div v-if="lastSeen" class="driver-card__time">{{ lastSeen }}</div>
            <span class="status-dot" :class="isMoving ? 'status-dot--moving' : 'status-dot--stopped'"></span>
            <button
                class="driver-card__history-btn"
                title="Ver historial"
                @click.stop="emit('open-history', driver)"
            >
                <i class="fad fa-route" style="font-size:12px; color:#0d6efd;"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>
/* ─── Tarjeta principal ──────────────────────────────────────── */
.driver-card {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 10px 10px 12px;
    border-bottom: 1px solid #f1f3f5;
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
    border-left: 3px solid transparent;
}

.driver-card:hover {
    background-color: #f8f9fb;
    border-left-color: #0d6efd40;
}

.driver-card--moving {
    border-left-color: #22c55e40;
}

.driver-card--moving:hover {
    border-left-color: #22c55e;
}

/* ─── Zona izquierda ─────────────────────────────────────────── */
.driver-card__left {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    min-width: 0;
    flex: 1;
}

/* ─── Avatar (círculo perfecto, sin conflicto Bootstrap) ─────── */
.driver-avatar {
    width: 38px;
    height: 38px;
    min-width: 38px;
    min-height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.78rem;
    letter-spacing: 0.5px;
    flex-shrink: 0;
    margin-top: 1px;
}

.driver-avatar--moving {
    background: rgba(34, 197, 94, 0.12);
    color: #16a34a;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.25);
}

.driver-avatar--stopped {
    background: rgba(13, 110, 253, 0.1);
    color: #0d6efd;
}

/* ─── Info del conductor ─────────────────────────────────────── */
.driver-info {
    min-width: 0;
    flex: 1;
}

.driver-info__name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
}

.driver-info__sub {
    font-size: 0.72rem;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
}

/* Bloque secundario con separador visual */
.driver-info__secondary {
    margin-top: 6px;
    padding-top: 5px;
    border-top: 1px dashed #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.driver-info__badge-project {
    display: inline-flex;
    align-items: center;
    font-size: 0.7rem;
    font-weight: 600;
    color: #1d4ed8;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 20px;
    padding: 1px 7px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    align-self: flex-start;
}

.driver-info__detail {
    font-size: 0.7rem;
    color: #475569;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* ─── Zona derecha ───────────────────────────────────────────── */
.driver-card__right {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.driver-card__speed {
    font-size: 0.8rem;
    font-weight: 700;
    line-height: 1;
    border-radius: 20px;
    padding: 2px 7px;
    white-space: nowrap;
}

.driver-card__speed--moving {
    background: rgba(34, 197, 94, 0.12);
    color: #16a34a;
    border: 1px solid rgba(34, 197, 94, 0.25);
}

.driver-card__speed--stopped {
    background: rgba(245, 158, 11, 0.1);
    color: #b45309;
    border: 1px solid rgba(245, 158, 11, 0.25);
}

.driver-card__time {
    font-size: 0.65rem;
    color: #94a3b8;
    white-space: nowrap;
}

/* ─── Status dot ─────────────────────────────────────────────── */
.status-dot {
    width: 8px;
    height: 8px;
    min-width: 8px;
    border-radius: 50%;
    display: inline-block;
}

.status-dot--moving {
    background: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

.status-dot--stopped {
    background: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

/* ─── Botón historial ────────────────────────────────────────── */
.driver-card__history-btn {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    color: #212529;
    border-radius: 6px;
    padding: 3px 6px;
    line-height: 1;
    cursor: pointer;
    transition: background 0.15s;
}

.driver-card__history-btn:hover {
    background: #e8f0fe;
    border-color: #bfdbfe;
}
</style>