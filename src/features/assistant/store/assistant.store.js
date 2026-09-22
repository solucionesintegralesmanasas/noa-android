import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Preferences } from '@capacitor/preferences';
import assistantService from '../services/assistant.service.js';

const STORAGE_KEY = 'assistant_session_uuid';

export const useAssistantStore = defineStore('assistant', () => {
    const sessionUuid = ref(null);
    const messages = ref([]);
    const isLoading = ref(false);
    const isOpen = ref(false);
    const error = ref(null);

    async function _loadSessionFromStorage() {
        const { value } = await Preferences.get({ key: STORAGE_KEY });
        sessionUuid.value = value || null;
        return sessionUuid.value;
    }

    async function _saveSessionToStorage(uuid) {
        await Preferences.set({ key: STORAGE_KEY, value: uuid });
        sessionUuid.value = uuid;
    }

    async function _removeSessionFromStorage() {
        await Preferences.remove({ key: STORAGE_KEY });
        sessionUuid.value = null;
    }

    const initSession = async () => {
        let stored = await _loadSessionFromStorage();

        if (stored) {
            const loaded = await loadHistory(stored);
            if (loaded) return;
            await _removeSessionFromStorage();
        }

        try {
            const list = await assistantService.listSessions({ per_page: 1, status: 'ACTIVA' });
            const latest = list?.data?.data?.[0];
            if (latest?.uuid) {
                await _saveSessionToStorage(latest.uuid);
                await loadHistory(latest.uuid);
                return;
            }
        } catch (_) {
        }

        try {
            const response = await assistantService.createSession({ module: 'general' });
            const uuid = response.data?.uuid;
            if (uuid) {
                await _saveSessionToStorage(uuid);
            }
        } catch (e) {
            error.value = 'No se pudo iniciar la sesión.';
            console.error(e);
        }
    };

    const normalizeRole = (role) => {
        if (role === 'USUARIO') return 'user';
        if (role === 'ASISTENTE') return 'assistant';
        return role;
    };

    const loadHistory = async (uuid) => {
        try {
            const response = await assistantService.getHistory(uuid);
            const session = response.data;
            if (session?.messages) {
                messages.value = session.messages.map(m => ({
                    ...m,
                    role: normalizeRole(m.role)
                }));
            }
            return true;
        } catch (e) {
            console.error('Error al cargar historial', e);
            return false;
        }
    };

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        if (!sessionUuid.value) {
            error.value = 'Sesión no inicializada.';
            return;
        }

        isLoading.value = true;
        error.value = null;

        const tempUserMsg = {
            id: Date.now(),
            uuid: 'temp-' + Date.now(),
            role: 'user',
            content: text,
            created_at: new Date().toISOString()
        };
        messages.value.push(tempUserMsg);

        try {
            const body = await assistantService.sendMessage(sessionUuid.value, text);
            const rawMsg = body?.data?.message || body?.message;
            if (rawMsg) {
                messages.value.push({
                    ...rawMsg,
                    role: normalizeRole(rawMsg.role)
                });
            }
        } catch (e) {
            error.value = 'Error al conectar con el asistente.';
            console.error(e);
        } finally {
            isLoading.value = false;
        }
    };

    const resetSession = async () => {
        messages.value = [];
        await _removeSessionFromStorage();
        await initSession();
    };

    const toggleWidget = () => {
        isOpen.value = !isOpen.value;
        if (isOpen.value && !sessionUuid.value) {
            initSession();
        }
    };

    const rateMessage = async (id, value) => {
        try {
            await assistantService.sendFeedback(id, value);
            const msg = messages.value.find(m => m.id === id || m.uuid === id);
            if (msg) msg.feedback = value;
        } catch (e) {
            console.error('Error al enviar feedback', e);
        }
    };

    return {
        sessionUuid,
        messages,
        isLoading,
        isOpen,
        error,
        initSession,
        loadHistory,
        sendMessage,
        toggleWidget,
        rateMessage,
        resetSession
    };
});
