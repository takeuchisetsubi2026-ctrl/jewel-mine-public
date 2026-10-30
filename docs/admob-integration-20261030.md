# Android AdMob integration (test-only)

Base: PR #13 / 42bdf3731872fa3f32ccdbbef5fc2810fc2137fe. No existing advertising implementation was found in the enumerated branches/PRs.

## Build safety
All build types use Google sample App ID and ad units, hard-coded on the native side. Production account IDs are recorded only in config/admob-identities.json. That JSON is not loaded by the SDK. Rewarded interstitial remains unused. Production enablement and consent/privacy configuration require a later change; this PR does not publish or serve live inventory.
SDK: Google Mobile Ads 25.5.0 (Java API). Android applicationId/signing configuration and WebView origin remain unchanged.

## Lifecycle
Capacitor registers JewelMineAdsPlugin. The generated Capacitor.Plugins.JewelMineAds Promise methods are used directly; no simulated success provider is shipped.
RewardedAd is loaded for each board-reset/revive request. onUserEarnedReward records the result only. onAdDismissedFullScreenContent resolves it with the original requestId. Failure to load/show and activity destruction resolve no reward. A 30s timeout applies to loading only, never to a visible advertisement. Late callbacks are ignored by identity against the current PluginCall.
Native and JS single-flight locks cover loading and display. Native also arbitrates interstitials. Game input remains blocked until dismissal. Each reward is scoped to one request, and the saved game snapshot must still match before clearing the board and jewels. Score, FEVER, held pieces and records remain unchanged. Revive uses the same operation from the game-over dialog; cancellation leaves the dialog and state intact. The existing new-game action remains available without a reward, and starts a fresh ad-cadence session.

## Layout and cadence
The anchored adaptive banner is a native sibling below the WebView, never an overlay. The WebView receives the remaining measured height and the existing viewport-fit adapter responds. System bottom inset is reserved. Orientation changes reload the adaptive size.
A persistent ad-game session ID deduplicates repeated finishGame notifications/reloads. Native SharedPreferences counts distinct game-over events (1,2,3 then repeats). Only every third event may show the preloaded interstitial at the game-over transition. If not ready, it is skipped instead of appearing later during play. Banner and interstitial use only sample units.

## Validation boundary
Browser tests use a mocked Capacitor bridge and must not be described as real SDK or Android-device tests. CI compiles/packages the real SDK. Pixel 7 must still check: test-ad labels; reward before close does not reset; cancellation/load failure preserves state; repeated resets require distinct ads; revive cancellation; banner safe areas in both orientations; continuous drags/edge gestures after closing ads; upgrade without uninstall/data clearing.

## Official sources checked 2026-10-30
https://developers.google.com/admob/android/quick-start
https://developers.google.com/admob/android/rewarded
https://developers.google.com/admob/android/banner
https://developers.google.com/admob/android/test-ads
https://developers.google.com/admob/android/privacy
