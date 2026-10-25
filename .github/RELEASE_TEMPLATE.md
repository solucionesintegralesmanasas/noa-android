## NOA v1.2.7 — Barra de navegación en Solicitudes de tanqueo

App de **Transportes Sin Barreras** para Android (Vue + Capacitor).

> Esta versión corrige una inconsistencia de la **v1.2.6**: la pantalla de **solicitudes de tanqueo** se abría sin la **barra inferior** del conductor, así que no podías volver a Inicio, Inspección, Servicios o Perfil sin usar el botón atrás.

---

### 🛠️ Correcciones

- **Barra inferior en solicitudes de tanqueo**: la pantalla usa ahora la misma navegación del conductor que el resto de la app (Inicio, Inspección, Servicios y Perfil).
- **Inicio sigue marcado**: al abrir solicitudes de tanqueo desde la tarjeta de Inicio, la pestaña **Inicio** queda resaltada, para que sepas de dónde vienes.

### 🔎 Causa

Las rutas que usan la navegación del conductor están definidas en una lista. La pantalla de solicitudes de tanqueo se añadió en la v1.2.6 sin incluirla en esa lista, por eso se mostraba el diseño de escritorio. Ya está incluida.

---

### 📲 Cómo actualizar

1. Descarga `NOA-v1.2.7.apk` desde este Release.
2. Instálalo encima de la versión actual **sin desinstalar**: conservas tus datos y tu sesión.
3. Si Android lo pide, permite **instalar apps desconocidas** para este origen.
4. Abre NOA. La app también puede ofrecerte la actualización automáticamente.

Para verificar la descarga, compara el SHA256 con el archivo `NOA-v1.2.7.apk.sha256.txt` adjunto.

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
| `versionName` | `1.2.7` |
| `versionCode` | `15` (base de `build.gradle` 14 + 1) |
| Firma | Release |
| Servidor | `https://apinoa.transportessinbarreras.com/api/v1/` |

- Pruebas unitarias: 149 en verde.
- Build web y sincronización nativa (`cap sync`) correctas.
