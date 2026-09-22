# NOA Android — Releases APK por GitHub

App NOA (Vue 3 + Vite + Capacitor) distribuida como APK firmada via GitHub Releases. Sin Play Store.

- ID: `com.transportessinbarreras.noa`
- Versionado: tag `vX.Y.Z` = `versionName X.Y.Z`. `versionCode` = numero de ejecucion del workflow (siempre creciente).
- APK: `NOA-vX.Y.Z.apk` (sin espacios) + `NOA-vX.Y.Z.apk.sha256.txt`, solo como assets del Release, nunca en git.
- Notas: plantilla en `.github/RELEASE_TEMPLATE.md`.
- Actualizacion: instalar el APK nuevo encima, conserva datos si se mantiene ID + firma.

## Publicar una actualizacion

```bash
git tag v1.0.1
git push origin v1.0.1
```

Ver `Actions > Android APK Release` y luego `Releases > NOA v1.0.1` con el asset `NOA-v1.0.1.apk`.

Detalle completo: `docs/RELEASE.md`.
