# Safari試験版準備

基準：GitHub 0eaf72fc5b2f9d0a3959b4047a55516e55f5c26c、BGM実装0edb97ee087791aaae5d40196925c5dd4210b41b。
専用ブランチ：feat/work3-safari-preview-20261110。

旧main Web版と比較し、最新側には画像オープニング、赤いロゴ、音・振動設定、N1/L1、広告ゲート、スコア版管理、ドラッグ/画面固定等の変更がある。今回mainの最新版をネット再取得していないため、比較はローカルorigin/mainとの比較である。

scripts/build-safari-preview.cjs は最新index.htmlからsafari-preview/を生成する。Android index.htmlのSHA256 afb5e810134f9f84c2676a082347dc00f63980dfd8c7f86670b97a1196fe047e を保持。
Safari向け差分：ブラウザでも画像オープニング、初回操作によるAudioContext開始、全体音量スライダーと保存、全保存アクセスをjm-safari-trial-v1:へ分離、振動非対応時は設定disabled。N1/L1とSEの原音パラメータ・ゲーム計算は変更しない。
オープニングは2秒後自動終了またはタップ開始。自動終了だけでは音声は始まらず、最初の盤面操作で開始する。音量はBGM/SE共通で、既存の個別ON/OFFを維持。
広告SDKはWebに無いため報酬リセット・復活は成功させない。Android広告や振動の実機確認とは別。

検査：生成した全inline script構文、build-identity、bgm-source、Safari生成版のgesture/音量/保存/曲切替/振動UIモックを実行。ブラウザはsocket Operation not permittedで起動失敗。iPhone Safariのタッチ/ドラッグ/8x8表示/スコア/5ターン/音声/再読込保存/画面復帰は未検証。既存Android CIの5手ゲームロジック回帰成功を継承し、今回Safariで実行済みとはしない。

公開：未実施。既存Pages(main root)を変更しないため、専用の別URLへの公開承認が必要。候補は別リポジトリjewel-mine-safari-testのGitHub Pages（新規リポジトリ作成・公開設定も承認対象）。同じGitHubアカウント配下でも保存prefixを分離。予定URLは実アクセス確認URLとして提示しない。
ユーザー最小操作：試験版を別URLへ公開する承認。その後こちらで公開・アクセス検査を行い、iPhoneでURLタップ→開始タップ→プレイ→音量/ON-OFFと再読込→FEVER5配置→ホーム復帰を確認する。
