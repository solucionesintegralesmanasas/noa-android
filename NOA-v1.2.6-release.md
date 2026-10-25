## NOA v1.2.6 — Ubicación del teléfono y solicitudes de tanqueo

App de **Transportes Sin Barreras** para Android (Vue + Capacitor).

> Esta versión corrige la pantalla de **solicitudes de tanqueo**, donde el QR aprobado no se mostraba, y evita que el rastreo falle en silencio cuando la **ubicación del teléfono está apagada**.

---

### ✨ Novedades

| | Función | Qué cambia para ti |
|---|---|---|
| 📍 | **Aviso de ubicación apagada** | Si el GPS del teléfono está desactivado, NOA lo indica y ofrece **Abrir ajustes de ubicación**. Al volver a la app, el rastreo se reanuda solo. |
| 📝 | **Motivo de rechazo** | Al rechazar una solicitud de tanqueo, la empresa escribe el motivo y el conductor lo ve en su listado. |
| 🧭 | **Acceso desde el menú** | Quien tenga permiso de solicitudes de tanqueo la encuentra en el menú lateral, en **Combustible**. |

> ℹ️ Android no permite encender el GPS desde una aplicación. NOA abre la pantalla de ubicación del teléfono y tú la activas allí.

---

### 🛠️ Correcciones

- **QR aprobado sin imágenes**: el código QR ahora se muestra completo en la estación.
- **Vehículos que no cargan**: si falla la carga, NOA muestra el problema y un botón **Reintentar**, en lugar de decir "no tienes vehículos asignados".
- **Acciones sin permiso**: los botones y tarjetas de solicitudes solo aparecen si tu usuario puede usarlos.
- **Estados desconocidos**: una solicitud con un estado nuevo ya no aparece como "Anulada"; se muestra "Estado no disponible".
- **Mensajes técnicos**: los errores de red ya no muestran textos en inglés como `Network Error`; se muestra un mensaje claro en español.
- **Listado completo**: si tienes más de 50 solicitudes, NOA indica cuántas se muestran.
- **Botones táctiles**: las acciones de solicitudes tienen al menos 48 px de altura para usarlas con una mano.

---

### 📲 Cómo actualizar

1. Descarga `NOA-v1.2.6.apk` desde este Release.
2. Instálalo encima de la versión actual **sin desinstalar**: conservas tus datos y tu sesión.
3. Si Android lo pide, permite **instalar apps desconocidas** para este origen.
4. Abre NOA. La app también puede ofrecerte la actualización automáticamente.

Para verificar la descarga, compara el SHA256 con el archivo `NOA-v1.2.6.apk.sha256.txt` adjunto.

---

### 📋 Requisitos

- Android 7.0 o superior.
- Conexión al servidor `https://apinoa.transportessinbarreras.com/api/v1/`.
- Permisos: **ubicación** (incluida en segundo plano), **notificaciones**, **ejecución en segundo plano** e **instalación de paquetes**.
- Ubicación del teléfono **activada** para registrar la ruta.

---

### 🔍 Verificación técnica

| Campo | Valor |
|---|---|
| `applicationId` | `com.transportessinbarreras.noa` |
| `versionName` | `1.2.6` |
| `versionCode` | `14` (base de `build.gradle` 13 + 1) |
| Firma | Release |
| Servidor | `https://apinoa.transportessinbarreras.com/api/v1/` |

- Pruebas unitarias: 147 en verde.
- Build web y sincronización nativa (`cap sync`) correctas.
- Compilación nativa verificada con el plugin de rastreo actualizado.
