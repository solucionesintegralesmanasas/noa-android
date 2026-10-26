## NOA v1.2.8 — Planillas de servicio: descargas en tu teléfono y agrupación por proyecto

App de **Transportes Sin Barreras** para Android (Vue + Capacitor).

> Esta versión completa la pantalla de **Control de Servicio**: los PDF y Excel se guardan ahora directo en **Descargas/NOA**, la paginación vuelve a funcionar, cada conductor ve solo sus planillas y puedes agruparlas por proyecto.

---

### ✨ Novedades

- **Agrupar por proyecto**: un interruptor en el filtro ordena y agrupa las planillas por proyecto, con el nombre del proyecto y su cantidad en cada grupo. Viene activado y puedes plegar o desplegar cada grupo.
- **Ir al proyecto**: desde cada planilla (y desde su tarjeta en el móvil) puedes abrir el perfil o la edición del proyecto, si tienes permiso.
- **Servicio por placa**: al elegir un servicio en el formulario, la lista muestra primero la placa del vehículo.

### 🛠️ Correcciones

- **Solo tus planillas**: en modo conductor el listado se filtra en la app (el servidor no lo hace); si no hay identidad de conductor se muestra la lista vacía en vez de las planillas de otros.
- **Descarga real en Android**: los PDF y Excel se guardan en **Descargas/NOA** con el nombre del archivo (sin sobrescribir los anteriores); si no se puede guardar, la app ofrece compartir el archivo. Antes el Excel no se guardaba en el teléfono.
- **Paginación arreglada**: los botones de página y el selector de "por página" ahora responden; una página fuera de rango se recorta a la última.
- **Búsqueda con espera**: la búsqueda por texto vuelve a esperar antes de consultar el servidor.
- **La sesión no se congela**: si cambias de rol o de usuario sin recargar la pantalla, el listado se recalcula con tus datos actuales.

---

### 📲 Cómo actualizar

1. Descarga `NOA-v1.2.8.apk` desde este Release.
2. Instálalo encima de la versión actual **sin desinstalar**: conservas tus datos y tu sesión.
3. Si Android lo pide, permite **instalar apps desconocidas** para este origen.
4. Abre NOA. La app también puede ofrecerte la actualización automáticamente.

Para verificar la descarga, compara el SHA256 con el archivo `NOA-v1.2.8.apk.sha256.txt` adjunto.

---

### 📋 Requisitos

- Android 7.0 o superior.
- Conexión al servidor `https://apinoa.transportessinbarreras.com/api/v1/`.
- Permisos: **ubicación** (incluida en segundo plano), **notificaciones**, **ejecución en segundo plano** e **instalación de paquetes**.

---

### 🔍 Verificación técnica

| Campo | Valor |
|---|---|
| `applicationId` | `com.transportessinbarreras.noa` |
| `versionName` | `1.2.8` |
| `versionCode` | `16` (base de `build.gradle` 15 + 1) |
| Firma | Release |
| Servidor | `https://apinoa.transportessinbarreras.com/api/v1/` |

- Pruebas unitarias: 198 en verde.
- Build web y sincronización nativa (`cap sync`) correctas.
