<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useTrackingStore } from '../store/tracking.store';
import { useToast } from 'vue-toastification';
import BasePageHeader from '@/components/BasePageHeader.vue';
import BaseFormActions from '@/components/BaseFormActions.vue';

const route = useRoute();
const router = useRouter();
const store = useTrackingStore();
const { loadLeaflet } = useGeolocation();
const toast = useToast();

const isEdit = computed(() => route.name === 'tracking.geofences.edit');
const geofenceUuid = route.params.id;

const editing = ref(false);
const loading = ref(false);
const saving = ref(false);
let map = null;
let drawnLayer = null;
let circleLayer = null;
let markerLayer = null;

const form = ref({
    name: '',
    description: '',
    type: 'circle',
    center_lat: null,
    center_lng: null,
    radius_meters: 500,
    polygon_points: [],
    alert_on_enter: true,
    alert_on_exit: true,
    max_speed_kmh: null,
    is_active: true,
});

const validationErrors = ref({});

const computedPolygonCoords = computed(() =>
    form.value.polygon_points.map((p) => [p.lat, p.lng])
);

async function setupMap() {
    const L = await loadLeaflet();
    map = L.map('geofenceMap', { center: [4.710993, -74.072068], zoom: 13 });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(map);

    map.on('click', (e) => {
        if (form.value.type === 'polygon') {
            addPolygonPoint(e.latlng.lat, e.latlng.lng);
        } else {
            form.value.center_lat = e.latlng.lat;
            form.value.center_lng = e.latlng.lng;
            redrawCircle();
            validationErrors.value.center = null;
        }
    });

    if (form.value.center_lat) {
        map.setView([form.value.center_lat, form.value.center_lng], 14);
        redrawCircle();
    }

    setTimeout(() => map?.invalidateSize(), 300);
}

function redrawCircle() {
    if (!map || !window.L) return;
    if (circleLayer) map.removeLayer(circleLayer);
    if (markerLayer) map.removeLayer(markerLayer);

    if (form.value.center_lat && form.value.center_lng) {
        markerLayer = window.L.circleMarker([form.value.center_lat, form.value.center_lng], {
            radius: 8,
            color: '#0d6efd',
            fillColor: '#0d6efd',
            fillOpacity: 1,
        }).addTo(map);

        if (form.value.radius_meters) {
            circleLayer = window.L.circle([form.value.center_lat, form.value.center_lng], {
                radius: form.value.radius_meters,
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.15,
            }).addTo(map);
        }
    }
}

function addPolygonPoint(lat, lng) {
    form.value.polygon_points.push({ lat, lng });
    validationErrors.value.polygon_points = null;
    redrawPolygon();
}

function redrawPolygon() {
    if (!map || !window.L) return;
    if (drawnLayer) map.removeLayer(drawnLayer);
    if (circleLayer) map.removeLayer(circleLayer);

    if (form.value.polygon_points.length >= 3) {
        const coords = computedPolygonCoords.value;
        drawnLayer = window.L.polygon(coords, {
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.2,
        }).addTo(map);
    }
}

function removePolygonPoint(index) {
    form.value.polygon_points.splice(index, 1);
    redrawPolygon();
}

function resetDrawing() {
    if (drawnLayer && map) map.removeLayer(drawnLayer);
    if (circleLayer && map) map.removeLayer(circleLayer);
    if (markerLayer && map) map.removeLayer(markerLayer);
    form.value.polygon_points = [];
    form.value.center_lat = null;
    form.value.center_lng = null;
    redrawPolygon();
}

function selectType(type) {
    if (form.value.type === type) return;
    resetDrawing();
    form.value.type = type;
}

async function loadGeofence() {
    if (!isEdit.value) return;

    editing.value = true;
    loading.value = true;
    try {
        const { getGeofence } = await import('../services/tracking.service');
        const { data } = await getGeofence(geofenceUuid);
        const geofence = data?.data || data;
        if (geofence) {
            form.value = {
                name: geofence.name || '',
                description: geofence.description || '',
                type: geofence.type || 'circle',
                center_lat: geofence.center_lat ? parseFloat(geofence.center_lat) : null,
                center_lng: geofence.center_lng ? parseFloat(geofence.center_lng) : null,
                radius_meters: geofence.radius_meters || 500,
                polygon_points: (geofence.polygon_points || []).map((p) => ({
                    lat: parseFloat(p.lat ?? p[0]),
                    lng: parseFloat(p.lng ?? p[1]),
                })),
                alert_on_enter: !!geofence.alert_on_enter,
                alert_on_exit: !!geofence.alert_on_exit,
                max_speed_kmh: geofence.max_speed_kmh || null,
                is_active: !!geofence.is_active,
            };

            if (map && form.value.center_lat) {
                map.setView([form.value.center_lat, form.value.center_lng], 14);
                redrawCircle();
                redrawPolygon();
            }
        }
    } catch (err) {
        toast.error('Error cargando la geocerca');
    } finally {
        loading.value = false;
    }
}

function validate() {
    validationErrors.value = {};
    const errors = {};

    if (!form.value.name.trim()) errors.name = 'El nombre es obligatorio';

    if (form.value.type === 'circle') {
        if (form.value.center_lat === null || form.value.center_lng === null) {
            errors.center = 'Haz clic en el mapa para seleccionar el centro de la zona';
        }
        if (!form.value.radius_meters || form.value.radius_meters < 10) {
            errors.radius_meters = 'El radio debe ser al menos 10 metros';
        }
    }

    if (form.value.type === 'polygon' && form.value.polygon_points.length < 3) {
        errors.polygon_points = 'Agrega al menos 3 puntos en el mapa';
    }

    validationErrors.value = errors;
    return Object.keys(errors).length === 0;
}

async function save() {
    if (!validate()) {
        await nextTick();
        const firstKey = Object.keys(validationErrors.value)[0];
        // Los errores del mapa (center/polygon_points) llevan el foco al mapa
        const mapKeys = { center: 'geofenceMap', polygon_points: 'geofenceMap' };
        const targetId = (firstKey && mapKeys[firstKey]) || (firstKey ? `f-${firstKey}` : null);
        const target = (targetId && document.getElementById(targetId))
            || document.querySelector('[aria-invalid="true"], .is-invalid');
        if (target) {
            if (!/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(target.tagName)) target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        toast.error('Revisa los campos del formulario');
        return;
    }

    saving.value = true;
    try {
        const payload = {
            geofence: {
                name: form.value.name.trim(),
                description: form.value.description || null,
                type: form.value.type,
                center_lat: form.value.type === 'circle' ? form.value.center_lat : null,
                center_lng: form.value.type === 'circle' ? form.value.center_lng : null,
                radius_meters: form.value.type === 'circle' ? form.value.radius_meters : null,
                polygon_points: form.value.type === 'polygon' ? form.value.polygon_points : null,
                alert_on_enter: form.value.alert_on_enter,
                alert_on_exit: form.value.alert_on_exit,
                max_speed_kmh: form.value.max_speed_kmh || null,
                is_active: form.value.is_active,
            },
        };

        if (isEdit.value) {
            await store.updateGeofence(geofenceUuid, payload);
            toast.success('Geocerca actualizada exitosamente');
        } else {
            await store.createGeofence(payload);
            toast.success('Geocerca creada exitosamente');
        }

        router.push({ name: 'tracking.geofences.list' });
    } catch (err) {
        toast.error('Error al guardar la geocerca');
    } finally {
        saving.value = false;
    }
}

function goBack() {
    router.push({ name: 'tracking.geofences.list' });
}

onMounted(async () => {
    try {
        await setupMap();
        await loadGeofence();
    } catch (err) {
        console.error('Error inicializando formulario:', err);
    }
});

onBeforeUnmount(() => {
    if (map) {
        map.remove();
        map = null;
    }
});
</script>

<template>
    <div>
        <BasePageHeader :title="isEdit ? 'Editar Geocerca' : 'Nueva Geocerca'"
            description="Define zonas geográficas para monitoreo de conductores"
            icon="fad fa-draw-polygon text-primary" :show-back="true" :show-bg="true" :compact="true"
            :breadcrumbs="[{ label: 'Geolocalización' }, { label: 'Geocercas', to: { name: 'tracking.geofences.list' } }, { label: isEdit ? 'Editar' : 'Crear' }]"
            @back="goBack" />

        <div class="row gx-3 fade-in-up" style="animation-delay: 0.1s;">
            <div class="col-12 col-xxl-12">
                <div class="card border-0 shadow-sm">
                    <div class="bg-holder d-none d-lg-block bg-card"
                        style="background-image:url(/assets/img/icons/spot-illustrations/corner-4.png);" />

                    <div class="card-header bg-light py-2 px-3 border-bottom">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fad fa-draw-polygon text-primary"></i>
                            <h6 class="mb-0 fw-medium">Información de la Zona</h6>
                            <span class="badge bg-primary bg-opacity-10 text-primary ms-2">
                                <i class="fad fa-asterisk me-1" style="font-size: 0.5rem;"></i>Campos obligatorios
                            </span>
                        </div>
                    </div>

                    <div class="card-body p-3 p-md-4">
                        <div v-if="loading"
                            class="position-absolute top-0 start-0 end-0 bottom-0 bg-white bg-opacity-70 d-flex flex-column align-items-center justify-content-center z-3 rounded-bottom">
                            <div class="spinner-border text-primary mb-2" role="status"></div>
                            <span class="text-muted small">Cargando geocerca...</span>
                        </div>

                        <form @submit.prevent="save" class="row g-3" novalidate>
                            <div class="col-12 col-lg-5 col-xl-4">
                                <div class="row g-3">
                                    <div class="col-12">
                                        <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-name">Nombre</label>
                                        <input type="text" autocomplete="off" class="form-control" id="f-name" v-model="form.name"
                                            :aria-invalid="!!validationErrors.name"
                                            :aria-describedby="validationErrors.name ? 'f-name-error' : undefined"
                                            :class="{
                                                'is-invalid': validationErrors.name,
                                                'is-valid': form.name && !validationErrors.name
                                            }"
                                            @input="validationErrors.name = null" placeholder="Ej: Terminal de transportes" />
                                        <div v-if="validationErrors.name" class="invalid-feedback d-block" id="f-name-error" role="alert">
                                            {{ validationErrors.name }}
                                        </div>
                                    </div>

                                    <div class="col-12">
                                        <label class="form-label fw-medium" style="font-size: 0.9rem;" for="f-description">Descripción</label>
                                        <textarea class="form-control" id="f-description" v-model="form.description" rows="3"
                                            placeholder="Detalle de la zona (opcional)"></textarea>
                                    </div>

                                    <div class="col-12">
                                        <label class="form-label fw-medium" style="font-size: 0.9rem;" id="f-type-label">Tipo de zona</label>
                                        <div class="btn-group w-100" role="group" aria-labelledby="f-type-label">
                                            <button type="button" class="btn btn-sm"
                                                :class="form.type === 'circle' ? 'btn-primary' : 'btn-outline-primary'"
                                                :aria-pressed="form.type === 'circle'"
                                                @click="selectType('circle')">
                                                <i class="fad fa-circle me-1" aria-hidden="true"></i> Círculo
                                            </button>
                                            <button type="button" class="btn btn-sm"
                                                :class="form.type === 'polygon' ? 'btn-primary' : 'btn-outline-primary'"
                                                :aria-pressed="form.type === 'polygon'"
                                                @click="selectType('polygon')">
                                                <i class="fad fa-draw-polygon me-1" aria-hidden="true"></i> Polígono
                                            </button>
                                        </div>
                                    </div>

                                    <template v-if="form.type === 'circle'">
                                        <div class="col-12">
                                            <label class="form-label required fw-medium" style="font-size: 0.9rem;" for="f-radius">Radio (metros)</label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-light" aria-hidden="true"><i class="fad fa-ruler-horizontal text-muted"></i></span>
                                                <input v-model.number="form.radius_meters" type="number" min="10" max="50000"
                                                    id="f-radius" class="form-control"
                                                    :aria-invalid="!!validationErrors.radius_meters"
                                                    :aria-describedby="validationErrors.radius_meters ? 'f-radius-error' : undefined"
                                                    :class="{ 'is-invalid': validationErrors.radius_meters }" />
                                            </div>
                                            <div v-if="validationErrors.radius_meters" class="invalid-feedback d-block" id="f-radius-error" role="alert">
                                                {{ validationErrors.radius_meters }}
                                            </div>
                                        </div>
                                    </template>

                                    <template v-if="form.type === 'polygon'">
                                        <div class="col-12">
                                            <span class="form-label fw-medium d-block" style="font-size: 0.9rem;" id="f-polygon-caption">
                                                Puntos del polígono
                                                <span class="badge rounded-pill badge-subtle badge-subtle-primary ms-1">
                                                    {{ form.polygon_points.length }}
                                                </span>
                                            </span>
                                            <div v-if="form.polygon_points.length" class="border rounded-3 p-2"
                                                style="max-height: 160px; overflow-y: auto;" role="list" aria-labelledby="f-polygon-caption">
                                                <div v-for="(point, index) in form.polygon_points" :key="index" role="listitem"
                                                    class="d-flex align-items-center justify-content-between py-1 border-bottom border-light small">
                                                    <span class="text-muted font-monospace">
                                                        {{ point.lat.toFixed(6) }}, {{ point.lng.toFixed(6) }}
                                                    </span>
                                                    <button type="button" class="btn btn-sm btn-falcon-default text-danger"
                                                        @click="removePolygonPoint(index)" :aria-label="`Quitar punto ${index + 1}`">
                                                        <i class="fad fa-times" aria-hidden="true"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div v-else class="px-3 py-2 bg-light rounded-3 text-muted small">
                                                <i class="fad fa-draw-polygon me-1" aria-hidden="true"></i> Haz clic en el mapa para agregar puntos.
                                            </div>
                                            <div v-if="validationErrors.polygon_points" class="invalid-feedback d-block" id="f-polygon-error" role="alert">
                                                {{ validationErrors.polygon_points }}
                                            </div>
                                        </div>
                                    </template>

                                    <div class="col-12">
                                        <div class="card bg-soft-primary border border-primary border-opacity-10 rounded-3">
                                            <div class="card-body py-2 px-3">
                                                <div class="d-flex align-items-center gap-2">
                                                    <span class="badge bg-primary bg-opacity-10 text-primary">
                                                        <i class="fad fa-mouse-pointer me-1" style="font-size: 10px;"></i>
                                                    </span>
                                                    <small class="text-muted">
                                                        {{ form.type === 'circle'
                                                            ? 'Haz clic en el mapa para ubicar el centro de la zona.'
                                                            : 'Haz clic en el mapa para agregar los puntos del polígono.' }}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="validationErrors.center" class="invalid-feedback d-block" id="f-center-error" role="alert">
                                            {{ validationErrors.center }}
                                        </div>
                                    </div>

                                    <div class="col-12">
                                        <h6 class="text-muted fw-medium mb-3 pb-2 border-bottom" style="font-size: 0.9rem;">
                                            <i class="fad fa-bell-exclamation me-2"></i>Alertas de la zona
                                        </h6>

                                        <div class="form-check form-switch mt-2">
                                            <input class="form-check-input" type="checkbox" id="alert_enter"
                                                v-model="form.alert_on_enter" />
                                            <label class="form-check-label small" for="alert_enter">
                                                <i class="fad fa-sign-in-alt text-success me-1" aria-hidden="true"></i> Alertar al ingresar a la zona
                                            </label>
                                        </div>
                                        <div class="form-check form-switch mt-2">
                                            <input class="form-check-input" type="checkbox" id="alert_exit"
                                                v-model="form.alert_on_exit" />
                                            <label class="form-check-label small" for="alert_exit">
                                                <i class="fad fa-sign-out-alt text-danger me-1" aria-hidden="true"></i> Alertar al salir de la zona
                                            </label>
                                        </div>

                                        <label class="form-label fw-medium mt-3" style="font-size: 0.9rem;" for="f-speed">Límite de velocidad</label>
                                        <div class="input-group">
                                            <span class="input-group-text bg-light" aria-hidden="true"><i class="fad fa-gauge-high text-muted"></i></span>
                                            <input v-model.number="form.max_speed_kmh" type="number" min="1" max="200"
                                                id="f-speed" class="form-control" placeholder="Opcional" />
                                            <span class="input-group-text bg-light text-muted">km/h</span>
                                        </div>

                                        <div class="form-check form-switch mt-3">
                                            <input class="form-check-input" type="checkbox" id="is_active" v-model="form.is_active" />
                                            <label class="form-check-label small" for="is_active">
                                                <i class="fad fa-toggle-on text-success me-1" aria-hidden="true"></i> Zona activa
                                            </label>
                                        </div>
                                    </div>

                                    <div class="col-12">
                                        <BaseFormActions :submitting="saving" :is-edit-mode="isEdit" @cancel="goBack" />
                                    </div>
                                </div>
                            </div>

                            <div class="col-12 col-lg-7 col-xl-8">
                                <div class="position-relative rounded-3 border border-light overflow-hidden" style="min-height: 520px;">
                                    <div id="geofenceMap" class="w-100" style="height: 520px;" role="application" aria-label="Mapa de geocerca: haz clic para ubicar el centro o agregar puntos del polígono"></div>

                                    <div class="position-absolute top-0 start-0 p-2 z-2">
                                        <span class="badge bg-white bg-opacity-90 text-dark shadow-sm px-2 py-1">
                                            <i class="fad fa-map-marked-alt text-primary me-1"></i>
                                            {{ form.type === 'circle' ? 'Centro del círculo' : 'Dibujo de polígono' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.required::after {
    content: " *";
    color: #dc3545;
    font-weight: 700;
}

.badge-subtle-primary {
    background: rgba(13, 110, 253, .1);
    color: #0d6efd;
    border: 1px solid rgba(13, 110, 253, .2);
}

:deep(.btn-falcon-default) {
    background: #f8f9fa;
    border-color: #e9ecef;
    color: #212529;
}

:deep(.btn-falcon-default:hover) {
    background: #e9ecef;
}

:deep(.leaflet-container) {
    border-radius: 0.5rem;
}
</style>