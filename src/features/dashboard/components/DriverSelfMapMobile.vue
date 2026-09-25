<template>
  <div :id="anchorId" class="selfmap-mobile card border-0 shadow-sm overflow-hidden">
    <div class="selfmap-head">
      <div class="d-flex align-items-center gap-2 min-w-0">
        <h2 class="selfmap-title">Mi ubicación</h2>
        <span class="badge rounded-pill selfmap-live"><span class="live-dot" aria-hidden="true"></span>LIVE</span>
      </div>
      <div class="selfmap-chips">
        <span v-if="isTracking" class="chip chip-speed"><i class="fas fa-satellite me-1" aria-hidden="true"></i>{{ speed }} km/h</span>
        <span v-if="isTracking" class="chip chip-time"><i class="far fa-clock me-1" aria-hidden="true"></i>{{ formattedDuration }}</span>
      </div>
    </div>
    <DriverSelfMap :vehicles="vehicles" :preferred-vehicle-uuid="preferredVehicleUuid" />
    <p class="selfmap-note"><i class="fas fa-shield-alt me-1" aria-hidden="true"></i>El GPS sigue activo aunque cambies de pantalla. La central ve tu ruta en vivo.</p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import DriverSelfMap from '@/features/tracking/components/DriverSelfMap.vue';
import { useDriverTrackingStore } from '@/features/tracking/store/driverTracking.store';

defineProps({
  vehicles: { type: Array, default: () => [] },
  preferredVehicleUuid: { type: String, default: null },
  anchorId: { type: String, default: 'conductor-mapa' },
});

const tracking = useDriverTrackingStore();
const isTracking = computed(() => tracking.isTracking);
const speed = computed(() => tracking.speed ?? 0);
const elapsed = ref(0);
let timer = null;
const formattedDuration = computed(() => {
  const h = Math.floor(elapsed.value / 3600);
  const m = Math.floor((elapsed.value % 3600) / 60);
  const s = elapsed.value % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
});
onMounted(() => { timer = setInterval(() => { if (isTracking.value) elapsed.value++; }, 1000); });
onBeforeUnmount(() => { if (timer) clearInterval(timer); });
</script>

<style scoped>
.selfmap-mobile { border-left: 5px solid #00d27a !important; border-radius: 16px !important; }
.selfmap-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 14px; background: #f9fafd; border-bottom: 1px solid #edf2f9; flex-wrap: wrap; }
.dark .selfmap-head { background: #16181b; border-color: #25282c; }
.selfmap-title { margin: 0; font-size: 16px; font-weight: 800; color: #001c41; }
.dark .selfmap-title { color: #f1f4f9; }
.selfmap-live { background: #e63757; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 5px; }
.live-dot { width: 7px; height: 7px; border-radius: 50%; background: #fff; display: inline-block; animation: live-pulse 1.4s ease-out infinite; }
@keyframes live-pulse { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,.7); } 70% { box-shadow: 0 0 0 5px rgba(255,255,255,0); } 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); } }
.selfmap-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { font-size: 13px; font-weight: 700; padding: 6px 10px; border-radius: 999px; background: #edf2f9; color: #344050; }
.chip-speed { color: #009e5c; } .chip-time { color: #2c7be5; }
.selfmap-mobile :deep(#driverSelfMap) { height: 72vw !important; max-height: 300px !important; min-height: 240px !important; }
.selfmap-mobile :deep(.card-footer) { font-size: 13px !important; }
.selfmap-mobile :deep(.btn-sm) { min-height: 44px; font-size: 14px; }
.selfmap-note { margin: 0; padding: 10px 14px; font-size: 13px; color: #5e6e82; }
@media (prefers-reduced-motion: reduce) { .live-dot { animation: none; } }
</style>
