# ジュエルマイン開発引き継ぎ報告書

作業日 2026年11月6日（日本時間）  
対象 takeuchisetsubi2026-ctrl/jewel-mine-public  
作業ブランチ `fix/jewelmine2-pixel7-revive-limit-20261106`  
検証対象コミット `7f8506b22c7cef818a425dadd53ca7d16eaa8f27`  
基点 `811823e6062f34d84b814754813a8730faf97e18`。既存 Jewelmine2 AAB のビルド情報と、GitHubの `feature/jewelmine2-unsigned-aab-20261104` の先端を照合。

## 1. 変更内容

- `index.html` のAndroid表示で、WebView内に重複していた広告用余白を除き、盤面・SCORE・手持ちピースを拡大。バナーはAndroidがWebViewの下に確保する既存の領域を使用する。
- 1ゲームの復活を最大2回に制限。毎回、その広告の報酬と終了を確認してから、復活後の盤面と使用回数を同じ保存に書き込む。中断・失敗・保存失敗では復活も回数消費も発生しない。旧セーブには利用回数の記録がないため、その進行中ゲームの復活は利用不可とし、次のゲームから2回利用できる。
- `tests/viewport-lock.cjs` と `tests/admob-integration.cjs` に画面寸法と復活上限の回帰テストを追加。`tests/build-identity.cjs` は意図した復活差分だけを比較から除外し、既存ゲーム処理の照合を維持。

## 2. 検証結果

- Windows上のChromium、412×800 CSS pxの模擬WebViewで、従来表示からAndroid表示へ、盤面幅264.8→331.8 px、SCOREの表示フォント相当36.8→43.0 px、ピースの1マス16.2→23.7 px、最下段の表示からWebView下端まで128.4→7.7 px。高さ720・900 pxへの変更でも最下段が表示範囲内。既存の4画面寸法、端操作16回、ドラッグ配置12回の検証に合格。
- 模擬広告で報酬だけでは復活しないこと、キャンセル、広告中の再読み込み、連打、2回成功後の再読み込みで3回目を拒否、新規ゲームで回数初期化、保存失敗、旧セーブ、広告後のドラッグを確認。
- GitHub Actionsで全12テストに合格。初回は旧コードとの完全一致チェックで停止し、比較対象を修正した再実行でテスト、APK生成、同梱アセットと既存テスト署名の検証に成功。 [初回CI](https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/42210584651)・[成功したCI](https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/42210905150)

## 3. GitHub反映

Jewelmine2専用の既存ビルド元から分岐。main、既存PR、アプリID、署名設定への変更なし。[検証対象コミット](https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/commit/7f8506b22c7cef818a425dadd53ca7d16eaa8f27)

## 4. Android

CIのAPKは既存のテストID `com.wilduncle.jewelmine.codextest` 用。Jewelmine2の上書き更新には使用できない。 [テストAPK成果物](https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/42210905150/artifacts/13498976417)

Pixel 7実機での広告表示、タッチ操作、上書き更新時の保存保持は未検証。この作業でのAAB署名・Playへのアップロード・公開は未実施。

## 5. AdMob

既存AABのManifestに Google のテスト用App ID `ca-app-pub-3940256099942544~3347511713`、同梱Capacitor設定に `com.takeuchisetsubi.jewelmine2` を確認。リポジトリの本番IDは無効。Googleのテスト広告は自分のAdMob登録から独立して利用できる。本番は管理画面で新パッケージ、AdMob App ID、広告ユニットの所属を照合する必要がある。既存ブラウザのURLを安全に確認できず、管理画面での照合は中断。既存のAdMob登録・設定に変更なし。[テスト広告](https://developers.google.com/admob/android/test-ads)・[AdMobのパッケージ設定](https://support.google.com/admob/answer/10037806?hl=en)

## 6. 次の確認

対象アプリのパッケージと署名を照合したうえで、Pixel 7でバナー境界、2回の復活、3回目の拒否、既存セーブ保持を確認する。AdMobの新旧登録は管理画面で読み取り照合する。

## 7. 引き継ぎ

既存の【WORK】ジュエルマイン開発で本報告を使用し、実機およびAdMob管理画面で未確認の項目を引き継ぐ。
