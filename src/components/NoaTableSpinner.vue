<template>
    <Transition name="fade">
        <div 
            v-if="show" 
            class="loader-overlay" 
            role="status" 
            aria-live="polite" 
            aria-label="Cargando aplicación"
        >
            <div class="loader-card">
                <NoaBadge size="56px" />
                <p v-if="message" class="loading-message">{{ message }}</p>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import NoaBadge from '@/components/NoaBadge.vue';

defineProps({
    show: {
        type: Boolean,
        default: true
    },
    message: {
        type: String,
        default: ''
    }
})
</script>

<style scoped>
.loader-overlay {
    --noa-navy: #061a45;
    --noa-blue: #2c7be5;
    --noa-cyan: #00d2f4;

    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    z-index: 999999;
    will-change: opacity;
}

.loader-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
}

.loading-message {
    margin: -2px 0 0;
    font-size: 0.85rem;
    font-weight: 500;
    color: #64748b;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    letter-spacing: 0.2px;
}

.progress {
    margin-top: 4px;
    width: 180px;
    height: 4px;
    background: #e8eef5;
    border-radius: 30px;
    overflow: hidden;
}

.progress-bar {
    width: 45%;
    height: 100%;
    border-radius: 30px;
    background: linear-gradient(90deg, var(--noa-navy), var(--noa-blue), var(--noa-cyan));
    animation: loading 1.4s ease infinite;
    will-change: transform;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes loading {
    0% { transform: translateX(-200%); }
    100% { transform: translateX(350%); }
}
</style>