package com.transportessinbarreras.noa;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;

import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Servicio foreground que mantiene el rastreo GPS vivo aunque la app
 * esté minimizada o cerrada con swipe (el WebView de Capacitor muere,
 * este Service nativo no).
 *
 * - Escucha LocationManager (GPS + NETWORK, sin dependencia de Play Services).
 * - Publica POST /tracking/location directo al backend con Bearer.
 * - Cola offline en SharedPreferences (máx 200 puntos) y reintento cada 30s.
 * - START_STICKY + BootReceiver = sobrevive a cierre y reinicio.
 */
public class TrackingForegroundService extends Service implements LocationListener {

    public static final String ACTION_START = "com.noa.tracking.START";
    public static final String ACTION_UPDATE = "com.noa.tracking.UPDATE";
    public static final String ACTION_STOP = "com.noa.tracking.STOP";

    public static final String PREFS = "noa_tracking";
    private static final String CHANNEL_ID = "noa_tracking_channel";
    private static final int NOTIF_ID = 8201;
    private static final int MAX_QUEUE = 200;
    private static final long MIN_TIME_MS = 10000;
    private static final float MIN_DISTANCE_M = 15f;

    private LocationManager locationManager;
    private PowerManager.WakeLock wakeLock;
    private ExecutorService executor;
    private Handler flushHandler;
    private Runnable flushRunnable;

    @Override
    public void onCreate() {
        super.onCreate();
        executor = Executors.newSingleThreadExecutor();
        createChannel();
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "NOA:TrackingWakeLock");
            wakeLock.setReferenceCounted(false);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent != null ? intent.getAction() : ACTION_START;
        if (ACTION_STOP.equals(action)) {
            stopTracking();
            return START_NOT_STICKY;
        }

        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        SharedPreferences.Editor ed = prefs.edit();

        // Extras tienen prioridad; si no vienen (ej: reinicio), se reutiliza lo guardado.
        if (intent != null && intent.getExtras() != null) {
            Bundle b = intent.getExtras();
            putIfPresent(ed, "baseUrl", b.getString("baseUrl"));
            putIfPresent(ed, "token", b.getString("token"));
            putIfPresent(ed, "sessionUuid", b.getString("sessionUuid"));
            putIfPresent(ed, "vehicleUuid", b.getString("vehicleUuid"));
            putIfPresent(ed, "projectUuid", b.getString("projectUuid"));
            putIfPresent(ed, "thirdPartyUuid", b.getString("thirdPartyUuid"));
            putIfPresent(ed, "plate", b.getString("plate"));
        }
        ed.putBoolean("tracking", true);
        ed.apply();

        startForegroundWithType(buildNotification(prefs));
        if (wakeLock != null && !wakeLock.isHeld()) {
            try { wakeLock.acquire(12 * 60 * 60 * 1000L); } catch (Exception ignored) {}
        }
        subscribeLocation();
        scheduleFlush();

        return START_STICKY;
    }

    private void putIfPresent(SharedPreferences.Editor ed, String k, String v) {
        if (v != null && !v.isEmpty()) ed.putString(k, v);
    }

    private void subscribeLocation() {
        try {
            if (locationManager == null) {
                locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
            }
            if (locationManager == null) return;
            boolean fine = ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
            boolean coarse = ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
            if (!fine && !coarse) return;
            try {
                if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                    locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, MIN_TIME_MS, MIN_DISTANCE_M, this);
                }
            } catch (Exception ignored) {}
            try {
                if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                    locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, MIN_TIME_MS, MIN_DISTANCE_M, this);
                }
            } catch (Exception ignored) {}
            // Punto inmediato para no esperar 10s tras abrir el servicio.
            try {
                Location last = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                if (last == null) last = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                if (last != null) onLocationChanged(last);
            } catch (Exception ignored) {}
        } catch (Exception ignored) {}
    }

    @Override
    public void onLocationChanged(Location location) {
        if (location == null) return;
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        if (!prefs.getBoolean("tracking", false)) return;

        double lat = location.getLatitude();
        double lng = location.getLongitude();
        float speedMs = location.hasSpeed() ? location.getSpeed() : 0f;
        int speedKmh = Math.round(speedMs * 3.6f);
        boolean moving = speedMs > 0.2f;
        float accuracy = location.hasAccuracy() ? location.getAccuracy() : -1f;

        prefs.edit()
                .putString("lastLat", String.valueOf(lat))
                .putString("lastLng", String.valueOf(lng))
                .putInt("lastSpeed", speedKmh)
                .putLong("lastFixAt", System.currentTimeMillis())
                .apply();

        updateNotification(prefs, speedKmh, moving);
        enqueueOrSend(prefs, lat, lng, speedKmh, moving, accuracy);
    }

    private void enqueueOrSend(SharedPreferences prefs, double lat, double lng, int speedKmh, boolean moving, float accuracy) {
        JSONObject point = buildPoint(prefs, lat, lng, speedKmh, moving, accuracy);
        executor.execute(() -> {
            if (!postPoint(prefs, point)) {
                appendQueue(point);
            } else {
                flushQueueAsync();
            }
        });
    }

    private JSONObject buildPoint(SharedPreferences prefs, double lat, double lng, int speedKmh, boolean moving, float accuracy) {
        try {
            JSONObject loc = new JSONObject();
            loc.put("latitude", lat);
            loc.put("longitude", lng);
            loc.put("speed", speedKmh);
            loc.put("is_moving", moving);
            if (accuracy >= 0) loc.put("accuracy", (double) accuracy);
            else loc.put("accuracy", JSONObject.NULL);
            loc.put("recorded_at", isoNow());
            putOpt(loc, "vehicle_uuid", prefs.getString("vehicleUuid", null));
            putOpt(loc, "project_uuid", prefs.getString("projectUuid", null));
            putOpt(loc, "third_party_uuid", prefs.getString("thirdPartyUuid", null));

            JSONObject root = new JSONObject();
            putOpt(root, "session_uuid", prefs.getString("sessionUuid", null));
            root.put("location", loc);
            return root;
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    private void putOpt(JSONObject o, String k, String v) {
        try {
            if (v != null && !v.isEmpty()) o.put(k, v);
        } catch (Exception ignored) {}
    }

    private String isoNow() {
        SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        f.setTimeZone(TimeZone.getTimeZone("UTC"));
        return f.format(new Date());
    }

    /** Envía un punto. Devuelve true si el backend respondió 2xx. */
    private boolean postPoint(SharedPreferences prefs, JSONObject payload) {
        String baseUrl = prefs.getString("baseUrl", "");
        String token = prefs.getString("token", "");
        if (baseUrl == null || baseUrl.isEmpty()) return false;
        String urlStr = baseUrl.endsWith("/") ? baseUrl + "tracking/location" : baseUrl + "/tracking/location";
        HttpURLConnection conn = null;
        try {
            URL url = new URL(urlStr);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(15000);
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            if (token != null && !token.isEmpty()) conn.setRequestProperty("Authorization", "Bearer " + token);
            byte[] body = payload.toString().getBytes(StandardCharsets.UTF_8);
            try (OutputStream os = conn.getOutputStream()) { os.write(body); }
            int code = conn.getResponseCode();
            if (code >= 200 && code < 300) {
                prefs.edit().putLong("lastSentAt", System.currentTimeMillis()).putString("lastError", "").apply();
                return true;
            }
            // 401/400/422 no se reintentan en bucle: se guardan como error visible y no se encolan 401.
            if (code == 401 || code == 400 || code == 422) {
                prefs.edit().putString("lastError", "HTTP " + code + " (revisa sesión/vehículo)").apply();
                return true; // no encolar, evita tormenta
            }
            prefs.edit().putString("lastError", "HTTP " + code).apply();
            return false;
        } catch (Exception e) {
            prefs.edit().putString("lastError", e.getMessage() != null ? e.getMessage() : "error de red").apply();
            return false;
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    private synchronized void appendQueue(JSONObject point) {
        try {
            SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
            String raw = prefs.getString("queue", "[]");
            JSONArray arr = new JSONArray(raw);
            arr.put(point);
            while (arr.length() > MAX_QUEUE) arr.remove(0);
            prefs.edit().putString("queue", arr.toString()).apply();
        } catch (Exception ignored) {}
    }

    private void scheduleFlush() {
        if (flushHandler == null) flushHandler = new Handler(Looper.getMainLooper());
        if (flushRunnable != null) flushHandler.removeCallbacks(flushRunnable);
        flushRunnable = new Runnable() {
            @Override public void run() {
                flushQueueAsync();
                flushHandler.postDelayed(this, 30000);
            }
        };
        flushHandler.postDelayed(flushRunnable, 30000);
    }

    private void flushQueueAsync() {
        executor.execute(() -> {
            try {
                SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
                String raw = prefs.getString("queue", "[]");
                JSONArray arr = new JSONArray(raw);
                if (arr.length() == 0) return;
                JSONArray remaining = new JSONArray();
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject p = arr.getJSONObject(i);
                    if (!postPoint(prefs, p)) remaining.put(p);
                }
                prefs.edit().putString("queue", remaining.toString()).apply();
            } catch (Exception ignored) {}
        });
    }

    private void stopTracking() {
        try {
            if (locationManager != null) locationManager.removeUpdates(this);
        } catch (Exception ignored) {}
        if (flushHandler != null && flushRunnable != null) {
            try { flushHandler.removeCallbacks(flushRunnable); } catch (Exception ignored) {}
        }
        if (wakeLock != null && wakeLock.isHeld()) {
            try { wakeLock.release(); } catch (Exception ignored) {}
        }
        try {
            getSharedPreferences(PREFS, MODE_PRIVATE).edit()
                    .putBoolean("tracking", false)
                    .putString("queue", "[]")
                    .apply();
        } catch (Exception ignored) {}
        try { stopForeground(true); } catch (Exception ignored) {}
        stopSelf();
    }

    // ---- Notificación persistente (obligatoria para foreground) ----

    private void createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel(CHANNEL_ID, "Rastreo GPS", NotificationManager.IMPORTANCE_LOW);
            ch.setDescription("Mantiene el rastreo de la flota activo en segundo plano");
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(ch);
        }
    }

    private Notification buildNotification(SharedPreferences prefs) {
        String plate = prefs.getString("plate", "");
        String title = "NOA · Rastreo activo" + (plate != null && !plate.isEmpty() ? " · " + plate : "");
        Intent launch = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent pi = null;
        if (launch != null) {
            int flags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
            pi = PendingIntent.getActivity(this, 0, launch, flags);
        }
        NotificationCompat.Builder b = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText("Transmitiendo ubicación aunque la app esté cerrada")
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setOngoing(true)
                .setOnlyAlertOnce(true);
        if (pi != null) b.setContentIntent(pi);
        return b.build();
    }

    private void updateNotification(SharedPreferences prefs, int speedKmh, boolean moving) {
        try {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            String plate = prefs.getString("plate", "");
            String title = "NOA · Rastreo activo" + (plate != null && !plate.isEmpty() ? " · " + plate : "");
            NotificationCompat.Builder b = new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle(title)
                    .setContentText((moving ? "En ruta · " : "Detenido · ") + speedKmh + " km/h · app cerrada OK")
                    .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                    .setOngoing(true)
                    .setOnlyAlertOnce(true);
            nm.notify(NOTIF_ID, b.build());
        } catch (Exception ignored) {}
    }

    private void startForegroundWithType(Notification notif) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIF_ID, notif, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
            } else {
                startForeground(NOTIF_ID, notif);
            }
        } catch (Exception e) {
            startForeground(NOTIF_ID, notif);
        }
    }

    @Override public IBinder onBind(Intent intent) { return null; }
    @Override public void onProviderEnabled(String provider) {}
    @Override public void onProviderDisabled(String provider) {}
    @Override public void onStatusChanged(String provider, int status, Bundle extras) {}
}
