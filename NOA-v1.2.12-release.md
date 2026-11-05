## NOA v1.2.12 — Planilla del día vigente en hora de Colombia

App de **Transportes Sin Barreras** para Android (Vue + Capacitor).

> Esta versión limita el diligenciamiento a la planilla del día en curso y calcula ese "hoy" en la zona horaria de Colombia (America/Bogota), no con el reloj del teléfono. Así se evita el error "La planilla pertenece a un día ya vencido" que aparecía cuando el reloj/zona del equipo difería del servidor. También se declara la jornada en disponibilidad con su motivo, que queda en el PDF/Excel.

---

### 🛠️ Correcciones

- **Solo se diligencia el día vigente**: la app deja operar únicamente la planilla del día en curso; los días anteriores quedan marcados como "Día vencido" y bloqueados, sin arrastrarse a la jornada actual.
- **"Hoy" en hora de Colombia**: la fecha del día vigente se calcula en America/Bogota en lugar de usar el reloj o la zona horaria del equipo. Con esto el teléfono y el servidor deciden igual qué planilla es la de hoy, y una planilla del día ya no se rechaza como vencida por desfase de horas.
- **Disponibilidad con motivo**: al cerrar un día sin recorridos se declara la jornada en disponibilidad y se captura el motivo (obligatorio), que queda registrado en el PDF y el Excel como respaldo.

---

### 📲 Cómo actualizar

1. Descarga `NOA-v1.2.12.apk` desde este Release.
2. Instálalo encima de la versión actual **sin desinstalar**: conservas tus datos y tu sesión.
3. Si Android lo pide, permite **instalar apps desconocidas** para este origen.
4. Abre NOA. La app también puede ofrecerte la actualización automáticamente.

Para verificar la descarga, compara el SHA256 con el archivo `NOA-v1.2.12.apk.sha256.txt` adjunto.

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
| `versionName` | `1.2.12` |
| `versionCode` | `20` (base de `build.gradle` 19 + 1) |
| Firma | Release |
| Servidor | `https://apinoa.transportessinbarreras.com/api/v1/` |

- Pruebas unitarias: 222 en verde (17 archivos).
- Build web correcto; `totalJS` 2936.2 kB (+2.3 kB, +0.08 %), `totalCSS` 292.1 kB (sin cambios), `indexJS` 145.6 kB (sin cambios).
- Compilación nativa y firma: las realiza el CI (`android-release.yml`) al publicar el tag.
