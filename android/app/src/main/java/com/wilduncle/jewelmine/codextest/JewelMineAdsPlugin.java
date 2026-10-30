package com.wilduncle.jewelmine.codextest;

import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.os.Handler;
import android.os.Looper;
import androidx.annotation.NonNull;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.ads.*;
import com.google.android.gms.ads.rewarded.*;
import com.google.android.gms.ads.interstitial.*;

/** Test-ads-only integration. No JavaScript-supplied ad unit can reach the SDK. */
@CapacitorPlugin(name = "JewelMineAds")
public class JewelMineAdsPlugin extends Plugin {
    private static final String BANNER = "ca-app-pub-3940256099942544/9214589741";
    private static final String REWARD = "ca-app-pub-3940256099942544/5224354917";
    private static final String INTERSTITIAL = "ca-app-pub-3940256099942544/1033173712";
    private boolean initialized, destroyed, fullScreen;
    private PluginCall pending;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private AdView banner;
    private InterstitialAd interstitial;
    private FrameLayout bannerHost;
    private Runnable timeout;
    private int bannerWidth;

    @PluginMethod public void initialize(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (initialized) { call.resolve(); return; }
            if (destroyed) { call.reject("Activity destroyed"); return; }
            MobileAds.initialize(getContext(), status -> getActivity().runOnUiThread(() -> {
                if (destroyed) { call.reject("Activity destroyed"); return; }
                if (!initialized) {
                    initialized = true;
                    installBannerLayout();
                    preloadInterstitial();
                }
                call.resolve();
            }));
        });
    }

    private void installBannerLayout() {
        View web = getBridge().getWebView();
        ViewGroup parent = (ViewGroup) web.getParent();
        int index = parent.indexOfChild(web);
        ViewGroup.LayoutParams params = web.getLayoutParams();
        parent.removeView(web);
        LinearLayout column = new LinearLayout(getContext());
        column.setOrientation(LinearLayout.VERTICAL);
        column.addView(web, new LinearLayout.LayoutParams(-1, 0, 1));
        bannerHost = new FrameLayout(getContext());
        column.addView(bannerHost, new LinearLayout.LayoutParams(-1, -2));
        parent.addView(column, index, params);
        // Banner is outside the WebView; resizing the WebView invokes its viewport fit.
        ViewCompat.setOnApplyWindowInsetsListener(column, (view, insets) -> {
            int bottom = insets.getInsets(WindowInsetsCompat.Type.systemBars()).bottom;
            bannerHost.setPadding(0, 0, 0, bottom);
            return insets;
        });
        ViewCompat.requestApplyInsets(column);
        column.addOnLayoutChangeListener((v,l,t,r,b,ol,ot,or,ob) -> {
            if (r-l > 0 && bannerWidth != r-l) {
                bannerWidth = r-l;
                loadBanner();
            }
        });
    }

    private void loadBanner() {
        if (destroyed) return;
        if (banner != null) { bannerHost.removeView(banner); banner.destroy(); }
        banner = new AdView(getContext());
        int dp = Math.max(1, (int)(bannerWidth / getContext().getResources().getDisplayMetrics().density));
        banner.setAdSize(AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(getActivity(), dp));
        banner.setAdUnitId(BANNER);
        bannerHost.addView(banner, new FrameLayout.LayoutParams(-1,-2));
        banner.loadAd(new AdRequest.Builder().build());
    }

    private boolean begin(PluginCall call) {
        if (!initialized || destroyed || fullScreen) { call.reject("Ads unavailable or busy"); return false; }
        fullScreen = true; pending = call;
        return true;
    }

    private void complete(PluginCall call, boolean earned, boolean dismissed, String reason) {
        if (pending != call) return;
        if (timeout != null) handler.removeCallbacks(timeout);
        timeout = null; pending = null; fullScreen = false;
        JSObject result = new JSObject();
        result.put("requestId", call.getString("requestId"));
        result.put("rewardEarned", earned); result.put("dismissed", dismissed);
        result.put("reason", reason); call.resolve(result);
    }

    @PluginMethod public void showRewarded(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            String purpose = call.getString("purpose", "");
            if (!(purpose.equals("board-reset") || purpose.equals("revive")) || call.getString("requestId") == null) {
                call.reject("Invalid reward request"); return;
            }
            if (!begin(call)) return;
            timeout = () -> complete(call, false, false, "load-timeout");
            handler.postDelayed(timeout, 30000);
            RewardedAd.load(getContext(), REWARD, new AdRequest.Builder().build(), new RewardedAdLoadCallback() {
                @Override public void onAdFailedToLoad(@NonNull LoadAdError error) { complete(call, false, false, "load-failed"); }
                @Override public void onAdLoaded(@NonNull RewardedAd ad) {
                    if (pending != call || destroyed) return;
                    handler.removeCallbacks(timeout); timeout = null;
                    final boolean[] earned = {false};
                    ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                        @Override public void onAdDismissedFullScreenContent() { complete(call, earned[0], true, "dismissed"); }
                        @Override public void onAdFailedToShowFullScreenContent(@NonNull AdError error) { complete(call, false, false, "show-failed"); }
                    });
                    // A reward callback alone must never resolve the WebView transaction.
                    try { ad.show(getActivity(), item -> { if (pending == call) earned[0] = true; }); }
                    catch (RuntimeException error) { complete(call, false, false, "show-failed"); }
                }
            });
        });
    }

    private void preloadInterstitial() {
        if (destroyed) return;
        InterstitialAd.load(getContext(), INTERSTITIAL, new AdRequest.Builder().build(), new InterstitialAdLoadCallback() {
            @Override public void onAdLoaded(@NonNull InterstitialAd ad) { if (!destroyed) interstitial = ad; }
        });
    }

    @PluginMethod public void gameOver(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            String eventId = call.getString("eventId", "");
            if (eventId.isEmpty()) { call.reject("Missing game event"); return; }
            if (!begin(call)) return;
            android.content.SharedPreferences prefs = getContext().getSharedPreferences("jewel-mine-ad-cadence", 0);
            if (eventId.equals(prefs.getString("last", ""))) { complete(call,false,false,"duplicate"); return; }
            int count = prefs.getInt("count",0) % 3 + 1;
            prefs.edit().putString("last",eventId).putInt("count",count).apply();
            InterstitialAd ad = interstitial;
            if (count != 3 || ad == null) {
                complete(call,false,false,"skipped");
                if (ad == null) preloadInterstitial();
                return;
            }
            interstitial = null;
            ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                @Override public void onAdDismissedFullScreenContent() { complete(call,false,true,"dismissed"); preloadInterstitial(); }
                @Override public void onAdFailedToShowFullScreenContent(@NonNull AdError error) { complete(call,false,false,"show-failed"); preloadInterstitial(); }
            });
            try { ad.show(getActivity()); }
            catch (RuntimeException error) { complete(call,false,false,"show-failed"); preloadInterstitial(); }
        });
    }

    @Override protected void handleOnPause() { if (banner != null) banner.pause(); }
    @Override protected void handleOnResume() { if (banner != null) banner.resume(); }
    @Override protected void handleOnDestroy() {
        destroyed = true;
        if (pending != null) complete(pending,false,false,"activity-destroyed");
        handler.removeCallbacksAndMessages(null);
        if (banner != null) banner.destroy();
        interstitial = null;
    }
}
