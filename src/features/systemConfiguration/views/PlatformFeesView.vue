<template>
    <div class="row gx-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader title="Tarifas de Plataforma"
                subtitle="Consulta y gestiona los valores de cobro aplicados a la flota"
                icon="fad fa-usd-circle text-primary" :breadcrumbs="breadcrumbs" :show-back="true" />

            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="text-muted mt-3">Cargando tarifas...</p>
            </div>

            <div v-else class="fade-in-up">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white py-3 d-flex align-items-center justify-content-between border-bottom">
                        <h5 class="mb-0 fw-medium text-dark">
                            <i class="fad fa-list-ul me-2 text-primary"></i>
                            Listado de Tarifas Configuradas
                        </h5>
                        <div class="d-flex gap-2">
                            <span class="badge bg-light text-dark border px-3 py-2">
                                Criterio: {{ feeTypeLabel }}
                            </span>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="bg-light">
                                    <tr v-if="formData.platform_fee_type === 'PASSENGER_RANGE'">
                                        <th class="py-3 px-4 text-dark fw-semibold">Mín. Pasajeros</th>
                                        <th class="py-3 px-4 text-dark fw-semibold">Máx. Pasajeros</th>
                                        <th class="py-3 px-4 text-dark fw-semibold">Tarifa ($ COP)</th>
                                    </tr>
                                    <tr v-else>
                                        <th class="py-3 px-4 text-dark fw-semibold">Clase de Vehículo</th>
                                        <th class="py-3 px-4 text-dark fw-semibold">Tarifa ($ COP)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(rate, index) in formData.platform_fee_rates" :key="index" class="border-bottom">
                                        <template v-if="formData.platform_fee_type === 'PASSENGER_RANGE'">
                                            <td class="py-3 px-4">{{ rate.min_passengers }}</td>
                                            <td class="py-3 px-4">{{ rate.max_passengers }}</td>
                                        </template>
                                        <template v-else>
                                            <td class="py-3 px-4">
                                                <span class="fw-medium">{{ getClassName(rate.vehicle_class_uuid) }}</span>
                                            </td>
                                        </template>
                                        <td class="py-3 px-4 fw-bold text-primary">
                                            {{ formatCurrency(rate.fee) }}
                                        </td>
                                    </tr>
                                    <tr v-if="!formData.platform_fee_rates || formData.platform_fee_rates.length === 0">
                                        <td :colspan="formData.platform_fee_type === 'PASSENGER_RANGE' ? 3 : 2" class="text-center py-5 text-muted">
                                            <i class="fad fa-info-circle fs-3 d-block mb-2"></i>
                                            No se han registrado tarifas para este criterio.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer bg-white py-3 text-end">
                        <router-link to="/settings/system-configuration" class="btn btn-sm btn-primary px-4 rounded-pill">
                            <i class="fad fa-edit me-1"></i> Editar Tarifas
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-07-02
 * @module {Features.SystemConfiguration}
 * @resource {SystemConfiguration}
 */

import { ref, computed, onMounted } from 'vue';
import { useSystemConfigurationStore } from '../store/systemConfiguration.store.js';
import { useAuthStore } from '@/features/auth/store/auth.store.js';
import { useUserStore } from '@/store/modules/user.js';
import { authService } from '@/features/auth/services/auth.service.js';
import companiesService from '@/features/companies/services/companies.service.js';
import BasePageHeader from '@/components/BasePageHeader.vue';

const authStore = useAuthStore();
const userStore = useUserStore();
const systemConfigStore = useSystemConfigurationStore();

const isLoading = ref(true);
const vehicleClasses = ref([]);
const formData = ref({});

const breadcrumbs = computed(() => [
    { label: 'Configuración', to: '/settings/system-configuration' },
    { label: 'Tarifas' },
]);

const feeTypeLabel = computed(() => {
    return formData.value.platform_fee_type === 'PASSENGER_RANGE' 
        ? 'Rango de Pasajeros' 
        : 'Clase de Vehículo';
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
};

const getClassName = (uuid) => {
    const vc = vehicleClasses.value.find(v => v.uuid === uuid);
    return vc ? `${vc.description} (${vc.class_code_class})` : 'No asignada';
};

const getOrFetchCompanyUuid = async () => {
    let companyUuid = authStore.currentTenant?.id || userStore.company_uuid || (userStore.companies && userStore.companies[0]?.uuid);
    if (companyUuid) return companyUuid;

    try {
        const profileData = await authService.getProfile();
        if (profileData?.user?.company_uuid) return profileData.user.company_uuid;
    } catch (e) { console.warn(e); }
    return null;
};

onMounted(async () => {
    isLoading.value = true;
    try {
        const companyUuid = await getOrFetchCompanyUuid();
        if (companyUuid) {
            // Cargar catálogo de clases
            const vcRes = await companiesService._getInstance().get('catalogs/vehicle-classes/list');
            vehicleClasses.value = vcRes.data?.data || vcRes.data || [];

            // Cargar configuración
            const data = await systemConfigStore.fetchByCompany(companyUuid);
            if (data) {
                formData.value = data;
            }
        }
    } catch (e) {
        console.error('Error cargando tarifas:', e);
    } finally {
        isLoading.value = false;
    }
});
</script>

<style scoped>
.fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
}
@keyframes fadeInUp {
    from { opacity: 0; transform: translate3d(0, 15px, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 1); }
}
</style>
