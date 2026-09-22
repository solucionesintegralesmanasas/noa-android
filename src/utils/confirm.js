// Confirmaciones con SweetAlert2 cargado de forma diferida.
// Se usa `import()` para no sumar SweetAlert2 al arranque de la aplicación.
let SwalPromise = null;

function getSwal() {
    if (!SwalPromise) {
        SwalPromise = import('sweetalert2').then(({ default: Swal }) => Swal);
    }
    return SwalPromise;
}

/**
 * Pregunta al usuario qué hacer con cambios sin guardar.
 * @returns {Promise<'save'|'discard'|'cancel'>}
 */
export async function confirmUnsavedChanges() {
    try {
        const Swal = await getSwal();
        const result = await Swal.fire({
            title: 'Tienes cambios sin guardar',
            text: 'Puedes guardarlos antes de continuar o salir sin guardar.',
            icon: 'warning',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Guardar y continuar',
            denyButtonText: 'Salir sin guardar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#2c7be5',
            denyButtonColor: '#e63757',
            reverseButtons: true,
        });

        if (result.isConfirmed) return 'save';
        if (result.isDenied) return 'discard';
        return 'cancel';
    } catch {
        // Si SweetAlert2 no está disponible, no bloqueamos la navegación.
        return 'discard';
    }
}
