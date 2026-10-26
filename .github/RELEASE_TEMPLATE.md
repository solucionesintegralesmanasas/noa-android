## NOA v1.2.11 — GPS del conductor se activa al iniciar sesión

App de **Transportes Sin Barreras** para Android (Vue + Capacitor).

> Esta versión hace que el rastreo GPS del conductor arranque automáticamente al entrar a la app (cuando tiene un vehículo asignado), igual que ya ocurría en el panel web. Antes, en el teléfono el GPS solo empezaba a registrar al abrir el Control de Servicio.

---

### 🛠️ Correcciones

- **GPS automático al iniciar sesión**: la pantalla de inicio del conductor ahora inicia el rastreo en cuanto se cargan sus vehículos, sin que tenga que entrar a otra sección ni pulsar nada. La central ve la ruta desde el primer momento.
- **Sin vehículo, sin sesión huérfana**: si el conductor aún no tiene un vehículo asignado, no se crea una sesión de rastreo vacía; el GPS se activa solo cuando hay vehículo.
- **Un solo camino de arranque**: el arranque automático del panel web y del móvil comparten la misma lógica, para que ambos se comporten igual.

---

### 📲 Cómo actualizar

1. Descarga `NOA-v1.2.11.apk` desde este Release.
2. Instálalo encima de la versión actual **sin desinstalar**: conservas tus datos y tu sesión.
3. Si Android lo pide, permite **instalar apps desconocidas** para este origen.
4. Abre NOA. La app también puede ofrecerte la actualización automáticamente.

Para verificar la descarga, compara el SHA256 con el archivo `NOA-v1.2.11.apk.sha256.txt` adjunto.

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
| `versionName` | `1.2.11` |
| `versionCode` | `19` (base de `build.gradle` 18 + 1) |
| Firma | Release |
| Servidor | `https://apinoa.transportessinbarreras.com/api/v1/` |

- Pruebas unitarias: 211 en verde (15 archivos).
- Build web correcto; `totalJS` 2933.9 kB (+0.4 kB, +0.01 %), `totalCSS` 292.1 kB (sin cambios), `indexJS` 145.6 kB (+0.3 kB).
- Compilación nativa y firma: las realiza el CI (`android-release.yml`) al publicar el tag.
