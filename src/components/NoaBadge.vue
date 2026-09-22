<template>
    <div 
        class="logo-noa font-sans-serif" 
        :class="{ 'flex-row align-items-center gap-2': inline, 'flex-column align-items-center': !inline }"
        :style="{ fontSize: size }"
    >
        <img 
            v-if="!hideImage" 
            src="/logo.svg" 
            alt="NOA Transportes" 
            class="noa-img"
            :class="{ 'me-1': inline }"
            :style="{ height: size }"
        />
        <div v-if="hideImage" class="noa-text-brand text-primary fw-bold">NOA</div>
        <div 
            v-if="showSubtitle && hideImage" 
            class="transportes"
            :class="{ 'transportes-inline': inline, 'transportes-text-mode': hideImage && !inline }"
        >
            TRANSPORTES
        </div>
    </div>
</template>

<script setup>
defineProps({
    size: {
        type: String,
        default: '48px'
    },
    inline: {
        type: Boolean,
        default: false
    },
    hideImage: {
        type: Boolean,
        default: false
    },
    showSubtitle: {
        type: Boolean,
        default: true
    }
})
</script>

<style scoped>
.logo-noa {
    display: inline-flex;
    line-height: 1;
    user-select: none;
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.logo-noa:hover {
    opacity: 0.95;
}

.noa-img {
    width: auto;
    max-width: 100%;
    aspect-ratio: 1010 / 270;
    object-fit: contain;
    display: block;
    flex-shrink: 0;
}

.noa-text-brand {
    font-size: 1.1em;
    letter-spacing: -0.02em;
    color: var(--bs-primary, #2c7be5);
    line-height: 1;
}

.transportes {
    margin-top: -1.65em;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-weight: 800;
    font-size: 0.28em;
    letter-spacing: 0.55em;
    color: var(--bs-gray-600, #7b8794);
    text-transform: uppercase;
    padding-left: 0.55em; /* compensa el letter-spacing del último carácter */
    white-space: nowrap;
}

.transportes.transportes-text-mode {
    margin-top: 0.1em;
}

.transportes.transportes-inline {
    margin-top: 0;
}
</style>