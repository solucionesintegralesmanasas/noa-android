<template>
  <div class="activity-card card border-0 shadow-sm">
    <div class="activity-tabs" role="tablist" aria-label="Actividad reciente">
      <button
        v-for="t in tabs"
        :key="t.value"
        role="tab"
        :aria-selected="activeTab === t.value"
        class="activity-tab"
        :class="{ 'is-active': activeTab === t.value }"
        @click="activeTab = t.value"
      >
        <i :class="t.icon" aria-hidden="true"></i>{{ t.label }}
      </button>
      <router-link :to="activeTab === 'inspections' ? '/inspeccion-vehiculos' : '/extracto-de-contrato'" class="activity-all">Ver todas</router-link>
    </div>
    <ul v-if="activeTab === 'inspections'" class="timeline">
      <li v-if="!inspections.length" class="timeline-empty"><i class="far fa-clipboard me-1" aria-hidden="true"></i>Sin inspecciones en este periodo.</li>
      <li v-for="item in inspections" :key="item.uuid" class="timeline-item">
        <span class="timeline-dot dot-blue" aria-hidden="true"></span>
        <div class="min-w-0">
          <p class="timeline-title">{{ item.date }} · <span class="timeline-plate">{{ item.plate }}</span></p>
          <p class="timeline-sub">{{ formatNumber(item.mileage) }} km reportados</p>
        </div>
      </li>
    </ul>
    <ul v-else class="timeline">
      <li v-if="!fuecs.length" class="timeline-empty"><i class="far fa-file-alt me-1" aria-hidden="true"></i>Sin FUECs en este periodo.</li>
      <li v-for="f in fuecs" :key="f.uuid" class="timeline-item">
        <span class="timeline-dot" :class="f.status === 'ACTIVO' ? 'dot-green' : 'dot-amber'" aria-hidden="true"></span>
        <div class="min-w-0">
          <p class="timeline-title">FUEC #{{ f.number }} · <span class="timeline-plate">{{ f.plate }}</span></p>
          <p class="timeline-sub text-truncate">{{ f.contractor }} · {{ f.status || 'GENERADO' }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';
defineProps({ inspections: { type: Array, default: () => [] }, fuecs: { type: Array, default: () => [] } });
const tabs = [
  { value: 'inspections', label: 'Inspecciones', icon: 'fas fa-clipboard-check me-1' },
  { value: 'fuecs', label: 'FUEC', icon: 'fas fa-file-contract me-1' },
];
const activeTab = ref('inspections');
const formatNumber = (n) => (n === null || n === undefined || isNaN(n) ? '0' : Number(n).toLocaleString('es-CO'));
</script>

<style scoped>
.activity-card { border-radius: 16px !important; overflow: hidden; }
.activity-tabs { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: #f9fafd; border-bottom: 1px solid #edf2f9; }
.dark .activity-tabs { background: #16181b; border-color: #25282c; }
.activity-tab { min-height: 44px; padding: 8px 14px; border-radius: 999px; border: 1px solid transparent; background: transparent; font-size: 14px; font-weight: 700; color: #5e6e82; }
.activity-tab.is-active { background: rgba(44,123,229,.12); color: #2c7be5; border-color: rgba(44,123,229,.25); }
.activity-all { margin-left: auto; font-size: 13px; font-weight: 700; color: #2c7be5; text-decoration: none; padding: 10px 6px; min-height: 44px; display: inline-flex; align-items: center; }
.timeline { list-style: none; margin: 0; padding: 12px 16px 16px 28px; display: flex; flex-direction: column; gap: 0; max-height: 340px; overflow-y: auto; }
.timeline-item { position: relative; padding: 10px 0 10px 14px; border-left: 2px solid #edf2f9; }
.timeline-dot { position: absolute; left: -7px; top: 14px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 2px #edf2f9; }
.dot-blue { background: #2c7be5; } .dot-green { background: #00d27a; } .dot-amber { background: #f5803e; }
.timeline-title { margin: 0; font-size: 14px; font-weight: 700; color: #001c41; }
.dark .timeline-title { color: #f1f4f9; }
.timeline-plate { display: inline-block; background: #edf2f9; border-radius: 6px; padding: 1px 7px; font-size: 12px; }
.timeline-sub { margin: 2px 0 0; font-size: 13px; color: #5e6e82; }
.timeline-empty { padding: 20px 0; font-size: 14px; color: #5e6e82; text-align: center; }
</style>
