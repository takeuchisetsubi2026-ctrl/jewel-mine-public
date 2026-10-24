# Android APK追加の準備

現リポジトリには package.json、Capacitor設定、android/、Gradle Wrapper、GitHub Actionsは存在しない。ZIPも旧index.htmlのみ。したがって現状ではAPKをビルドできず、今回APKビルドは未実施。Web版のみを変更した。

## 次の追加に必要なファイルと手順

1. package.jsonとロックファイルに互換バージョンの @capacitor/core、@capacitor/cli、@capacitor/android を固定する。
2. capacitor.config.json に確定したappId、appName、webDir: "www"を設定する。appIdは配布予定に合わせて決める。
3. scripts/build-web.cjs を追加し、ルートのindex.htmlと参照されるWebPだけをwww/へコピーする。ゲームソースはルートの1つを共用し、Android用コピーを手編集しない。www/は生成物として無視する。
4. npmで依存導入後、Web資産を生成し `npx cap add android`、`npx cap sync android` を実行。生成された android/（gradlew、gradlew.bat、gradle/wrapperを含む）を管理する。local.properties、.gradle、build、node_modulesは無視する。
5. 採用したCapacitor/Gradleに対応するJDKとAndroid SDKを用意し、Android側で `./gradlew assembleDebug` を実行する。
6. .github/workflows/android-debug.yml を追加する。checkout → Node/JDK/Android SDK準備 → npm ci → Web資産生成 → cap sync android → chmod +x android/gradlew → androidでassembleDebug → APKアップロードの順にする。
7. actions/upload-artifact のpathを `android/app/build/outputs/apk/debug/*.apk`、if-no-files-found: errorに設定する。成功した実行のActions画面のArtifactsから取得する。debug APKは配布用release署名とは別。

既存WebのURL・保存キーを維持しても、CapacitorのWebViewはWeb版と保存領域が別になるため、Webのセーブが自動移行するわけではない。Android側の終了・再開・オフライン起動を実機で確認する。

公式手順:
- https://capacitorjs.com/docs/getting-started （webDir、Android追加とsync）
- https://github.com/actions/upload-artifact （成果物のアップロード）

Androidプロジェクトがない段階で動かないワークフローを登録せず、上記を追加後にビルド・成果物取得を確認する。
