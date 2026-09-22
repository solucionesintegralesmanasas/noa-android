<template>
    <div v-if="modelValue" class="docmenu-overlay" @click.self="close">
        <div class="docmenu-dialog card border-0 shadow-lg" role="dialog" aria-modal="true"
            aria-label="Documentos del vehículo">
            <div class="card-header bg-light py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-2">
                    <i class="fad fa-file-circle-check text-primary" style="font-size: 14px;"></i>
                    <h6 class="mb-0 fw-medium" style="font-size: 0.9rem;">
                        Documentos del vehículo
                        <small v-if="vehicleLabel" class="text-muted font-monospace ms-1">{{ vehicleLabel }}</small>
                    </h6>
                </div>
                <button type="button" class="btn btn-sm btn-falcon-default px-2" @click="close" aria-label="Cerrar">
                    <i class="fas fa-times" style="font-size: 12px;"></i>
                </button>
            </div>

            <div class="card-body p-2 p-md-3">
                <div v-if="loading" class="text-center py-4">
                    <div class="spinner-border spinner-border-sm text-primary" role="status" aria-label="Cargando"></div>
                    <p class="text-muted small mt-2 mb-0">Verificando documentos…</p>
                </div>

                <div v-else class="accordion d-flex flex-column gap-2">
                    <div v-for="row in rows" :key="row.key" class="docmenu-card border rounded-3 overflow-hidden">
                        <button type="button"
                            class="docmenu-head btn w-100 d-flex align-items-center gap-2 p-2 px-3 text-start"
                            @click="toggle(row.key)" :aria-expanded="expandedKey === row.key">
                            <i :class="row.icon" class="text-primary flex-shrink-0" style="font-size: 16px;"></i>
                            <span class="fw-medium text-dark flex-grow-1" style="font-size: 0.85rem;">{{ row.label }}</span>
                            <span class="badge rounded-pill" :class="row.badgeClass" style="font-size: 0.65rem;">
                                {{ row.badgeLabel }}
                            </span>
                            <i class="fas fa-chevron-down text-muted docmenu-chevron"
                                :class="{ open: expandedKey === row.key }" style="font-size: 11px;"></i>
                        </button>

                        <div v-show="expandedKey === row.key" class="px-3 pb-3 pt-1 border-top bg-light bg-opacity-50">
                            <dl v-if="row.doc" class="row mb-2 mt-2 small" style="font-size: 0.8rem;">
                                <dt class="col-5 text-muted fw-medium">{{ row.numberLabel }}:</dt>
                                <dd class="col-7 text-dark fw-semibold font-monospace mb-1">{{ row.number || '—' }}</dd>
                                <dt class="col-5 text-muted fw-medium">{{ row.entityLabel }}:</dt>
                                <dd class="col-7 text-dark mb-1">{{ row.entity || '—' }}</dd>
                                <dt class="col-5 text-muted fw-medium">Vigencia:</dt>
                                <dd class="col-7 text-dark mb-0">{{ row.validity }}</dd>
                            </dl>
                            <p v-else class="text-muted small mt-2 mb-2" style="font-size: 0.8rem;">
                                <i class="fad fa-exclamation-circle me-1"></i>{{ row.missingLabel }}
                            </p>

                            <div class="d-flex flex-wrap gap-2 mt-1">
                                <button v-if="!row.doc && row.canCreate" type="button"
                                    class="btn btn-primary btn-sm px-3" @click="goCreate(row)">
                                    <i class="fas fa-plus me-1" style="font-size: 11px;"></i>Completar
                                </button>
                                <button v-if="row.doc && row.canUpdate" type="button"
                                    class="btn btn-primary btn-sm px-3" @click="goEdit(row)">
                                    <i class="fas fa-pen me-1" style="font-size: 11px;"></i>Editar documento
                                </button>
                                <button v-if="row.doc && row.canCreate" type="button"
                                    class="btn btn-falcon-default btn-sm px-3" @click="goNew(row)">
                                    <i class="fas fa-file-circle-plus me-1" style="font-size: 11px;"></i>Registrar nuevo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePermissionsStore } from '@store';
import { useDocumentWizard } from '@/hooks/useDocumentWizard.js';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    vehicleUuid: { type: String, default: '' },
    vehicleLabel: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);

const router = useRouter();
const permissionsStore = usePermissionsStore();
const { fetchExistingDocs } = useDocumentWizard();

const loading = ref(false);
const found = ref({ soat: null, rce: null, rcc: null, rtm: null, tarjeta: null, convenio: null });
const expandedKey = ref(null);

const close = () => emit('update:modelValue', false);
const toggle = (key) => { expandedKey.value = expandedKey.value === key ? null : key; };

const can = (permission) => {
    try {
        return permissionsStore.can(permission);
    } catch {
        return true;
    }
};

const formatShort = (date) => {
    if (!date) return '—';
    try {
        return new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return '—'; }
};

const expiryOf = (doc, isCard) => (isCard ? doc?.expiration_date : doc?.expiry_date) ?? null;

const statusOf = (doc, isCard) => {
    if (!doc) return 'faltante';
    if (!isCard && doc.status === 'VENCIDO') return 'vencido';
    const expiry = expiryOf(doc, isCard);
    if (!expiry) return 'vigente';
    const end = new Date(expiry);
    const now = new Date();
    if (end <= now) return 'vencido';
    if (end.getTime() - now.getTime() <= 30 * 24 * 60 * 60 * 1000) return 'por-vencer';
    return 'vigente';
};

const STATUS_META = {
    'faltante': { label: 'Faltante', badgeClass: 'bg-secondary bg-opacity-10 text-secondary border' },
    'vigente': { label: 'Vigente', badgeClass: 'badge-subtle-success' },
    'por-vencer': { label: 'Por vencer', badgeClass: 'badge-subtle-warning' },
    'vencido': { label: 'Vencido', badgeClass: 'badge-subtle-danger' },
};

/** Ruta de retorno al perfil con reapertura del menú */
const retorno = computed(() => `/vehiculos/perfil/${props.vehicleUuid}?panel=documentos`);

const buildQuery = (extra = {}) => {
    const q = new URLSearchParams({ wizard: props.vehicleUuid, retorno: retorno.value, ...extra });
    return q.toString();
};

const createPath = (row) => {
    if (row.isAgreement) return `/convenios-colaboracion/crear?${buildQuery()}`;
    return row.isCard
        ? `/tarjetas-de-operacion/crear?${buildQuery()}`
        : `/vehiculos-documentos/${row.docType}/crear?${buildQuery()}`;
};

const editPath = (row) => {
    if (row.isAgreement) return `/convenios-colaboracion/editar/${row.doc.uuid}?${buildQuery()}`;
    return row.isCard
        ? `/tarjetas-de-operacion/editar/${row.doc.uuid}?${buildQuery()}`
        : `/vehiculos-documentos/${row.docType}/editar/${row.doc.uuid}?${buildQuery()}`;
};

const goCreate = (row) => { close(); router.push(createPath(row)); };
const goEdit = (row) => { close(); router.push(editPath(row)); };
const goNew = (row) => { close(); router.push(`${createPath(row)}&nuevo=1`); };

const rows = computed(() => {
    const defs = [
        { key: 'soat', label: 'SOAT', icon: 'fad fa-shield-alt', docType: 'soat', doc: found.value.soat, isCard: false, module: 'vehicle_documents', numberLabel: 'N° de SOAT', entityLabel: 'Entidad emisora', missingLabel: 'Documento faltante para este vehículo.' },
        { key: 'rce', label: 'Póliza RCE', icon: 'fad fa-file-contract', docType: 'poliza', doc: found.value.rce, isCard: false, module: 'vehicle_documents', numberLabel: 'N° de póliza', entityLabel: 'Entidad emisora', missingLabel: 'Documento faltante para este vehículo.' },
        { key: 'rcc', label: 'Póliza RCC', icon: 'fad fa-file-invoice', docType: 'poliza', doc: found.value.rcc, isCard: false, module: 'vehicle_documents', numberLabel: 'N° de póliza', entityLabel: 'Entidad emisora', missingLabel: 'Documento faltante para este vehículo.' },
        { key: 'rtm', label: 'Tecnomecánica', icon: 'fad fa-clipboard-check', docType: 'tecnomecanica', doc: found.value.rtm, isCard: false, module: 'vehicle_documents', numberLabel: 'N° de revisión', entityLabel: 'CDA', missingLabel: 'Documento faltante para este vehículo.' },
        { key: 'tarjeta', label: 'Tarjeta de operación', icon: 'fad fa-car-bus', docType: 'tarjeta', doc: found.value.tarjeta, isCard: true, module: 'operation_cards', numberLabel: 'N° de tarjeta', entityLabel: 'Empresa afiliada', missingLabel: 'Documento faltante para este vehículo.' },
        { key: 'convenio', label: 'Convenio de colaboración', icon: 'fad fa-handshake', docType: 'convenio', doc: found.value.convenio, isAgreement: true, module: 'business_collaboration_agreements', numberLabel: 'N° de convenio', entityLabel: 'Entidad contratante', missingLabel: 'Sin convenio de colaboración registrado.' },
    ];
    return defs.map((d) => {
        const status = statusOf(d.doc, d.isCard);
        const meta = STATUS_META[status];
        return {
            ...d,
            badgeLabel: meta.label,
            badgeClass: meta.badgeClass,
            canCreate: can(`${d.module}.create`),
            canUpdate: can(`${d.module}.update`),
            number: d.isAgreement
                ? d.doc?.agreement_internal_id
                : (d.isCard ? d.doc?.operating_card_number : d.doc?.policy_number),
            entity: d.isAgreement
                ? d.doc?.contracting_entity_name
                : (d.isCard ? d.doc?.affiliated_company : d.doc?.issuing_entity),
            validity: d.doc
                ? (d.isAgreement
                    ? `${formatShort(d.doc?.effective_date)} → ${formatShort(d.doc?.expiry_date)}`
                    : `${formatShort(d.doc?.issue_date)} → ${formatShort(expiryOf(d.doc, d.isCard))}`)
                : '',
        };
    });
});

const load = async () => {
    if (!props.vehicleUuid) return;
    loading.value = true;
    try {
        found.value = await fetchExistingDocs(props.vehicleUuid);
        // Expande la primera fila que requiera atención (faltante o por vencer/vencido)
        const attention = rows.value.find((r) => statusOf(r.doc, r.isCard) !== 'vigente');
        expandedKey.value = (attention ?? rows.value[0])?.key ?? null;
    } finally {
        loading.value = false;
    }
};

watch(() => props.modelValue, (open) => { if (open) load(); });
</script>

<style scoped>
.docmenu-overlay {
    position: fixed;
    inset: 0;
    z-index: 1080;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 3rem 1rem 1rem;
    overflow-y: auto;
}

.docmenu-dialog {
    width: 100%;
    max-width: 560px;
    border-radius: 0.625rem !important;
}

.docmenu-card {
    background: #fff;
}

.docmenu-head {
    border: 0;
    background: transparent;
}

.docmenu-head:hover {
    background: rgba(13, 110, 253, 0.04);
}

.docmenu-chevron {
    transition: transform 150ms ease-in-out;
}

.docmenu-chevron.open {
    transform: rotate(180deg);
}
</style>
