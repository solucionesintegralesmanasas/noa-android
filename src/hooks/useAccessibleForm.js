// src/hooks/useAccessibleForm.js
import { reactive, ref, nextTick } from 'vue';

/**
 * Composable estándar para formularios accesibles.
 *
 * Incluye validación con `trim()`, mensajes en español con nombre de campo,
 * bloqueo de doble envío, foco al primer error y helpers ARIA.
 *
 * Esquema de reglas por campo:
 * {
 *   campo: { required: true, label: 'Nombre visible', minLength: 3, maxLength: 60,
 *            email: true, pattern: /.../, message: 'Mensaje personalizado' }
 * }
 *
 * @param {Object} initialState - Valores iniciales del formulario.
 * @param {Object} validationSchema - Reglas por campo.
 */
export function useAccessibleForm(initialState = {}, validationSchema = {}) {
    const formData = reactive({ ...initialState });
    const errors = reactive({});
    const isSubmitting = ref(false);
    const errorSummaryId = `form-errors-${Math.random().toString(36).slice(2, 8)}`;

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const getLabel = (key) => validationSchema[key]?.label || key.replace(/_/g, ' ');

    const clearErrors = () => {
        Object.keys(errors).forEach((key) => delete errors[key]);
    };

    const validateField = (key, rawValue) => {
        const rules = validationSchema[key];
        if (!rules) return null;
        const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
        const label = getLabel(key);
        const empty = value === null || value === undefined || value === '';

        if (rules.required && empty) {
            return rules.message || `${label} es obligatorio`;
        }
        if (empty) return null;
        if (rules.minLength && String(value).length < rules.minLength) {
            return rules.message || `${label} debe tener al menos ${rules.minLength} caracteres`;
        }
        if (rules.maxLength && String(value).length > rules.maxLength) {
            return rules.message || `${label} debe tener máximo ${rules.maxLength} caracteres`;
        }
        if (rules.email && !EMAIL_RE.test(String(value))) {
            return rules.message || `${label} no tiene un formato válido`;
        }
        if (rules.pattern && !rules.pattern.test(String(value))) {
            return rules.message || `${label} no tiene un formato válido`;
        }
        return null;
    };

    const validate = () => {
        clearErrors();
        const newErrors = {};
        Object.keys(validationSchema || {}).forEach((key) => {
            const message = validateField(key, formData[key]);
            if (message) newErrors[key] = message;
        });
        Object.assign(errors, newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Valida y mueve el foco al primer campo con error.
     * @param {HTMLElement|Document} [root=document] - Raíz donde buscar los campos.
     * @returns {Promise<boolean>} `true` si el formulario es válido.
     */
    const validateAndFocus = async (root = document) => {
        const valid = validate();
        if (!valid) await focusFirstError(root);
        return valid;
    };

    // Convención del proyecto: los mensajes de error usan `f-<campo>-error`.
    const fieldId = (key) => `f-${String(key).replace(/\./g, '-')}`;
    const errorId = (key) => (errors[key] ? `${fieldId(key)}-error` : undefined);

    /**
     * Atributos ARIA para un campo: `{ 'aria-invalid', 'aria-describedby' }`.
     */
    const fieldAria = (key) => ({
        'aria-invalid': errors[key] ? 'true' : 'false',
        'aria-describedby': errorId(key),
    });

    const focusFirstError = async (root = document) => {
        await nextTick();
        const scope = root && root.querySelector ? root : document;
        const firstKey = Object.keys(errors)[0];
        if (!firstKey) return;
        const target =
            scope.querySelector(`#${CSS.escape(fieldId(firstKey))}`) ||
            scope.querySelector(`#${CSS.escape(firstKey)}`) ||
            scope.querySelector('[aria-invalid="true"]') ||
            scope.querySelector('.is-invalid, .is-invalid-select2, .p-invalid');
        if (target) {
            if (!target.hasAttribute('tabindex') && !/^(INPUT|SELECT|TEXTAREA|BUTTON|A)$/.test(target.tagName)) {
                target.setAttribute('tabindex', '-1');
            }
            target.focus({ preventScroll: false });
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    /**
     * Ejecuta `fn` con bloqueo de doble envío (asigna `isSubmitting`).
     * @returns {Promise<*>} Resultado de `fn`, o `undefined` si ya había un envío en curso.
     */
    const submit = async (fn) => {
        if (isSubmitting.value) return undefined;
        isSubmitting.value = true;
        try {
            return await fn();
        } finally {
            isSubmitting.value = false;
        }
    };

    const reset = () => {
        Object.keys(formData).forEach((key) => {
            formData[key] = key in (initialState || {}) ? initialState[key] : null;
        });
        clearErrors();
        isSubmitting.value = false;
    };

    return {
        formData,
        errors,
        isSubmitting,
        errorSummaryId,
        validate,
        validateField,
        validateAndFocus,
        focusFirstError,
        fieldAria,
        fieldId,
        errorId,
        submit,
        reset,
    };
}
