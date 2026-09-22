<template>
    <!-- ═══ TABLA ═══ -->
    <div v-if="type === 'table'" class="card-body p-0">
        <div class="table-responsive scrollbar">
            <table class="table table-sm mb-0">
                <thead>
                    <tr>
                        <th v-for="(w, i) in columns" :key="i" style="padding: 12px 8px;">
                            <div class="skeleton-text sk-h-sm" :style="`width:${w}`" />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="n in rows" :key="`sk-row-${n}`">
                        <td v-for="i in (columns.length - 1)" :key="i">
                            <div class="skeleton-text sk-h-md" style="width: 75%;" />
                        </td>
                        <td>
                            <div class="d-flex justify-content-center gap-1">
                                <div v-for="j in actionCount" :key="j"
                                    class="skeleton-icon"
                                    style="height: 28px; width: 28px;" />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- ═══ FORMULARIO ═══ -->
    <div v-else-if="type === 'form'" class="card border-0 shadow-sm">
        <div class="card-header bg-light py-2 px-3 border-bottom">
            <div class="d-flex align-items-center gap-2">
                <div class="skeleton-icon" style="width: 20px; height: 20px;" />
                <div class="skeleton-text sk-h-md sk-w-25" />
            </div>
        </div>
        <div class="card-body p-3 p-md-4">
            <div class="row g-3">
                <div v-for="n in fields" :key="`sk-field-${n}`" :class="fieldColClass">
                    <div class="skeleton-text sk-h-sm sk-w-40 mb-2" />
                    <div class="skeleton-block sk-h-xl sk-w-full" />
                </div>
                <div class="col-12 d-flex gap-2 justify-content-end mt-2">
                    <div class="skeleton-icon" style="width: 90px; height: 36px;" />
                    <div class="skeleton-icon" style="width: 120px; height: 36px;" />
                </div>
            </div>
        </div>
    </div>

    <!-- ═══ TARJETA DE DETALLE ═══ -->
    <div v-else-if="type === 'detail'" class="row g-3">
        <div v-for="card in cards" :key="`sk-card-${card}`" class="col-12">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-light py-2 px-3">
                    <div class="skeleton-text sk-h-md sk-w-25" />
                </div>
                <div class="card-body">
                    <div class="row g-3">
                        <div v-for="n in itemsPerCard" :key="`sk-item-${n}`" class="col-12 col-md-6 col-lg-4">
                            <div class="skeleton-text sk-h-sm sk-w-40 mb-1" />
                            <div class="skeleton-text sk-h-md sk-w-75" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ═══ LÍNEAS ═══ -->
    <div v-else-if="type === 'lines'" class="d-flex flex-column gap-2">
        <div v-for="n in rows" :key="`sk-ln-${n}`"
            class="skeleton-text"
            :style="`height: ${lineHeight}px; width: ${lineWidths[(n - 1) % lineWidths.length]};`" />
    </div>

    <!-- ═══ SLOT PERSONALIZADO ═══ -->
    <slot v-else />
</template>

<script setup>
/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-15
 * @module Features.Shared
 * @resource SkeletonLoader
 */

/**
 * @typedef {Object} Props
 * @property {'table'|'form'|'detail'|'lines'} [type='table'] - Variante del skeleton
 * @property {string[]} [columns] - Anchos de columnas para tipo tabla
 * @property {number} [rows=10] - Filas (tabla) o líneas (lines)
 * @property {number} [actionCount=3] - Botones de acción en columna final (tabla)
 * @property {number} [fields=8] - Cantidad de campos (formulario)
 * @property {string} [fieldColClass='col-12 col-md-6 col-lg-3'] - Bootstrap col class por campo
 * @property {number} [cards=2] - Tarjetas (detalle)
 * @property {number} [itemsPerCard=6] - Items por tarjeta (detalle)
 * @property {number} [lineHeight=16] - Altura px de línea (lines)
 * @property {string[]} [lineWidths] - Ciclo de anchos de línea (lines)
 */
const props = defineProps({
    type:          { type: String, default: 'table' },
    columns:       { type: Array,  default: () => ['30%', '20%', '20%', '15%', '15%'] },
    rows:          { type: Number, default: 10 },
    actionCount:   { type: Number, default: 3 },
    fields:        { type: Number, default: 8 },
    fieldColClass: { type: String, default: 'col-12 col-md-6 col-lg-3' },
    cards:         { type: Number, default: 2 },
    itemsPerCard:  { type: Number, default: 6 },
    lineHeight:    { type: Number, default: 16 },
    lineWidths:    { type: Array,  default: () => ['80%', '60%', '70%', '50%', '75%'] },
});
</script>

<!-- Sin scoped: los estilos son globales para cubrir skeleton-text/skeleton-icon en todas las vistas -->
<style>
:root {
    --sk-base: #e2e5e7;
    --sk-shine: #f8f9fa;
    --sk-speed: 1.6s;
    --sk-delay-step: 0.1s;
}

@media (prefers-color-scheme: dark) {
    :root {
        --sk-base: #2a2d30;
        --sk-shine: #3d4147;
    }
}

/* ─── Animación base compartida ─── */
.skeleton,
.skeleton-text,
.skeleton-icon,
.skeleton-avatar,
.skeleton-badge,
.skeleton-img,
.skeleton-block {
    background: linear-gradient(
        90deg,
        var(--sk-base) 0%,
        var(--sk-base) 30%,
        var(--sk-shine) 50%,
        var(--sk-base) 70%,
        var(--sk-base) 100%
    );
    background-size: 300% 100%;
    animation:
        sk-shimmer var(--sk-speed) ease-in-out infinite,
        sk-pulse calc(var(--sk-speed) * 2) ease-in-out infinite;
    will-change: background-position, opacity;
    display: block;
}

@keyframes sk-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

@keyframes sk-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.65; }
}

/* ─── Delays escalonados ─── */
.skeleton:nth-child(1), .skeleton-text:nth-child(1) { animation-delay: calc(var(--sk-delay-step) * 0); }
.skeleton:nth-child(2), .skeleton-text:nth-child(2) { animation-delay: calc(var(--sk-delay-step) * 1); }
.skeleton:nth-child(3), .skeleton-text:nth-child(3) { animation-delay: calc(var(--sk-delay-step) * 2); }
.skeleton:nth-child(4), .skeleton-text:nth-child(4) { animation-delay: calc(var(--sk-delay-step) * 3); }
.skeleton:nth-child(5), .skeleton-text:nth-child(5) { animation-delay: calc(var(--sk-delay-step) * 4); }
.skeleton:nth-child(6), .skeleton-text:nth-child(6) { animation-delay: calc(var(--sk-delay-step) * 5); }
.skeleton:nth-child(7), .skeleton-text:nth-child(7) { animation-delay: calc(var(--sk-delay-step) * 6); }
.skeleton:nth-child(8), .skeleton-text:nth-child(8) { animation-delay: calc(var(--sk-delay-step) * 7); }

/* ─── Border-radius por variante ─── */
.skeleton-text   { border-radius: 100px; }
.skeleton-icon   { border-radius: 20px; }
.skeleton-avatar { border-radius: 50%; }
.skeleton-img    { border-radius: 8px; }
.skeleton-badge  { border-radius: 100px; }
.skeleton-block  { border-radius: 6px; }

/* ─── Utilidades de tamaño ─── */
.sk-h-xs  { height: 10px; }
.sk-h-sm  { height: 14px; }
.sk-h-md  { height: 18px; }
.sk-h-lg  { height: 24px; }
.sk-h-xl  { height: 32px; }
.sk-h-2xl { height: 48px; }
.sk-h-3xl { height: 64px; }

.sk-w-25   { width: 25%; }
.sk-w-40   { width: 40%; }
.sk-w-50   { width: 50%; }
.sk-w-60   { width: 60%; }
.sk-w-75   { width: 75%; }
.sk-w-80   { width: 80%; }
.sk-w-full { width: 100%; }
</style>
