<template>
    <div class="bubble-chat-widget">
        <!-- Panel de chat -->
        <Transition name="bubble-panel">
            <div v-if="isOpen" class="card border-0 shadow-lg chat-panel overflow-hidden" role="dialog" aria-label="Chat con NOA Assistant">
                <!-- Header Refinado -->
                <div class="card-header bg-white border-bottom py-3 px-3 d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                        <div class="avatar avatar-l">
                            <div class="avatar-name rounded-circle bg-primary-subtle text-primary border border-primary-subtle">
                                <i class="fad fa-robot fs-10"></i>
                            </div>
                        </div>
                        <div class="lh-1">
                            <h6 class="mb-0 fw-bold text-900" style="font-size: 0.85rem;">NOA Assistant</h6>
                            <div class="d-flex align-items-center gap-1 mt-1">
                                <span class="dot-online bg-success rounded-circle"></span>
                                <small class="text-success fw-medium" style="font-size: 0.65rem;">En línea</small>
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-link text-400 p-0 text-decoration-none shadow-none hover-text-danger transition-base" @click="toggleChat" aria-label="Cerrar chat">
                        <i class="fad fa-times"></i>
                    </button>
                </div>

                <!-- Mensajes -->
                <div class="card-body p-3 scrollbar panel-msgs bg-light bg-opacity-50" ref="msgsRef">
                    <div v-for="(msg, i) in messages" :key="i" class="d-flex w-100 gap-2 mb-3 animate__animated animate__fadeInUp animate__faster" :class="msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'">
                        
                        <!-- Avatar Assistant (Pequeño) -->
                        <div v-if="msg.role !== 'user'" class="avatar avatar-s flex-shrink-0">
                            <div class="avatar-name rounded-circle bg-primary-subtle text-primary border border-primary-subtle">
                                <i class="fad fa-robot" style="font-size: 0.7rem;"></i>
                            </div>
                        </div>

                        <!-- Bubble -->
                        <div class="message-bubble shadow-sm px-3 py-2" 
                             :class="msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border'" 
                             :style="bubbleStyle(msg.role)">
                            <div style="font-size: 0.8rem; word-break: break-word; line-height: 1.4;" v-html="formatMessage(msg.content)"></div>
                        </div>

                    </div>

                    <!-- Typing indicator -->
                    <div v-if="isTyping" class="d-flex w-100 gap-2 mb-3 justify-content-start">
                        <div class="avatar avatar-s flex-shrink-0">
                            <div class="avatar-name rounded-circle bg-primary-subtle text-primary border border-primary-subtle">
                                <i class="fad fa-robot" style="font-size: 0.7rem;"></i>
                            </div>
                        </div>
                        <div class="bg-white border shadow-sm px-3 py-2 d-flex align-items-center gap-1" style="border-radius: 4px 12px 12px 12px;">
                             <span class="typing-dot"></span>
                             <span class="typing-dot"></span>
                             <span class="typing-dot"></span>
                        </div>
                    </div>
                </div>

                <!-- Sugerencias -->
                <div v-if="showSuggestions" class="px-3 pt-2 pb-2 bg-white border-top overflow-auto no-scrollbar">
                    <div class="d-flex gap-2 flex-nowrap">
                        <button v-for="sug in suggestions" :key="sug" 
                                class="btn btn-xs rounded-pill border border-200 btn-light shadow-none text-nowrap text-600 hover-bg-light fw-medium" 
                                style="font-size: 0.65rem;" 
                                @click="sendMessage(sug)">
                            {{ sug }}
                        </button>
                    </div>
                </div>

                <!-- Footer / Input -->
                <div class="card-footer bg-white border-top p-3">
                    <div class="input-group shadow-sm rounded-pill overflow-hidden border border-300 focus-within-primary transition-base">
                        <input ref="inputRef" v-model="inputText" class="form-control border-0 bg-transparent shadow-none ps-3 py-2" 
                               style="font-size: 0.8rem;" placeholder="Escribe un mensaje..."
                               aria-label="Mensaje" @keydown.enter.prevent="sendMessage()" />
                        <button class="btn btn-primary border-0 d-flex align-items-center justify-content-center p-0 me-1 my-1 rounded-circle" 
                                style="width: 28px; height: 28px;"
                                :disabled="isBusy || !inputText.trim()" @click="sendMessage()" aria-label="Enviar">
                            <i class="fad fa-paper-plane" style="font-size: 10px; margin-right: 1px;"></i>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- Botón burbuja -->
        <button class="btn btn-primary rounded-circle shadow-lg bubble-btn d-flex align-items-center justify-content-center position-relative border-0" 
                @click="toggleChat" aria-label="Abrir chat con NOA Assistant">
            <i class="fad" :class="isOpen ? 'fa-times' : 'fa-comment-alt-dots'"></i>
            <span v-if="unreadCount > 0 && !isOpen" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-2 border-white" style="font-size: 0.6rem; padding: 0.25em 0.4em;">
                {{ unreadCount }}
            </span>
        </button>
    </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import assistantService from '@/features/assistant/services/assistant.service.js'

function timeGreeting() {
  const hour = new Date().getHours()
  if (hour >= 0 && hour < 12) return '¡Buenos días!'
  if (hour >= 12 && hour < 18) return '¡Buenas tardes!'
  return '¡Buenas noches!'
}

// --- Props ---
const props = defineProps({
    initialMessage: {
        type: String,
        default: 'Hola, soy NOA Assistant. ¿En qué te puedo ayudar?',
    },
    suggestions: {
        type: Array,
        default: () => ['¿Cuántos vehículos tengo?', 'SOAT por vencer', 'Lista de clientes'],
    },
})

// --- Estado ---
const isOpen = ref(false)
const isBusy = ref(false)
const isTyping = ref(false)
const inputText = ref('')
const unreadCount = ref(1)
const showSuggestions = ref(true)
const sessionUuid = ref(null)

const initialGreeting = timeGreeting() + ' Soy NOA Assistant. ¿En qué puedo ayudarte?'
const messages = ref([
    { role: 'assistant', content: initialGreeting },
])

const msgsRef = ref(null)
const inputRef = ref(null)

// --- Métodos ---
function formatMessage(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-light text-dark px-1 rounded border">$1</code>');
}

function bubbleStyle(role) {
    return role === 'user' 
        ? 'border-radius: 12px 12px 4px 12px; max-width: 85%;' 
        : 'border-radius: 12px 12px 12px 4px; max-width: 85%;';
}

function toggleChat() {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        unreadCount.value = 0
        nextTick(() => inputRef.value?.focus())
    }
}

async function sendMessage(text) {
    const msg = (text ?? inputText.value).trim()
    if (!msg || isBusy.value) return

    isBusy.value = true
    inputText.value = ''
    showSuggestions.value = false

    messages.value.push({ role: 'user', content: msg })
    await scrollToBottom()

    isTyping.value = true
    await scrollToBottom()

    try {
        if (!sessionUuid.value) {
            const res = await assistantService.createSession({ module: 'general' })
            sessionUuid.value = res.data?.uuid
        }

        const body = await assistantService.sendMessage(sessionUuid.value, msg)
        const reply = body?.data?.message?.content || body?.message?.content || ''
        messages.value.push({ role: 'assistant', content: reply || 'No pude procesar tu solicitud.' })
    } catch {
        messages.value.push({
            role: 'assistant',
            content: 'Error de conexión. Intenta de nuevo.',
        })
    } finally {
        isTyping.value = false
        isBusy.value = false
        await scrollToBottom()
        nextTick(() => inputRef.value?.focus())
    }
}

async function scrollToBottom() {
    await nextTick()
    if (msgsRef.value) {
        msgsRef.value.scrollTop = msgsRef.value.scrollHeight
    }
}
</script>

<style scoped>
/* ── Contenedor raíz ── */
.bubble-chat-widget {
    position: fixed;
    bottom: 80px;
    right: 24px;
    z-index: 1050;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 16px;
}

/* ── Botón burbuja ── */
.bubble-btn {
    width: 52px;
    height: 52px;
    font-size: 22px;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bubble-btn:hover {
    transform: scale(1.1) rotate(-5deg);
    box-shadow: 0 10px 20px rgba(44, 123, 229, 0.3) !important;
}

/* ── Panel ── */
.chat-panel {
    width: calc(100vw - 48px);
    max-width: 340px;
    height: 480px;
    max-height: calc(100vh - 160px);
    border-radius: 16px;
    transform-origin: bottom right;
    display: flex;
    flex-direction: column;
}

/* ── Mensajes ── */
.panel-msgs {
    flex-grow: 1;
    overflow-y: auto;
    scroll-behavior: smooth;
}

.message-bubble {
    transition: transform 0.2s ease;
}

/* ── UI Elements ── */
.dot-online {
    width: 6px;
    height: 6px;
    display: inline-block;
}

.typing-dot {
  width: 5px;
  height: 5px;
  background-color: var(--falcon-primary);
  border-radius: 50%;
  animation: typing-bounce 1s infinite ease-in-out;
}

.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.transition-base {
    transition: all 0.2s ease-in-out;
}

.focus-within-primary:focus-within {
  border-color: var(--falcon-primary) !important;
  box-shadow: 0 0 0 0.2rem rgba(44, 123, 229, 0.15) !important;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.scrollbar::-webkit-scrollbar { width: 5px; }
.scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 5px; }

/* ── Transición del panel ── */
.bubble-panel-enter-active,
.bubble-panel-leave-active {
    transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bubble-panel-enter-from,
.bubble-panel-leave-to {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
    pointer-events: none;
}
</style>
