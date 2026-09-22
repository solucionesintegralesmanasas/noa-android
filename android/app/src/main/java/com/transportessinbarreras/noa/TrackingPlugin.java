package com.transportessinbarreras.noa;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Puente Capacitor -> TrackingForegroundService.
 * Métodos: start | updateContext | stop | getStatus |
 * requestBatteryExemption | isBatteryExempt | openAppSettings
 */
@CapacitorPlugin(name = "NoaTracking")
public class TrackingPlugin extends Plugin {

    private void startServiceWith(Intent intent) {
        Context ctx = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ctx.startForegroundService(intent);
        } else {
            ctx.startService(intent);
        }
    }

    @PluginMethod
    public void start(PluginCall call) {
        try {
            Intent i = new Intent(getContext(), TrackingForegroundService.class);
            i.setAction(TrackingForegroundService.ACTION_START);
            i.putExtra("baseUrl", call.getString("baseUrl", ""));
            i.putExtra("token", call.getString("token", ""));
            i.putExtra("sessionUuid", call.getString("sessionUuid", ""));
            i.putExtra("vehicleUuid", call.getString("vehicleUuid", ""));
            i.putExtra("projectUuid", call.getString("projectUuid", ""));
            i.putExtra("thirdPartyUuid", call.getString("thirdPartyUuid", ""));
            i.putExtra("plate", call.getString("plate", ""));
            startServiceWith(i);
            JSObject ret = new JSObject();
            ret.put("started", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("No se pudo iniciar el servicio: " + e.getMessage());
        }
    }

    @PluginMethod
    public void updateContext(PluginCall call) {
        try {
            Intent i = new Intent(getContext(), TrackingForegroundService.class);
            i.setAction(TrackingForegroundService.ACTION_UPDATE);
            if (call.getString("baseUrl") != null) i.putExtra("baseUrl", call.getString("baseUrl"));
            if (call.getString("token") != null) i.putExtra("token", call.getString("token"));
            if (call.getString("sessionUuid") != null) i.putExtra("sessionUuid", call.getString("sessionUuid"));
            if (call.getString("vehicleUuid") != null) i.putExtra("vehicleUuid", call.getString("vehicleUuid"));
            if (call.getString("projectUuid") != null) i.putExtra("projectUuid", call.getString("projectUuid"));
            if (call.getString("thirdPartyUuid") != null) i.putExtra("thirdPartyUuid", call.getString("thirdPartyUuid"));
            if (call.getString("plate") != null) i.putExtra("plate", call.getString("plate"));
            startServiceWith(i);
            JSObject ret = new JSObject();
            ret.put("updated", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("No se pudo actualizar el contexto: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        try {
            Intent i = new Intent(getContext(), TrackingForegroundService.class);
            i.setAction(TrackingForegroundService.ACTION_STOP);
            getContext().startService(i);
            JSObject ret = new JSObject();
            ret.put("stopped", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("No se pudo detener el servicio: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        try {
            SharedPreferences p = getContext().getSharedPreferences(TrackingForegroundService.PREFS, Context.MODE_PRIVATE);
            JSObject ret = new JSObject();
            ret.put("tracking", p.getBoolean("tracking", false));
            String lat = p.getString("lastLat", null);
            String lng = p.getString("lastLng", null);
            if (lat != null) ret.put("latitude", Double.parseDouble(lat));
            else ret.put("latitude", null);
            if (lng != null) ret.put("longitude", Double.parseDouble(lng));
            else ret.put("longitude", null);
            ret.put("speed", p.getInt("lastSpeed", 0));
            ret.put("lastFixAt", p.getLong("lastFixAt", 0));
            ret.put("lastSentAt", p.getLong("lastSentAt", 0));
            ret.put("lastError", p.getString("lastError", ""));
            try {
                org.json.JSONArray q = new org.json.JSONArray(p.getString("queue", "[]"));
                ret.put("queued", q.length());
            } catch (Exception ignored) { ret.put("queued", 0); }
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("No se pudo leer el estado: " + e.getMessage());
        }
    }

    @PluginMethod
    public void isBatteryExempt(PluginCall call) {
        try {
            PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
            boolean exempt = pm != null && pm.isIgnoringBatteryOptimizations(getContext().getPackageName());
            JSObject ret = new JSObject();
            ret.put("exempt", exempt);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void requestBatteryExemption(PluginCall call) {
        try {
            Intent i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            i.setData(Uri.parse("package:" + getContext().getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            JSObject ret = new JSObject();
            ret.put("opened", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("No se pudo abrir el ajuste de batería: " + e.getMessage());
        }
    }

    @PluginMethod
    public void openAppSettings(PluginCall call) {
        try {
            Intent i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            i.setData(Uri.parse("package:" + getContext().getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            JSObject ret = new JSObject();
            ret.put("opened", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }
}
