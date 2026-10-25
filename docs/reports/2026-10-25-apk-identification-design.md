# APK識別調査・管理設計

2026-10-25 UTC。PR #4 d513c89を調査。端末には接続していない。

## 調査結果

| 項目 | 端末の「v4.0.7」 | 端末の「v4.0.8」 | 確認済みPR #4のCIビルド |
|---|---|---|---|
| アプリID | 端末未確認 | 端末未確認 | com.wilduncle.jewelmine.codextest |
| Android versionName / code | 端末未確認 | 端末未確認 | 1.0 / 実行25は25、実行26は26（設定と実行記録） |
| 画面表示 | ユーザー観察v4.0.7 | ユーザー観察v4.0.8 | v4.0.7 |
| コミット・ブランチ | 表記だけでは特定不能 | 特定不能 | 298c901 / d513c89、feature/score-versioning-difficulty |
| 得点ルール | 未確認 | 未確認 | 新規line-v2-20261025、旧再開unversioned／mixed |
| 主保存キー | 未確認 | 未確認 | jewel-mine-v36-score-rules、別台帳jewel-mine-score-records-v1、旧キー読取維持 |
| 署名SHA-256 | 未確認 | 未確認 | adf316980df6f14b7b5510eafd42c6557d6b6f70623dc35466940bc9c2a4b029 |
| PR #4包含 | 未確認 | 未確認 | 含む |

originの全取得履歴を検索し、v4.0.8を画面バージョンとするコミットは確認できなかった。v4.0.8というコメント等があることはAPKの識別根拠ではない。PR #1〜#4は同じv4.0.7画面表記を保持しており、番号の大小から新旧を判断できない。

手元の保全APK jewel-mine-android-ux-v2-debug.apkは、実ファイル検査でアプリID codextest、versionName1.0、code3、固定公開テスト署名を確認。同梱HTMLのSHA-256が87dde26のHTMLと一致し、PR #4は含まない。これは端末のv4.0.7アプリと同一だと断定できない。生データ：apk-identity-history.json。

2つのアイコンだけでは異なるパッケージと断定できない。PWA、別プロファイル、アプリ複製等もあり得るため、いずれも未確定とする。

## 端末で安全に確認する方法

両方を順番に長押し→「アプリ情報」。アプリ名、Androidのバージョン、個人／仕事用等のプロファイル、設定画面で表示されるパッケージ名を記録する。メーカーによってパッケージ名は表示されないので、出ない項目を推測しない。ブラウザ管理のアプリなら、インストール元と起動URLも記録する。画面内バージョンとは別々に記録する。

PCが使用できる場合、本人が許可したUSBデバッグで `adb shell pm list packages` と `adb shell dumpsys package <確認したパッケージ名>` を読み取り専用で使用する。必要なら `adb shell pm path <パッケージ名>` でAPKパスを確認し、`adb pull`でAPKだけを複製する。APKにaapt dump badging／apksigner verify --print-certsを実行し、同梱assets/public/index.htmlを確認する。PWAに同じ保存形式があるとは仮定しない。秘密情報やプレイデータを公開しない。アンインストール、pm clear、保存ファイルの書換えは禁止。

スマホだけで不足情報を確認できない場合は、取得済みアプリ情報の範囲を報告し、未確認のまま止める。追加のAPK解析アプリの導入を必須としない。

## 推奨と番号管理

標準候補はPR #4と同じcodextest＋固定テスト署名。既存の別IDアプリとの統合・移行は行わない。端末の更新対象と一致するかの最終確認は未実施。

履歴の画面表示07とユーザー観察08に続く識別番号としてTEST09を予約した。Actionsの過去実行番号26をリリース番号として転用しない。新しいテストリリースごとにconfig/test-release.jsonのtestNumberとversionNameを増やす。同じリリースのCI再ビルドは同じTEST番号で、SHA・実行番号・試行番号・UTCで区別する。変更したゲームを次回リリースする際は10以降に更新する。

versionCode = TEST番号×1,000,000 + Actions実行番号×10 + 試行番号。既存の最大実行code26より大きい。TEST番号1〜2000、実行番号0〜99999、試行1〜9の範囲外は停止する。実行番号が増加する通常CIでは単調増加。同じ実行の再試行も増加。古いTEST番号の再ビルドは新番号より優先しない。端末に未知のより大きいversionCodeがあれば更新不能なので削除せず停止する。ローカルrun0は配布用にしない。

Actionsのcheckoutの実際のHEADを埋め込む。PRイベントはマージテスト用SHAの場合があるため、ブランチHEADと同一と仮定しない。配布はpushイベントの成功APKを優先する。未コミット状態はDIRTYと表示し、CIでは初期状態がdirtyならビルドを拒否する。

APK内のbuild-info.jsonと画面番号、Androidラベル・versionCode/name、署名・同梱HTMLをビルド後に照合する。フルSHA、ソースファイルSHA-256、UTC、アプリID、APK名、Artifact名、run URLを記録。APKハッシュはビルド後の外部manifest、Artifact ID/URLはアップロード後の別release-record.jsonに記録する。APK自身へのAPKハッシュ／アップロード前のArtifact ID埋め込みは行わない。

変更はフッターとビルド・ラベル情報のみ。PR #4のゲームJavaScriptとCSSの完全一致をテストする。保存キー、得点、FEVER、生成評価、ホスト名・スキーム・署名は維持。実機更新後のデータ保持は別途確認が必要。
