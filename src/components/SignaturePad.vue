<template>
    <div class="signature-wrapper">
        <label class="sig-label">{{ roleLabel }}</label>

        <div class="canvas-container" :class="{ 'has-error': error }">
            <canvas
                ref="canvasRef"
                class="sig-canvas"
                @mousedown="startDraw"
                @mousemove="draw"
                @mouseup="stopDraw"
                @mouseleave="stopDraw"
                @touchstart.prevent="startDraw"
                @touchmove.prevent="draw"
                @touchend="stopDraw"
                @touchcancel="stopDraw"
            />
            <div v-show="isEmpty" class="sig-placeholder">
                Firme aquí
            </div>
        </div>

        <div class="sig-actions">
            <button type="button" @click="clear" class="btn-clear" :disabled="loading">
                Limpiar
            </button>
            <button type="button" @click="save" :disabled="isEmpty || loading">
                {{ loading ? 'Guardando...' : 'Guardar firma' }}
            </button>
        </div>

        <p v-if="error" class="sig-error">{{ error }}</p>
        <p v-if="success" class="sig-success">Firma guardada correctamente</p>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useSignatureService } from '@/services/api/signature.service'

// --- props
const props = defineProps({
    entityType: { type: String, required: true },   // 'vehicle', 'driver', 'contract', 'vehicle_inspection'
    entityId: { type: [String, Number], required: true },
    role: { type: String, default: null },           // 'inspector' | 'coordinator' | null
})

const emit = defineEmits(['saved'])

// --- refs
const canvasRef = ref(null)
const isEmpty = ref(true)
const loading = ref(false)
const error = ref(null)
const success = ref(false)

let ctx = null
let isDrawing = false
let lastX = 0
let lastY = 0
let resizeObserver = null

const signatureService = useSignatureService()

const roleLabel = computed(() => {
    if (!props.role) return 'Firma del responsable'
    if (props.role === 'inspector') return 'Firma Inspector / Conductor'
    if (props.role === 'coordinator') return 'Firma Coordinador HSEQ / Operaciones'
    return 'Firma del responsable'
})

// --- canvas setup & resizing
function initCanvas() {
    const canvas = canvasRef.value
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const targetWidth = Math.round(rect.width || canvas.offsetWidth || 480)
    const targetHeight = 200

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        let dataBackup = null
        if (!isEmpty.value && canvas.width > 0 && canvas.height > 0) {
            dataBackup = canvas.toDataURL('image/png')
        }

        canvas.width = targetWidth
        canvas.height = targetHeight

        ctx = canvas.getContext('2d')
        ctx.strokeStyle = '#1a1a1a'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        if (dataBackup) {
            const img = new Image()
            img.onload = () => {
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
            }
            img.src = dataBackup
        }
    } else if (!ctx) {
        ctx = canvas.getContext('2d')
        ctx.strokeStyle = '#1a1a1a'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
    }
}

onMounted(() => {
    nextTick(() => {
        initCanvas()
        if (window.ResizeObserver && canvasRef.value) {
            resizeObserver = new ResizeObserver(() => {
                initCanvas()
            })
            resizeObserver.observe(canvasRef.value)
        }
        window.addEventListener('resize', initCanvas)
    })
})

onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect()
    }
    window.removeEventListener('resize', initCanvas)
})

// --- drawing helpers (robust coordinate mapping)
function getPos(e) {
    const canvas = canvasRef.value
    const rect = canvas.getBoundingClientRect()
    const src = e.touches && e.touches.length > 0 ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : e)
    
    const widthScale = (rect.width > 0) ? (canvas.width / rect.width) : 1
    const heightScale = (rect.height > 0) ? (canvas.height / rect.height) : 1

    return {
        x: (src.clientX - rect.left) * widthScale,
        y: (src.clientY - rect.top) * heightScale,
    }
}

function startDraw(e) {
    if (!ctx) initCanvas()
    isDrawing = true
    const { x, y } = getPos(e)
    lastX = x
    lastY = y
}

function draw(e) {
    if (!isDrawing || !ctx) return
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.stroke()
    lastX = x
    lastY = y
    isEmpty.value = false
}

function stopDraw() {
    isDrawing = false
}

function clear() {
    if (!canvasRef.value || !ctx) return
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    isEmpty.value = true
    error.value = null
    success.value = false
}

// --- export como PNG base64
function getPngBase64() {
    if (!canvasRef.value) return ''
    return canvasRef.value.toDataURL('image/png')
}

// --- guardar
async function save() {
    if (isEmpty.value) return

    error.value = null
    success.value = false
    loading.value = true
    try {
        const base64 = getPngBase64()
        const payload = {
            entity_type: props.entityType,
            entity_id: props.entityId,
            signature: base64,            // data:image/png;base64,...
        }
        if (props.role) payload.role = props.role
        const result = await signatureService.store(payload)
        success.value = true
        emit('saved', result.data)
    } catch (err) {
        error.value = err.response?.data?.message ?? 'Error al guardar la firma'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.signature-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    font-family: inherit;
}

.sig-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--p-text-color, #4b5563);
}

.canvas-container {
    position: relative;
    border: 2px dashed var(--p-content-border-color, #e5e7eb);
    border-radius: 8px;
    background-color: #ffffff;
    overflow: hidden;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    touch-action: none;
}

.canvas-container:hover {
    border-color: var(--p-primary-color, #3b82f6);
}

.canvas-container.has-error {
    border-color: #ef4444;
}

.sig-canvas {
    display: block;
    width: 100%;
    cursor: crosshair;
    touch-action: none;
}

.sig-placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1rem;
    color: #9ca3af;
    pointer-events: none;
    user-select: none;
    font-style: italic;
}

.sig-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}

button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 6px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: var(--p-primary-color, #3b82f6);
    color: var(--p-primary-contrast-color, #ffffff);
}

button:hover:not(:disabled) {
    opacity: 0.9;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-clear {
    background-color: transparent;
    border-color: var(--p-content-border-color, #e5e7eb);
    color: var(--p-text-color, #4b5563);
}

.btn-clear:hover:not(:disabled) {
    background-color: var(--p-content-hover-background, #f3f4f6);
    color: var(--p-text-hover-color, #1f2937);
}

.sig-error {
    font-size: 0.75rem;
    color: #ef4444;
    margin: 0;
}

.sig-success {
    font-size: 0.75rem;
    color: #10b981;
    margin: 0;
}
</style>