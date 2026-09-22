<template>
    <div class="card border-0 shadow-sm h-100 signature-card">
        <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
                <i :class="icono" :style="{ color: accent }"></i>
                <h6 class="mb-0 fw-semibold text-dark">{{ titulo }}</h6>
            </div>
            <span class="badge" :class="badgeClase">Requerido</span>
        </div>
        <div class="card-body p-3">
            <div class="mb-3">
                <label class="form-label required fw-medium text-700" style="font-size: 0.9rem;">Nombre Completo</label>
                <input v-if="!bloquearNombre" v-model="nombreModel" type="text" class="form-control" :placeholder="placeholderNombre" />
                <div v-else class="p-2 rounded bg-light border">
                    <span class="fw-semibold fs-13 text-dark d-block">{{ nombreModel || '—' }}</span>
                    <small v-if="detalleNombre" class="text-muted fs-11">{{ detalleNombre }}</small>
                </div>
            </div>

            <label class="form-label required fw-medium text-700" style="font-size: 0.9rem;">Trazo de Firma</label>
            <div class="signature-pad-wrapper rounded border bg-white position-relative">
                <canvas ref="canvasRef" width="500" height="150" class="w-100 signature-canvas"></canvas>
                <div v-if="vacio" class="signature-hint position-absolute top-50 start-50 translate-middle text-muted fs-12 pointer-events-none">
                    <i class="fad fa-pen-alt me-1"></i> Firme aquí (táctil o mouse)
                </div>
            </div>
            <div class="text-end mt-2">
                <button type="button" class="btn btn-link text-danger btn-sm p-0 fs-11 text-decoration-none" @click="limpiar">
                    <i class="fas fa-trash-alt me-1"></i> Borrar y reintentar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
    rol: { type: String, required: true }, // 'funcionario' | 'conductor'
    titulo: { type: String, required: true },
    placeholderNombre: { type: String, default: 'Nombre completo' },
    accent: { type: String, default: '#2c7be5' },
    bloquearNombre: { type: Boolean, default: false }, // Nombre informativo, sin caja de texto
    detalleNombre: { type: String, default: '' }, // Texto secundario bajo el nombre (ej: CC del funcionario)
});

const nombreModel = defineModel('nombre', { type: String, default: '' });

const canvasRef = ref(null);
const vacio = ref(true);

const icono = computed(() => props.rol === 'conductor' ? 'fad fa-steering-wheel' : 'fad fa-user-check');
const badgeClase = computed(() =>
    props.rol === 'conductor' ? 'bg-success bg-opacity-10 text-success' : 'bg-primary bg-opacity-10 text-primary'
);

const initCanvas = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let drawing = false;

    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    };

    const start = (e) => {
        drawing = true;
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        vacio.value = false;
    };

    const move = (e) => {
        if (!drawing) return;
        const { x, y } = getPos(e);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();
    };

    const stop = () => {
        drawing = false;
    };

    canvas.onmousedown = start;
    canvas.onmousemove = move;
    canvas.ontouchstart = (e) => { e.preventDefault(); start(e); };
    canvas.ontouchmove = (e) => { e.preventDefault(); move(e); };
    canvas.ontouchend = stop;
    window.addEventListener('mouseup', stop);
    canvas._stopHandler = stop;
};

const limpiar = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    vacio.value = true;
};

const getDataUrl = () => {
    const canvas = canvasRef.value;
    return canvas ? canvas.toDataURL('image/png') : '';
};

const estaVacio = () => vacio.value;

watch(nombreModel, () => {});

onMounted(() => {
    nextTickInit();
});

const nextTickInit = () => setTimeout(() => initCanvas(), 50);

onUnmounted(() => {
    const canvas = canvasRef.value;
    if (canvas && canvas._stopHandler) {
        window.removeEventListener('mouseup', canvas._stopHandler);
    }
});

defineExpose({ getDataUrl, estaVacio, limpiar });
</script>

<style scoped>
.signature-pad-wrapper {
    min-height: 150px;
    overflow: hidden;
    border-radius: 10px;
    background-color: #ffffff;
}

.signature-canvas {
    display: block;
    touch-action: none;
    cursor: crosshair;
}

.signature-hint {
    pointer-events: none;
    opacity: 0.55;
}
</style>