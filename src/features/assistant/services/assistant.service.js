import { BaseService } from '@services/api/base.service.js';

/**
 * @author Darwin Montes
 * @version 1.0.0
 * @created_at 2026-06-15
 * @module Features.Assistant
 * @resource Chat
 */
class AssistantService extends BaseService {
    constructor() {
        super({
            resourcePath: '/chat/sessions',
            metadata: { module: 'chat', service: 'assistant' },
        });
    }

    /**
     * Crea una nueva sesión.
     * @param {Object} data - { title?, module? }
     * @returns {Promise}
     */
    createSession(data = {}) {
        return this._request('POST', '', { data });
    }

    /**
     * Envía un mensaje a la sesión actual.
     * @param {string} sessionUuid - UUID de la sesión.
     * @param {string} content - Contenido del mensaje.
     * @returns {Promise}
     */
    sendMessage(sessionUuid, content) {
        // Asumiendo que la API original decía POST /chat/sessions/{uuid}/messages
        // Si la API es POST /api/chat/message, deberíamos sobreescribir con _getInstance
        return this._request('POST', `/${sessionUuid}/messages`, {
            data: { content: content }
        });
    }

    /**
     * Lista las sesiones activas del usuario (más reciente primero).
     * @param {Object} params - { per_page?, status? }
     * @returns {Promise}
     */
    listSessions(params = {}) {
        return this._request('GET', '', { params });
    }

    /**
     * Obtiene el historial de una sesión (alias para get).
     * @param {string} uuid
     * @returns {Promise}
     */
    getHistory(uuid) {
        return this._request('GET', `/${uuid}`);
    }

    /**
     * Envía feedback sobre un mensaje.
     * @param {string|number} messageId
     * @param {number} value - 1 o -1
     * @returns {Promise}
     */
    async sendFeedback(messageId, value) {
        const response = await this._getInstance()({
            method: 'POST',
            url: `/chat/messages/${messageId}/feedback`,
            data: { feedback: value }
        });
        return response.data;
    }
}

export default new AssistantService();
