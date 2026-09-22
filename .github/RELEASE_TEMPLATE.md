## NOA v1.0.0 — Primera versión distribuible

App de Transportes Sin Barreras para Android (Vue + Capacitor).

### Incluye
- Acceso, panel operativo y gestión FUEC.
- Rastreo GPS en segundo plano con servicio foreground y reanudación tras reinicio.
- Icono e identidad NOA (`com.transportessinbarreras.noa`).

### Requisitos
- Android 7.0 o superior.
- Conexión a https://api.transportessinbarreras.com.
- Permisos: ubicación (incluida en segundo plano), notificaciones y ejecución en segundo plano.

### Instalación
1. Descargar `NOA-v1.0.0.apk` desde este Release.
2. Permitir "instalar apps desconocidas" cuando Android lo pida.
3. Abrir NOA e iniciar sesión con tu usuario.

### Actualizaciones futuras
- Instalar el APK nuevo encima, sin desinstalar: conserva datos y sesión.
- Verifica el SHA256 con el `.sha256.txt` adjunto si lo descargaste fuera de aquí.

### Verificación técnica
- `applicationId com.transportessinbarreras.noa`, `versionName 1.0.0`, `versionCode 1`, APK firmado release.
- Para la próxima versión solo cambian versión y la sección "Incluye".
