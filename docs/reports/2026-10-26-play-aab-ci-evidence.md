# ジュエルマイン開発引き継ぎ報告書：Play AAB検証

作業日時：2026-10-26（日本時間）

対象リポジトリ：takeuchisetsubi2026-ctrl/jewel-mine-public

作業ブランチ：feature/play-aab-preparation-20261026

検証コミット：02fa62b77f201fd0e3043669c9d9325016b45967

作業目的：既存TEST 09を変更せず、Google Play向けAABの生成経路を専用ブランチで検証する。

## 1. 完了した作業
- `android/app/build.gradle`：Play向けapplicationIdを明示指定するオプションを追加。既定のTEST 09設定は変更しない。
- `.github/workflows/play-aab-preparation.yml`：専用ブランチのpushでAAB生成と署名ブロック検査を実行。
- `docs/play-aab-preparation-20261026.md`：公開前の確認事項を整理。
- Draft PR #10 を作成（ベースは `feature/apk-build-identity`、mainではない）。

## 2. テスト結果
- GitHub Actions `Play AAB preparation (unsigned verification only)` 最新実行 #40217181418：**success**。
- Gradle `bundleRelease`：**BUILD SUCCESSFUL in 1m 31s**。
- ZIP形式のAABの存在と `base/manifest/AndroidManifest.xml`：検証成功。
- AABの `META-INF/*.RSA|*.DSA|*.EC` 署名証明書ブロック：検出なし（**未署名**）。
- AAB内部のバイナリAndroidManifest.xmlをAAPT2 protobuf仕様に従って読み取り、パッケージIDが `com.takeuchisetsubi.jewelmine` と一致：**成功**。
- AABアーティファクト `play-aab-unsigned-not-for-upload`：アップロード成功、サイズ 3,411,288 bytes（GitHub Actions artifact ZIPサイズ）。
- GitHub Actions Android debug APK 実行 #40212319724：success。TEST 09の動作・保存データの実機確認を意味するものではない。
- **未実施**：Play Consoleへの登録、Play App Signing照合、正式版versionCode整合、署名済みAABの作成、Google Play内部テスト・クローズドテスト、既存アプリの上書き更新と保存データ検証。

## 3. GitHub反映状況
- ブランチ：`feature/play-aab-preparation-20261026`
- 検証コミット：`02fa62b77f201fd0e3043669c9d9325016b45967`
- Draft PR #10：https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/pull/10
- マージ：未実施。main・既存PRは変更していない。

## 4. Android AAB
- 生成：成功。ただし**未署名でありGoogle Playへのアップロード不可**。
- 実行：https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/40217181418
- 成果物：https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/40217181418/artifacts/12607263823
- 成果物名：`play-aab-unsigned-not-for-upload`。
- 成果物ZIPのActionsログ内SHA-256：`4f9ebb1d4f05774ff50d1af2f4677adb419773a0407955e58179fa0b40a11670`。
- 注意：このAABにはTEST 09由来の表示名・versionCodeなどが残る可能性がある。公開用の成果物ではない。

## 5. 未完了・問題点
- Play Consoleの登録状況と本番署名が不明。
- 既存本番アプリとのアプリID・署名・versionCode・保存データの互換性が不明。
- 最初の署名検査は `jarsigner -verify` の戻り値に関する誤った前提で失敗。修正後の成功は**署名ブロックなし**を確認したものであり、Play提出可能性の証明ではない。
- 既存PR #1〜#9、mainのマージは未実施。

## 6. 次に必要な作業
1. Play Consoleの既存アプリとGoogle Play App Signingの状態を所有者が確認。
2. 正式版アプリID、バージョンコード、表示名、アップロード鍵の運用を確認。秘密鍵はリポジトリへ保存しない。
3. AAB内部のpackage ID独立検証は自動化済み。次は正式版の表示名・versionCode・アップロード署名を本番設定として分離する。
4. 正式な署名が整った後、Play Consoleの内部テスト・クローズドテストをユーザーの個別承認を得て実施。
5. 更新時の保存データ互換性を実機で検証。

## 7. ChatGPTへの依頼事項
- 未署名AABの成功を公開準備完了と誤認しない。
- 許可範囲は専用ブランチでのコード変更・テスト・新規Draft PR作成まで。マージ・公開は禁止。
- TEST 09、既存本番アプリID、署名、保存データを保護する。
