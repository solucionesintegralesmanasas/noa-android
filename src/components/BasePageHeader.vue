<template>
    <div class="card mb-3 border-0 shadow-sm fade-in-up">
        <!-- Fondo decorativo opcional -->
        <div v-if="showBg" class="bg-holder d-none d-lg-block bg-card"
            style="background-image: url(/assets/img/icons/spot-illustrations/corner-4.png);" />

        <div class="card-body position-relative" :class="compact ? 'py-2' : 'py-3'">

            <!-- BREADCRUMB (Opcional) -->
            <nav v-if="breadcrumbs.length > 0" aria-label="Migas de pan" class="mb-2">
                <ol class="breadcrumb mb-0 fs-7">
                    <li class="breadcrumb-item">
                        <router-link to="/" class="text-decoration-none text-muted">
                            <i class="fad fa-home me-1" aria-hidden="true"></i> Inicio
                        </router-link>
                    </li>
                    <li v-for="(item, index) in breadcrumbs" :key="index"
                        class="breadcrumb-item"
                        :class="{ active: index === breadcrumbs.length - 1 }"
                        :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined">
                        <router-link
                            v-if="item.to && index !== breadcrumbs.length - 1"
                            :to="item.to"
                            class="text-decoration-none text-muted">
                            {{ item.label }}
                        </router-link>
                        <button
                            v-else-if="item.click && index !== breadcrumbs.length - 1"
                            type="button"
                            class="btn btn-link btn-sm p-0 text-decoration-none text-muted"
                            @click="item.click">
                            {{ item.label }}
                        </button>
                        <span v-else :class="index === breadcrumbs.length - 1 ? 'text-primary' : 'text-muted'">
                            {{ item.label }}
                        </span>
                    </li>
                </ol>
            </nav>

            <!-- CONTENT -->
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">

                <!-- LEFT: Skeleton cargando -->
                <div v-if="loading" class="w-100 w-sm-auto" role="status" aria-label="Cargando encabezado">
                    <div class="skeleton-text mb-1" style="height: 12px; width: 140px;" aria-hidden="true" />
                    <div class="skeleton-text" style="height: 22px; width: 300px;" aria-hidden="true" />
                </div>

                <!-- LEFT: Títulos e Información -->
                <div v-else class="d-flex flex-column">
                    <!-- Etiqueta Superior (Slot o Prop) -->
                    <slot name="top-label">
                        <span
                            v-if="topLabel"
                            class="text-primary fw-medium small mb-1 d-flex align-items-center gap-1"
                            style="font-size: 0.8rem;">
                            <i v-if="icon" :class="icon"></i>
                            {{ topLabel }}
                        </span>
                    </slot>

                    <!-- Título Principal -->
                    <h1
                        class="mb-0 fw-semibold text-dark d-flex align-items-center gap-2 h4"
                        :style="{ fontSize: compact ? '1.1rem' : '1.25rem' }">
                        <i v-if="!topLabel && icon" :class="icon" aria-hidden="true"></i>
                        <slot name="title">{{ title }}</slot>
                        <!-- Espacio para Badges o Status -->
                        <slot name="title-after"></slot>
                    </h1>

                    <!-- Subtítulo -->
                    <slot name="subtitle">
                        <small v-if="subtitle || description" class="text-muted" style="font-size: 0.85rem;">
                            {{ subtitle || description }}
                        </small>
                    </slot>
                </div>

                <!-- RIGHT: Skeleton acciones -->
                <div v-if="loading" class="d-flex align-items-center gap-2" role="status" aria-label="Cargando acciones">
                    <div class="skeleton-icon" style="height: 32px; width: 32px; border-radius: 5px;" aria-hidden="true" />
                    <div class="skeleton-icon" style="height: 32px; width: 32px; border-radius: 5px;" aria-hidden="true" />
                </div>

                <!-- RIGHT: Acciones -->
                <div v-else class="d-flex align-items-center gap-2">
                    <slot name="actions">

                        <!-- REFRESH -->
                        <button
                            v-if="showRefresh"
                            class="btn btn-falcon-default btn-sm px-2 px-sm-3"
                            type="button"
                            title="Actualizar"
                            aria-label="Actualizar"
                            @click="$emit('refresh')">
                            <i class="fad fa-sync" aria-hidden="true"></i>
                            <span class="d-none d-sm-inline ms-1">Actualizar</span>
                        </button>

                        <!-- CREATE -->
                        <button
                            v-if="showCreate && canCreate"
                            class="btn btn-primary btn-sm px-2 px-sm-3"
                            type="button"
                            title="Nuevo registro"
                            aria-label="Nuevo registro"
                            @click="$emit('create')">
                            <i class="fad fa-plus" aria-hidden="true"></i>
                            <span class="d-none d-sm-inline ms-1">Nuevo</span>
                        </button>

                        <!-- EDIT -->
                        <button
                            v-if="showEdit"
                            class="btn btn-primary btn-sm px-2 px-sm-3"
                            type="button"
                            title="Editar"
                            aria-label="Editar"
                            @click="$emit('edit')">
                            <i class="fad fa-pen" aria-hidden="true"></i>
                            <span class="d-none d-sm-inline ms-1">Editar</span>
                        </button>

                        <!-- BACK -->
                        <button
                            v-if="showBack"
                            class="btn btn-falcon-default btn-sm px-2 px-sm-3"
                            type="button"
                            title="Regresar"
                            aria-label="Regresar"
                            @click="$emit('back')">
                            <i class="fad fa-arrow-left" aria-hidden="true"></i>
                            <span class="d-none d-sm-inline ms-1">Regresar</span>
                        </button>

                    </slot>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        default: 'Título'
    },

    subtitle: {
        type: String,
        default: ''
    },

    description: {
        type: String,
        default: ''
    },

    topLabel: {
        type: String,
        default: ''
    },

    icon: {
        type: String,
        default: ''
    },

    breadcrumbs: {
        type: Array,
        default: () => []
    },

    loading: {
        type: Boolean,
        default: false
    },

    showBg: {
        type: Boolean,
        default: false
    },

    compact: {
        type: Boolean,
        default: false
    },

    showRefresh: {
        type: Boolean,
        default: false
    },

    showCreate: {
        type: Boolean,
        default: false
    },

    /**
     * Permiso para mostrar el botón "Nuevo".
     * Usar con can('modulo.create') desde el composable de permisos.
     * Ejemplo: :canCreate="can('companies.create')"
     */
    canCreate: {
        type: Boolean,
        default: true
    },

    showBack: {
        type: Boolean,
        default: false
    },

    showEdit: {
        type: Boolean,
        default: false
    }
});

defineEmits([
    'refresh',
    'create',
    'back',
    'edit'
]);
</script>

<style scoped>
.fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card {
    border-radius: 0.75rem !important;
    transition: box-shadow 0.15s ease-in-out;
}

.card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
}

.btn:not(:disabled),
.btn-link:not(:disabled) {
    cursor: pointer;
}

.btn:focus-visible,
.btn-link:focus-visible {
    outline: 2px solid #2c7be5;
    outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
    .fade-in-up {
        animation: none;
    }
    .skeleton-text,
    .skeleton-icon,
    .skeleton-badge {
        animation: none;
    }
}

.fs-7 {
    font-size: 0.8rem !important;
}

/* Skeleton base — por si no está definido globalmente */
.skeleton-text,
.skeleton-icon,
.skeleton-badge {
    background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 4px;
}

.skeleton-icon {
    border-radius: 6px;
    flex-shrink: 0;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
</style>