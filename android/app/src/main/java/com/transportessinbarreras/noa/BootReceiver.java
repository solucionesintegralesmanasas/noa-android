package com.transportessinbarreras.noa;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

/**
 * Si el conductor tenía rastreo activo al apagar/reiniciar,
 * reanuda el servicio automáticamente con lo guardado en prefs.
 */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;
        String a = intent.getAction();
        if (!Intent.ACTION_BOOT_COMPLETED.equals(a)
                && !"android.intent.action.QUICKBOOT_POWERON".equals(a)
                && !"com.htc.intent.action.QUICKBOOT_POWERON".equals(a)) return;
        try {
            SharedPreferences p = context.getSharedPreferences(TrackingForegroundService.PREFS, Context.MODE_PRIVATE);
            if (!p.getBoolean("tracking", false)) return;
            Intent i = new Intent(context, TrackingForegroundService.class);
            i.setAction(TrackingForegroundService.ACTION_START);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(i);
            } else {
                context.startService(i);
            }
        } catch (Exception ignored) {}
    }
}
