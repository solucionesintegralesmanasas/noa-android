/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-30
 * @module Features.Dashboard
 * @resource DashboardService
 */

import apiClient from '@/services/api/client';

class DashboardService {
    /**
     * Obtiene el resumen de métricas del dashboard
     * @param {number} days Rango de días a consultar
     * @returns {Promise<Object>}
     */
    async getSummary(days = 30) {
        return await apiClient.global.get('/dashboard/summary', { params: { days } });
    }

    /**
     * Obtiene la actividad reciente (FUECs, Contratos, Timeline)
     * @returns {Promise<Object>}
     */
    async getRecentActivity() {
        return await apiClient.global.get('/dashboard/recent-activity');
    }

    /**
     * Obtiene las alertas de documentos por vencer
     * @returns {Promise<Object>}
     */
    async getAlerts() {
        return await apiClient.global.get('/dashboard/alerts');
    }

    /**
     * Obtiene el resumen del dashboard para el rol CONDUCTOR
     * @param {number} days Rango de días a consultar
     * @returns {Promise<Object>}
     */
    async getConductorSummary(days = 30) {
        return await apiClient.global.get('/dashboard/conductor-summary', { params: { days } });
    }
}

export default new DashboardService();
