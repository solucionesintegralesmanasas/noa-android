// src/hooks/useFormManager.js
import { useAccessibleForm } from './useAccessibleForm.js';

/**
 * Hook para gestionar formularios con validación y loading.
 *
 * Envoltura compatible sobre `useAccessibleForm`: misma firma de retorno
 * (`{ formData, errors, isSubmitting, validate, reset }`) más los helpers
 * accesibles (`validateAndFocus`, `fieldAria`, `errorId`, `submit`).
 *
 * Mejoras frente a la versión anterior: `trim()` antes de validar, reglas
 * `minLength`/`maxLength`/`email`/`pattern`, mensajes con nombre de campo y
 * foco al primer error.
 */
export function useFormManager(initialState = {}, validationSchema = {}) {
    const form = useAccessibleForm(initialState, validationSchema);

    return {
        formData: form.formData,
        errors: form.errors,
        isSubmitting: form.isSubmitting,
        validate: form.validate,
        reset: form.reset,
        // Helpers accesibles (nuevos, opcionales para el llamador)
        validateAndFocus: form.validateAndFocus,
        focusFirstError: form.focusFirstError,
        fieldAria: form.fieldAria,
        errorId: form.errorId,
        submit: form.submit,
        errorSummaryId: form.errorSummaryId,
    };
}
