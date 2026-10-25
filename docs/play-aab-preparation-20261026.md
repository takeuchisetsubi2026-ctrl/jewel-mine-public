# Google Play AAB準備（2026-10-26）

## 変更の範囲
- TEST 09の既定applicationId `com.wilduncle.jewelmine.codextest` と公開テスト署名を維持する。
- Gradleに `-PplayApplicationId=com.takeuchisetsubi.jewelmine` を明示した場合のみPlay用IDを使用する。
- `bundleRelease` で **未署名のAAB** を生成する。未署名AABはGoogle Playにアップロードできない。
- Play用の署名鍵・パスワード・トークンは作成も登録もしない。
- 本番アプリの既存のID、署名、更新互換性、保存データは現時点では未検証。

## ローカル/独立したCIでの確認
1. `npm ci`
2. `npm run build:web`
3. `npx cap sync android`
4. `cd android && ./gradlew --no-daemon -PplayApplicationId=com.takeuchisetsubi.jewelmine bundleRelease`
5. `android/app/build/outputs/bundle/release/app-release.aab` が生成されたことを確認。
6. `jarsigner -verify` で未署名であることを確認。
7. Android SDKのbundletoolなどで最終パッケージIDが期待どおりか別途検証すること。

## GitHub Actionsの注意
`.github/workflows/play-aab-preparation.yml` は手動起動専用。
GitHubの `workflow_dispatch` は原則としてワークフローがデフォルトブランチに存在する必要があるため、現段階で実行できない可能性がある。**この理由だけでmainにマージしないこと。**
実際のビルド成功・AABの検証は未実施。

## Play公開前の必須ゲート
- Play Consoleの既存アプリ登録IDを確認する。
- 既存アプリの署名証明書とGoogle Play App Signingの状態を確認する。
- Play用署名情報は安全な秘密管理経路のみで扱い、リポジトリに追加しない。
- `versionCode` の連番と既存アプリとの更新互換性を検証する。
- 実機で更新前後の保存データを検証する。既存アプリをアンインストールしない。
- ユーザーの明示的な承認なしに公開・マージしない。
