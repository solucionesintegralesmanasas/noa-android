// SweetAlert2 se carga de forma diferida para no bloquear el arranque:
// el primer toast importa el chunk bajo demanda y lo reutiliza después.
let ToastPromise = null;

function getToast() {
    if (!ToastPromise) {
        ToastPromise = import('sweetalert2').then(({ default: Swal }) => Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            showClass: { popup: 'toast-slide-in' },
            hideClass: { popup: 'toast-slide-out' },
            customClass: { popup: 'toast-thin', timerProgressBar: 'toast-thin-bar' },
            didOpen: (t) => {
                if (t) {
                    t.onmouseenter = () => {
                        try {
                            if (typeof Swal.stopTimer === 'function') Swal.stopTimer();
                        } catch {
                            // Ignorar error si el timer ya se cerró
                        }
                    };
                    t.onmouseleave = () => {
                        try {
                            if (typeof Swal.resumeTimer === 'function') Swal.resumeTimer();
                        } catch {
                            // Ignorar error si el timer ya se cerró
                        }
                    };
                }
            }
        }));
    }
    return ToastPromise;
}

let lastToastKey = '';
let lastToastTime = 0;

/**
 * Muestra un mensaje tipo toast en la esquina superior derecha.
 * @param {string} title - Título del mensaje.
 * @param {string} text - Descripción del mensaje.
 * @param {string} icon - Ícono (success, error, warning, info, question).
 */
export const toast = async (title, text, icon = 'info') => {
    const key = `${title || ''}:${text || ''}:${icon}`;
    const now = Date.now();
    // Evitar ráfagas de toasts idénticos en menos de 800ms
    if (key === lastToastKey && (now - lastToastTime) < 800) {
        return Promise.resolve();
    }
    lastToastKey = key;
    lastToastTime = now;

    // Normalizar título/texto: nunca enviar ambos vacíos porque
    // SweetAlert2 considera el payload "vacío" y retorna `false`
    // en vez de una Promise (rompiendo encadenar `.catch`).
    const hasTitle = typeof title === 'string' && title.trim() !== '';
    const hasText = typeof text === 'string' && text.trim() !== '';
    const cleanTitle = hasTitle ? title : (hasText ? text : '');
    const cleanText = hasTitle && hasText ? text : undefined;

    // Si no hay contenido qué mostrar, no abrir (evita `false.catch`)
    if (!cleanTitle && !cleanText) {
        return Promise.resolve();
    }

    try {
        const Toast = await getToast();
        const result = Toast.fire({
            icon: icon,
            title: cleanTitle,
            text: cleanText
        });
        // En algunos entornos `fire` puede retornar `false` o `undefined`
        if (result && typeof result.catch === 'function') {
            return result.catch(() => {});
        }
    } catch (error) {
        // El toast nunca debe romper el flujo de la aplicación
        console.warn('Toast no disponible:', error);
    }

    return Promise.resolve();
};

