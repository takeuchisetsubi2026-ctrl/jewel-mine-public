送付先：【chat】ジュエルマイン開発
ジュエルマイン開発引き継ぎ報告書
作業日：2026年10月30日（日本時間）
対象：takeuchisetsubi2026-ctrl/jewel-mine-public
ブランチ：feature/admob-integration-20261030
実装コミット：580f32bba73ae60ae43051345ff0568e8881cb79
目的：PR #13とAndroid AdMob SDKの統合。

1. 完了した作業
● 調査した既存ブランチ・PRにSDK実装なし。PR #13をベースに新規作業。
● Google Mobile Ads SDK 25.5.0をCapacitorネイティブプラグインへ接続。
● 報酬確認と広告終了の両方を条件に、盤面リセット・復活を実行。
● 盤面と宝石だけを消し、スコア・FEVER・手持ちブロック・ハイスコアを保持。
● 未接続・ロード/表示失敗・報酬なし終了ではリセット・復活しない。広告中は入力を止め、JS/native両側で排他。
● バナーをWebView下部の別領域へ配置。ゲーム画面の高さを調整し、重なりを避ける実装。
● ゲーム終了IDを重複除外し、3回目ごとに準備済みインタースティシャルを表示。未準備時はスキップ。
● 全ビルドをGoogleのテストApp ID・広告ユニットに固定。本番IDはconfig/admob-identities.jsonに記録するだけでSDKから参照しない。リワードインタースティシャル未使用。

2. テスト結果
● ローカルChromium 131・CIのnpm test全12工程成功。
● 模擬ネイティブ接続で報酬のみでは未反映、終了後反映、キャンセル・失敗時の保存保持、復活、排他、広告後ドラッグ再開を確認。
● 画面固定4サイズ・端操作16回・ブロック配置12回・縦横切替の回帰テスト成功。
● CIで実SDKを含むAndroidビルド・アセット・アプリID・署名照合成功。
● 取得APKと記録のSHA-256一致、同梱ゲーム元ソースSHA一致。DEXにテスト広告IDあり、本番アカウントIDなし。
模擬テストとビルド成功は、実機での広告視聴成功とは別です。

3. GitHub反映状況
● 新規Draft PR #14：
https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/pull/14
base：feature/rewarded-board-reset-20261028。
main・PR #12・#13変更、既存PRマージ、本番公開なし。
実装説明：docs/admob-integration-20261030.md
本報告：docs/reports/2026-10-30-admob-integration.md

4. Android APK
● CI成功：
https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/40984717228
artifact：12946945712／記録：12946183935
TEST 09／v4.0.9／versionCode 9000541
AndroidアプリID：com.wilduncle.jewelmine.codextest
CI検証SHA：77cd7803bb77bbc452a864578438e6da2db3c2ab
既存テスト署名の照合成功。
証明書SHA-256：adf316980df6f14b7b5510eafd42c6557d6b6f70623dc35466940bc9c2a4b029
APK SHA-256：ecb7a311631261c8ffa20014b32686b1d43bf5ddabbf7ef3a2d9f83e5206c900
既存端末のアプリ情報と照合してから更新する。別アプリの新規インストールや署名不一致が出たら停止。アンインストール・データ初期化禁止。

5. 未完了・問題点
○ Pixel 7実機でのテスト広告表示・視聴・報酬・キャンセル・通信失敗の確認。
○ 広告前後の連続ドラッグ・画面端操作・縦横切替・バナー重なり・復帰の確認。
○ 既存端末への更新と保存データ保持の確認。
○ 実機でのゲーム終了3回に1回の表示確認。
○ 本番配信に必要な同意・プライバシー設定。今回はテスト広告限定、本番配信は無効。
完了条件の実機検証が残るため、プロジェクト全体を完了扱いしない。

6. 次の作業
更新先のアプリID・署名・versionCodeを照合し、保存データを消さずに検証APKへ更新。
テスト広告でリセット・復活の成功/キャンセル/失敗前後の盤面・スコア・FEVERを記録。
バナー領域、広告後の連続ドラッグと端操作、終了3回ごとの広告を確認。

7. ChatGPTへの依頼事項
● SDK接続・自動検証・APK生成。
◐ 作業中なし（本報告時点）。
○ 実機検証・更新互換性・本番準備。
このTXTとAPKを収録した一括ZIPを【chat】ジュエルマイン開発へ引き継ぐ。
実機未確認を完了にせず、既存PRのマージ・本番公開を行わない。

公式参照（2026-10-30確認）：
https://developers.google.com/admob/android/quick-start
https://developers.google.com/admob/android/rewarded
https://developers.google.com/admob/android/banner
https://developers.google.com/admob/android/test-ads
https://developers.google.com/admob/android/privacy
