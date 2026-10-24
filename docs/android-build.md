# AndroidテストAPKのビルドとスマートフォン導入

## 構成

共通ゲームはルートindex.html。`npm run build:web`でwwwへコピーし、`npx cap sync android`でAndroidへ同期する。生成物はGit管理しない。Web公開版のコード・設定は変更しない。

固定依存: Capacitor core/android/cli 8.4.3、Playwright 1.64.1。package-lock.jsonを管理しnpm ciで再現。最新8.5.3のCLIにiOS向け間接依存の監査警告があったため8.4.3を採用し、npm auditで0件を確認した。
ビルド: Node 22、JDK21、SDK36、Gradle8.14.3、AGP8.13.0、minSdk24（Android7以降）。WebViewの互換性は実機確認が必要。

## アプリIDと署名

ID: `com.wilduncle.jewelmine.codextest`
表示名: ジュエルマイン テスト
旧APKのID・鍵は不明。更新互換性は保証しない。別IDでの並行インストールを意図したテスト版。もし旧アプリと偶然IDが一致して署名不一致になった場合は旧版を削除せず相談する。

`android/signing/public-test.keystore`は**公開のテスト専用鍵**（パスワードandroid）。Actionsの一時ランナー間で同じ署名を維持し、このテスト版を上書き更新できるようにする。誰でも署名可能なので本番・機密用途に使用しない。release配布時は別IDと秘密鍵を使用する。Actionsではrun_numberをversionCodeに使用する。同じworkflowの新しい実行を順に導入する。古い実行のAPKへのダウングレードは非対応。
旧APKやWebブラウザとは保存領域が別。旧版をアンインストールしない。このテスト版も削除・データ消去するとセーブが失われる。

## PCなしの通常サイクル

1. iPhoneからCodexへ、対象開発ブランチでの修正・検証・pushを指示する。
2. main以外へのコードpushでAndroid debug APKが自動実行される（docsのみの変更は除外）。mainのWeb公開は更新しない。
3. AndroidのブラウザでGitHubにログインし、以下のActions画面を開く。
   https://github.com/wild-uncle/jewel-mine-public/actions/workflows/android-debug.yml
4. 対象ブランチ・最新コミットの緑色の成功した実行を開く。Artifactsの`jewel-mine-test-debug-実行番号`をダウンロードする。有効期限30日。期限切れならCodexへ再ビルドを依頼する。
5. AndroidのファイルアプリでZIPを展開しapp-debug.apkを開く。必要ならダウンロードに使ったブラウザ／ファイルアプリの「不明なアプリのインストール」を許可する。導入後は許可を戻す。
6. 「ジュエルマイン テスト」を起動する。iPhoneは指示用でありAndroid APKはインストールできない。

workflow_dispatchも定義済み。ただしGitHubは通常デフォルトブランチにworkflowが存在するまでRun workflowボタンやdispatchを利用できない。mainへは承認なく追加しないため、当面はコードpushによる自動実行を使用する。Codexは必要なら専用ブランチに空コミットをpushして再実行できる。

## 自動検証

構文・FEVER150%/1250ms・軽量化コードを検査し、生成Web資産と共通ソースが一致することを確認。既存Chrome回帰テスト後、Gradle assembleDebugを実行。APK内assets/public/index.htmlのバイト一致、APK署名を検証し、APKとSHA256SUMS.txtをArtifactsへ保存する。

ローカル: npm ci → npm run sync:android → npm run check → npm test → android/でgradlew assembleDebug。Chromeが必要。SDK/JDKの環境変数を設定する。APKはandroid/app/build/outputs/apk/debug/app-debug.apk。

## ユーザー側の実機テスト

- 起動、狭幅、ステータス／ナビゲーション領域、縦横回転、オフライン起動
- タップ・ドラッグ・置けない場所・連続操作
- 単一行、複数行、縦横同時消去時の停止や描画乱れ
- 宝石、コンボ、FEVER文字の大きさ・虹色・表示時間、5手・2倍
- スコア保存、アプリ終了再起動、バックグラウンド復帰
- 新しい実行のAPKによる上書き更新でセーブが維持されること

実機テストは未実施。APKビルド成功と実機での滑らかさは別の確認事項。

公式資料: https://capacitorjs.com/docs/getting-started 、https://capacitorjs.com/docs/android 、https://github.com/actions/upload-artifact

## 初回確認済みAPK

2026-10-24にActions実行40089260086が成功（コード38aca3e）。
APKダウンロード（GitHubログインが必要）:
https://github.com/wild-uncle/jewel-mine-public/actions/runs/40089260086/artifacts/12557783498

成果物名: jewel-mine-test-debug-2。有効期限: 2026-11-23 11:18 UTC。APKとSHA256SUMS.txtを含むZIP。
ビルドログと証跡: docs/reports/2026-10-24-android-build-evidence.json。
