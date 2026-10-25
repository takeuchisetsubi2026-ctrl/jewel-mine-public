# ジュエルマイン開発引き継ぎ報告書

作業日時：2026年10月25日（UTC）
対象リポジトリ：wild-uncle/jewel-mine-public
作業ブランチ：feature/apk-build-identity
実装・APK生成元コミット：2b489f1809e8f0588556fb52db7ebcfa2c92528f
基準：PR #4、d513c89a95d0bfc382ef2e5257720e66df9142e6
作業目的：2つの開発スレッドの成果を照合し、APKの表示番号とビルド情報を一致させる。

## 1. 完了した作業

### PR #1〜#4と旧スレッドの調査

各PRの実際のbaseとの分岐点から調査した。PR #1・#2・#3の先端はすべてPR #4の祖先であり、履歴は連続している。

| PR | 先端 | PR固有コミット数／変更ファイル数 | 主な内容 | PR #4への引継ぎ |
|---|---|---|---|---|
| #1 | 8b598c8 | 2／7 | 消去軽量化・文字色・ドラッグ元非表示 | 含まれる |
| #2 | d4c092e | 4／15 | スコア連動ピース生成・順序評価 | 含まれる。後続で調整あり |
| #3 | 1ac50c0 | 7／25 | 大型ピース調整・得点倍率・演出・省電力 | 含まれる |
| #4 | d513c89 | 3／19 | 得点記録分離・旧セーブ保全・難易度進行値 | 現在の基準 |

主な変更ファイルは各PR共通のindex.html、PR #1のscripts/check-assets.cjs・tests/regression.cjs、PR #2のtests/piece-*.cjs、PR #3のtests/reward-*.cjs・tests/simultaneous-reward.cjs、PR #4のtests/score-versioning*.cjs・tests/versioning-comparison.cjs。package.jsonとdocs配下の報告・測定結果も含む。各コミットの完全SHAと全変更ファイルはdocs/reports/pr1-pr4-inheritance-audit.jsonに保存した。

旧スレッドの87dde26はPR #4の祖先ではない。ただし、旧APKと87dde26の同梱ゲームHTMLのハッシュが一致し、その機能をPR #1の別実装と照合できた。

- 引継ぎ済み：斜めスラッシュ削除、消去DOM上限、ハイスコア文字改善、ドラッグ中の元形状非表示、キャンセル復元、FEVER・保存の維持。
- 後続実装で置換：旧版の色付き破片・衝撃波は、PR #1で最大8セルの光フラッシュ中心の軽量演出へ変更。ドラッグ元のCSSクラスもsource-draggingからdrag-sourceへ変更。
- 後続仕様で変更：PR #2の生成重みはPR #3で、難易度判定・保存はPR #4で調整。機能の取り込み漏れではない。
- そのまま取り込まれていない資料：旧tests/android-ux-v2.cjsと旧スレッド独自の報告・画面証跡。主要な機能検証は現行テスト群に存在する。旧ブランチと保全APKは削除していない。

確認範囲で未統合のゲーム機能は見つからず、追加の機能統合・cherry-pickは不要。旧演出やテストをそのまま復活させていない。対象は確認できたGit履歴・保全APK・報告書であり、未提供の別成果物までは断定しない。

### 端末のv4.0.7／v4.0.8の識別

| 項目 | 端末のv4.0.7 | 端末のv4.0.8 | 確認できたPR #4のAPK系統 |
|---|---|---|---|
| アプリID | 未確認 | 未確認 | com.wilduncle.jewelmine.codextest |
| Android versionName／versionCode | 未確認 | 未確認 | 1.0／実行25では25、26では26（設定・実行記録） |
| 画面表記 | ユーザー観察v4.0.7 | ユーザー観察v4.0.8 | v4.0.7 |
| コミット／ブランチ | 未特定 | 未特定 | 298c901・d513c89／feature/score-versioning-difficulty |
| 得点ルール | 未確認 | 未確認 | 新規line-v2-20261025、旧再開unversioned／mixed |
| 保存 | 未確認 | 未確認 | jewel-mine-v36-score-rules、別台帳jewel-mine-score-records-v1、旧キー読取維持 |
| 署名 | 未確認 | 未確認 | 既存の固定公開テスト署名 |
| PR #4包含 | 未確認 | 未確認 | 含む |

GitHub履歴ではPR #1〜#4とも画面はv4.0.7。v4.0.8画面のAPKに対応するコミットは特定できなかった。番号だけで新旧は判定できない。2アイコンが異なるアプリIDであることも未確認で、PWA・別プロファイル等の可能性を断定していない。

保全済みの旧APKは実検査でcodextest、versionName1.0、versionCode3、87dde26相当のHTML、同じテスト署名を確認。PR #4は含まない。これを端末のどちらかと同一とは断定しない。

標準テストアプリの推奨はPR #4と同じcodextest＋既存署名。別IDアプリとの統合や移行はしていない。

### APK識別の最小限の追加

既知の07・08に続く識別番号としてTEST09を予約。Android表示名は「09 ジュエルマイン」、ゲーム下部は「TEST 09｜v4.0.9｜2b489f1」。表示コミットは固定文字列ではなく、ビルド時の実際のcheckout HEADから生成する。

config/test-release.jsonを番号・versionName・アプリID・証明書識別の管理元とし、Androidラベル・バージョン・画面・JSONを同じ情報から生成。次の新しいテストリリースでは番号とversionNameを増やす。同じリリースの再ビルドはSHA・Actions番号・試行番号で区別する。

versionCode＝TEST番号×1,000,000＋Actions実行番号×10＋試行番号。今回の配布候補は9,000,271で、既知の旧ビルド最大26より大きい。範囲外の番号は停止する。未知の端末側versionCodeより大きい保証はできないため、更新拒否時は削除せず中止する。

APK内build-info.jsonにフルSHA、UTC日時、ソースハッシュ、番号、アプリ名、versionName/code、アプリID、署名識別、APK名、Artifact名、実行URLを記録。APKハッシュは外部manifest、Artifact ID・URLはアップロード後のrelease-record.jsonに記録する。PRイベントではテスト用マージSHAの場合があるため、配布候補はpushイベントの成功APKを指定した。

変更ファイル：config/test-release.json、scripts/build-identity.cjs、scripts/build-web.cjs、scripts/check-assets.cjs、scripts/verify-apk.py、tests/build-identity.cjs、Androidのbuild.gradle・表示名リソース、capacitor.config.jsonの表示名、index.htmlのフッター、package.json、.gitignore、Actions設定、docs/reports。

## 2. テスト結果

ローカルとGitHub Actionsで全回帰テスト成功。構文、Capacitor同期、生成アセット一致も成功。

PR #4とゲームJavaScript・CSSが完全一致することを自動確認。得点式、難易度、生成評価、保存キー、FEVER、省電力処理は変更していない。

旧スレッド由来の斜め演出削除・DOM上限・文字視認性・ドラッグ開始／キャンセル／配置・元形状非表示、FEVER5手／2倍／150%／1250ms、宝石、コンボ、全消し、保存復元、新旧記録分離、非表示復帰の現行回帰テストが成功。Android端末での操作を確認したという意味ではない。

Actionsで完成APKをaapt・apksignerとZIP内容検査にかけ、Androidラベル、versionCode/name、画面番号、フルSHA、同梱HTML・JSON、既存テスト署名の一致まで成功した。

Android実機の更新インストール後のデータ保持・動作・電池・発熱は未確認。

## 3. GitHub反映状況

新ブランチへのpush成功。新ドラフトPR #5：
https://github.com/wild-uncle/jewel-mine-public/pull/5

base：feature/score-versioning-difficulty。
main・PR #1〜#4の先端は変更していない。いずれもマージしていない。

APK生成元2b489f1のActions成功：
https://github.com/wild-uncle/jewel-mine-public/actions/runs/40170315521

## 4. Android APK

アプリ名：09 ジュエルマイン
versionName：4.0.9
versionCode：9000271
アプリID：com.wilduncle.jewelmine.codextest
APK名：jewel-mine-test-09-v4.0.9-2b489f1-27-1-debug.apk

APK ZIP：
https://github.com/wild-uncle/jewel-mine-public/actions/runs/40170315521/artifacts/12589722990

ビルド対応表release-record.json：
https://github.com/wild-uncle/jewel-mine-public/actions/runs/40170315521/artifacts/12588963945

GitHubログインが必要。保存期間30日。GitHub APIでArtifactの存在・未失効を確認済みだが、スマホでの取得は未確認。この環境へのダウンロードはリダイレクト先の403で失敗したため、APKを回答へ直接添付はできていない。

テスト署名証明書SHA-256：
adf316980df6f14b7b5510eafd42c6557d6b6f70623dc35466940bc9c2a4b029

端末で更新対象を確認してからZIPを展開し、APKを開いて更新する。旧アプリをアンインストールせず、ストレージ消去もしない。「新規インストール」になって意図した対象と一致しない場合や更新拒否時は中止する。

## 5. 未完了・問題点

- 端末のv4.0.7／v4.0.8のアプリID、署名、ビルド元は未特定。端末情報または元APKが必要。
- 両方を長押し→アプリ情報で、アプリ名・Androidバージョン・パッケージ名・プロファイルを記録する。表示されない項目は不明とする。ブラウザ管理ならインストール元と起動URLを確認する。
- PCを使える場合だけ、許可済みADBによるdumpsys package、pm path、APK複製とaapt／apksigner検査を案内する。削除・pm clear・保存変更は行わない。
- PR #4の由来不明ベスト、生成候補の利点と悪化、破損保存の復元UI等の設計課題は今回変更していない。
- 正式リリース番号は設定ファイルで更新する運用。Actionsの実行ごとにリリース番号を増やす方式ではない。ローカルrun0やDIRTYビルドは配布対象にしない。

## 6. 次に必要な作業

1. 端末の2つのアプリ情報を確認し、標準候補codextestの更新対象を特定する。
2. 一致確認後にTEST09を削除なしで更新し、アプリ名・画面番号・コミット・旧新スコア・BEST・盤面復元を確認する。
3. 不一致なら元APKの読み取り専用検査を行い、統合やデータ移行は別途承認を得る。
4. 次のゲーム機能開発はPR #4の課題を別作業として比較する。重複する旧機能を再実装しない。

## 7. ChatGPTへの依頼事項

PR #1〜#4の機能は履歴と現行テストで引継ぎを確認でき、追加統合は不要という結果を引き継いでください。次は端末の2アプリの識別と、TEST09の安全な更新確認を優先してください。未提供の端末情報を推測せず、データ削除・アプリ統合・ID変更・既存PRのマージを指示しないでください。
