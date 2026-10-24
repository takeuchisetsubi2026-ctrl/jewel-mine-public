# ジュエルマイン開発引き継ぎ報告書

作業日時：2026-10-24（日本時間）
対象リポジトリ：wild-uncle/jewel-mine-public
作業ブランチ：build/android-debug-apk
コミットID：d113533（構築）、38aca3e（CI修正・APK生成対象）。報告書は後続コミット。
作業目的：iPhoneからCodexへ指示し、PC操作なしでAndroidテストAPKを繰り返し取得する環境の構築。

## 1. 完了した作業
package.json・ロックファイル、capacitor.config.json、android/、scripts/、.github/workflows/android-debug.ymlを追加。共通ソースindex.htmlから生成・同期し、ゲーム本体は変更なし。Capacitor8.4.3、Playwright1.64.1を固定。導入・実機テスト手順はdocs/android-build.md。READMEに案内を追加。
テストIDはcom.wilduncle.jewelmine.codextest。旧APKのID・鍵が不明なため更新互換性を仮定しない。CI間で上書き更新できる公開テスト専用固定鍵を使用し、本番利用は禁止。旧版は削除せず保持する。

## 2. テスト結果
Windows/JDK21/Gradle8.14.3でassembleDebug成功、APK4,644,762バイト。構文、既存Chrome回帰、FEVER150%・1250msと軽量化コード、同期アセット一致、APK署名検証成功。
Ubuntu24.04/Node22.22.0/JDK21のActionsでも回帰テスト・Gradleビルド・APK内index.htmlのバイト一致・署名検証・Artifact保存が全成功。npm依存監査0件。
Actions初回は廃止済みSDK toolsの取得で失敗したが、platform-toolsへ限定して解消。Android実機のタッチ・描画停止・保存復帰・更新は未実施。

## 3. GitHub反映状況
専用ブランチへpush済み。基準はfix/line-clear-performance-fever。mainへのマージ・Web公開更新なし。
成功実行：https://github.com/wild-uncle/jewel-mine-public/actions/runs/40089260086
PR作成はGitHub連携403（Resource not accessible by integration）で失敗。PR未作成。
比較・PR作成URL：https://github.com/wild-uncle/jewel-mine-public/compare/fix/line-clear-performance-fever...build/android-debug-apk?expand=1

## 4. Android APK
ローカル・Actionsともビルド成功。
取得先：https://github.com/wild-uncle/jewel-mine-public/actions/runs/40089260086/artifacts/12557783498
成果物：jewel-mine-test-debug-2。有効期限2026-11-23 11:18 UTC。
AndroidのブラウザでGitHubへログイン→上記ZIPを取得→展開→app-debug.apkを開く→必要なインストール許可を付与→「ジュエルマイン テスト」を起動。iPhoneは指示用でAPKは導入不可。
旧アプリ・Web版のセーブは自動移行しない。同テスト版は新しいActions実行のAPKで上書きする。アンインストール・データ消去はセーブを失うため避ける。公開鍵のため本番・機密用途に使用しない。

## 5. 未完了・問題点
実機検証はユーザー待ち。旧版の更新互換性は不明。別IDでの並行導入を意図するが、偶然同じIDの場合は旧版を削除せず相談する。
workflow_dispatchは定義済みだが、mainにworkflowがない間はGitHubの手動実行が利用できない場合がある。当面はmain以外へのコードpushで自動生成。docsのみの変更は実行対象外。必要ならCodexから専用ブランチへ空コミットをpushして再生成する。
Artifact取得にはGitHubログインが必要で保存期間は30日。実機の性能改善は未確認。

## 6. 次に必要な作業
1. AndroidへAPKを導入し、タッチ・連続消去・FEVER・画面端・保存復帰を確認する。
2. 次のコード修正を同環境でpushし、新しいAPKの上書き更新とセーブ維持を確認する。
3. PRを作成・レビューし、必要なマージはユーザー承認後に行う。

## 7. ChatGPTへの依頼事項
次は「Android実機テスト結果を整理し、再現条件のある不具合のみ修正・回帰確認・Actions APK再生成する」指示書を作成する。旧アプリは保持し、今回のテスト版で評価する。実機未確認の性能効果を断定しない。
