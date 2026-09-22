<template>
  <div class="profile-photo-uploader d-flex flex-column align-items-center">
    <div class="avatar-orbit" :class="{ 'is-filled': hasPhoto }" :style="orbitStyle">
      <component
        :is="hasPhoto ? Image : 'div'"
        v-bind="imageBindings"
        class="avatar-frame"
        :class="{ 'avatar-empty': !hasPhoto }"
      >
        <template v-if="!hasPhoto">
          <i class="fas fa-camera avatar-empty-icon" aria-hidden="true"></i>
        </template>
      </component>
      <button
        v-if="hasPhoto"
        type="button"
        class="avatar-remove"
        aria-label="Quitar foto"
        title="Quitar foto"
        @click="onRemove"
      >
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </div>

    <input ref="fileInput" type="file" :id="inputId" class="d-none" :accept="accept" @change="onChange" />

    <div class="avatar-actions">
      <PButton
        type="button"
        :label="hasPhoto ? 'Cambiar' : 'Subir foto'"
        :icon="hasPhoto ? 'fas fa-refresh' : 'fas fa-upload'"
        size="small"
        text
        @click="triggerPicker"
      />
      <span v-if="!hasPhoto" class="avatar-caption">{{ label }}</span>
    </div>
  </div>
</template>

<script setup>
/**
 * Uploader de foto de perfil con anillo orbital animado (CSS procedural).
 * El anillo rota para invitar a subir foto y se aquieta cuando ya hay imagen.
 * Clic en la imagen abre la vista previa grande (primevue/image).
 */
import { computed, useTemplateRef } from 'vue';
import Image from 'primevue/image';
import PButton from 'primevue/button';

const props = defineProps({
  previewSrc: { type: String, default: '' },
  label: { type: String, default: 'Foto de Perfil' },
  size: { type: Number, default: 88 },
  accept: { type: String, default: 'image/png, image/jpeg, image/webp' },
  inputId: { type: String, default: 'photoInput' },
});

const emit = defineEmits(['change', 'remove']);

const fileInput = useTemplateRef('fileInput');

const hasPhoto = computed(() => !!props.previewSrc);

const orbitStyle = computed(() => ({
  '--avatar-size': `${props.size}px`,
}));

const imageBindings = computed(() =>
  hasPhoto.value
    ? { src: props.previewSrc, alt: props.label, preview: true, imageClass: 'avatar-img' }
    : {}
);

const triggerPicker = () => {
  fileInput.value?.click();
};

const onChange = (event) => {
  const file = event.target.files?.[0];
  if (file) emit('change', file);
  event.target.value = '';
};

const onRemove = () => emit('remove');
</script>

<style scoped>
.profile-photo-uploader {
  --orbit-speed: 7s;
  --brand-blue: #2c7be5;
  --brand-cyan: #00d2f4;
  --brand-green: #00d27a;
}

/* Anillo orbital: degradado cónico rotando en ::before, recorte a anillo con máscara */
.avatar-orbit {
  position: relative;
  width: calc(var(--avatar-size) + 12px);
  height: calc(var(--avatar-size) + 12px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
}

.avatar-orbit::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    var(--brand-blue),
    var(--brand-cyan),
    var(--brand-green),
    var(--brand-blue)
  );
  animation: orbit-spin var(--orbit-speed) linear infinite;
  z-index: 0;
}

.avatar-orbit::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: #fff;
  z-index: 1;
}

@keyframes orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Con foto el anillo se aquieta; se reanima suave al hover */
.avatar-orbit.is-filled::before {
  animation-play-state: paused;
}

.avatar-orbit.is-filled:hover::before {
  animation-play-state: running;
  animation-duration: calc(var(--orbit-speed) * 2);
}

.avatar-frame {
  position: relative;
  z-index: 2;
  width: var(--avatar-size);
  height: var(--avatar-size);
  border-radius: 50%;
  overflow: hidden;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-frame :deep(.avatar-img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  cursor: zoom-in;
}

.avatar-empty {
  background: linear-gradient(135deg, rgba(44, 123, 229, 0.1), rgba(0, 210, 244, 0.12));
}

.avatar-empty-icon {
  font-size: 1.6rem;
  color: var(--brand-blue);
}

.avatar-remove {
  position: absolute;
  z-index: 3;
  top: 2px;
  right: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #e5484d;
  color: #fff;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.avatar-remove:hover {
  background: #c2222a;
}

.avatar-remove:focus-visible {
  outline: 2px solid #2c7be5;
  outline-offset: 2px;
}

.avatar-actions {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.avatar-caption {
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 500;
}

@media (prefers-reduced-motion: reduce) {
  .avatar-orbit::before {
    animation: none;
  }
}
</style>
