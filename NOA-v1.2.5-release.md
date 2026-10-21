## NOA v1.2.5 — Conexión unificada al servidor

App de Transportes Sin Barreras para Android (Vue + Capacitor).

### Incluye

- **API unificada**: la app nativa, la versión web y los recursos de media apuntan ahora a `https://apinoa.transportessinbarreras.com/api/v1/`. Se retiran las referencias al dominio anterior `api.transportessinbarreras.com` y al host histórico `apinoatransportes.solucionesintegralesmana.com`.
- **Variables de entorno actualizadas**: `VITE_API_BASE_URL`, `VITE_API_NATIVE_URL` y `VITE_API_PROXY_TARGET` usan el mismo servidor; el valor por defecto de `API_NATIVE_URL` en `src/utils/env.js` también queda alineado.
- **Recursos y PDF**: la resolución de media y los enlaces de archivos usan la nueva base, sin mezclar dominios.
- **Assets de Android regenerados** con la configuración nueva (`cap sync`).
- Se mantienen las funciones publicadas en v1.2.4: control de combustible, estado por vehículo, solicitudes de tanqueo con QR, alertas y sucursal del tercero.

### Requisitos

- Android 7.0 o superior.
- Conexión al servidor `https://apinoa.transportessinbarreras.com/api/v1/`.
- Permisos: ubicación (incluida en segundo plano), notificaciones, ejecución en segundo plano e instalación de paquetes.

### Instalación

1. Descargar `NOA-v1.2.5.apk` desde este Release.
2. Permitir "instalar apps desconocidas" cuando Android lo pida.
3. Abrir NOA e iniciar sesión con tu usuario.

### Actualizaciones futuras

- Instalar el APK nuevo encima, sin desinstalar: conserva datos y sesión.
- La propia app detecta la nueva versión y ofrece la descarga automática.
- Verifica el SHA256 con el `.sha256.txt` adjunto si lo descargaste fuera de aquí.

### Verificación técnica

- `applicationId com.transportessinbarreras.noa`, `versionName 1.2.5`, `versionCode 13` (build.gradle 12 + 1), APK firmado release.
- Servidor API configurado en `https://apinoa.transportessinbarreras.com/api/v1/`.
