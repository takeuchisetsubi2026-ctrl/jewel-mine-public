# ZIPに保存されていた過去の引継ぎ報告

以下はZIP原文の履歴です。今回の検証結果は `2026-11-07-feedback-recovery.md` を参照してください。画像の公開GitHub登録は今回ユーザー承認済みです。

【chat】ジュエルマイン開発2 宛て
ジュエルマイン開発引き継ぎ報告書

作業日時：2026年11月7日 JST（今回の検証）
対象リポジトリ：takeuchisetsubi2026-ctrl/jewel-mine-public
作業ブランチ：feat/jewelmine2-feedback-resume-20261107（ローカル）
引継ぎ元：feat/jewelmine2-feedback-opening-20261106
元HEAD：5b3d8f916d13f7f257876cc6695ba49e96429133
実装コミット：da424503a5230dd9c0a942a0bc64c633e627879f（ローカル）
対象：com.takeuchisetsubi.jewelmine2／基準v4.0.9／Pixel 7

【目標別進捗率】
①ゲーム本体：進捗率未設定
②Android実機：進捗率未設定
③Google Play公開：進捗率未設定
過去報告の40%・40%・20%には算出配点が記載されておらず、今回の確定率として継承しない。

1. 既存成果の調査
・実装済み・今回ブラウザ確認済み：振動呼出し、5種の操作音、通常/FEVER用BGM、個別設定保存、2秒/スキップ/広告開始待ち。
・実装済み・実機未検証：実振動、音質・音量、Android設定への追従、実広告との切替。
・調査時に未実装：採用画像・赤い葉2枚ロゴの使用、コンボ・宝石回収・ゲーム終了の専用効果音。
・不明：今回演出版のPixel 7での結果、Play側で次に使用可能なversionCode。
・既存CI 42235264455は87a70ebc97aed9edfc37cee427deedca1c71bc4dでsuccessを確認。今回実装のCI結果とは区別する。
  https://github.com/takeuchisetsubi2026-ctrl/jewel-mine-public/actions/runs/42235264455

2. 完了した作業（今回）
● 採用原本を取得し画像を直接確認。JEWEL MINEと赤い葉2枚のロゴが一体の画像を無加工で組込み。別画像の生成なし。
● コンボ・宝石回収・ゲーム終了の合成効果音を追加。終了音は既存広告要求の終了後に鳴らし、広告要求自体は維持。
● 影の移動はAndroid 34以降の弱いSEGMENT_FREQUENT_TICKへ変更。65msの連発抑制を継承。実振動は未検証。
● 音源は既存のWeb Audio発振器と固定音符配列を継承。外部楽曲・録音・サンプルなし。
● 原本→Web資産→Android同梱予定資産の画像バイト一致を確認。
● 既存の得点・ゲームルール・保存処理を比較する回帰チェックに合格。広告Java、アプリID設定、署名鍵・署名設定は元HEADとの差分なし。

変更ファイル（実装コミット9件）：
・index.html
・android/app/src/main/java/com/wilduncle/jewelmine/codextest/JewelMineHapticsPlugin.java
・scripts/build-web.cjs
・scripts/prepare-jewelmine2-ci.cjs
・tests/build-identity.cjs
・tests/game-feedback.cjs
・assets/opening/jewel-mine.png
・assets/opening/README.md
・.github/workflows/jewelmine2-feedback-unsigned-aab.yml
報告・証拠：本ファイル、2026-11-07-feedback-tests.log。

3. テスト結果
● Node v24.22.1／Chromium 153.0.8010.0／Linuxでnpm test全13スクリプトが終了コード0。
  実行：CHROMIUM_PATH=<ブラウザ実行パス> npm test
● オープニング2000ms・タップスキップ・広告初期化待ち・画像decodeを確認。
● BGM広告停止/再開・FEVER開始/終了・音/振動設定の保存をモックで確認。
● 実際の配置→ライン消去からコンボ/宝石回収音、終了処理から終了音を確認。
● SCORE/BEST保護、復活2回・再読込後の3回目拒否、広告報酬失敗時の維持を確認。
● 320×640、393×851、412×915、800×360で画像全体が画面内に収まることを確認。393pxの画面を目視確認。
● npm run sync:android、npm run check、git diff --check、追加workflowのYAML解析に合格。
画像SHA-256：e58f42ef2f59a29e26c0ae0383e9370d7c92948661a27d3ec0b3fa05e0c13149
音声/振動はモックによる確認であり、実際に聴いた・振動を体感した結果ではない。

4. GitHub反映状況
○ 新ブランチpushは自動承認審査で拒否。公開リポジトリに採用画像と非公開ファイル識別情報を載せる明示許可が不足との理由。
・非公開識別情報は実装コミットを修正して除去済み。画像の公開許可は未取得としてpushを再試行していない。
・GitHub側の新ブランチ照会は404。新PRなし。main/既存ブランチ/既存PRへの変更・マージなし。

5. Android APK・AAB
○ 今回のAPK/AAB生成は未完了。署名・Playアップロード・内部配信・公開なし。
・別の隔離作業コピーでjewelmine2用の生成資産を準備しCapacitor同期まで成功。
・bundleReleaseはgradle-8.14.3-all.zip取得時の「Network is unreachable」で停止。Android Javaのコンパイル未確認。
・新ブランチ用の未署名AAB生成/アプリID/署名なし/画像バイト照合workflowは準備済み、実行未確認。
・通常debug workflowはTEST 09用の別アプリID。jewelmine2の更新用として扱わない。
・既存署名鍵を変更・新規作成していない。

6. 未完了・次の作業
○ 採用画像を公開GitHubに含める明示承認→新専用ブランチpush→CI・未署名AABの生成/検査。
○ その後、別途承認の範囲で署名・内部テスト配信。versionCodeはPlayの最大値確認が必要。
○ Pixel 7：振動強度/連発/OS振動OFF、実音量・音質、通常↔FEVER、実広告切替、起動毎の2秒/タップ、更新時のSCORE/BEST/復活回数保持を確認。

7. ChatGPTへの依頼事項
画像公開の可否をユーザーに確認する。未検証のAPK/AAB・Pixel 7動作を完了扱いしない。

【報告日時 JST】
202611071610
