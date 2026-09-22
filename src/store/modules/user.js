/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-07-03
 * @module {Features.Auth}
 * @resource {User}
 */

import { defineStore } from 'pinia';
import { logger } from '@utils/logger.js';
import { userProfilePersistencePlugin } from "@store/plugins/persistence.js";

export const useUserStore = defineStore('user', {
    state: () => ({
        id: null,
        email: null,
        username: null,
        fullName: null,
        company_uuid: null,
        companyName: null,
        third_party_uuid: null,
        uuid_driver: null, // Guardamos el UUID original del conductor si es rol CONDUCTOR
        companies: [], // Almacena el listado de empresas a las que pertenece
        logo: null, // Logotipo de la empresa actual
        theme: 'light',
        sidebarCollapsed: false,
        isHydrated: false,
    }),

    getters: {
        initials: (state) => {
            if (!state.fullName) return 'US';
            const parts = state.fullName.split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return parts[0].substring(0, 2).toUpperCase();
        }
    },

    actions: {
        setProfile(profileData) {
            const activeCompany = (profileData.companies || []).find(c => c.uuid === profileData.company_uuid);
            this.$patch({
                id: profileData.id,
                email: profileData.email,
                username: profileData.username,
                company_uuid: profileData.company_uuid,
                companyName: activeCompany ? activeCompany.name : null,
                third_party_uuid: profileData.third_party_uuid,
                uuid_driver: profileData.uuid_driver || null,
                companies: profileData.companies || [],
                logo: profileData.logo || (activeCompany ? activeCompany.logo : null),
                fullName: profileData.name || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
            });
            logger.debug('User profile updated');
        },

        toggleSidebar() {
            this.sidebarCollapsed = !this.sidebarCollapsed;
        },

        clear() {
            this.$reset();
        }
    },
    persist: { plugins: [userProfilePersistencePlugin] }
});