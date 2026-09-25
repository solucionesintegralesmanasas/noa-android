## NOA v1.1.0 — Rediseño del panel de conductor y navegación móvil

App de Transportes Sin Barreras para Android (Vue + Capacitor).

### Incluye
- Rediseño integral para dispositivos móviles del panel de conductor:
  - Barra de navegación inferior fija (`ConductorBottomNav`) adaptada al safe-area de Android.
  - Tarjeta persistente de servicio activo (`ActiveServiceStickyCard`) con estado en tiempo real.
  - Carrusel interactivo vehicular (`VehicleCarousel`) con formato de placa colombiana.
  - Cuadrícula de accesos rápidos (`QuickActionsGrid`) a inspecciones, FUEC y tareas prioritarias.
  - Mapa móvil de ubicación propia (`DriverSelfMapMobile`) y cronología de actividad (`RecentActivityTimeline`).
- Integración nativa de `@capacitor-community/file-opener` para descarga e instalación directa del APK.
- Alerta automática de nueva versión en web y Android (con banner no intrusivo y comprobación semver).
- Acceso, gestión FUEC y rastreo GPS en segundo plano con servicio foreground persistente.
- Icono e identidad NOA (`com.transportessinbarreras.noa`).

### Requisitos
- Android 7.0 o superior.
- Conexión a https://api.transportessinbarreras.com.
- Permisos: ubicación (incluida en segundo plano), notificaciones, ejecución en segundo plano e instalación de paquetes.

### Instalación
1. Descargar `NOA-v1.1.0.apk` desde este Release.
2. Permitir "instalar apps desconocidas" cuando Android lo pida.
3. Abrir NOA e iniciar sesión con tu usuario.

### Actualizaciones futuras
- Instalar el APK nuevo encima, sin desinstalar: conserva datos y sesión.
- La propia app detecta la nueva versión y ofrece la descarga automática.
- Verifica el SHA256 con el `.sha256.txt` adjunto si lo descargaste fuera de aquí.

### Verificación técnica
- `applicationId com.transportessinbarreras.noa`, `versionName 1.1.0`, `versionCode 3`, APK firmado release.
- Para la próxima versión solo cambian versión y la sección "Incluye".

