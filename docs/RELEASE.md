# Releases APK — noa-android

## 1. Keystore (una sola vez, fuera del repo)

```bash
keytool -genkeypair -alias noa -keyalg RSA -keysize 2048 -validity 9125 -keystore noa-release.jks
base64 -w0 noa-release.jks > noa-release.b64
```

Guardar `noa-release.jks` en lugar seguro (USB + copia). Si se pierde, no hay forma de actualizar la app instalada: tocaria desinstalar.

## 2. Secrets en GitHub (repo noa-android > Settings > Secrets > Actions)

- `ANDROID_KEYSTORE_BASE64`: contenido de `noa-release.b64`
- `ANDROID_KEYSTORE_PASSWORD`: password del keystore
- `ANDROID_KEY_ALIAS`: `noa`
- `ANDROID_KEY_PASSWORD`: password de la clave

## 3. Publicar / actualizar

```bash
git tag v1.0.1
git push origin v1.0.1
```

El workflow `.github/workflows/android-release.yml` hace: `npm ci` > `build --mode production` > `cap sync` > inyecta version > `assembleRelease` firmado > publica `NOA-vX.Y.Z.apk` + `.sha256.txt`.

El cuerpo del Release es obligatorio y se toma de la plantilla versionada
`.github/RELEASE_TEMPLATE.md` (ajustar version y seccion "Incluye" en cada
version). Ver `.github/COMMIT_CONVENTION.md`: prohibido improvisar el texto
en el formulario web.

Reglas de actualizacion Android:

1. Mismo `applicationId` (`com.transportessinbarreras.noa`).
2. Misma firma (mismo `.jks`).
3. `versionCode` mayor (lo pone el workflow con `run_number`).

## 4. Verificar antes de distribuir

- Firma: `apksigner verify --print-certs` sin errores.
- Identidad: `aapt dump badging` con `applicationId com.transportessinbarreras.noa`
  y `versionCode` mayor al Release anterior.
- Instalacion limpia en 1 dispositivo.
- Actualizacion encima (vN > vN-1) sin desinstalar, con sesion iniciada.

## 5. Desarrollo local con Android Studio

El boton `Run` usa la variante `debug` (firma automática) y funciona sin
keystore. La variante `release` exige el keystore: para probarla en local,
crear `android/app/release.keystore` (ignorado por git) y exportar las 4
variables `ANDROID_*`.

## 6. Que NO subir

Nunca commitear `*.jks`, `*.apk`, `android/build/`, `android/app/build/`, `android/local.properties`, `dist/`. El APK solo vive como asset del Release.

## 7. Naming estricto de assets

`NOA-vX.Y.Z.apk` + `NOA-vX.Y.Z.apk.sha256.txt`. Sin espacios, sin "final",
sin sufijos improvisados. Cada Release corresponde a un tag, cada tag a un
commit en `main`: nada huérfano.
