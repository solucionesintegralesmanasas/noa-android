<template>
  <div class="wizard-strip mb-3">
    <div class="wizard-steps d-flex align-items-start" role="group" aria-label="Progreso del registro">
      <template v-for="(step, i) in steps" :key="step.key">
        <button
          type="button"
          class="wizard-node"
          :class="{ 'wizard-node-nav': isNavigable(step) }"
          :disabled="!isNavigable(step)"
          :aria-current="step.key === current ? 'step' : undefined"
          :aria-label="isNavigable(step) ? nodeAria(step) : undefined"
          :title="stepTitle(step)"
          @click="onNavigate(step)"
        >
          <span class="wizard-dot" :class="stepStateClass(step)">
            <svg
              v-if="showCheck(step)"
              class="wizard-check"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 12.5l5 5L20 6.5"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                pathLength="1"
              />
            </svg>
            <i v-else :class="currentIcon(step)" aria-hidden="true"></i>
          </span>
          <span class="wizard-caption" :class="{ 'wizard-caption-active': step.key === current }">
            {{ step.label }}
          </span>
        </button>
        <span v-if="i < steps.length - 1" class="wizard-link" :class="{ 'wizard-link-done': isLinkDone(i) }"></span>
      </template>
    </div>
  </div>
</template>

<script setup>
/**
 * Stepper del asistente de documentos: nodos con icono y conector.
 * Los nodos son navegables si `clickable` está activo: emiten `navigate`
 * con la clave del paso para que el formulario decida cómo ir a él.
 */
import { computed } from 'vue';
import { WIZARD_STEPS } from '@/hooks/useDocumentWizard.js';

const props = defineProps({
  current: { type: String, required: true },
  doneKeys: { type: Array, default: () => [] },
  incompleteKeys: { type: Array, default: () => [] },
  disabledKeys: { type: Array, default: () => [] },
  clickable: { type: Boolean, default: false },
});

const emit = defineEmits(['navigate']);

const steps = computed(() => WIZARD_STEPS);

const orderOf = (key) => steps.value.map((s) => s.key).indexOf(key);

const isDone = (step) => props.doneKeys.includes(step.key);
const isIncomplete = (step) => props.incompleteKeys.includes(step.key);

/** El chulo solo aparece en pasos completados que no son el actual. */
const showCheck = (step) => isDone(step) && step.key !== props.current;

/** El paso actual ya tiene datos (completos o parciales) y se está editando. */
const isCurrentEditing = (step) =>
  step.key === props.current && (isDone(step) || isIncomplete(step));

/**
 * Icono del nodo: lápiz mientras se edita un paso con datos,
 * icono del documento si está vacío o es otro paso.
 */
const currentIcon = (step) => {
  if (isCurrentEditing(step)) return 'fas fa-pen';
  return step.icon;
};

const isNavigable = (step) =>
  props.clickable &&
  step.key !== props.current &&
  !props.disabledKeys.includes(step.key);

const stepStateClass = (step) => {
  if (step.key === props.current) return 'wizard-dot-current';
  if (isIncomplete(step)) return 'wizard-dot-incomplete';
  if (isDone(step)) return 'wizard-dot-done';
  return orderOf(step.key) < orderOf(props.current)
    ? 'wizard-dot-past'
    : 'wizard-dot-next';
};

const isLinkDone = (i) => {
  const order = steps.value.map((s) => s.key);
  return order.indexOf(props.current) > i || props.doneKeys.includes(steps.value[i].key);
};

const stateLabel = (step) => {
  if (step.key === props.current) {
    return isCurrentEditing(step) ? 'en edición' : 'en registro';
  }
  if (isIncomplete(step)) return 'incompleto, falta información';
  if (isDone(step)) return 'cargado';
  return 'pendiente';
};

const stepTitle = (step) => {
  const base = `${step.label}: ${stateLabel(step)}`;
  if (isNavigable(step)) return `${base}. Pulsa para abrir este paso`;
  if (step.hint && !isDone(step) && step.key !== props.current) return `${base}. ${step.hint}`;
  return base;
};

const nodeAria = (step) => `${step.label}, ${stateLabel(step)}. Ir a este paso`;

const onNavigate = (step) => {
  if (!isNavigable(step)) return;
  emit('navigate', step.key);
};
</script>

<style scoped>
/* Barra de herramientas plana: el relieve lo pone la tarjeta del formulario */
.wizard-strip {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.625rem;
  padding: 0.7rem 0.9rem;
}

.wizard-steps {
  min-width: 0;
}

.wizard-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: default;
  border-radius: 0.5rem;
}

.wizard-node-nav {
  cursor: pointer;
}

.wizard-node-nav:focus-visible {
  outline: 2px solid #2c7be5;
  outline-offset: 3px;
}

.wizard-node-nav:hover .wizard-caption {
  color: #0f172a;
}

.wizard-dot {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  border: 2px solid transparent;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s, transform 0.18s;
}

.wizard-node-nav:hover .wizard-dot {
  transform: translateY(-1px);
}

.wizard-dot-current {
  background: linear-gradient(135deg, #2c7be5, #1a68d1);
  color: #fff;
  box-shadow: 0 4px 12px rgba(44, 123, 229, 0.4);
}

.wizard-dot-done {
  position: relative;
  background: rgba(44, 123, 229, 0.08);
  color: #1a68d1;
  isolation: isolate;
}

/* Anillo orbital azul: diferencia expresa frente al multicolor de la foto de perfil */
.wizard-dot-done::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #2c7be5, #00d2f4, #1a68d1, #2c7be5);
  animation: orbit-spin 5s linear infinite;
  z-index: 0;
}

.wizard-dot-done::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 50%;
  background: #fff;
  z-index: 1;
}

.wizard-dot-done > * {
  position: relative;
  z-index: 2;
}

@keyframes orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Check que se dibuja al confirmar el guardado */
.wizard-check {
  width: 1.1rem;
  height: 1.1rem;
}

.wizard-check path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: check-draw 0.5s ease-out 0.1s forwards;
}

@keyframes check-draw {
  to {
    stroke-dashoffset: 0;
  }
}

.wizard-dot-past {
  background: rgba(44, 123, 229, 0.1);
  color: #1a68d1;
}

/* Documento existente pero incompleto (por ejemplo, solo una póliza de dos) */
.wizard-dot-incomplete {
  background: rgba(245, 128, 62, 0.14);
  color: #d96716;
  border-color: rgba(245, 128, 62, 0.45);
}

.wizard-dot-next {
  background: #eef2f7;
  color: #64748b;
}

.wizard-caption {
  font-size: 0.68rem;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
  transition: color 0.18s;
}

.wizard-caption-active {
  color: #0f172a;
  font-weight: 700;
}

.wizard-link {
  flex: 1 1 1.5rem;
  min-width: 0.75rem;
  height: 2px;
  margin: 1.25rem 0.35rem 0;
  background: #e2e8f0;
  border-radius: 2px;
}

.wizard-link-done {
  background: linear-gradient(90deg, #2c7be5, #00d2f4);
}

@media (prefers-reduced-motion: reduce) {
  .wizard-dot-done::before,
  .wizard-check path {
    animation: none;
  }
  .wizard-check path {
    stroke-dashoffset: 0;
  }
  .wizard-node-nav:hover .wizard-dot {
    transform: none;
  }
}
</style>
