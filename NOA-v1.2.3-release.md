## NOA v1.2.3 — Actualización de conexión servidor

App de Transportes Sin Barreras para Android (Vue + Capacitor).

### Incluye

- **Actualización de conexión servidor**: URLs de API actualizadas para alinearse con la configuración de producción del frontend (`noa-frontend`). 
  - `VITE_API_BASE_URL`: `https://apinoa.transportessinbarreras.com/api/v1/` (antes: `https://apinoatransportes.solucionesintegralesmana.com/api/v1/`)
  - `VITE_API_NATIVE_URL`: `https://api.transportessinbarreras.com/api/v1/` (antes: `https://apinoatransportes.solucionesintegralesmana.com/api/v1/`)
- **Versión actualizada**: `1.2.3` en `package.json` y `.env.production`
- **Configuración de entorno**: Valor por defecto en `src/utils/env.js` actualizado para `API_NATIVE_URL`

### Requisitos

- Android 7.0 o superior.
- Conexión al servidor actualizado `https://apinoa.transportessinbarreras.com/api/v1/`.
- Permisos: ubicación (incluida en segundo plano), notificaciones, ejecución en segundo plano e instalación de paquetes.

### Instalación

1. Descargar `NOA-v1.2.3.apk` desde este Release.
2. Permitir "instalar apps desconocidas" cuando Android lo pida.
3. Abrir NOA e iniciar sesión con tu usuario.

### Actualizaciones futuras

- Instalar el APK nuevo encima, sin desinstalar: conserva datos y sesión.
- La propia app detecta la nueva versión y ofrece la descarga automática.
- Verifica el SHA256 con el `.sha256.txt` adjunto si lo descargaste fuera de aquí.

### Verificación técnica

- `applicationId com.transportessinbarreras.noa`, `versionName 1.2.3`, `versionCode 12` (build.gradle 11 + 1), APK firmado release.
- Servidor API configurado correctamente para entorno de producción.