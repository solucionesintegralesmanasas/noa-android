/** @author Darwin Montes @version 1.0.0 @created_at 2026-06-13 @module {systemConfiguration} @resource {systemConfiguration} */
import { defineStore } from 'pinia';
import { toast } from '@/utils/toast.js';
import systemConfigurationService from '../services/systemConfiguration.service.js';



export const useSystemConfigurationStore = defineStore('systemConfiguration', {
    state: () => ({
        config: null,
        loading: false,
        error: null,
    }),

    actions: {
        async _run(action, errorMsg) {
            this.loading = true;
            this.error = null;
            try {
                return await action();
            } catch (error) {
                this.error = error.message || errorMsg;
                await toast('Error', this.error, 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchByCompany(companyUuid) {
            return this._run(async () => {
                const response = await systemConfigurationService.getByCompany(companyUuid);
                const raw = response?.data?.data ?? response?.data ?? response;
                this.config = (raw && raw.uuid) ? raw : null;
                return this.config;
            }, 'Error al obtener la configuración del sistema');
        },

        async saveConfig(companyUuid, payload) {
            return this._run(async () => {
                let response;
                if (this.config && this.config.uuid) {
                    response = await systemConfigurationService.update(this.config.uuid, {
                        ...payload,
                        company_uuid: companyUuid,
                    });
                    const raw = response?.data?.data ?? response?.data ?? response;
                    this.config = (raw && raw.uuid) ? raw : this.config;
                    await toast('¡Éxito!', 'Configuración del sistema actualizada correctamente', 'success');
                } else {
                    response = await systemConfigurationService.create({
                        ...payload,
                        company_uuid: companyUuid,
                    });
                    const raw = response?.data?.data ?? response?.data ?? response;
                    this.config = (raw && raw.uuid) ? raw : null;
                    await toast('¡Éxito!', 'Configuración del sistema creada correctamente', 'success');
                }
                return this.config;
            }, 'Error al guardar la configuración del sistema');
        },
    },
});
