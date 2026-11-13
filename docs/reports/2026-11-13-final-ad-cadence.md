# ジュエルマイン開発引き継ぎ報告書

対象は jewel-mine-public の com.takeuchisetsubi.jewelmine2。
作業ブランチは fix/jewelmine2-final-ad-cadence-20261113。
指定基準 0edb97ee087791aaae5d40196925c5dd4210b41b と、
統合ブランチ先端 0eaf72fc5b2f9d0a3959b4047a55516e55f5c26c の差分は検証資料2件。

- index.html で終了確定を New Game 押下時に移動し、広告処理中の再操作を既存の排他制御で止める。GAME OVER の音は画面表示時に再生する。SFX診断の表示とCSSを削除。
- JewelMineAdsPlugin.java で終了確定2回に1回を適用。最後の終了IDと偶奇をSharedPreferencesに一括保存し、旧仕様のカウントと分ける。広告の読込・表示失敗、読込タイムアウト後は新ゲームへ進む。
- 復活の報酬と閉じたことの両方を確認する条件、1プレイ2回の上限、WebView下の独立バナー領域を維持。
- tests/admob-integration.cjs で終了確定、再読込、連打、広告終了と失敗のブラウザ回帰を追加。tests/build-identity.cjs の演出除外を更新。
- 専用ブランチのCIで21,000,000台の新しいversionCodeを割り当て、未署名AABを検査する。
- Pixel 7実機ではバナーの収まり、復活成功/取消/失敗、アプリ再起動を挟んだ終了広告の間隔を別途確認する。
