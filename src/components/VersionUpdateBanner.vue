<script setup>
import { ref } from "vue";
import { Capacitor } from "@capacitor/core";
import { FileOpener } from "@capacitor-community/file-opener";
import { useVersionUpdateStore } from "@/features/versionUpdate/store/versionUpdate.store.js";
import { logger } from "@utils/logger.js";

const versionStore = useVersionUpdateStore();
const statusMessage = ref("");
const isWorking = ref(false);

function openInBrowser() {
    if (versionStore.apkUrl) {
        window.open(versionStore.apkUrl, "_blank", "noopener");
    } else if (versionStore.releaseUrl) {
        window.open(versionStore.releaseUrl, "_blank", "noopener");
    }
}

async function handleUpdate() {
    // En web (no nativo) la instalación es manual: se abre la descarga.
    if (!Capacitor.isNativePlatform()) {
        openInBrowser();
        return;
    }
    if (!versionStore.apkUrl) {
        openInBrowser();
        return;
    }
    isWorking.value = true;
    statusMessage.value = "Descargando actualización…";
    try {
        const { Filesystem, Directory } = await import("@capacitor/filesystem");
        const fileName = `NOA-v${versionStore.latestVersion}.apk`;
        const dl = await Filesystem.downloadFile({
            url: versionStore.apkUrl,
            path: fileName,
            directory: Directory.Cache,
        });
        const filePath = dl && dl.path ? dl.path : fileName;
        statusMessage.value = "Abriendo instalador…";
        try {
            await FileOpener.open({
                filePath,
                contentType: "application/vnd.android.package-archive",
            });
            statusMessage.value = "";
        } catch (e) {
            // Si el instalador no se abre: el navegador descarga y el usuario instala.
            logger.warn("VersionUpdate: FileOpener fallo, abro navegador", { error: e.message });
            statusMessage.value = "Completa la instalación desde el navegador.";
            openInBrowser();
        }
    } catch (e) {
        logger.warn("VersionUpdate: fallo la descarga del APK", { error: e.message });
        statusMessage.value = "No se pudo descargar. Intenta desde el navegador.";
        openInBrowser();
    } finally {
        isWorking.value = false;
    }
}

function handleLater() {
    versionStore.dismiss();
}
</script>

<template>
  <div
    v-if="versionStore.shouldOffer"
    class="version-update-banner shadow-lg"
    role="status"
    aria-live="polite"
    aria-label="Hay una nueva versión disponible"
  >
    <i class="fas fa-circle-arrow-down me-2" aria-hidden="true"></i>
    <p class="version-update-text mb-0">
      Hay una nueva versión <strong>NOA {{ versionStore.latestVersion }}</strong> disponible.
      <span v-if="statusMessage" class="version-update-status">{{ statusMessage }}</span>
    </p>
    <div class="version-update-actions">
      <button
        type="button"
        class="btn btn-sm btn-warning fw-bold"
        :disabled="isWorking"
        aria-label="Actualizar ahora a la nueva versión"
        @click="handleUpdate"
      >
        Actualizar ahora
      </button>
      <button
        type="button"
        class="btn btn-sm btn-outline-light"
        :disabled="isWorking"
        aria-label="Recordarme después"
        @click="handleLater"
      >
        Después
      </button>
    </div>
  </div>
</template>

<style scoped>
.version-update-banner {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 1090;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background-color: #1b1e22;
  color: #fff;
  border-left: 3px solid var(--bs-warning, #ffc107);
}
.version-update-text {
  flex-grow: 1;
  font-size: 0.85rem;
  line-height: 1.4;
}
.version-update-status {
  display: block;
  font-size: 0.75rem;
  opacity: 0.85;
}
.version-update-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
@media (max-width: 576px) {
  .version-update-banner {
    flex-wrap: wrap;
  }
  .version-update-actions {
    width: 100%;
  }
  .version-update-actions .btn {
    flex: 1;
  }
}
</style>
