# ZIP復旧・今回の検証

- 対象: takeuchisetsubi2026-ctrl/jewel-mine-public
- 復旧元: feat/jewelmine2-feedback-opening-20261106 / 5b3d8f916d13f7f257876cc6695ba49e96429133（リモート照合済み）
- 新規ブランチ: feat/jewelmine2-feedback-resume-20261107
- ZIP全11ファイルを検査・反映。画像はユーザーから公開GitHub登録の承認済み。
- ZIPとの差異: 過去報告に履歴の見出しを追加。AAB workflowの検証専用versionCodeを20,000,000 + run_number * 100 + run_attemptに変更。既存の10,000,101と衝突する初回番号を回避。Play Console最大値は未確認、アップロード禁止。

## 今回の結果

- Node v24.19.0 / Chromium 154.0.8037.57 / Linux。
- CHROMIUM_PATH=/usr/bin/chromium npm test: 全13スクリプト成功、終了コード0。ログ: 2026-11-07-feedback-recovery-tests.log。
- npm run sync:android / npm run check / git diff --check / workflow YAML解析: 成功。
- 最初のsandbox内実行は子プロセス起動EPERMで停止。同じコマンドをsandbox外で再実行して成功。
- オープニング2000ms、スキップ、広告開始待ち、BGM広告停止/再開とFEVER切替、個別設定保存、ドラッグ振動、コンボ/宝石回収/終了音を自動確認。
- SCORE/BEST、ゲームルールの回帰チェック成功。広告報酬のキャンセル/失敗、復活2回、再読込後の3回目拒否を確認。
- アプリID設定、Gradle設定、署名鍵、AndroidManifest、広告Javaの復旧元との差分なし。jewelmine2指定はCI生成ファイルのみ。
- 画像SHA256: e58f42ef2f59a29e26c0ae0383e9370d7c92948661a27d3ec0b3fa05e0c13149。原本・Web・Android生成資産でバイト一致。
- テストが生成した既存スクリーンショット等は復旧対象に含めず元に戻した。

## CI

新規ブランチpush後に専用workflowを実行予定。結果とAAB検証は追記する。

## 制約・未検証

Pixel 7実機の振動・実音量/音質・OS設定追従・実広告切替・更新時データ保持は未検証。テストの音/振動/広告はモック。
Play Consoleの使用済みversionCode最大値は未確認。本成果は未署名の検証専用で、Playへアップロードしない。
main・既存ブランチ・既存PRの変更/マージ、署名鍵変更、Playアップロード/配信/公開は実施しない。
