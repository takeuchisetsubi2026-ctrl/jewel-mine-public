# WORK3 N1/L1 BGM統合報告

対象ブランチ: `feat/work3-n1-l1-integration-20261110`

CI対象SHA: `0edb97ee087791aaae5d40196925c5dd4210b41b`

## 確認済み

- 添付ZIPのチェックサムを検査し、N1 jmn14 / L1 jmflの試聴HTML内スクリプトと単体JavaScriptが一致することを確認した。
- 完全な試聴エンジンJSをバイト単位で保管し、既存抽出データが各エンジンの先頭曲N1/L1と一致することを自動検査した。
- N1/L1のテンポ、音符、コード、ベース、音色、フィルター、エンベロープ、ドラム、先読み幅、スケジューラ周期、音量係数を既存ゲームのWeb Audio処理へ統合した。
- FEVER開始でL1、実際の5配置終了でN1へ復帰するブラウザ回帰が成功した。同一FEVER状態の再描画では再起動しないこと、切替時に旧音源を停止することも検査した。
- BGMとSEは共通出力バスで共存し、BGM設定OFF、広告中断、pagehide、pageshow、suspended AudioContext復帰を検査した。
- 既存CI修復と保存済み音声設定の優先処理を維持した。ゲームロジック同一性検査も成功した。
- GitHub ActionsのAndroid debug APKとJewelmine2未署名AABは、ともに全テスト、Androidビルド、各パッケージ検査を通過した。

## CIと成果物

| 種別 | Run | Artifact | 結果 | 本体SHA-256 |
|---|---:|---:|---|---|
| Android debug APK | 42722422428 | 13719889974 | success | `dbb04d488ef97d9087581862d54db4f157cf64b211d47ba3a1a2f63aca0d616e` |
| Jewelmine2未署名AAB | 42722422415 | 13721516797 | success | `a09951d939e27f318f607b654d23bab155643fd44a07cc4e67b5e77b1b0f94de` |

APKは `com.wilduncle.jewelmine.codextest` のTEST09であり、Jewelmine2の更新用APKではない。AABは `com.takeuchisetsubi.jewelmine2`、versionCode 20001201、未署名であり、検証専用・Playアップロード不可である。

成果物を実際にダウンロードし、外側ZIPと内側APK/AABのCRC、GitHub artifact digest、ファイルSHA-256、埋込metadata、sourceSha256、Capacitor ID、N1/L1原本JSの同梱ハッシュを確認した。AABはprotobuf Manifestでも `com.takeuchisetsubi.jewelmine2` を確認し、META-INF署名ブロックがないことを確認した。

## 変更ファイル

- `index.html`
- `assets/bgm/source/JEWEL_MINE_N1_jmn14_AUDITION_ENGINE.js`
- `assets/bgm/source/JEWEL_MINE_L1_jmfl_AUDITION_ENGINE.js`
- `assets/bgm/source/README.md`
- `tests/bgm-source.cjs`
- `tests/game-feedback.cjs`
- ブラウザテスト注入先修正10ファイル
- `scripts/check-assets.cjs`
- `scripts/prepare-jewelmine2-ci.cjs`
- `.github/workflows/jewelmine2-feedback-unsigned-aab.yml`
- 本報告と検証JSON

## 未完了

- Pixel 7での実音、音量バランス、通常→FEVER→5手→通常、連続FEVER、SE同時再生、設定保持、画面消灯・ホーム移動・広告復帰の確認。
- `com.takeuchisetsubi.jewelmine2` の既存署名経路を使った安全なインストール可能成果物の作成・配布。
- Play Protect結果の確認。
- Google Playへのアップロード、配信、公開（未実施）。

Pixel 7実機確認へ進むには、既存署名を保持する安全な配布経路のユーザー判断または操作が必要である。TEST09 APKのインストールや、未署名AABのアップロードは案内しない。

報告日時: 202611100846 JST
