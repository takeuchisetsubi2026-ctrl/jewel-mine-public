# jewel-mine-public

ジュエルマインの共通ゲームソースは `index.html` です。

Androidテスト版のビルド・ダウンロード・インストール手順は [docs/android-build.md](docs/android-build.md) を参照してください。

- 開発ブランチへのコードpushでGitHub ActionsがデバッグAPKを生成します。
- [Android debug APKの実行一覧](https://github.com/wild-uncle/jewel-mine-public/actions/workflows/android-debug.yml) の成功した実行からArtifactsを取得できます（GitHubログインが必要）。
- 旧APKの更新互換性は不明です。今回のテスト版は別IDと専用テスト署名を使用します。
- 開発ルール: [AGENTS.md](AGENTS.md)。mainへのマージ・公開にはユーザー承認が必要です。
