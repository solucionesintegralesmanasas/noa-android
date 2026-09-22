<template>
  <div class="card border-0 shadow-sm h-100 chat-container bg-white">
    <!-- Header Refinado -->
    <div class="card-header bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-3">
        <div class="avatar avatar-xl">
          <div class="avatar-name rounded-circle bg-primary-subtle text-primary border border-primary-subtle shadow-sm">
            <i class="fad fa-robot fs-7"></i>
          </div>
        </div>
        <div>
          <h5 class="mb-0 fw-bold text-800">Asistente IA</h5>
          <div class="d-flex align-items-center gap-1">
            <span class="dot-online bg-success rounded-circle"></span>
            <small class="text-success fw-medium">En línea</small>
          </div>
        </div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-light border-200 text-600 hover-bg-light shadow-none"
          @click="assistantStore.resetSession()" title="Reiniciar conversación">
          <i class="fad fa-sync-alt"></i>
        </button>
      </div>
    </div>

    <!-- Cuerpo del Chat -->
    <div class="card-body p-0 d-flex flex-column chat-body" style="background-color: #f8fafc;">

      <div v-if="assistantStore.error"
        class="alert alert-soft-danger rounded-0 mb-0 border-0 border-bottom py-2 px-4 d-flex align-items-center animate__animated animate__fadeIn"
        role="alert">
        <i class="fas fa-exclamation-circle me-2"></i>
        <span class="fs-10">{{ assistantStore.error }}</span>
      </div>

      <div class="chat-messages-wrapper scrollbar flex-grow-1 p-3 p-md-4" ref="messagesWrapper">

        <!-- Estado de Bienvenida (Sin mensajes) -->
        <div v-if="assistantStore.messages.length === 0" class="welcome-section mx-auto" style="max-width: 600px;">
          <div class="text-start mb-4 animate__animated animate__fadeIn">
            <h4 class="fw-bold mb-3 text-900">{{ greeting }}, {{ userName }}</h4>
            <div class="assistant-card p-4 rounded-4 shadow-sm border bg-white mb-3">
              <p class="mb-3 fs-9">🤖 <strong>Hola, soy tu asistente Next</strong></p>
              <p class="text-700 mb-3 fs-9">Puedes preguntarme sobre:</p>

              <div class="row g-2 mb-4">
                <div v-for="(cap, i) in capabilities" :key="i" class="col-md-6">
                  <div class="d-flex gap-2 align-items-start capability-item p-1">
                    <span class="fs-9">{{ cap.icon }}</span>
                    <div class="fs-10">
                      <strong class="text-800">{{ cap.title }}</strong> — <span class="text-600">{{ cap.desc }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p class="mb-2 fs-9">💡 <strong>Ejemplos:</strong></p>
              <ul class="list-unstyled ps-2 mb-0">
                <li v-for="(ex, i) in examples" :key="i" class="mb-1 text-primary cursor-pointer hover-underline fs-10"
                  @click="quickMessage(ex)">
                  • "{{ ex }}"
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Conversación -->
        <div v-else class="d-flex flex-column gap-4">
          <div v-for="msg in assistantStore.messages" :key="msg.uuid || msg.id" class="d-flex w-100"
            :class="msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'">

            <div class="d-flex gap-2 gap-md-3 max-w-85" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
              <!-- Avatar -->
              <div class="avatar avatar-l flex-shrink-0 mt-1">
                <div v-if="msg.role === 'assistant'"
                  class="avatar-name rounded-circle bg-primary-subtle text-primary border border-primary-subtle shadow-sm">
                  <i class="fad fa-robot fs-11"></i>
                </div>
                <div v-else class="avatar-name rounded-circle bg-200 text-600 border border-300 shadow-sm">
                  <i class="fad fa-user fs-11"></i>
                </div>
              </div>

              <!-- Burbuja de Mensaje -->
              <div class="message-container d-flex flex-column"
                :class="msg.role === 'user' ? 'align-items-end' : 'align-items-start'">
                <div class="message-bubble p-3 shadow-sm"
                  :class="msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border'"
                  :style="bubbleStyle(msg.role)">
                  <div class="message-text fs-9" v-html="formatMessage(msg.content)"></div>
                </div>

                <!-- Acciones (Solo Asistente) -->
                <div v-if="msg.role === 'assistant'" class="d-flex gap-2 mt-1 px-1 align-items-center">
                  <button class="btn btn-link text-400 p-0 feedback-btn" :class="{ 'text-success': msg.feedback === 1 }"
                    @click="rateMessage(msg.uuid || msg.id, 1)">
                    <i class="fad fa-thumbs-up"></i>
                  </button>
                  <button class="btn btn-link text-400 p-0 feedback-btn" :class="{ 'text-danger': msg.feedback === -1 }"
                    @click="rateMessage(msg.uuid || msg.id, -1)">
                    <i class="fad fa-thumbs-down"></i>
                  </button>
                  <span class="text-400 ms-2" style="font-size: 0.65rem;">{{ formatTime(msg.created_at) }}</span>
                </div>
                <div v-else class="mt-1 px-1">
                  <span class="text-400" style="font-size: 0.65rem;">{{ formatTime(msg.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Indicador de Carga -->
          <div v-if="assistantStore.isLoading"
            class="d-flex gap-3 justify-content-start animate__animated animate__pulse animate__infinite">
            <div class="avatar avatar-l flex-shrink-0">
              <div
                class="avatar-name rounded-circle bg-primary-subtle text-primary border border-primary-subtle shadow-sm">
                <i class="fad fa-robot fs-11"></i>
              </div>
            </div>
            <div class="bg-white border shadow-sm px-3 py-2 rounded-4 d-flex align-items-center gap-1"
              style="border-radius: 4px 12px 12px 12px;">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
        </div>

      </div>

      <!-- Pie de Página / Input -->
      <div class="card-footer bg-white border-top p-3 p-md-4">

        <!-- Sugerencias rápidas arriba del input -->
        <div v-if="assistantStore.messages.length > 0 && !assistantStore.isLoading"
          class="suggestions-container d-flex gap-2 overflow-auto pb-3 mb-1 no-scrollbar">
          <button v-for="(ex, i) in examples.slice(0, 4)" :key="i"
            class="btn btn-xs btn-outline-light text-nowrap rounded-pill border-200 text-600 hover-bg-light shadow-none fw-medium"
            @click="quickMessage(ex)">
            {{ ex }}
          </button>
        </div>

        <form @submit.prevent="handleSend" class="position-relative">
          <div
            class="input-group shadow-sm rounded-pill overflow-hidden border border-300 transition-base focus-within-primary">
            <input v-model="newMessage"
              class="form-control border-0 ps-4 py-2-5 shadow-none fs-9 bg-light bg-opacity-50" type="text"
              placeholder="Escribe tu consulta..." :disabled="assistantStore.isLoading" ref="inputField" />
            <button class="btn btn-primary px-4 border-0 d-flex align-items-center gap-2" type="submit"
              :disabled="!newMessage.trim() || assistantStore.isLoading">
              <i class="fad fa-paper-plane"></i>
              <span class="d-none d-sm-inline fw-bold">Enviar</span>
            </button>
          </div>
          <div class="text-center mt-2">
            <small class="text-500" style="font-size: 0.65rem;">NOA Assistant utiliza IA para ayudarte. Verifica datos
              críticos.</small>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { useAssistantStore } from '../store/assistant.store';
import { useUserStore } from '@/store/modules/user';

const assistantStore = useAssistantStore();
const userStore = useUserStore();
const newMessage = ref('');
const messagesWrapper = ref(null);

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 12) return '¡Buenos días!';
  if (hour >= 12 && hour < 18) return '¡Buenas tardes!';
  return '¡Buenas noches!';
}

const greeting = timeGreeting();
const inputField = ref(null);

const userName = computed(() => userStore.fullName?.split(' ')[0] || 'Usuario');

const capabilities = [
  { icon: '🚛', title: 'Vehículos', desc: 'contar, listar, buscar placa' },
  { icon: '📋', title: 'SOAT y Docs', desc: 'SOAT por vencer, vehiculares' },
  { icon: '👤', title: 'Clientes', desc: 'contar, listar terceros' },
  { icon: '📄', title: 'FUECs', desc: 'listar, contar, vigencia' },
  { icon: '🔧', title: 'Taller', desc: 'mantenimientos pendientes' },
  { icon: '💰', title: 'Pagos', desc: 'pendientes, al día' },
];

const examples = [
  'cuántos vehículos tengo',
  'lista de clientes',
  'SOAT por vencer',
  'vehículos activos',
  'ABC123'
];

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesWrapper.value) {
      messagesWrapper.value.scrollTop = messagesWrapper.value.scrollHeight;
    }
  });
};

watch(() => assistantStore.messages, () => { scrollToBottom(); }, { deep: true });
watch(() => assistantStore.isLoading, (loading) => { if (loading) scrollToBottom(); });

const handleSend = async () => {
  if (!newMessage.value.trim() || assistantStore.isLoading) return;
  const content = newMessage.value;
  newMessage.value = '';
  await assistantStore.sendMessage(content);
};

const quickMessage = (text) => {
  newMessage.value = text;
  handleSend();
};

const rateMessage = async (id, value) => {
  await assistantStore.rateMessage(id, value);
};

const formatMessage = (text) => {
  if (!text) return '';
  let f = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .split('\n').map(line => {
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return `<div class="ps-3 mb-1">• ${line.trim().substring(1).trim()}</div>`;
      }
      return line;
    }).join('<br>');
  return f;
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const bubbleStyle = (role) => {
  return role === 'user'
    ? 'border-radius: 16px 16px 4px 16px;'
    : 'border-radius: 16px 16px 16px 4px;';
};

onMounted(async () => {
  if (!assistantStore.sessionUuid) {
    await assistantStore.initSession();
  }
  scrollToBottom();
});
</script>

<style scoped>
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages-wrapper {
  overflow-y: auto;
  scroll-behavior: smooth;
}

.max-w-85 {
  max-width: 85%;
}

.message-bubble {
  line-height: 1.5;
  transition: all 0.2s ease;
}

.dot-online {
  width: 8px;
  height: 8px;
  display: inline-block;
}

.feedback-btn {
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.feedback-btn:hover {
  transform: scale(1.2);
}

.typing-dot {
  width: 6px;
  height: 6px;
  background-color: #3b82f6;
  border-radius: 50%;
  animation: typing-bounce 1s infinite ease-in-out;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-4px);
  }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hover-underline:hover {
  text-decoration: underline;
}

.py-2-5 {
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
}

.focus-within-primary:focus-within {
  border-color: var(--falcon-primary) !important;
  box-shadow: 0 0 0 0.2rem rgba(44, 123, 229, 0.25) !important;
}

.transition-base {
  transition: all 0.2s ease-in-out;
}

.capability-item {
  border-radius: 8px;
  transition: background 0.2s;
}

.capability-item:hover {
  background: #f1f5f9;
}

.scrollbar::-webkit-scrollbar {
  width: 6px;
}

.scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>
