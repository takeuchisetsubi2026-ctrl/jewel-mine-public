# ジュエルマイン開発引き継ぎ報告書

対象: takeuchisetsubi2026-ctrl/jewel-mine-public / com.takeuchisetsubi.jewelmine2
作業ブランチ: feat/work3-bgm-ci-20261110
実装SHA: 0219b4fa032d9ae5461477ef5141b4f6f47dde5c
最終CI対象SHA: 994c0ad095bbf911e52d9f493ff51114c2ed8be2（AAB実行順のみ追加修正）
基準SHA: 4f97b9368757e6a92c989af5a29b7b00f859b654（既存SFX balance版）
目標別進捗率: ①ゲーム本体・②Android実機・③Google Play公開すべて進捗率未設定。

## 1. 今回の確認・変更

● 添付ZIPは3ファイル、CRC正常。2曲のJSを無加工でassets/bgm/sourceに保管し、ZIP内バイトとの一致を確認。
● N1/L1とも8小節、各小節の音符長合計8単位、全64単位、和音・ベース8組、MIDI値・テンポを検査。
● build-identity.cjs:35の失敗をローカルで再現し、修正後成功。SFX balance版でコンボ発音がshowClearToastからplaceへ移動、通常clearとの二重発音と毎手score音を抑止したが、従来の音声差分除去が追従していなかった。確認済みの音声行・診断用styleだけを正確な文字列で正規化し、PR4からのゲームスクリプト・CSSの完全比較を維持。
● 得点加算・FEVER5手・手数更新・保存先の変更を検出する否定検査を追加。アプリID、versionCode生成、署名設定の既存assertを削除していない。
● SFXのfrequency AudioParam mockと終了音の期待値を現行版へ更新。和音に同一周波数が含まれるため、コンボ/clear競合は周波数の不在でなくcueの実呼出し回数を確認する。
● BGMの保存済みOFF設定を強制trueで上書きしていた診断行を除去。既存保存値を優先し、未設定時は従来の実効動作と同じON。
● 空白1byteだけの無効workflowを専用ブランチで除去。既存AAB workflowに履歴全取得・testsで使用するChromeの導入を指定。専用ブランチのCI生成物に限って既存jewelmine2 ID変換を許可。

## 2. 原本照合の到達点

添付JSは「採用曲データ＋主要パラメータの抽出物」であり、試聴AppBlock全文ではない。これは添付指示書自身にも明記されている。
今回のproject_source_filesは空で、jmn14/jmflの全文は取得できなかった。Libraryの該当引継ぎ2ファイルも全文を含まない。過去の「原本ソース追加済み」という報告だけで照合済みとはしない。

N1 SHA256: 859a834c315949ec03d6ef14b071ef7a3eb18dc454dd31a5e3031c8a7135a942
L1 SHA256: 33e295582518e54496e90cdd9e3c1d8d719df08869cfdc5bad22a04c1e3b75c2

○ 未確認: 元試聴コードとのバイト/意味照合、tone/noise関数の完全なエンベロープ、snare/hat長、音の完全一致。
○ N1/L1の実再生統合は未実施。推測で不足音色を作らず、既存曲配列・再生処理を維持。ビルドはCI復旧版であり採用BGM統合版ではない。

## 3. 検査・CI

ローカルで成功: build-identity、BGMデータ検査、piece-generation（200000 draws）、reward-scoring（180 combinations）、score-versioning、build:web、check-assets、git diff --check。
ローカルブラウザ: Playwright Chromiumの取得ZIPが壊れており導入失敗。Chrome導入はaptのsetgroups権限エラーで停止。この環境でブラウザ実行成功とは報告しない。

CI対象: 上記最終CI対象SHA。
0219b4fのAAB run 42711262000では全14スクリプト成功。その後build:webがテスト生成記録を未コミット変更として検知して停止。クリーン状態の検査は削除せず、build:webをテスト前に移し、テスト後は製品ソースのdiffが空であることを検査する順序へ修正。
- Android debug APK: https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/42711584117
- Jewelmine2未署名AAB: https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/42711584479

● 最終CIは両runともsuccess。Chromeでnpm test全14スクリプトが成功、Androidビルドと各workflowのパッケージ検査が成功。

今回両artifactをダウンロードし、外側ZIPのGitHub digestとCRCを確認。APK/AAB本体のCRC、HTML埋込metadata、sourceSha256、実装SHA、dirty=false、Capacitor ID、同梱N1/L1抽出JSのバイト一致をローカルで確認。証拠: 2026-11-10-work3-artifacts-verification.json。

- 未署名AAB: artifact 13716690451、9,727,360 bytes、実物protobuf ManifestのID com.takeuchisetsubi.jewelmine2 / versionCode 20000701 / versionName 4.0.9を確認。META-INFの署名ブロック/SFなし。SHA256: 50771d5e9d37747d17b8d92d933d0373e72a4d998750658e671ab7072b9e8872。
- TEST09 APK: artifact 13715144953、11,752,482 bytes、埋込ID com.wilduncle.jewelmine.codextest / versionCode 9000861。SHA256: 8b0a0fe5e158ccdf0d42c6b8f551f28e8a553e939cd172f165260d0eb938cf1a。既存公開テスト証明書はCIのapksigner検証成功。ローカルで署名の再検証はしていない。jewelmine2更新用ではなく導入指示をしない。
- 両成果物ともN1/L1データは同梱されるが、ゲームからはロードされていない。原音の統合・実音・Pixel 7検証は未完了。
- AABはCIで2026-11-10 07:27 JST頃ビルド成功、今回の実物検査は07:29 JST頃。過去成果と区別する。

## 4. 保護した範囲

config/test-release.json、capacitor.config.json、android/app/build.gradle、既存署名鍵、AndroidManifestは基準とのdiffなし。main・既存ブランチ・PRの変更/マージ、署名鍵生成、Playアップロード/配信/公開なし。
既存debug CIはTEST09の別IDであり、jewelmine2への更新に使わない。未署名AABは直接インストール不可、Playへアップロード不可。

## 5. 次の作業・ChatGPTへの依頼

1. jmn14とjmflの完全な試聴HTML/JSをこのWORKへ添付する。音符の抽出物は再提出不要。必要なのはtone/noise/kick/snare/hat/scheduler本体を含む全文。
2. 原本照合後、既存FEVER状態通知とN1/L1のエンジンを接続し、先読み発音の取消・音量・SFX競合・広告/非表示/OS割込みの停止と再開を検査する。5手を5秒にしない。
3. BGM統合版のビルド・実物検証後、安全な既存署名/配布経路を確認してPixel 7検証。Playへの操作は禁止のまま。
4. 実機では通常→宝石5個→L1→5手→N1、連続FEVER、設定OFF/ONと再起動、SFX同時再生、広告取消/失敗/復帰、画面消灯/ホーム移動/復帰を確認する。アンインストールやPlay Protect無効化は指示しない。

## 6. 変更ファイル

- tests/build-identity.cjs、tests/game-feedback.cjs、tests/bgm-source.cjs
- index.html（BGM設定上書き修正のみ）、package.json
- scripts/prepare-jewelmine2-ci.cjs、.github/workflows/jewelmine2-feedback-unsigned-aab.yml
- .github/workflows/jewelmine2-automated-checks.yml（空の無効workflowを削除）
- assets/bgm/source/ の抽出JS2件とREADME
- 本報告書とartifact検証JSON

報告日時: 202611100729 JST
