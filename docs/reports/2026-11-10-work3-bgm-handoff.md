# ジュエルマイン開発引き継ぎ報告書

作業日時: 202611100613 JST（今回の調査。過去のCI実行日時とは別）
対象: takeuchisetsubi2026-ctrl/jewel-mine-public / com.takeuchisetsubi.jewelmine2
作業ブランチ: docs/work3-bgm-handoff-20261110
調査基準SHA: e13f6a5270b2cc907690a59e522f0858aac0b07e
目的: WORK3への既存成果引継ぎとN1/L1統合準備。

目標別進捗率: ゲーム本体・Android実機・Google Play公開はいずれも進捗率未設定。旧管理資料の40/40/20には確定配点がなく、継承しない。

## 1. 完了した作業

● GitHubの全29ブランチ、open PR、直近CI、ローカルcloneの既存コードを読み取り確認。
● 旧openingブランチHEADは5b3d8f916d13f7f257876cc6695ba49e96429133。
● resumeブランチHEADは上記調査基準SHA。600249fでZIP復旧、4f73921で未定義setClearHint呼出し修正、89e1944で証拠記録。その後workflow変更がある。
● 指定da424503a5230dd9c0a942a0bc64c633e627879fはGitHub commit APIが422を返す。旧報告にローカルSHAとして記録されている。履歴そのものの反映は確認できず、ZIP復旧コミットと区別する。
● 現在のWeb Audio処理、FEVER残り手数、停止・再開、設定保存、CI用ID変換処理を読んだ。
変更ファイルはこの報告書のみ。ゲーム・署名・ID・保存データは変更なし。

## 2. テスト結果

● 今回、Node vm.Scriptで基準index.htmlのインラインJavaScript4本の構文解析成功。
○ 今回、全回帰テスト・ブラウザ実行・Androidビルド・実音の確認は未実施。
既存成功テストを再実行したとは扱わない。

## 3. GitHub・CI

- 旧opening: https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/tree/feat/jewelmine2-feedback-opening-20261106
- 復旧成果: https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/tree/feat/jewelmine2-feedback-resume-20261107
- HEAD e13f6a5のdebug CI 42387862742はsuccess、AAB CI 42387862622はfailure（今回API確認）。異なるworkflow結果を混同しない。
- 直近効果音balanceブランチ4f97b9368757e6a92c989af5a29b7b00f859b654のdebug CI 42472184438はfailure。
- 同job 128705329353のログを今回取得。npm test内tests/build-identity.cjs:35のソース比較assert.deepEqualで停止。APKビルド・検査・artifact作成はskipped。テストを弱める変更はしていない。
- main・既存PRのマージなし。新規PRなし。

## 4. APK/AAB

今回の新規APK/AAB: 未作成、実物検証未実施、配信なし。
過去の復旧報告はAAB 20000201 / b0520771302dbd0510c88006c71edcd9bdcc22c3e40db1920efff5758120ed8dを記録しているが、今回は実物を再取得・検証していない。
既存debug workflowはTEST 09用でありjewelmine2更新用と扱わない。CI準備scriptは生成物のみjewelmine2へ変換する構成。

## 5. 原本不足と調査結果

○ N1「ジュエル・アクセル MAX」およびL1「FEVER PRESSURE EX」の試聴コード全文は取得できていない。
検索で判明した過去の会話上の見出しは「JEWEL MINE｜Nシリーズ3曲試聴」（jmn14）と「JEWEL MINE｜FEVER Lシリーズ」（jmfl）。これは所在の手掛かりで、コード原本の取得証拠ではない。
全remoteブランチのHTML/JS/CJS/MD/TXTを曲名・識別子で検索し一致なし。Library検索でも一致する原本を特定できなかった。不存在を証明するものではない。
現在のmusicNotes/feverNotesは既存の短い合成ループでありN1/L1と確認できない。推測で置換しない。
既存setFeverは状態変化時にタイマーとmusic出力を停止して再開する。renderがfeverTurns>0を通知する。FEVER中の配置で手数を減らし、0なら通常へ戻る。ただし蓄積宝石で連続FEVERになる分岐があり、既存仕様を維持する必要がある。
広告・非表示・pagehideで消音し、復帰時sync。効果音とBGMはbusを共有。実OS割込み時のAudioContext再開、音質・音量・二重再生は未検証。

## 6. 次の作業と実機確認項目

1. ユーザーから上記2つの試聴コード全文（HTML/JS）を一括受領する。曲名やBPMだけでは同一曲を復元しない。
2. 専用実装ブランチでN1/L1を統合。効果音balance差分とソース比較失敗を精査し、必要な限定修正と意味のある回帰検査を行う。
3. ID・versionCode・既存署名との互換性を照合し、許可範囲でビルド・実物検証。Playへのアップロード・配信・公開は行わない。
4. 検証済み更新経路が用意できた後にPixel 7で確認: 通常N1、FEVER開始L1、5手後N1、連続FEVER、設定OFF/ON、連続タップ、効果音同時発音、ホーム移動/復帰、画面消灯/復帰、広告開始/終了/キャンセル、再起動、保存保持。実施前はすべて未確認。
Play Protect無効化・アンインストールは指示しない。

## 7. ChatGPTへの依頼事項

旧チャットから2つの試聴コード全文をコピーし、WORK3へ一括で渡す案内。旧Workは削除しない。BGM統合・Pixel 7確認・Google Play公開を完了扱いしない。
