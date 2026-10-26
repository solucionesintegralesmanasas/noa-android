## NOA v1.2.10 — Rastreo: tu vehículo sigue visible aunque esté detenido

App de **Transportes Sin Barreras** para Android (Vue + Capacitor).

> Esta versión corrige el rastreo de los vehículos **detenidos o estacionados**: dejaban de enviar su posición al no moverse y desaparecían del mapa. También evita perder un tramo de ruta cuando la sesión expira.

---

### 🛠️ Correcciones

- **Vehículo detenido sigue visible**: la app envía una señal (latido) cada minuto aunque el vehículo no se mueva, para que el mapa no lo oculte por "sin datos recientes". Antes solo reportaba en movimiento.
- **Sesión expirada sin perder ruta**: si tu sesión vence durante el recorrido, la app guarda el punto y lo reenvía al volver a abrir NOA y renovar el acceso; ya no se pierde ese tramo.
- **Cierre más limpio**: al detener el rastreo se limpian temporizadores y cola, para que el servicio no siga enviando en segundo plano.

---

### 📲 Cómo actualizar

1. Descarga `NOA-v1.2.10.apk` desde este Release.
2. Instálalo encima de la versión actual **sin desinstalar**: conservas tus datos y tu sesión.
3. Si Android lo pide, permite **instalar apps desconocidas** para este origen.
4. Abre NOA. La app también puede ofrecerte la actualización automáticamente.

Para verificar la descarga, compara el SHA256 con el archivo `NOA-v1.2.10.apk.sha256.txt` adjunto.

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
| `versionName` | `1.2.10` |
| `versionCode` | `18` (base de `build.gradle` 17 + 1) |
| Firma | Release |
| Servidor | `https://apinoa.transportessinbarreras.com/api/v1/` |

- Pruebas unitarias: 206 en verde.
- Compilación nativa (`:app:compileDebugJavaWithJavac`) en verde con JDK 21.
- Sin cambios web: `totalJS`, `totalCSS` e `indexJS` iguales que v1.2.9.
