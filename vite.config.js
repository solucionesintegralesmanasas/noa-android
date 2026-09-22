// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno (carga archivos .env locales y globales)
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://api.transportessinbarreras.local';

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@store': path.resolve(__dirname, './src/store'),
        '@router': path.resolve(__dirname, './src/router'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@services': path.resolve(__dirname, './src/services'),
        '@components': path.resolve(__dirname, './src/components'),
        '@features': path.resolve(__dirname, './src/features'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@assets': path.resolve(__dirname, './src/assets'),
      }
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/storage': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    optimizeDeps: {
      include: ['@capacitor/preferences']
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      chunkSizeWarningLimit: 500,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vue core + ecosystem
            if (id.includes('node_modules/vue') || id.includes('node_modules/@vue') || id.includes('node_modules/vue-router') || id.includes('node_modules/pinia')) {
              return 'vendor-vue';
            }
            // PrimeVue UI framework
            if (id.includes('node_modules/primevue') || id.includes('node_modules/@primeuix') || id.includes('node_modules/primeicons')) {
              return 'vendor-primevue';
            }
            // HTTP (axios; crypto-js sin uso en src, fuera del bundle inicial)
            if (id.includes('node_modules/axios')) {
              return 'vendor-http';
            }
            // Capacitor nativo (no crítico en web)
            if (id.includes('node_modules/@capacitor')) {
              return 'vendor-capacitor';
            }
            // Utilidades de fecha e i18n
            if (id.includes('node_modules/dayjs') || id.includes('node_modules/vue-i18n')) {
              return 'vendor-utils';
            }
            // Alertas y firmas (cargan bajo demanda)
            if (id.includes('node_modules/sweetalert2') || id.includes('node_modules/signature_pad') || id.includes('node_modules/vue-toastification')) {
              return 'vendor-feedback';
            }
          }
        }
      }
    }
  };
});