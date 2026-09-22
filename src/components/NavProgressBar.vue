<template>
    <Transition name="nprogress">
        <div v-if="isVisible" class="nav-progress-bar" role="progressbar"
            aria-label="Cargando pagina" aria-valuemin="0" aria-valuemax="100"
            :aria-valuenow="Math.round(width)">
            <div class="nav-progress-fill" :style="{ width: width + '%' }"></div>
        </div>
    </Transition>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useConfigStore } from '@store/modules/config.js'

const configStore = useConfigStore()
const isVisible = ref(false)
const width = ref(0)
let intervalTimer = null
let hideTimer = null

watch(() => configStore.isNavigating, (navigating) => {
    if (navigating) {
        clearInterval(intervalTimer)
        clearTimeout(hideTimer)
        isVisible.value = true
        width.value = 25
        // Simula avance orgánico hasta 85% mientras carga la vista
        intervalTimer = setInterval(() => {
            if (width.value < 85) {
                const remaining = 85 - width.value
                width.value += Math.random() * Math.min(remaining * 0.35, 15)
            }
        }, 150)
    } else if (isVisible.value) {
        // Completar al 100% y luego ocultar con suave desvanecimiento
        clearInterval(intervalTimer)
        intervalTimer = null
        width.value = 100
        hideTimer = setTimeout(() => {
            isVisible.value = false
            setTimeout(() => { width.value = 0 }, 300)
        }, 320)
    }
})

onUnmounted(() => {
    clearInterval(intervalTimer)
    clearTimeout(hideTimer)
})
</script>

<style scoped>
.nav-progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    z-index: 99999;
    pointer-events: none;
    background: transparent;
}

.nav-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #2c7be5, #00d2f4, #2c7be5);
    background-size: 200% 100%;
    animation: shimmer 1.5s ease infinite;
    transition: width 0.25s ease-out;
    box-shadow: 0 0 10px rgba(44, 123, 229, 0.5), 0 0 4px rgba(0, 210, 244, 0.3);
    border-radius: 0 2px 2px 0;
}

.nprogress-enter-active {
    transition: opacity 0.15s ease;
}

.nprogress-leave-active {
    transition: opacity 0.3s ease;
}

.nprogress-enter-from,
.nprogress-leave-to {
    opacity: 0;
}

@keyframes shimmer {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
}

@media (prefers-reduced-motion: reduce) {
    .nav-progress-fill {
        animation: none;
        transition: none;
    }
}
</style>