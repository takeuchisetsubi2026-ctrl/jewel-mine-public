package com.wilduncle.jewelmine.codextest;

import android.os.Build;
import android.view.HapticFeedbackConstants;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "JewelMineHaptics")
public final class JewelMineHapticsPlugin extends Plugin {
    @PluginMethod public void play(PluginCall call) {
        String kind = call.getString("kind", "");
        final int effect;
        switch (kind) {
            case "pick":
            case "score":
                effect = HapticFeedbackConstants.CLOCK_TICK;
                break;
            case "step":
                // Honor system settings; do not request IGNORE_* flags.
                effect = Build.VERSION.SDK_INT >= 34
                        ? HapticFeedbackConstants.SEGMENT_FREQUENT_TICK
                        : HapticFeedbackConstants.CLOCK_TICK;
                break;
            case "place":
            case "fever":
                effect = Build.VERSION.SDK_INT >= 30
                        ? HapticFeedbackConstants.CONFIRM : HapticFeedbackConstants.VIRTUAL_KEY;
                break;
            case "clear":
                effect = HapticFeedbackConstants.LONG_PRESS;
                break;
            default:
                call.reject("Unknown haptic event");
                return;
        }
        getActivity().runOnUiThread(() -> {
            getBridge().getWebView().performHapticFeedback(effect);
            call.resolve();
        });
    }
}
