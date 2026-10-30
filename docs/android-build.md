# AndroidテストAPKのビルドと安全な確認
更新：2026-10-30。旧所有者URLや初期導入時の推定を現状の手順として使わない。過去の内容はGit履歴に保全されている。

## 現在の入口
- リポジトリ：https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public
- [共通台帳](common-ledger.md)：PR・APK・実機・Pagesの確認根拠
- [スマホ運用手順](mobile-operations.md)：既存run再実行、今日のPC確認、依頼用コピペ
- 実作業は既存【WORK】ジュエルマイン開発のみ。新しいWorkは作らない。

## 安全条件
既存Pixel 7のアプリ・保存データ・BEST200,555／SCORE116,070を保護する。
Play Protectの警告が出ている間は導入を停止する。無効化、警告を無視したインストール、ADBによる回避、アンインストール、データ消去を行わない。
CI成功、署名一致、versionCode増加は安全性・保存互換性・実機成功を保証しない。
APKの外部アップロード、申請送信、main/既存PR変更・マージ、本番公開は実施しない。

## ビルド構成（変更していない）
ルートindex.html → npm run build:web → www → npx cap sync android。
既存CIはnpm ci、build identity生成、npm test、assetsチェック、assembleDebug、APK署名・内部assets照合、Artifacts保存。
Node22.22.0／JDK21／Android SDK36をworkflowで指定。依存はpackage-lock.jsonに従いnpm ciを使用する。
本番のAdMob IDは実行に使わず、開発・CIはGoogleテストID。実広告・実機は別の確認項目。

## 識別情報
package：com.wilduncle.jewelmine.codextest
versionName：4.0.9
表示名：09 ジュエルマイン
公開テスト証明書SHA-256：
adf316980df6f14b7b5510eafd42c6557d6b6f70623dc35466940bc9c2a4b029
公開テスト鍵を本番鍵へ転用しない。鍵ファイルやパスワードを別サービスへ送らない。

versionCodeは単純なrun_numberではなく、testNumber×1,000,000 + runNumber×10 + runAttempt。
現在のコードはrunAttempt<10。再実行も別APKになる。最新成果物一覧は共通台帳とCI recordを照合する。
端末内旧APK9000291と旧原本一致はユーザー確認済み。「旧ID・鍵が不明」という初期資料の記述を現在の結論にしない。
端末にあるAPKの一致と、更新後のゲームデータ互換性の実証は別。

## PCなしのCI
main以外のコードpush／PRが起点。docs/**、README.md、AGENTS.mdのみは除外。
workflow_dispatchは開発ブランチにあるが、既定mainにworkflowがないためRun workflowの通常経路は未整備。
既存runの再実行はmain変更なしで利用できる。今回、接続済GitHubからrun40985254973をattempt2として再実行し成功した。
スマホブラウザのRe-run操作・成果物ダウンロードはユーザーのアカウントでの確認を残す。
空コミット、設定変更、mainへのworkflow追加を再実行の必須条件にしない。

## 取得してから照合するもの
ArtifactsはAPK ZIPとrecord ZIPをセットで保全し、run URL・attempt・head SHA・実際のcheckout SHA・versionCode・package・証明書・APK SHA-256を記録する。
ZIPのdigestとAPK単体のSHA-256は別。Actionsの緑表示だけを根拠にインストールしない。
Artifactsの保存期間はこのworkflowでは30日。期限切れは同一run再実行等で別成果物として扱う。
iPhoneは指示と結果確認用。Android APKの実行はできない。
公開Pagesは現在main相当で最新Android開発版ではない。

## 実機未完了
広告の視聴完了／キャンセル／読み込み失敗、復活と盤面リセット、終了3回ごとの広告、広告前後のドラッグ、画面固定、バナー領域、バックグラウンド復帰、保存データ保持。
これらは警告解消と安全な導入条件を確認するまで未完了。現時点で新APKの導入を指示しない。

## 公式資料
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow
- https://developer.android.com/studio/publish/app-signing
