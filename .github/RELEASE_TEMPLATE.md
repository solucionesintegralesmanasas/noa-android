## NOA v1.2.4 — Combustible, solicitudes de tanqueo y alertas

App de Transportes Sin Barreras para Android (Vue + Capacitor).

### Incluye

- **Control de Combustible y Kilometraje**: registro de surtimientos con galones, rendimiento (km/gal), costo por km y saldos de tanque. Los galones y el alcance estimado se calculan automáticamente y el formulario explica de dónde sale cada valor.
- **Estado de combustible por vehículo**: kilómetros recorridos desde el último tanqueo, alcance estimado y kilómetros restantes, con clasificación (OK, próximo, excedido, sin datos o sin tanqueo), resumen y filtros por estado y proyecto.
- **Solicitudes de tanqueo**: el conductor solicita el surtimiento para su vehículo, la empresa aprueba o rechaza con motivo y la app muestra el **QR aprobado** para la estación de servicio, incluido un QR con los datos para consultar sin internet. La solicitud vence a las 24 horas y puede anularse.
- **Inicio del conductor**: nueva tarjeta de acceso directo a "Solicitudes de tanqueo" en la vista móvil y de escritorio.
- **Alertas de combustible**: las notificaciones avisan cuando el vehículo agota el alcance estimado o entra en la reserva.
- **Terceros**: selección y visualización de la sucursal del tercero.
- **Menú de flota**: acceso a Combustible para los usuarios con permiso de consulta.

### Requisitos

- Android 7.0 o superior.
- Conexión al servidor `https://api.transportessinbarreras.com/api/v1/`.
- Permisos: ubicación (incluida en segundo plano), notificaciones, ejecución en segundo plano e instalación de paquetes.

### Instalación

1. Descargar `NOA-v1.2.4.apk` desde este Release.
2. Permitir "instalar apps desconocidas" cuando Android lo pida.
3. Abrir NOA e iniciar sesión con tu usuario.

### Actualizaciones futuras

- Instalar el APK nuevo encima, sin desinstalar: conserva datos y sesión.
- La propia app detecta la nueva versión y ofrece la descarga automática.
- Verifica el SHA256 con el `.sha256.txt` adjunto si lo descargaste fuera de aquí.

### Verificación técnica

- `applicationId com.transportessinbarreras.noa`, `versionName 1.2.4`, `versionCode 12` (build.gradle 11 + 1), APK firmado release.
- Servidor API configurado para el entorno de producción.
