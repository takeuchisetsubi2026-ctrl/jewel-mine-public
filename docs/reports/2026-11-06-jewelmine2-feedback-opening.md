【chat】ジュエルマイン開発2 宛て
【WORK】ジュエルマイン開発｜演出・振動・オープニング実装報告

【目標別進捗率】①ゲーム本体40%／②Android実機40%／③Google Play公開20%（据置）
基準：com.takeuchisetsubi.jewelmine2／versionCode 10000101 のソース（0dbf9e5）。
ユーザー実機報告：基準版のゲームプレイ良好、復活上限2回の表示を確認。

● 実装・検証済み
・index.html：持つ、影のマス移動、置く、ライン消去、得点加算、FEVER発動に振動・効果音を追加。影の振動はマスが変わったときだけで、65ms未満の連続発火を抑制。
・通常／FEVERのBGMを追加。「音・振動」からBGM・効果音・振動を個別に切り替え、ゲーム記録と別に保存。全画面広告の再生中はBGMを停止し、終了後は設定に従い再開。
・アプリ起動時に光る宝石と「JEWEL MINE」を2秒表示。タップで即スキップ。終了まで広告SDK初期化とバナー表示を開始しない。
・Android：JewelMineHapticsPlugin.java を追加し、MainActivity.java で登録。Androidのシステム振動設定に従う。
・初回CIで、破損データ保護の表示が設定ボタンを消し起動処理を止める問題を検出。警告文だけを更新するよう修正し、再実行で破損データ保護を含む保存回帰が合格。
・修正後のGitHub Actionsで npm test の13本、デバッグAPK生成、同梱ゲーム資産・既存テスト署名の検査が成功。Chromiumの広告・振動・音声モックで2秒の遷移、スキップ、広告開始待ち、BGM停止／再開、FEVER切替、個別設定と保存、マス振動を確認。既存回帰で復活2回・再読み込み後の3回目拒否、スコア／BEST保護を確認。
・既存アプリID・署名設定・main・既存PRへの変更なし。専用ブランチに反映し、マージなし。

【確認証拠】
専用ブランチ：feat/jewelmine2-feedback-opening-20261106
検証コミット：87a70ebc97aed9edfc37cee427deedca1c71bc4d
CI： https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/42235264455
デバッグAPK ZIP： https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/42235264455/artifacts/13511351052

○ 未検証・次の作業
・演出版のPixel 7実機で、振動の強さ、実際の音量・音質、実広告との切替、起動の見え方と上書き時の保存保持を確認する。
・CIのAPKは既存TEST 09用（com.wilduncle.jewelmine.codextest）。Play内部テスト版への更新には別途、新アプリID用AABの生成と署名が必要。今回はそのAABの生成・署名、Playへのアップロード・公開は未実施。Playへのアップロードは別途承認。

【報告日時 JST】
202611062339
