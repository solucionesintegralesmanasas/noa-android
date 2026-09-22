<template>
  <div class="d-flex flex-column-reverse flex-sm-row justify-content-sm-end gap-2 mt-4 pt-3 border-top">

    <!-- Cancelar / Volver — secundario, abajo en móvil, izquierda en desktop -->
    <button type="button" class="btn btn-outline-secondary rounded-pill px-3 w-100 w-sm-auto order-1 order-sm-0"
      :disabled="submitting" @click="$emit('cancel')">
      <i :class="`${cancelIconClass} me-1`" aria-hidden="true"></i> {{ cancelText }}
    </button>

    <!-- Guardar / Actualizar — primario, arriba en móvil, derecha en desktop -->
    <button type="submit" class="btn btn-success rounded-pill px-4 shadow-sm w-100 w-sm-auto order-0 order-sm-1"
      :disabled="submitting || disabled" :aria-busy="submitting">
      <span v-show="submitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
      <i v-show="!submitting && !disabled" class="fas fa-check me-1" aria-hidden="true"></i>
      <span aria-live="polite">
        <span v-show="submitting">Guardando...</span>
        <span v-show="!submitting">{{ submitLabelText }}</span>
      </span>
    </button>

  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  submitting: {
    type: Boolean,
    default: false
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  wizardMode: {
    type: Boolean,
    default: false
  },
  /**
   * Deshabilita el botón principal. Se usa, por ejemplo, cuando no hay
   * cambios que guardar respecto al documento original.
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /** Etiqueta del botón principal. Si se indica, reemplaza el cálculo por defecto. */
  submitLabel: {
    type: String,
    default: ''
  },
  /** Etiqueta del botón secundario. Si se indica, reemplaza "Cancelar"/"Anterior". */
  cancelLabel: {
    type: String,
    default: ''
  },
  /** Clase del icono del botón secundario. Si no se indica, se infiere. */
  cancelIcon: {
    type: String,
    default: ''
  }
});

defineEmits(['cancel']);

// En modo asistente (?wizard=) Guardar avanza al siguiente paso:
// la etiqueta lo deja explícito para no confundir con un guardado final.
const submitLabelText = computed(() => {
  if (props.submitLabel) return props.submitLabel;
  if (props.isEditMode) return 'Actualizar';
  return props.wizardMode ? 'Guardar y continuar' : 'Guardar';
});

const cancelText = computed(() => {
  if (props.cancelLabel) return props.cancelLabel;
  return props.wizardMode ? 'Anterior' : 'Cancelar';
});

const cancelIconClass = computed(() => {
  if (props.cancelIcon) return props.cancelIcon;
  return props.wizardMode ? 'fas fa-arrow-left' : 'fas fa-times';
});
</script>

<style scoped>
.btn:not(:disabled) {
  cursor: pointer;
}

.btn:focus-visible {
  outline: 2px solid #2c7be5;
  outline-offset: 2px;
}
</style>
