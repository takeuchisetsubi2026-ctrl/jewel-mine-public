# ジュエルマイン開発引き継ぎ報告書

作業日時：2026-11-11 01:40 JST
対象リポジトリ：takeuchisetsubi2026-ctrl/jewel-mine-public
作業ブランチ：docs/jewelmine2-aab-signing-prep-20261111
コミットID：本ファイルを追加したコミット（GitHub履歴参照）。基点 da9c49c29a14044e4fdff07d01ef02448f09cd69。
作業目的：最新版Android AABの対象特定と、秘密情報を扱わない署名準備。
進捗率：ゲーム本体40%／Android実機40%／Google Play公開20%（既存値を据置）。

## 1. 完了した作業
PROJECT_CONTEXT.md、正式署名記録、署名記録ブランチと開発HEADのAGENTS.md、管理台帳、固定共通キューを読了。
正式記録：[JEWELMINE2_SIGNING_RECORD.md](https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/blob/da9c49c29a14044e4fdff07d01ef02448f09cd69/docs/JEWELMINE2_SIGNING_RECORD.md)。
本報告書だけを新規専用ブランチへ追加する。既存文書・コード・workflowは変更しない。

### 今回GitHubで確認
- リポジトリの直近30 run一覧で最新の成功AABは run 42722422415、2026-11-10 08:40:59 JST開始。新しいAAB runは一覧にない。
- 対象開発ブランチ feat/work3-n1-l1-integration-20261110 のHEADは 0eaf72fc5b2f9d0a3959b4047a55516e55f5c26c。
- AABのsourceは 0edb97ee087791aaae5d40196925c5dd4210b41b。HEADは1コミット先、差分は docs/reports/2026-11-10-work3-n1-l1-integration.md と docs/reports/2026-11-10-work3-n1-l1-verification.json の追加だけ。ビルド対象コードは同じ。別系統の全ブランチを統合した最新版という意味ではない。
- [成果物13721516797](https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/42722422415/artifacts/13721516797) は expired=false。保存期限は 2026-11-17 08:44:17 JST（取得時点）。
- ZIP digest：5ec0423db9a1e4c11ba52111e9cfbb24544e8f65f0a1a2bca383eec19961abc9。ZIPサイズ9,552,702 bytes。
- CIジョブ129519431059は成功。npm test、生成元変更なし検査、bundleRelease、パッケージ検査、未署名検査、artifact保存が成功。
- CIログの実測AAB SHA256：a09951d939e27f318f607b654d23bab155643fd44a07cc4e67b5e77b1b0f94de。
- CIログのversionCode：20001201、パッケージ：com.takeuchisetsubi.jewelmine2。
- workflowは明示的に verification-only / NOT FOR PLAY UPLOAD。Play側の最大versionCode不明という注記があり、署名だけで提出可能と扱わない。
- Gradle releaseには署名設定なし。既定はTEST09 IDなので通常ビルドだけでは正式IDにならない。CIは生成設定・埋込情報を書き換え、-PplayApplicationId=com.takeuchisetsubi.jewelmine2 を明示。
- scripts/prepare-jewelmine2-ci.cjs はCI=trueと許可ブランチを要求。新しい専用ブランチでそのまま再ビルドできるとは案内しない。
- 旧 docs/play-aab-preparation-20261026.md は旧IDを記載。今回の操作手順に転用しない。
- GradleログのsignReleaseBundleというタスク名は署名済みの証拠ではない。後続の署名ブロック不存在検査と正式記録を優先。

### 過去検証を継承（今回バイナリ再検査なし）
[既存検証JSON](https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/blob/0eaf72fc5b2f9d0a3959b4047a55516e55f5c26c/docs/reports/2026-11-10-work3-n1-l1-verification.json)：
app-release.aab、9,733,564 bytes、versionName 4.0.9、versionCode 20001201、未署名。ZIP/AABのCRC・manifest・埋込情報等の検証済み報告を継承する。
ダウンロード用コネクタ応答は取得できたが、今回ローカルへ保存・展開・再ハッシュしていない。
PC JKSとPlayアップロード鍵証明書の一致は正式記録を継承し再検査しない。
証明書SHA256：93:E9:19:32:BA:20:F8:C3:7B:33:E7:3A:3F:D3:8E:F2:C9:69:D4:38:58:54:C9:04:E2:9A:3A:07:8F:13:11:09。
33:B9:...の対応先は未確定。Playアプリ署名鍵とは区別する。

## 2. テスト結果
今回は読み取り監査のみ。GitHub APIの比較、既存CIログ、artifactメタデータを照合。新規テスト・CI・ビルド・PC JKS検査・端末試験は未実施（重複検証と許可範囲外操作を避けるため）。
環境はGitHub既存CI Ubuntu 24.04、Node 22、Java 21。既存結果の確認であり今回の再実行ではない。

## 3. GitHub反映状況
専用ブランチに本報告書を保存。基点は署名正式記録コミット。
main・既存PR・既存ブランチへの書き込み、新規PR、マージなし。
CI起動なし。秘密鍵・パスワード・JKS内容の保存・転送なし。

## 4. Android APK
ビルド・インストール未実施。TEST09 APK run42722422428は別ID com.wilduncle.jewelmine.codextest。正式アプリ用AABや更新パッケージとして案内しない。

## 5. 未完了・問題点
- 現成果物は検証専用。正式な署名対象への採用判断は未了。
- com.takeuchisetsubi.jewelmine2 のPlay側使用済み最大versionCodeが未確認。20001201を採用可能か未確定。
- 既存台帳のRAV/Reason系警告・Defender状態の問題について解消記録を今回確認していない。現在の感染を断定しないが、既存の安全性確認待ちを維持。
- JKSのaliasは正式記録にない。推測しない。パスワードをチャットへ要求しない。
- 署名済みAAB・署名検証・Play受理・配信・Pixel7実機試験は未完了。

## 6. 次に必要な作業（PC側の最小操作）
今すぐ署名はしない。
1. 上記成果物を期限前にPCへ保存し、ZIPを展開。既に同一ファイルを保存済みなら再取得不要。JKSフォルダーとは分けて原本を保持。
2. 展開した app-release.aab のSHA256だけを確認する。PowerShellで Get-FileHash -Algorithm SHA256 -LiteralPath '実際に保存したAABの絶対パス'。期待値は上記 a09951...。ZIPの5ec042...と混同しない。今回は未実行。
3. 正式アプリのPlay Consoleで使用済み最大versionCodeを読み取り確認。既に分かる値があれば既存証拠を使う。アップロードしない。
4. 台帳のPC警告に対する信頼できる検査・解消記録があるか確認。既存の証明書一致や鍵の場所探しはやり直さない。
次の1作業：versionCodeとPC安全性の未確認事項を埋め、既存AABを署名対象として採用できるか判断する。採用不可なら正式ID・適切なversionCodeを持つ未署名AABの準備を別途依頼する。勝手に再ビルドしない。

### 将来の署名手順の設計（今回実行禁止）
採用判断と署名の明示依頼後、安全なPC内だけで既存JKSを使う。
- 既存JKS：%USERPROFILE%\JewelMine2-Signing\jewelmine2-upload.jks。鍵生成・リセット・CI登録なし。
- aliasはPC内の既存記録を使用。不明な場合だけPC内で確認する。
- AABにはjarsignerを使用し、原本とは別の出力ファイルを指定する。apksignerはAAB用に使わない。
- パスワードはPC上の対話入力のみ。コマンド引数・スクリプト・ログ・チャット・GitHubへ書かない。
- 署名後はjarsignerで整合性を検証し、署名者公開証明書SHA256を93:E9:...全文と照合。終了コードだけで未署名／署名済みを判断せず、署名対象の全実体、未署名エントリー、警告の内容も確認する。
- 自己署名・タイムスタンプ等の警告は内容を区別し、警告を消すために鍵を作り直さない。
- 署名後AABのハッシュは変わるため別記録。manifestのID・versionCode、埋込ソース情報、署名以外の内容保持を確認。
- 生成メタデータのcertificateSha256=nullは未署名時点の情報で、署名後の証明書判定に使わない。署名済みAABを編集しない。
- Playへのアップロード・配信・公開は別途の明示依頼まで行わない。
公式参照：[Android](https://developer.android.com/build/building-cmdline#sign_cmdline)、[Oracle jarsigner](https://docs.oracle.com/en/java/javase/21/docs/specs/man/jarsigner.html)。

## 7. ChatGPTへの依頼事項
正式署名記録と本報告を引き継ぎ、TEST09・旧ID・アップロード鍵・アプリ署名鍵を区別する。
既存証明書照合、鍵の再検索、過去の成果物内部検証をむやみに繰り返さない。
今回の準備依頼を署名・CI起動・Play操作の許可に読み替えない。唯一の既存WORKを維持し新規Work・チャットを作成しない。

報告日時：202611110140
