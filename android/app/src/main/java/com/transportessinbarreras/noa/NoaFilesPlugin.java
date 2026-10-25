package com.transportessinbarreras.noa;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.webkit.MimeTypeMap;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Locale;

/**
 * Guarda archivos descargados (PDF/Excel) en la carpeta pública
 * Descargas/NOA del dispositivo, para que el conductor los encuentre en su
 * gestor de archivos sin depender de un visor de documentos.
 *
 * Método: saveToDownloads { name, data (base64), mime }
 * - Android 10+ (API 29): MediaStore.Downloads con RELATIVE_PATH
 *   Descargas/NOA (no requiere permisos de almacenamiento).
 * - Android 9 o anterior: Environment.DIRECTORY_DOWNLOADS/NOA, que exige
 *   WRITE_EXTERNAL_STORAGE (declarado en el manifest con maxSdkVersion="28").
 */
@CapacitorPlugin(name = "NoaFiles")
public class NoaFilesPlugin extends Plugin {

    private static final String SUBCARPETA = "NOA";

    @PluginMethod
    public void saveToDownloads(PluginCall call) {
        try {
            String name = nombreLimpio(call.getString("name", ""));
            String data = call.getString("data", "");
            String mime = call.getString("mime", "");
            if (name.isEmpty() || data.isEmpty()) {
                call.reject("Faltan el nombre o el contenido del archivo");
                return;
            }
            if (mime == null || mime.isEmpty()) {
                mime = mimeDe(name);
            }

            byte[] bytes = android.util.Base64.decode(data, android.util.Base64.DEFAULT);
            if (bytes.length == 0) {
                call.reject("El contenido del archivo está vacío");
                return;
            }

            Uri uri;
            String path;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                uri = guardarConMediaStore(name, mime, bytes);
                path = "Descargas/" + SUBCARPETA + "/" + name;
            } else {
                File destino = guardarEnAlmacenamientoPublico(name, bytes);
                uri = Uri.fromFile(destino);
                path = destino.getAbsolutePath();
            }

            JSObject ret = new JSObject();
            ret.put("uri", uri.toString());
            ret.put("path", path);
            ret.put("name", name);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("No se pudo guardar el archivo: " + e.getMessage());
        }
    }

    /**
     * Android 10+: escribe directo en la colección de Descargas con MediaStore.
     * El llamador ya comprobó `SDK_INT >= Q`; el anotador evita el aviso de API
     * nueva en `lintVitalRelease` (assembleRelease) sin añadir código en runtime.
     */
    @android.annotation.TargetApi(29)
    private Uri guardarConMediaStore(String name, String mime, byte[] bytes) throws Exception {
        Context ctx = getContext();
        if (ctx == null) {
            throw new IllegalStateException("Sin contexto de la aplicación");
        }
        ContentResolver resolver = ctx.getContentResolver();
        Uri coleccion = MediaStore.Downloads.EXTERNAL_CONTENT_URI;
        String nombreFinal = nombreSinChoque(resolver, coleccion, name);

        ContentValues valores = new ContentValues();
        valores.put(MediaStore.MediaColumns.DISPLAY_NAME, nombreFinal);
        valores.put(MediaStore.MediaColumns.MIME_TYPE, mime);
        valores.put(MediaStore.MediaColumns.RELATIVE_PATH,
                Environment.DIRECTORY_DOWNLOADS + "/" + SUBCARPETA);
        valores.put(MediaStore.MediaColumns.IS_PENDING, 1);

        Uri uri = resolver.insert(coleccion, valores);
        if (uri == null) {
            throw new IllegalStateException("Android no creó la entrada en Descargas");
        }
        try {
            OutputStream salida = resolver.openOutputStream(uri);
            if (salida == null) {
                throw new IllegalStateException("No se pudo abrir Descargas para escribir");
            }
            try {
                salida.write(bytes);
            } finally {
                salida.close();
            }
        } catch (Exception e) {
            resolver.delete(uri, null, null);
            throw e;
        }

        valores.clear();
        valores.put(MediaStore.MediaColumns.IS_PENDING, 0);
        resolver.update(uri, valores, null, null);
        return uri;
    }

    /**
     * Android 9 o anterior: escribe en Descargas/NOA con almacenamiento público.
     */
    private File guardarEnAlmacenamientoPublico(String name, byte[] bytes) throws Exception {
        Context ctx = getContext();
        if (ctx == null) {
            throw new IllegalStateException("Sin contexto de la aplicación");
        }
        File carpeta = new File(
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                SUBCARPETA);
        if (!carpeta.exists() && !carpeta.mkdirs()) {
            throw new IllegalStateException("No se pudo crear la carpeta Descargas/" + SUBCARPETA);
        }
        File destino = new File(carpeta, nombreSinChoque(carpeta, name));
        OutputStream salida = new FileOutputStream(destino);
        try {
            salida.write(bytes);
        } finally {
            salida.close();
        }
        MediaScannerConnection.scanFile(ctx, new String[]{destino.getAbsolutePath()}, null, null);
        return destino;
    }

    /**
     * Evita sobrescribir un archivo ya guardado: añade " (1)", " (2)"…
     * antes de la extensión hasta encontrar un nombre libre.
     */
    private String nombreSinChoque(ContentResolver resolver, Uri coleccion, String nombre) {
        String actual = nombre;
        int intento = 0;
        while (existeNombre(resolver, coleccion, actual)) {
            intento++;
            actual = conSufijo(nombre, intento);
            if (intento > 99) break;
        }
        return actual;
    }

    private String nombreSinChoque(File carpeta, String nombre) {
        String actual = nombre;
        int intento = 0;
        while (new File(carpeta, actual).exists()) {
            intento++;
            actual = conSufijo(nombre, intento);
            if (intento > 99) break;
        }
        return actual;
    }

    private boolean existeNombre(ContentResolver resolver, Uri coleccion, String nombre) {
        Cursor cursor = null;
        try {
            cursor = resolver.query(
                    coleccion,
                    new String[]{MediaStore.MediaColumns.DISPLAY_NAME},
                    MediaStore.MediaColumns.DISPLAY_NAME + " = ?",
                    new String[]{nombre},
                    null);
            return cursor != null && cursor.getCount() > 0;
        } catch (Exception ignored) {
            return false;
        } finally {
            if (cursor != null) cursor.close();
        }
    }

    private String conSufijo(String nombre, int n) {
        int punto = nombre.lastIndexOf('.');
        if (punto <= 0) return nombre + " (" + n + ")";
        return nombre.substring(0, punto) + " (" + n + ")" + nombre.substring(punto);
    }

    /**
     * Deja solo el nombre del archivo (sin rutas) y quita caracteres no
     * admitidos por el sistema de archivos.
     */
    private String nombreLimpio(String nombre) {
        if (nombre == null) return "";
        String limpio = nombre.replace('\\', '/');
        int corte = limpio.lastIndexOf('/');
        if (corte >= 0) limpio = limpio.substring(corte + 1);
        limpio = limpio.replaceAll("[\\p{Cntrl}]", "").trim();
        if (limpio.equals(".") || limpio.equals("..")) return "";
        return limpio;
    }

    private String mimeDe(String nombre) {
        int punto = nombre.lastIndexOf('.');
        if (punto >= 0 && punto < nombre.length() - 1) {
            String ext = nombre.substring(punto + 1).toLowerCase(Locale.ROOT);
            String tipo = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);
            if (tipo != null) return tipo;
        }
        return "application/octet-stream";
    }
}
