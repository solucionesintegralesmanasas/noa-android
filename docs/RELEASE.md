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

El workflow `.github/workflows/android-release.yml` hace: `npm ci` > `build --mode production` > `cap sync` > inyecta version > `assembleRelease` firmado > publica `NOA-v1.0.1.apk` + `.sha256.txt`.

Reglas de actualizacion Android:

1. Mismo `applicationId` (`com.transportessinbarreras.noa`).
2. Misma firma (mismo `.jks`).
3. `versionCode` mayor (lo pone el workflow con `run_number`).

## 4. Verificar antes de distribuir

- Instalacion limpia en 1 dispositivo.
- Actualizacion encima (vN > vN-1) sin desinstalar, con sesion iniciada.
- Opcional local: `apksigner verify --print-certs android/app/build/outputs/apk/release/app-release.apk`.

## 5. Desarrollo local con Android Studio

Sin keystore configurado, el `build.gradle` cae a firma debug y permite `Run`. Para probar firma release local, crear `android/release.keystore` (ignorado por git) y exportar las 4 variables `ANDROID_*`.

## 6. Que NO subir

Nunca commitear `*.jks`, `*.apk`, `android/build/`, `android/app/build/`, `android/local.properties`, `dist/`. El APK solo vive como asset del Release.
