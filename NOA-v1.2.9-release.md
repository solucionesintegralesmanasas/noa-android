## NOA v1.2.9 — Control de Servicio: tus planillas ya aparecen siempre

App de **Transportes Sin Barreras** para Android (Vue + Capacitor).

> Esta versión corrige el campo **Planilla / Servicio Asignado** que quedaba vacío para el conductor, las planillas de varios días y el estado que se arrastraba al cambiar de vehículo.

---

### 🛠️ Correcciones

- **Tus planillas ya aparecen**: la app reconoce al conductor por todas las formas en que el servidor puede asignarlo (conductor, tercero vinculado y tercero de la empresa activa). Si la sesión guardada es antigua, se actualiza al abrir la pantalla antes de filtrar.
- **Planillas de varios días**: una planilla se muestra si el conductor está asignado en la hoja o en cualquiera de sus días, igual que hace el servidor. Antes solo se miraba la hoja principal y algunos servicios no aparecían.
- **Sin identidad no se muestran planillas de otros**: si no se puede reconocer al conductor, la lista queda vacía con su explicación, en vez de mostrar servicios ajenos.
- **Cambio de vehículo limpio**: al elegir otro servicio se detiene el cronómetro, vuelve a `00:00:00` y se limpia el nivel de combustible inicial; ya no se arrastra el estado del vehículo anterior.

---

### 📲 Cómo actualizar

1. Descarga `NOA-v1.2.9.apk` desde este Release.
2. Instálalo encima de la versión actual **sin desinstalar**: conservas tus datos y tu sesión.
3. Si Android lo pide, permite **instalar apps desconocidas** para este origen.
4. Abre NOA. La app también puede ofrecerte la actualización automáticamente.

Para verificar la descarga, compara el SHA256 con el archivo `NOA-v1.2.9.apk.sha256.txt` adjunto.

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
| `versionName` | `1.2.9` |
| `versionCode` | `17` (base de `build.gradle` 16 + 1) |
| Firma | Release |
| Servidor | `https://apinoa.transportessinbarreras.com/api/v1/` |

- Pruebas unitarias: 206 en verde.
- Build web correcto; `totalJS` 2933.5 kB (+0.3 kB, +0.01 %), `totalCSS` y `indexJS` sin cambios.
- Accesibilidad sin deltas respecto de v1.2.8.
