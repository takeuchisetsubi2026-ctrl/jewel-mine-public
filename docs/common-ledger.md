# ジュエルマイン共通台帳
確認日：2026-10-30（日本時間）。この既存【WORK】ジュエルマイン開発を唯一のWorkとして継続する。

## 運用先と権限
- 相談・判断先：【chat】ジュエルマイン開発。実作業：この既存Work。新しいWorkは作らない。
- 正式リポジトリ：takeuchisetsubi2026-ctrl/jewel-mine-public（旧所有者wild-uncle）。
- 共通タスク管理：既存PR #6。今回はPR #6本文・コメントを変更していない。本台帳は観測資料であり新たなタスク受付先ではない。
- GitHub接続アカウント：takeuchisetsubi2026-ctrl。repo APIはadmin/push/read trueを返した。
- ただし連携アプリは管理APIを制限する。main/protectionは403、Pages設定APIとworkflow一覧APIはコネクタ対象外。アカウント権限と連携アプリ権限は別。
- 当初はWindowsブラウザがwild-uncleでSettingsへアクセス不可。追記：所有者ログイン後のActions・Pages設定をユーザーが直接UI確認済み。詳細は末尾。
- main一覧のprotected:falseは観測値。管理APIでの詳細な保護ルール検査の代わりにならない。変更しない。

## ソース・Pages
- 既定ブランチmain：d5ffa1e23a4e44056a8ca5729ebfe42e38caa6cc。
- mainの9ファイル：README.md、index.html、index 31.html、jewel_mine_v23.zip、画像5枚。.github/workflowsなし。
- 最新の既存開発PR #14 head：feature/admob-integration-20261030 / c0bb303aad12b3e5ed1671a760c24f585ff88c22。
- 公開Pages：https://takeuchisetsubi2026-ctrl.github.io/jewel-mine-public/
- 今回のHTTP取得HTMLのGit blob SHAはb1023e6270090fda41450a07f68d7dc0be2a70fbでmain/index.htmlと一致。公開Pagesは現在main相当の内容。PR #14のWeb表示テストの代用にしない。
- Pages配信元はユーザー直接UI確認によりDeploy from a branch / main / (root)、HTTPS必須ON。デプロイ変更なし。詳細は末尾。

## 既存PRのスナップショット（すべてopen、未マージ）
| PR | Draft | head | base |
| --- | --- | --- | --- |
| #1 | no | fix/android-feedback-ui | build/android-debug-apk |
| #2 | yes | feature/score-adaptive-piece-generation | fix/android-feedback-ui |
| #3 | yes | feature/reward-balance-battery | feature/score-adaptive-piece-generation |
| #4 | yes | feature/score-versioning-difficulty | feature/reward-balance-battery |
| #5 | yes | feature/apk-build-identity | feature/score-versioning-difficulty |
| #6 | yes | coordination/single-task-queue-20261025 | feature/score-versioning-difficulty |
| #7 | yes | investigation/jm-001-apk-identities | coordination/single-task-queue-20261025 |
| #8 | yes | test/codex-mention-smoke-20261025 | coordination/single-task-queue-20261025 |
| #9 | yes | test/codex-cloud-write-check-20261025 | coordination/single-task-queue-20261025 |
| #10 | yes | feature/play-aab-preparation-20261026 | feature/apk-build-identity |
| #11 | yes | audit/play-aab-failures-20261027 | feature/play-aab-preparation-20261026 |
| #12 | yes | fix/android-viewport-lock-20261027 | feature/play-aab-preparation-20261026 |
| #13 | yes | feature/rewarded-board-reset-20261028 | fix/android-viewport-lock-20261027 |
| #14 | yes | feature/admob-integration-20261030 | feature/rewarded-board-reset-20261028 |

PRは積み重なっている。#14はmain向けではなく#13ブランチ向け。既存PRのbase変更・更新・マージは禁止。
本作業の新規docsブランチは#14 headから分岐し、docsのみを変更する。ゲーム・workflow・設定・署名は変更しない。

## APKを混同しない
共通package：com.wilduncle.jewelmine.codextest、versionName 4.0.9。
共通の公開テスト証明書SHA-256：
adf316980df6f14b7b5510eafd42c6557d6b6f70623dc35466940bc9c2a4b029

| 対象 | versionCode | ソース/ビルド識別 | APK SHA-256 | 根拠 |
| --- | --- | --- | --- | --- |
| Pixel既存 | 9000291 | 830101044466537d79e32a4b9c42ca9947281867 | 370fdd78119ab6500ec5c386ebdf2d11c4c21aa42112c07d79d6ca33575856c6 | 旧原本の過去直接検査＋端末回収一致のユーザー報告 |
| 警告調査対象の新APK | 9000541 | 77cd7803bb77bbc452a864578438e6da2db3c2ab / run40984717228 | ecb7a311631261c8ffa20014b32686b1d43bf5ddabbf7ef3a2d9f83e5206c900 | 過去直接検査、警告調査対象 |
| run55 attempt1 | 9000551 | 53f1e943e5a7ed7def31c671a9a3ae14e1336fe2 / run40985254973 | fc616db4a7ddcb9fd80e8d3597403bbd6584d32a87f7916b9114e67c8621641d | 今回record ZIP取得・整合確認、CI成功 |

PR #14のAPI head SHAと、pull_request CIがcheckoutした合成コミットSHAは異なる。合成コミットがあってもPRの実マージではない。
run55 attempt1 recordのsourceSha256：
1ad24dfabc068ddfab5df017bb29efcfc91dbff94c79be39cc703a818720a9ec
新しいattemptのAPKを9000541の警告解消済み版・同一ハッシュとして扱わない。
run55 attempt1 APK：
https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/40985254973/artifacts/12947305396
30日保存、今回APIの失効予定2026-11-29 01:23:44 UTC。失効時は別attemptを別の行に追加する。

## 実機保護・公開準備
● 完了（ユーザー確認）：Pixel内APKと旧原本のSHA-256一致。BEST200,555／SCORE116,070。USBデバッグは確認後オフ。
○ 未完了：Play Protect警告解消、新APK更新、広告・復活・リセット・保存保持・連続ドラッグ実機検証。
過去のCI成功とAndroid起動成功を混同しない。APK回収は保存データのバックアップではない。
● 完了（ユーザー報告）：TEST09起動プレイ、アイコン・フィーチャー登録。
● 完了（過去成果物）：掲載画像4枚制作。Consoleへの登録完了は未確認。
○ 未完了：現Console不足項目、正式ID/配信署名/公開AAB/データセーフティ等の証拠。
正式公開用com.takeuchisetsubi.jewelmineと既存テストIDは別。自動移行を約束しない。
禁止：アンインストール、データ消去、Play Protect無効化、警告無視の導入、APK外部アップロード、申請送信、main/既存PR変更・マージ、本番公開、有料設定。


## 今回の再実行結果（直接確認）
● 完了：run40985254973 attempt2、job123911348736、status completed / conclusion success。
再実行の対象は同じ合成コミット53f1e943e5a7ed7def31c671a9a3ae14e1336fe2。PR #14 headは変更していない。
versionCode：9000552
APK SHA-256：37e89c10f559b1f1807ffadebc5a122a2283d0637bb19ac4549c9ecdc6eae8d1
APK取得先：https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/40985254973/artifacts/12956698942
record artifact：12956688923。今回record ZIPを取得し破損なし、recordのpackage・証明書・SHA・attemptを確認した。
APK本体の再ダウンロード・直接再検査・実機導入は今回行っていない。CIの署名検証成功とrecordを根拠にする。

## 所有者ログイン後のUI確認（2026-10-30追記）
証拠種別：ユーザーから提供された直接UI確認結果。確認者は所有者アカウントでChatGPT内蔵ブラウザにログインしたユーザー。このWorkからの独立したUI追試・スクリーンショット回収は行っていない。

● 完了：repo/settings/actionsが正常表示。
- Allow all actions and reusable workflows：選択。
- Artifact/log retention：90日。
- forkからの実行：first-time contributorsの承認が必要。
- Workflow permissions：Read repository contents and packages。
- ActionsによるPR作成承認チェック：OFF。
設定変更の必要なし。ユーザーはSaveを押していない。
設定の90日はリポジトリの保持設定。Android debug workflowのupload-artifactはretention-days:30を明示しているため、今回のAPK成果物の保持期間を90日へ読み替えない。
ActionsのPR作成チェックOFFはGITHUB_TOKENによるPR作成の設定であり、このWorkの接続済GitHub経由でDraft PRを作成した事実と矛盾しない。設定をONへ変えない。

● 完了：Pages設定の直接UI確認。
- Live URL：https://takeuchisetsubi2026-ctrl.github.io/jewel-mine-public/
- Source：Deploy from a branch。
- Branch：main / (root)。
- HTTPS必須：ON。
- 最終デプロイ表示：Oct 22 12:23 JST / run39716569591。
- 公開ページのタイトル：v3.7.3。
- ゲーム画面の表示：「試作品v4.0.7・広告なし・自動保存」。
タイトルと画面内のバージョン表示は異なるため両方記録する。単一の現在バージョンと決めつけない。
以前のHTTPによるmain/index.htmlとの一致確認と合わせ、公開Pagesはmainの公開版。PR #14等の新しい開発版プレビューではない。
APIのPages設定取得非対応という過去の制約は残るが、設定内容自体は今回のユーザーUI報告により確認済み。

○ 未完了：本人スマホで同じ既存Workを再開、成果物ダウンロード、Cloud環境の公開状態・実行権限。
◐ 作業中：この追記完了時点で新たなビルド・公開・設定変更なし。
新しいWorkは作成しない。次の本人スマホ確認はユーザー側の案内に従い、完了証拠が届くまで完了扱いしない。
