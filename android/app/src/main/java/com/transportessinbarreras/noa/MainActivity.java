package com.transportessinbarreras.noa;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Puente JS <-> servicio foreground de rastreo (sobrevive con app cerrada).
        registerPlugin(TrackingPlugin.class);
    }
}
