## NOA v1.0.1 — Actualización con alerta de nueva versión

App de Transportes Sin Barreras para Android (Vue + Capacitor).

### Incluye
- Alerta automática de nueva versión en web y Android.
  - Banner no intrusivo que ofrece la actualización al abrir la app.
  - Detección semver contra el último Release publicado en GitHub.
  - En Android: descarga e instalación del APK desde el propio banner.
  - En web: descarga manual en el navegador.
- `versionCode` incremental desde `build.gradle` (reintentos del CI no rompen la secuencia).
- Acceso, panel operativo, gestión FUEC y rastreo GPS en segundo plano (sin cambios).
- Icono e identidad NOA (`com.transportessinbarreras.noa`).

### Requisitos
- Android 7.0 o superior.
- Conexión a https://api.transportessinbarreras.com.
- Permisos: ubicación (incluida en segundo plano), notificaciones, ejecución en segundo plano e instalación de paquetes.

### Instalación
1. Descargar `NOA-v1.0.1.apk` desde este Release.
2. Permitir "instalar apps desconocidas" cuando Android lo pida.
3. Abrir NOA e iniciar sesión con tu usuario.

### Actualizaciones futuras
- Instalar el APK nuevo encima, sin desinstalar: conserva datos y sesión.
- La propia app detecta la nueva versión y ofrece la descarga automática.
- Verifica el SHA256 con el `.sha256.txt` adjunto si lo descargaste fuera de aquí.

### Verificación técnica
- `applicationId com.transportessinbarreras.noa`, `versionName 1.0.1`, `versionCode 2`, APK firmado release.
- Para la próxima versión solo cambian versión y la sección "Incluye".
