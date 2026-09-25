<template>
  <div class="mobile-section-header">
    <div class="msh-title">
      <div v-if="iconClass || $slots.icon" class="msh-icon" :style="{ backgroundColor: iconBg }">
        <slot name="icon">
          <i :class="iconClass" aria-hidden="true"></i>
        </slot>
      </div>
      <h2 class="msh-text">{{ title }}</h2>
      <span v-if="badge" class="msh-badge">{{ badge }}</span>
    </div>
    <div class="msh-actions">
      <slot name="action">
        <span v-if="actionText" class="msh-action-link" @click="$emit('action')">
          {{ actionText }}
        </span>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  iconClass: {
    type: String,
    default: '',
  },
  iconBg: {
    type: String,
    default: '#1e40af',
  },
  badge: {
    type: [String, Number],
    default: '',
  },
  actionText: {
    type: String,
    default: '',
  },
});

defineEmits(['action']);
</script>

<style scoped>
.mobile-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 8px 6px;
  gap: 8px;
}

.msh-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.msh-icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 11px;
  flex-shrink: 0;
}

.msh-text {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}

.msh-badge {
  font-size: 10px;
  font-weight: 700;
  background: #e2e8f0;
  color: #475569;
  padding: 2px 7px;
  border-radius: 12px;
}

.msh-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.msh-action-link {
  font-size: 11px;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
}
</style>
