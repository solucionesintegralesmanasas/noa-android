<template>
    <div class="public-signature-container">
        <div class="glass-card">
            <!-- Header -->
            <div class="card-header-custom text-center">
                <div class="badge-icon">
                    <i class="fad fa-file-signature text-primary"></i>
                </div>
                <h2>{{ isControl ? 'Firma del Coordinador de Servicios' : 'Firma Digital de Inspección' }}</h2>
                <p class="subtitle text-muted">Valide la información y registre su firma en el panel inferior.</p>
            </div>

            <!-- Loading State -->
            <div v-if="loadingDetails" class="loading-wrapper text-center">
                <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
                <p class="mt-2 text-muted">{{ isControl ? 'Cargando detalles de la hoja de control...' : 'Cargando detalles de la inspección...' }}</p>
            </div>

            <!-- Error State -->
            <div v-else-if="loadError" class="error-wrapper text-center">
                <div class="error-icon">
                    <i class="fad fa-exclamation-triangle text-danger"></i>
                </div>
                <h4 class="text-danger mt-3">Enlace Inválido o Expirado</h4>
                <p class="text-muted mt-2">
                    El enlace para firmar este documento no es válido, ha sido alterado o expiró (validez de 1 hora).
                    Por favor, solicite un nuevo enlace de firma.
                </p>
            </div>

            <!-- Content State -->
            <div v-else class="content-wrapper">
                <!-- Inspection Details -->
                <div class="details-section">
                    <h5 class="section-title">Detalles del Documento</h5>
                    <div v-if="isControl" class="details-grid">
                        <div class="detail-item">
                            <span class="label">Placa del Vehículo</span>
                            <span class="value">{{ inspection.vehicle_license_plate }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Conductor</span>
                            <span class="value">{{ inspection.driver_name }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Fecha Servicio</span>
                            <span class="value">{{ formattedDate }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Ruta / Proyecto</span>
                            <span class="value">{{ inspection.daily_route || inspection.project_name || 'N/A' }}</span>
                        </div>
                    </div>
                    <div v-else class="details-grid">
                        <div class="detail-item">
                            <span class="label">Placa del Vehículo</span>
                            <span class="value">{{ inspection.vehicle_license_plate }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Conductor</span>
                            <span class="value">{{ inspection.driver_name }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Inspector</span>
                            <span class="value">{{ inspection.inspector_name || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Fecha Inspección</span>
                            <span class="value">{{ formattedDate }}</span>
                        </div>
                    </div>
                </div>

                <!-- Status List -->
                <div v-if="isControl" class="mt-4 p-3 bg-light rounded text-start shadow-sm border mb-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted font-weight-medium">Firma Coordinador de Servicios:</span>
                        <span v-if="inspection.has_coordinator_signature" class="status-badge signed">
                            <i class="fas fa-check-circle mr-1"></i> Firmado
                        </span>
                        <span v-else class="status-badge pending">
                            <i class="fas fa-clock mr-1"></i> Pendiente
                        </span>
                    </div>
                </div>
                <div v-else class="mt-4 p-3 bg-light rounded text-start shadow-sm border mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-muted font-weight-medium">Firma Inspector / Conductor:</span>
                        <span v-if="inspection.has_inspector_signature" class="status-badge signed">
                            <i class="fas fa-check-circle mr-1"></i> Firmado
                        </span>
                        <span v-else class="status-badge pending">
                            <i class="fas fa-clock mr-1"></i> Pendiente
                        </span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted font-weight-medium">Firma Coordinador HSEQ / Operaciones:</span>
                        <span v-if="inspection.has_coordinator_signature" class="status-badge signed">
                            <i class="fas fa-check-circle mr-1"></i> Firmado
                        </span>
                        <span v-else class="status-badge pending">
                            <i class="fas fa-clock mr-1"></i> Pendiente
                        </span>
                    </div>
                </div>

                <!-- Complete Success State -->
                <div v-if="isControl ? inspection.has_coordinator_signature : (inspection.has_inspector_signature && inspection.has_coordinator_signature)" class="success-all-wrapper text-center mt-4">
                    <div class="success-icon animate-bounce">
                        <i class="fad fa-check-double text-success fa-3x"></i>
                    </div>
                    <h3 class="text-success mt-3 font-weight-bold">¡Firmas Completadas!</h3>
                    <p class="text-muted mt-2">
                        {{ isControl ? 'Esta hoja de control ya cuenta con la firma del coordinador.' : 'Este documento de inspección ya cuenta con todas las firmas requeridas.' }}
                    </p>
                </div>

                <!-- Signature Pad Section -->
                <div v-else class="signature-section mt-4">
                    <!-- Segmented Selector (solo inspecciones: las planillas son una sola firma) -->
                    <template v-if="!isControl">
                    <label class="sig-label">Seleccione el firmante:</label>
                    <div class="role-selector mb-4">
                        <button 
                            type="button" 
                            @click="selectRole('inspector')"
                            :class="['role-tab', activeRole === 'inspector' ? 'active' : '']"
                            :disabled="inspection.has_inspector_signature"
                        >
                            <i class="fad fa-user-helmet-safety mr-2"></i>
                            <span>Inspector/Conductor</span>
                            <span v-if="inspection.has_inspector_signature" class="status-badge signed ml-2">
                                <i class="fas fa-check-circle"></i>
                            </span>
                        </button>
                        <button 
                            type="button" 
                            @click="selectRole('coordinator')"
                            :class="['role-tab', activeRole === 'coordinator' ? 'active' : '']"
                            :disabled="inspection.has_coordinator_signature"
                        >
                            <i class="fad fa-user-tie mr-2"></i>
                            <span>Coordinador HSEQ</span>
                            <span v-if="inspection.has_coordinator_signature" class="status-badge signed ml-2">
                                <i class="fas fa-check-circle"></i>
                            </span>
                        </button>
                    </div>
                    </template>

                    <!-- Alert Message -->
                    <div class="alert-info-custom mb-3">
                        <i class="fad fa-info-circle mr-2"></i>
                        <span v-if="isControl">
                            Firmando como <b>Coordinador de Servicios</b>.
                            La firma se plasmará en el campo RECIBO Y FIRMA del PDF.
                        </span>
                        <span v-else>
                            Firmando como <b>{{ activeRole === 'inspector' ? 'Inspector/Conductor' : 'Coordinador HSEQ/Operaciones' }}</b>. 
                            La firma se plasmará directamente en el reporte PDF.
                        </span>
                    </div>

                    <div class="canvas-container" :class="{ 'has-error': signatureError }">
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
                        <div v-if="isEmpty" class="sig-placeholder">
                            Dibuje su firma aquí
                        </div>
                    </div>

                    <div class="sig-actions mt-3">
                        <button type="button" @click="clear" class="btn-clear">
                            <i class="fad fa-eraser mr-1"></i> Limpiar
                        </button>
                        <button type="button" @click="saveSignature" :disabled="isEmpty || saving" class="btn-save">
                            <i v-show="saving" class="fas fa-spinner fa-spin mr-1"></i>
                            <i v-show="!saving" class="fad fa-check mr-1"></i>
                            <span v-show="saving">Guardando...</span>
                            <span v-show="!saving">Guardar Firma</span>
                        </button>
                    </div>

                    <p v-if="signatureError" class="sig-error mt-2">{{ signatureError }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import env from '@/utils/env.js';
import Swal from 'sweetalert2';

const route = useRoute();

const publicApi = axios.create({
    baseURL: env.API_BASE_URL,
    timeout: env.API_TIMEOUT || 30000,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
});

// State
const loadingDetails = ref(true);
const loadError = ref(false);
const saving = ref(false);
const inspection = ref({});
const signatureError = ref(null);
const activeRole = ref('coordinator');

// Route params & query parameters for signed validation
const uuid = route.params.uuid;
const signatureQuery = route.query.signature;
const expiresQuery = route.query.expires;
// Planillas de control usan el mismo componente con una sola firma (sin selector de rol)
const isControl = route.query.tipo === 'control';
const detailsEndpoint = isControl
    ? `public/service-delivery-control-sheets/${uuid}`
    : `public/vehicle-inspections/${uuid}`;

// Canvas Drawing State
const canvasRef = ref(null);
const isEmpty = ref(true);
let ctx = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

const formattedDate = computed(() => {
    const raw = inspection.value.inspection_date || inspection.value.service_date;
    if (!raw) return '';
    const date = new Date(raw);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

async function fetchDetails() {
    try {
        const response = await publicApi.get(detailsEndpoint, {
            params: {
                signature: signatureQuery,
                expires: expiresQuery
            }
        });
        inspection.value = response.data.data;

        if (isControl) return;
        // Auto-select pending role only if the currently active role is already signed
        if (activeRole.value === 'inspector' && inspection.value.has_inspector_signature && !inspection.value.has_coordinator_signature) {
            activeRole.value = 'coordinator';
        } else if (activeRole.value === 'coordinator' && inspection.value.has_coordinator_signature && !inspection.value.has_inspector_signature) {
            activeRole.value = 'inspector';
        } else if (!inspection.value.has_coordinator_signature && !inspection.value.has_inspector_signature && activeRole.value !== 'inspector' && activeRole.value !== 'coordinator') {
            // Default inicial si ambos están pendientes y no hay nada seleccionado
            activeRole.value = 'coordinator';
        }
    } catch (err) {
        console.error('Error fetching public inspection details:', err);
        loadError.value = true;
    }
}

// Fetch inspection details on mount
onMounted(async () => {
    loadingDetails.value = true;
    await fetchDetails();
    loadingDetails.value = false;

    const pending = isControl
        ? !inspection.value.has_coordinator_signature
        : (!inspection.value.has_inspector_signature || !inspection.value.has_coordinator_signature);
    // Wait for DOM update and initialize canvas if signatures are not complete
    if (inspection.value.uuid && pending) {
        setTimeout(initCanvas, 100);
    }
});

function selectRole(role) {
    activeRole.value = role;
    clear();
}

function initCanvas() {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const targetWidth = Math.round(rect.width || canvas.offsetWidth || 500);
    const targetHeight = 220;

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        let dataBackup = null;
        if (!isEmpty.value && canvas.width > 0 && canvas.height > 0) {
            dataBackup = canvas.toDataURL('image/png');
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#1e293b'; // Slate 800
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (dataBackup) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            };
            img.src = dataBackup;
        }
    } else if (!ctx) {
        ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
}

// Coordinate mapping
function getPos(e) {
    const canvas = canvasRef.value;
    const rect = canvas.getBoundingClientRect();
    const src = e.touches && e.touches.length > 0 ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : e);
    
    const widthScale = (rect.width > 0) ? (canvas.width / rect.width) : 1;
    const heightScale = (rect.height > 0) ? (canvas.height / rect.height) : 1;

    return {
        x: (src.clientX - rect.left) * widthScale,
        y: (src.clientY - rect.top) * heightScale
    };
}

function startDraw(e) {
    if (!ctx) initCanvas();
    isDrawing = true;
    const { x, y } = getPos(e);
    [lastX, lastY] = [x, y];
}

function draw(e) {
    if (!isDrawing || !ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    [lastX, lastY] = [x, y];
    isEmpty.value = false;
}

// Drawing control functions
function stopDraw() {
    isDrawing = false;
}

function clear() {
    if (!canvasRef.value || !ctx) return;
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    isEmpty.value = true;
    signatureError.value = null;
}

async function saveSignature() {
    if (isEmpty.value) return;
    
    saving.value = true;
    signatureError.value = null;
    
    try {
        const base64 = canvasRef.value.toDataURL('image/png');
        const payload = isControl ? { signature: base64 } : { signature: base64, role: activeRole.value };

        await publicApi.post(detailsEndpoint,
            payload,
            {
                params: {
                    signature: signatureQuery,
                    expires: expiresQuery
                }
            }
        );

        // Actualización optimista del estado para reflejar el cambio inmediato en la UI
        if (isControl) {
            inspection.value.has_coordinator_signature = true;
        } else if (activeRole.value === 'inspector') {
            inspection.value.has_inspector_signature = true;
        } else if (activeRole.value === 'coordinator') {
            inspection.value.has_coordinator_signature = true;
        }

        Swal.fire({
            title: '¡Firma Guardada!',
            text: isControl
                ? 'La firma del Coordinador de Servicios ha sido registrada correctamente.'
                : `La firma de ${activeRole.value === 'inspector' ? 'Inspector/Conductor' : 'Coordinador HSEQ'} ha sido registrada correctamente.`,
            icon: 'success',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3b82f6'
        });

        // Clear canvas and fetch details to update status
        clear();
        await fetchDetails();

        const stillPending = isControl
            ? !inspection.value.has_coordinator_signature
            : (!inspection.value.has_inspector_signature || !inspection.value.has_coordinator_signature);
        if (stillPending) {
            setTimeout(initCanvas, 100);
        }
    } catch (err) {
        console.error('Error saving signature:', err);
        const status = err.response?.status;
        if (status === 503) {
            signatureError.value = 'El servicio no está disponible en este momento. Intenta nuevamente en unos minutos.';
        } else {
            signatureError.value = err.response?.data?.message ?? 'Ocurrió un error al guardar la firma.';
        }
        Swal.fire({
            title: 'Error',
            text: signatureError.value,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#ef4444'
        });
    } finally {
        saving.value = false;
    }
}
</script>

<style scoped>

.public-signature-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at top right, #f8fafc, #e2e8f0);
    padding: 1.5rem;
    font-family: 'Outfit', sans-serif;
}

.glass-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02);
    width: 100%;
    max-width: 580px;
    padding: 2rem;
    transition: all 0.3s ease;
}

.card-header-custom {
    margin-bottom: 2rem;
}

.badge-icon {
    width: 60px;
    height: 60px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    margin-bottom: 1rem;
}

h2 {
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    font-size: 1.5rem;
}

.subtitle {
    font-size: 0.9rem;
    margin-top: 0.5rem;
}

.loading-wrapper, .error-wrapper {
    padding: 3rem 1rem;
}

.error-icon {
    font-size: 3rem;
}

.details-section {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.25rem;
}

.section-title {
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    margin-top: 0;
    margin-bottom: 1rem;
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

@media (max-width: 480px) {
    .details-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }
}

.detail-item {
    display: flex;
    flex-direction: column;
}

.detail-item .label {
    font-size: 0.75rem;
    color: #64748b;
    margin-bottom: 0.25rem;
}

.detail-item .value {
    font-size: 0.95rem;
    font-weight: 600;
    color: #334155;
}

.font-weight-medium {
    font-weight: 500;
}

.alert-info-custom {
    background-color: rgba(59, 130, 246, 0.08);
    border-left: 4px solid #3b82f6;
    color: #1e3a8a;
    padding: 0.75rem 1rem;
    border-radius: 0 8px 8px 0;
    font-size: 0.8rem;
    line-height: 1.4;
    display: flex;
    align-items: center;
}

.signature-section {
    display: flex;
    flex-direction: column;
}

.sig-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
}

/* Role Selector Segmented Control */
.role-selector {
    display: flex;
    background: #f1f5f9;
    padding: 4px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
}

.role-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #64748b;
    background: transparent;
    border: none;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.role-tab:hover:not(:disabled) {
    color: #1e293b;
    background: rgba(255, 255, 255, 0.4);
}

.role-tab.active {
    color: #3b82f6;
    background: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.role-tab:disabled {
    opacity: 0.8;
    color: #94a3b8;
    cursor: not-allowed;
}

.status-badge {
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
}

.status-badge.signed {
    background: #dcfce7;
    color: #15803d;
}

.status-badge.pending {
    background: #fef3c7;
    color: #b45309;
}

.success-all-wrapper {
    padding: 2rem 1rem;
}

.success-icon {
    margin-bottom: 1rem;
}

.canvas-container {
    position: relative;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    background-color: #ffffff;
    overflow: hidden;
    transition: all 0.2s ease;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
    touch-action: none;
}

.canvas-container:hover {
    border-color: #3b82f6;
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
    color: #94a3b8;
    pointer-events: none;
    user-select: none;
    font-style: italic;
}

.sig-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.625rem 1.25rem;
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: 8px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-save {
    background-color: #3b82f6;
    color: #ffffff;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.btn-save:hover:not(:disabled) {
    background-color: #2563eb;
    box-shadow: 0 4px 12px -1px rgba(59, 130, 246, 0.3);
}

.btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-clear {
    background-color: transparent;
    border-color: #cbd5e1;
    color: #475569;
}

.btn-clear:hover {
    background-color: #f1f5f9;
    color: #1e293b;
    border-color: #94a3b8;
}

.sig-error {
    font-size: 0.8rem;
    color: #ef4444;
    font-weight: 500;
}
</style>
