# スマホ中心の開発・CI手順
確認日：2026-10-30。入口は既存【WORK】ジュエルマイン開発のみ。共通台帳は[common-ledger.md](common-ledger.md)。

## 現在使える経路
1. このWorkへ対象ブランチ・変更目的・保護条件を指示する。
2. エージェントが最新headを読取り、専用新規ブランチで修正・必要なテスト・push・新規Draft PRを行う。既存PRのheadやmainを更新しない。
3. 開発ブランチのコードpush／pull_requestでAndroid debug APK CIが動く。
4. iPhone/AndroidのブラウザでGitHubへ所有者またはwrite権限のあるアカウントでログインし、対象PRのChecks、またはActionsのrunリンクを開く。
5. runの成功、branch、event、head、attemptを確認し、ArtifactsのAPK ZIPとrecord ZIPを取得する。必要ならブラウザのデスクトップ表示を使う。
6. build-info.json／release-record.json／SHA256SUMS.txtをこのWorkへ渡して、APK内部package・証明書・versionCode・APKハッシュを照合する。
7. Play Protect警告中はインストールせず停止。iPhoneではAndroid APKは動かない。Androidでの実機成功は別途確認が必要。

スマホでの閲覧・ダウンロード・再実行ボタン操作は、所有者アカウントを使った本人の端末での往復確認が未完了。クラウド経路と、ユーザーのスマホUI経路を区別する。

## 既存runを再ビルドする
対象例：
https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/40985254973

- mainのworkflow追加は不要。GitHub公式では初回runから30日以内、write権限、workflow有効が条件。
- 同じソースを再ビルドするならrun画面右上のRe-run all jobs／Re-run jobsを使う。失敗ジョブのみの再実行とは別。
- ボタンが見えないときはアカウント・write権限・スマホの表示モードを確認し、このWorkへrun URLを送る。
- このWorkの接続済GitHub経由でも既存ジョブ再実行を依頼できる。今回run40985254973/job123834660963で実行要求が受理され、attempt2のビルド・検証成功まで確認した。versionCode9000552。詳細はevidence/reportを参照する。
- 再実行は「最新コードのビルド」ではない。元のイベントのSHA/refを使う。
- このプロジェクトはversionCode = testNumber×1,000,000 + runNumber×10 + runAttempt。run55 attempt1は9000551、attempt2は9000552となる設計。
- 現実装はattempt<10を要求する。10回目は失敗する。GitHubの一般上限50回とは違う。回数稼ぎや空コミットを通常手順にしない。
- 新しいrunのAPKを導入済みなら、古いrun再実行のversionCodeが下回る場合がある。数値を実際に比較する。ダウングレードやアンインストールで解決しない。
- 再ビルドごとにファイル名・APKハッシュ・artifact IDが変わる。元APKと同一バイナリとは扱わない。

## Run workflowとpushの違い
開発ブランチの.github/workflows/android-debug.ymlにはpush(main除外)、pull_request、workflow_dispatchが定義されている。
docs/**、README.md、AGENTS.mdのみの変更はpaths-ignore。
mainにはworkflowがない。GitHub公式ではworkflow_dispatchは既定ブランチに定義が必要。開発ブランチに定義があっても、現状Run workflow経路を利用可能とは扱わない。
mainへの追加、既定ブランチ変更、workflow変更は今回行わない。新しいコード変更は新規開発ブランチのpush/PR、既存SHAの再検証は既存runのrerunを優先する。

## Web検証とAndroid検証
- 公開PagesはmainとHTML一致。最新開発版の回帰テストには使わない。
- このWorkで専用ブランチをcheckoutし、既存npm test等をクラウドで実施する。既存CIでもnpm test、assets検査、Gradle、APK署名検証を実行する。
- 本物のAdMob広告・Android WebView・Pixelの保存互換性はブラウザのモックテストだけでは完了にならない。
- ブランチプレビューの公開やPages配信元切替は実施しない。

## PC・スマホ確認一覧（所有者UI確認結果を追記）
1. ● 完了（ユーザー直接UI確認）：takeuchisetsubi2026-ctrlへログインし、Settings表示に成功。再度の切替案内は不要。
2. ● 完了（ユーザー直接UI確認）：ActionsとPages設定を読取確認。設定変更不要、Save未押下。詳細は共通台帳末尾。Branches/Rulesの詳細UI確認まで完了したとは扱わない。
3. 上記run画面を開きRe-runメニューが見えるか確認する。今回エージェントが検証したrunを重ねて再実行する必要はない。
4. iPhone/Pixelで同じ所有者アカウント・同じrunを開き、成功表示とArtifactsのダウンロードまで往復確認する。APKを開いて導入しない。
5. 同じChatGPTアカウントで既存Workを開けることを確認する。Settings>Codex Cloud>Environmentsがある場合は既存の環境名・公開済み状態・対象repo・利用権限を記録する。
6. 新規Work/新規taskの作成や別環境の起動はしない。既存の環境が見つからない場合はその状態をこのWorkへ報告する。
7. PCを閉じた後もiPhoneからこの同じWorkへ続けて送信できることを確認する。

OpenAI公式資料には公開済み環境をモバイルから利用し、同じtaskを再開できる記載があるが、ユーザーアカウントでの環境公開・実行権限は未確認。
環境公開はアプリ公開とは別。ただしこの既存Workと別環境の結び付きを勝手に変更しない。今あるGitHub接続＋Actions経路は環境新設なしで検証する。

## 今回不要な承認・禁止する代替策
- 新PAT、SSH鍵、本番署名鍵の作成・共有を要求しない。
- Actions workflow write権限の拡大やbranch protection解除をしない。既存のread権限workflowでCI成功の実績がある。
- Pagesの公開先を最新ブランチへ向けない。
- APKのVirusTotal提出・Google申請・強制インストールをCI確認の条件にしない。
- 既存PR #6は共通管理先として維持し、新しいWorkや独立タスク台帳を乱立させない。

## 依頼用コピペ
【WORK】ジュエルマイン開発へ：
この既存Workで継続。新しいWorkは作らない。
目的：
基点ブランチ/コミット：
実施範囲：
main・既存PR・アプリID・署名・保存データを変更せず、新規専用ブランチとDraft PRで作業してください。
既存SHAの再ビルドなら対象run URLとattemptを確認してください。
Play Protect無効化・強制導入・APK外部アップロード・申請送信・本番公開は禁止。
●完了／◐作業中／○未完了を、ソースSHA・run・attempt・成果物ハッシュ・実機確認の有無付きで報告してください。

## 公式根拠
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow
- https://learn.chatgpt.com/docs/environments/cloud-environments


## 2026-10-30追記
所有者ログイン後のActions/Pagesの設定はユーザーの直接UI報告で確認済み。PCで同じ設定を再変更する必要はない。公開ページはタイトルv3.7.3、画面内は「試作品v4.0.7・広告なし・自動保存」。開発版のプレビューではない。
リポジトリ保持設定90日とworkflow指定30日を区別する。
本人スマホの同一Work再開・成果物DL、Cloud環境公開状態は未確認。新規Workは作らない。


## スマホ接続の本人報告（2026-10-30追記）
● 完了（本人報告）：ユーザーより「既存Workへ送れた」との回答。スマホから同じ既存Workへ送信できたと報告された。
証拠区分は本人報告。報告元のread_threadには該当スマホ送信文がまだ表示されておらず、直接メッセージ受信照合済みとは記録しない。
● 完了（本人報告）：直前に案内した引継ぎTXTについて「開けた」との回答。TXTの閲覧確認であり、Actions成果物ZIPのダウンロード確認ではない。
○ 未完了：本人スマホからrun40985254973の成果物ZIPを取得できること。
次の確認対象：attempt2のAPK成果物ZIP（artifact12956698942）。
https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/40985254973/artifacts/12956698942
ZIP取得のみ。APK起動・インストールはしない。
○ 未完了：Cloud環境の公開状態・実行権限。Workへの送信成功からCloud環境の状態を推定しない。
今回の資料追記のためのCI再実行なし。新規Workなし。

## 成果物ZIP保存の本人報告（2026-10-30追記）
● 完了（本人報告）：ユーザーより「ZIP保存できた」との回答。
案内対象はrun40985254973 attempt2 / artifact12956698942。実際に端末へ保存されたZIPのファイル名・内容・ハッシュは未照合。
直前の画面では404とsign in案内を確認し、ログイン後の再取得を案内した。ログイン完了画面をこのWorkで直接確認したとは扱わない。
今回再添付されたJEWEL_MINE_PLAY_PROTECT_FINDINGS_20261030.txtは調査報告TXT。対象は旧新比較9000291/9000541であり、9000552のAPK原本ではない。
○ 未完了：本人スマホに保存されたZIP本体の破損・内部build-info・APKハッシュ照合。次はこのWorkへのZIP添付で確認する。
○ 未完了：Cloud環境の公開状態・実行権限。スマホ送信やZIP保存から推定しない。
APKインストール、CI再実行、外部アップロード、申請、新しいWork作成は行っていない。
