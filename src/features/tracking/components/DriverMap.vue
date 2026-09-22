<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue';
import { useTrackingStore } from '../store/tracking.store';
import { useGeolocation } from '@/hooks/useGeolocation';

const props = defineProps({
    showGeofences: { type: Boolean, default: true },
    interactive: { type: Boolean, default: true },
});

const emit = defineEmits(['driver-selected']);

const store = useTrackingStore();
const { loadLeaflet } = useGeolocation();

let map = null;
let markers = {};
let geofenceLayers = [];
let polylineLayer = null;

const DEFAULT_CENTER = [4.710993, -74.072068];
const DEFAULT_ZOOM = 12;

const driverIcon = (isMoving, initials = '?') => `
    <div style="
        width:38px;height:38px;min-width:38px;
        border-radius:50%;
        background:${isMoving ? '#22c55e' : '#f59e0b'};
        border:3px solid white;
        box-shadow:0 2px 10px rgba(0,0,0,.25);
        display:flex;align-items:center;justify-content:center;
        color:white;font-size:12px;font-weight:700;letter-spacing:.5px;
        box-sizing:border-box;
    ">${initials}</div>
`;

function setupMap(L) {
    map = L.map('trackingMap', {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(map);

    if (store.selectedDriver?.history) {
        drawHistory(L, store.selectedDriver.history);
    }

    if (props.showGeofences) {
        drawAllGeofences();
    }
}

function clearGeofences() {
    if (!map) return;
    geofenceLayers.forEach((layer) => map.removeLayer(layer));
    geofenceLayers = [];
}

function drawAllGeofences() {
    if (!map || !window.L) return;
    clearGeofences();
    store.geofences
        .filter((gf) => gf.is_active !== false)
        .forEach((gf) => drawGeofence(window.L, gf));
}

watch(
    () => props.showGeofences,
    (show) => {
        if (!map) return;
        if (show) {
            drawAllGeofences();
        } else {
            clearGeofences();
        }
    }
);

watch(
    () => store.activeDrivers,
    () => {
        updateMap();
    }
);


function getDriverInitials(driver) {
    const first = driver.driver?.first_name || driver.first_name || '';
    const last = driver.driver?.last_name || driver.last_name || '';
    if (first && last) return (first[0] + last[0]).toUpperCase();
    return (first[0] || '?').toUpperCase();
}

function drawDriver(L, driver) {
    if (!driver?.latitude && !driver?.last_location?.latitude) {
        return;
    }

    const lat = driver.latitude ?? driver.last_location?.latitude;
    const lng = driver.longitude ?? driver.last_location?.longitude;
    const isMoving = driver.is_moving ?? driver.last_location?.is_moving ?? false;
    const initials = getDriverInitials(driver);

    if (markers[driver.third_party_uuid]) {
        markers[driver.third_party_uuid].setLatLng([lat, lng]);
        markers[driver.third_party_uuid].setIcon(L.divIcon({ html: driverIcon(isMoving, initials), className: '' }));
        markers[driver.third_party_uuid].bindPopup(buildPopup(driver));
        return;
    }

    const marker = L.marker([lat, lng], {
        icon: L.divIcon({ html: driverIcon(isMoving, initials), className: '' }),
    }).addTo(map);

    marker.bindPopup(buildPopup(driver));
    marker.on('click', () => {
        store.selectDriver(driver);
        emit('driver-selected', driver);
    });

    markers[driver.third_party_uuid] = marker;
}

function buildPopup(driver) {
    const name = driver.driver?.first_name || driver.first_name || 'Conductor';
    const lastName = driver.driver?.last_name || driver.last_name || '';
    const fullName = `${name} ${lastName}`.trim();
    const plate = driver.vehicle?.vehicle_license_plate || driver.vehicle_license_plate || 'Sin vehículo';
    const docNum = driver.driver?.document_number || driver.document_number || '';
    const speed = Math.round(driver.speed ?? driver.last_location?.speed ?? 0);
    const isMoving = driver.is_moving ?? driver.last_location?.is_moving ?? false;
    const projectName = driver.project?.project_name || driver.planilla_dia?.project_name || null;
    const routes = driver.planilla_dia?.routes || [];
    const firstFunc = routes.find((r) => r.funcionario_nombre || r.funcionario_cc);
    const funcNombre = firstFunc?.funcionario_nombre || null;
    const funcCc = firstFunc?.funcionario_cc || null;
    const esHoy = driver.planilla_dia?.es_planilla_hoy !== false;
    const fechaPlanilla = driver.planilla_dia?.service_date
        ? new Date(driver.planilla_dia.service_date).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })
        : '';

    const speedColor = isMoving ? '#16a34a' : '#b45309';
    const speedBg = isMoving ? '#f0fdf4' : '#fffbeb';
    const speedBorder = isMoving ? '#bbf7d0' : '#fde68a';

    const routeRows = routes.length
        ? routes.slice(0, 3).map((r) =>
            `<div style="display:flex;align-items:center;gap:4px;padding:2px 0;">
                <span style="color:#94a3b8;font-size:10px;">▸</span>
                <span style="color:#1e293b;">${r.origin || '?'} → ${r.destination || '?'}</span>
            </div>`
        ).join('')
            + (routes.length > 3
                ? `<div style="color:#94a3b8;font-size:10px;padding-top:2px;">+${routes.length - 3} rutas más</div>`
                : '')
        : `<span style="color:#94a3b8;">Sin rutas registradas</span>`;

    const rutasTitulo = routes.length
        ? (esHoy ? 'Rutas de hoy' : `Rutas del ${fechaPlanilla}`)
        : 'Rutas';

    const rowStyle = 'display:flex;align-items:center;gap:6px;padding:3px 0;';
    const labelStyle = 'color:#64748b;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;min-width:64px;';
    const valueStyle = 'color:#1e293b;font-size:11px;';
    const dividerStyle = 'border:none;border-top:1px dashed #e2e8f0;margin:6px 0;';

    return `
        <div style="min-width:240px;max-width:280px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:4px 2px;">

            <!-- Encabezado: nombre + velocidad -->
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
                <div>
                    <div style="font-weight:700;font-size:13px;color:#0f172a;line-height:1.2;">${fullName}</div>
                    <div style="font-size:11px;color:#64748b;margin-top:1px;">🚗 ${plate}${docNum ? ` · CC ${docNum}` : ''}</div>
                </div>
                <div style="
                    background:${speedBg};color:${speedColor};
                    border:1px solid ${speedBorder};
                    border-radius:20px;padding:3px 9px;
                    font-size:12px;font-weight:700;white-space:nowrap;
                    flex-shrink:0;
                ">${speed} km/h</div>
            </div>

            <hr style="${dividerStyle}">

            <!-- Proyecto -->
            ${projectName ? `
            <div style="${rowStyle}">
                <span style="${labelStyle}">Proyecto</span>
                <span style="
                    background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;
                    border-radius:20px;padding:1px 8px;
                    font-size:10px;font-weight:600;
                    max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
                ">${projectName}</span>
            </div>` : ''}

            <!-- Funcionario -->
            ${funcNombre ? `
            <div style="${rowStyle}">
                <span style="${labelStyle}">Funcionario</span>
                <span style="${valueStyle}">${funcNombre}${funcCc ? ` <span style='color:#94a3b8'>· CC ${funcCc}</span>` : ''}${routes.length > 1 ? ` <span style='color:#94a3b8'>(+${routes.length - 1})</span>` : ''}</span>
            </div>` : ''}

            <hr style="${dividerStyle}">

            <!-- Rutas -->
            <div style="margin-bottom:2px;">
                <div style="font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;">${rutasTitulo}</div>
                <div style="font-size:11px;">${routeRows}</div>
            </div>
        </div>
    `;
}


function drawGeofence(L, geofence) {
    let layer = null;

    if (geofence.type === 'circle') {
        layer = L.circle([geofence.center_lat, geofence.center_lng], {
            radius: geofence.radius_meters,
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.15,
            weight: 2,
        }).addTo(map);
        layer.bindPopup(`<strong>${geofence.name}</strong><br>Zona circular · ${geofence.radius_meters} m`);
    } else if (geofence.type === 'polygon') {
        const points = (geofence.polygon_points || []).map((p) => [p.lat ?? p[0], p.lng ?? p[1]]);
        layer = L.polygon(points, {
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.15,
            weight: 2,
        }).addTo(map);
        layer.bindPopup(`<strong>${geofence.name}</strong><br>Zona poligonal`);
    }

    if (layer) {
        geofenceLayers.push(layer);
    }
}

function drawHistory(L, history) {
    if (polylineLayer) {
        map.removeLayer(polylineLayer);
    }
    if (!history || history.length < 2) return;

    const points = history.map((point) => [point.latitude, point.longitude]);
    polylineLayer = L.polyline(points, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7,
    }).addTo(map);

    const first = points[0];
    const last = points[points.length - 1];
    L.marker(first, { icon: L.divIcon({ html: '🟢', className: '', iconSize: [20, 20] }) }).addTo(map);
    L.marker(last, { icon: L.divIcon({ html: '🔴', className: '', iconSize: [20, 20] }) }).addTo(map);

    map.fitBounds(L.latLngBounds(points).pad(0.1));
}

let hasFittedDrivers = false;

function fitDrivers() {
    if (!map || !window.L) return;
    const points = store.activeDrivers
        .map((d) => [d.latitude ?? d.last_location?.latitude, d.longitude ?? d.last_location?.longitude])
        .filter(([lat, lng]) => lat != null && lng != null);
    if (!points.length) return;
    if (points.length === 1) {
        map.setView(points[0], 15);
    } else {
        map.fitBounds(window.L.latLngBounds(points).pad(0.15));
    }
    hasFittedDrivers = true;
}

function updateMap() {
    if (!map) return;
    const L = window.L;
    if (!L) return;

    // Actualizar conductores
    store.activeDrivers.forEach((driver) => drawDriver(L, driver));

    if (store.activeDrivers.length && !hasFittedDrivers) {
        fitDrivers();
    }

    // Actualizar selección/historial
    if (store.selectedDriver?.history) {
        drawHistory(L, store.selectedDriver.history);
    }
}

let intervalId = null;

onMounted(async () => {
    try {
        const L = await loadLeaflet();
        setupMap(L);
        updateMap();

        intervalId = setInterval(updateMap, 10000);

        setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 300);
    } catch (err) {
        console.error('Error inicializando mapa:', err);
    }
});

onBeforeUnmount(() => {
    if (intervalId) {
        clearInterval(intervalId);
    }
    if (map) {
        map.remove();
        map = null;
    }
});
</script>

<template>
    <div class="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-gray-200">
        <div id="trackingMap" class="w-full h-full" style="min-height: 400px;"></div>

        <div class="absolute top-3 left-3 z-[1000] bg-white rounded-lg shadow px-3 py-2 text-sm">
            <span class="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
            En movimiento
            <span class="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1 ml-3"></span>
            Detenido
        </div>
    </div>
</template>