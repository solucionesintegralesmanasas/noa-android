<template>
    <div class="row g-2 g-md-3">
        <div class="col-12 col-xxl-10 offset-xxl-1 col-xl-12">
            <BasePageHeader
                title="Detalle del Contrato"
                subtitle="Información detallada del contrato laboral"
                icon="fad fa-file-contract text-primary"
                :breadcrumbs="[{ label: 'Contratos', to: '/recursos-humanos/contratos-laborales/listas' }, { label: 'Detalle' }]"
                :show-back="true"
                @back="goBack"
            />
            
            <div class="card border-0 shadow-sm mt-3" v-if="contract">
                <div class="card-body">
                    <h5 class="mb-4">Contrato: {{ contract.contract_type }}</h5>
                    <p><strong>Empleado:</strong> {{ contract.thirdParty?.first_name }} {{ contract.thirdParty?.last_name }}</p>
                    <p><strong>Salario Base:</strong> {{ contract.base_salary }}</p>
                    <p><strong>Fecha de Inicio:</strong> {{ contract.start_date }}</p>
                    <p><strong>Estado:</strong> {{ contract.status }}</p>
                </div>
            </div>
            
            <div class="text-center py-5" v-else-if="store.loading">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmploymentContractsStore } from '../store/employmentContracts.store.js';
import BasePageHeader from '@/components/BasePageHeader.vue';

const route = useRoute();
const router = useRouter();
const store = useEmploymentContractsStore();
const contract = ref(null);

const goBack = () => router.push({ name: 'employmentContracts.list' });

onMounted(async () => {
    try {
        contract.value = await store.fetchProfileById(route.params.id);
    } catch (e) {
        goBack();
    }
});
</script>