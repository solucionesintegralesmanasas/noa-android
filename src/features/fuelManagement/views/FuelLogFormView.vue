<template>
    <div class="row gx-3 fade-in-up">
        <div class="col-12">
            <BasePageHeader :title="pageTitle" :subtitle="pageSubtitle" icon="fad fa-gas-pump text-primary"
                :breadcrumbs="breadcrumbs" :show-back="true" @back="goBack" />

            <!-- SKELETON FORM -->
            <div v-if="isViewLoading" class="card border-0 shadow-sm" role="status" aria-label="Cargando formulario">
                <div class="card-header bg-light py-2 px-3 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fad fa-gas-pump text-primary" aria-hidden="true"></i>
                        <h6 class="mb-0 fw-medium">Registro de Combustible</h6>
                    </div>
                </div>
                <div class="card-body p-3 p-md-4">
                    <span class="visually-hidden">Cargando formulario...</span>
                    <div class="row g-3">
                        <div v-for="i in 6" :key="i" class="col-12 col-sm-6 col-md-4">
                            <div class="placeholder-glow mb-2">
                                <span class="placeholder col-5 rounded" style="height: 14px;"></span>
                            </div>
                            <div class="placeholder-glow">
                                <span class="placeholder col-12 rounded" style="height: 38px;"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <template v-else>
                <FuelLogForm :fuel-log="editingItem" :is-edit="isEditMode"
                    @saved="onSaved" @cancel="goBack" />

                <!-- TARJETA INFORMATIVA / AYUDA -->
                <div class="card border-0 shadow-sm mt-3 mb-4">
                    <div class="card-body py-3 px-3 px-md-4">
                        <div class="d-flex align-items-start gap-3">
                            <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0 d-flex align-items-center justify-content-center"
                                style="width: 40px; height: 40px;">
                                <i class="fad fa-lightbulb text-primary fs-5" aria-hidden="true"></i>
                            </div>
                            <div>
                                <h6 class="fw-semibold mb-1" style="font-size: 0.92rem;">¿Cómo se calcula el rendimiento y el alcance?</h6>
                                <ul class="text-muted small mb-0 ps-3">
                                    <li><strong>Galones ingresados:</strong> se obtienen automáticamente dividiendo el <em>Total Tanqueo</em> entre el <em>Valor por Galón</em>.</li>
                                    <li><strong>Rendimiento (km/gal):</strong> se precarga del histórico real del vehículo o de la tabla técnica por cilindraje; puedes ajustarlo manualmente si lo requieres.</li>
                                    <li><strong>Alcance estimado:</strong> multiplica los galones tanqueados por el rendimiento aplicado para proyectar cuántos kilómetros cubrirá el surtimiento.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFuelManagementStore } from '../store/fuelManagement.store.js';
import BasePageHeader from '@/components/BasePageHeader.vue';
import FuelLogForm from '../components/FuelLogForm.vue';

const route = useRoute();
const router = useRouter();
const store = useFuelManagementStore();

const isViewLoading = ref(true);
const editingItem = ref(null);

const isEditMode = computed(() => route.params.id !== undefined);
const pageTitle = computed(() => (isEditMode.value ? 'Editar Registro de Combustible' : 'Nuevo Registro de Combustible'));
const pageSubtitle = computed(() => (isEditMode.value
    ? 'Modifica los datos del surtimiento'
    : 'Registra kilometraje, tanqueo y saldos del vehículo'));
const breadcrumbs = computed(() => [
    { label: 'Combustible', to: '/combustible' },
    { label: isEditMode.value ? 'Editar' : 'Nuevo' },
]);

const goBack = () => router.push('/combustible');
const onSaved = () => goBack();

onMounted(async () => {
    try {
        await store.loadFormOptions();
        if (isEditMode.value) {
            editingItem.value = await store.fetchProfileById(route.params.id);
        }
    } finally {
        isViewLoading.value = false;
    }
});
</script>

<style scoped>
.fade-in-up {
    animation: fadeInUp 0.35s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
