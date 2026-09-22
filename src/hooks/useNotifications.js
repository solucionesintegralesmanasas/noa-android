// src/hooks/useNotifications.js
import { computed, onMounted, onUnmounted } from 'vue';
import { useNotificationsStore } from '@/features/notifications/store/notifications.store.js';

export function useNotifications() {
    const store = useNotificationsStore();
    
    // Auto polling
    onMounted(() => store.startPolling && store.startPolling(60000));
    onUnmounted(() => store.stopPolling && store.stopPolling());

    return {
        list: computed(() => store.allNotificationsList || []),
        count: computed(() => store.unreadCount || 0),
        format: (n) => {
            let msg = n.message || '';
            msg = msg.replace(/VENCIDO|VENCIDA/g, '<strong>$&</strong>');
            msg = msg.replace(/por VENCER/g, '<strong>$&</strong>');
            return msg;
        }
    };
}
