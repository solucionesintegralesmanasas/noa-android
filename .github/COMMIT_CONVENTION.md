# Convención de commits — noa-android

Todo commit que se suba a este repositorio lleva título + cuerpo. Sin excepciones.

## Formato

```
tipo(alcance): título corto en imperativo (máx 72 caracteres)

- Qué cambia (viñetas técnicas y específicas)
- Archivos o áreas clave afectadas

Verificación: cómo se comprobó
```

## Tipos permitidos

- `feat`: funcionalidad nueva
- `fix`: corrección de error
- `chore`: tareas de mantenimiento, dependencias, configuración
- `docs`: solo documentación
- `ci`: workflows de GitHub Actions, releases
- `build`: sistema de compilación, Gradle, firma
- `refactor`: reestructuración sin cambio de comportamiento

## Reglas

1. Un propósito por commit. Prohibidos los commits "y de paso…".
2. Prohibido: "update", "ajustes", "cambios varios", "fix bug" sin contexto.
3. El título va en imperativo y en español ("agrega", "corrige", "normaliza").
4. El cuerpo explica el _qué_ y el _porqué_; el `git diff` ya muestra el _cómo_.
5. La línea `Verificación:` es obligatoria: comando ejecutado, chequeo en dispositivo o resultado del CI.
6. Nunca incluir secretos, contraseñas ni rutas locales en el mensaje.

## Ejemplos

```
ci(release): publica APK v1.0.0 firmada en Release

- Adjunta NOA-v1.0.0.apk + sha256 al Release v1.0.0
- Cuerpo del Release tomado de .github/RELEASE_TEMPLATE.md

Verificación: apksigner verify OK; badging con
applicationId com.transportessinbarreras.noa,
versionCode 1, versionName 1.0.0
```

```
build(android): firma release por Secrets y version por tag

- Agrega signingConfigs.release en android/app/build.gradle
  leyendo ANDROID_KEYSTORE_* del entorno, sin claves en el repo
- El workflow inyecta versionCode/versionName desde el tag vX.Y.Z

Verificación: workflow android-release.yml en verde y
grep sin restos del applicationId anterior
```

```
docs(release): exige cuerpo de Release desde plantilla

- Actualiza docs/RELEASE.md con naming y checklist de subida
- Agrega esta convención de commits

Verificación: lectura de los archivos generados
```
