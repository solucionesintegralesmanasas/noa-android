<template>
  <div class="login-preview">
    <div class="shape-bg s1"></div>
    <div class="shape-bg s2"></div>
    <div class="shape-bg s3"></div>
    <div class="glass-card">
      <div class="brand-panel">
        <div class="logo-wrap">
          <div class="logo-inner">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span class="logo-ver">v 1.0.1</span>
        </div>
        <h2 class="brand-name">NOA<span>Transportes</span></h2>
        <p class="brand-desc">Plataforma de gestión ERP diseñada para eficiencia, seguridad y escalabilidad en tu
          operación logística.</p>
        <div class="brand-badges">
          <span class="badge badge-blue">ERP</span>
          <span class="badge badge-green">Seguro</span>
          <span class="badge badge-sky">Cloud</span>
        </div>
        <div class="brand-terms">Términos y <span class="brand-terms-link" role="note">Condiciones</span></div>
      </div>
      <div class="form-panel">
        <div class="form-head">
          <h1 class="form-title-text">Seguridad 2FA</h1>
          <p class="form-sub">Ingresa el código de 6 dígitos de tu aplicación autenticadora.</p>
        </div>
        <hr class="divider-line">
        <div class="fgroup">
          <label class="flabel" for="twofa-code">Código de Verificación</label>
          <div class="iw">
            <span class="iico" aria-hidden="true">🛡️</span>
            <input id="twofa-code" class="finput code-input" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="000000" maxlength="6" v-model="formData.code" :aria-invalid="!!errors.code" :aria-describedby="errors.code ? 'twofa-code-error' : undefined">
          </div>
          <span v-if="errors.code" id="twofa-code-error" class="ferror" role="alert">{{ errors.code }}</span>
        </div>

        <button class="btn-main" @click="handleVerify" :disabled="isSubmitting">
          {{ isSubmitting ? 'Verificando...' : 'Verificar Código →' }}
        </button>

        <div class="or-divider">
          <div class="or-line"></div>
          <span class="or-text">¿Problemas?</span>
          <div class="or-line"></div>
        </div>

        <button class="btn-google" @click="goBack">
          Volver al Inicio de Sesión
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth.store.js';
import { useFormManager } from '@/hooks/useFormManager.js';

const router = useRouter();
const authStore = useAuthStore();
const isSmallMobile = ref(window.innerWidth <= 375);

const { formData, errors, isSubmitting, validateAndFocus } = useFormManager(
  { code: '' },
  {
    code: { required: true, minLength: 6, maxLength: 6, label: 'El código de verificación' }
  }
);

const handleVerify = async () => {
  if (!(await validateAndFocus())) return;

  isSubmitting.value = true;
  try {
    // Si tienes un método específico para el 2FA en tu store
    // await authStore.verify2FA(formData.code);

    // Mientras tanto redirige al dashboard
    router.push('/dashboard');
  } catch (error) {
    console.error('Fallo en la verificación:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.push('/login');
};

const checkResize = () => isSmallMobile.value = window.innerWidth <= 375;

onMounted(() => window.addEventListener('resize', checkResize));
onUnmounted(() => window.removeEventListener('resize', checkResize));
</script>

<style scoped>

.login-preview {
  font-family: 'Outfit', sans-serif;
  --primary: #2c7be5;
  --primary-dark: #1a68d1;
  --accent: #00d27a;
  --sky: #00d2f4;
  background: linear-gradient(135deg, #f0f6ff 0%, #ffffff 50%, #f1f5f9 100%);
  border-radius: 16px;
  padding: 2rem;
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.shape-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  pointer-events: none;
}

.s1 {
  width: 280px;
  height: 280px;
  background: rgba(44, 123, 229, 0.12);
  top: -80px;
  right: -60px;
}

.s2 {
  width: 220px;
  height: 220px;
  background: rgba(0, 210, 122, 0.09);
  bottom: -40px;
  left: -40px;
}

.s3 {
  width: 140px;
  height: 140px;
  background: rgba(0, 210, 244, 0.09);
  bottom: 15%;
  right: 8%;
}

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 20px 50px -10px rgba(44, 123, 229, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.5);
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  width: 100%;
  max-width: 780px;
}

.brand-panel {
  background: linear-gradient(160deg, rgba(44, 123, 229, 0.04) 0%, rgba(0, 210, 244, 0.025) 100%);
  padding: 2.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  border-right: 1px solid #e2e8f0;
  position: relative;
}

.brand-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #2c7be5, #00d2f4, #00d27a);
}

.brand-panel::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(44, 123, 229, 0.15), transparent);
}

.logo-wrap {
  width: 72px;
  height: 72px;
  background: linear-gradient(145deg, #fff, #f8fafc);
  border-radius: 14px;
  margin: 0 auto 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(44, 123, 229, 0.14), 0 0 0 1px rgba(226, 232, 240, 0.7);
  gap: 2px;
}

.logo-inner {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #2c7be5, #00d2f4);
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-inner svg {
  fill: none;
  stroke: white;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.logo-ver {
  font-size: 9px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.brand-name {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.75rem;
  letter-spacing: -0.5px;
}

.brand-name span {
  background: linear-gradient(90deg, #2c7be5, #00d2f4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-desc {
  color: #475569;
  font-size: 0.875rem;
  line-height: 1.65;
  margin: 0 0 1.75rem;
}

.brand-badges {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}

.badge-blue {
  background: rgba(44, 123, 229, 0.1);
  color: #1a68d1;
}

.badge-green {
  background: rgba(0, 210, 122, 0.1);
  color: #0a8a50;
}

.badge-sky {
  background: rgba(0, 210, 244, 0.1);
  color: #0899b0;
}

.brand-terms {
  font-size: 0.75rem;
  color: #94a3b8;
}

.brand-terms a {
  color: #2c7be5;
  text-decoration: none;
  font-weight: 500;
}

.form-panel {
  padding: 2.5rem 2rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-head {
  margin-bottom: 1.5rem;
}

.form-title-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.35rem;
}

.form-sub {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.divider-line {
  height: 1px;
  background: linear-gradient(90deg, rgba(44, 123, 229, 0.3), rgba(0, 210, 244, 0.2), transparent);
  margin: 0 0 1.5rem;
  border: none;
}

.fgroup {
  margin-bottom: 1.25rem;
}

.flabel {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.4rem;
  letter-spacing: 0.2px;
}

.iw {
  position: relative;
  display: flex;
  align-items: center;
}

.iico {
  position: absolute;
  left: 13px;
  color: #94a3b8;
  font-size: 13px;
  z-index: 2;
  line-height: 1;
}

.finput {
  width: 100%;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px 10px 38px;
  color: #0f172a;
  font-size: 0.9rem;
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
  transition: all 0.2s;
}

.finput::placeholder {
  color: #94a3b8;
}

.code-input {
  letter-spacing: 0.5rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: #1e293b;
}

.btn-main {
  width: 100%;
  padding: 11px;
  background: linear-gradient(135deg, #2c7be5, #1a68d1);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  margin-top: 0.5rem;
  cursor: pointer;
  letter-spacing: 0.2px;
  box-shadow: 0 4px 16px rgba(44, 123, 229, 0.35);
  font-family: 'Outfit', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.or-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 1rem 0;
}

.or-line {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.or-text {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  white-space: nowrap;
}

.btn-google {
  width: 100%;
  padding: 10px 16px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.btn-google:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.google-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
</style>
