# Task 02: 過去問JSONデータの作成

## 背景

IPA公式サイトで公開されている過去問PDFをJSON形式に変換し、アプリのデータソースとする。
2026年度以降はCBT化に伴い問題が非公開となるため、利用可能な過去問は2025年度（令和7年度）秋期までのペーパー試験で公開されたもの。

対象:
- 応用情報技術者（AP）科目A（旧午前）: 各回80問
- 情報処理安全確保支援士（SC）科目A-2（旧午前II）: 各回25問

## ゴール

`public/data/` に全過去問JSONファイルが配置され、バリデーションスクリプトがエラー0で通る。

## 技術的な指示

### 1. データ取得元

IPA公式 過去問題ページ: https://www.ipa.go.jp/shiken/mondai-kaiotu/index.html

各回の問題冊子PDF（問題）と解答PDF（正解）をダウンロードする。
解説はIPA公式には掲載されていないため、以下のいずれかで対応:
- 過去問道場（https://www.ap-siken.com/, https://www.sc-siken.com/）の解説を参考にする
- AIに解説を生成させる
- 解説フィールドは空文字でもアプリは動作するので、後から埋めてもよい

### 2. 対象回一覧

| ファイル名 | 試験 | 年度(西暦) | 季節 | 令和表記 | 問題数 |
|-----------|------|-----------|------|---------|-------|
| AP-2020A.json | AP | 2020 | 秋 | 令和2年秋 | 80 |
| AP-2021S.json | AP | 2021 | 春 | 令和3年春 | 80 |
| AP-2021A.json | AP | 2021 | 秋 | 令和3年秋 | 80 |
| AP-2022S.json | AP | 2022 | 春 | 令和4年春 | 80 |
| AP-2022A.json | AP | 2022 | 秋 | 令和4年秋 | 80 |
| AP-2023S.json | AP | 2023 | 春 | 令和5年春 | 80 |
| AP-2023A.json | AP | 2023 | 秋 | 令和5年秋 | 80 |
| AP-2024S.json | AP | 2024 | 春 | 令和6年春 | 80 |
| AP-2024A.json | AP | 2024 | 秋 | 令和6年秋 | 80 |
| AP-2025S.json | AP | 2025 | 春 | 令和7年春 | 80 |
| AP-2025A.json | AP | 2025 | 秋 | 令和7年秋 | 80 |
| SC-2020A.json | SC | 2020 | 秋 | 令和2年秋 | 25 |
| SC-2021S.json | SC | 2021 | 春 | 令和3年春 | 25 |
| SC-2021A.json | SC | 2021 | 秋 | 令和3年秋 | 25 |
| SC-2022S.json | SC | 2022 | 春 | 令和4年春 | 25 |
| SC-2022A.json | SC | 2022 | 秋 | 令和4年秋 | 25 |
| SC-2023S.json | SC | 2023 | 春 | 令和5年春 | 25 |
| SC-2023A.json | SC | 2023 | 秋 | 令和5年秋 | 25 |
| SC-2024S.json | SC | 2024 | 春 | 令和6年春 | 25 |
| SC-2024A.json | SC | 2024 | 秋 | 令和6年秋 | 25 |
| SC-2025S.json | SC | 2025 | 春 | 令和7年春 | 25 |
| SC-2025A.json | SC | 2025 | 秋 | 令和7年秋 | 25 |

※2020年春はコロナで中止のため存在しない。
※2025年秋のデータが未公開の場合はスキップし、公開され次第追加する。

合計: AP 最大11回 × 80問 = 880問、SC 最大11回 × 25問 = 275問、総計 最大1,155問

### 3. JSONフォーマット

各ファイルは Question[] の配列:

```json
[
  {
    "id": "AP-2024A-Q01",
    "exam": "AP",
    "year": 2024,
    "season": "秋",
    "questionNumber": 1,
    "majorCategory": "テクノロジ系",
    "subCategory": "基礎理論",
    "questionText": "AIにおける教師あり学習の説明として，最も適切なものはどれか。",
    "choices": {
      "ア": "正解ラベルが付与された訓練データを用いて...",
      "イ": "データにラベルを付けずに...",
      "ウ": "報酬信号を基に...",
      "エ": "ニューラルネットワークの層を..."
    },
    "correctAnswer": "ア",
    "explanation": "教師あり学習は、入力データとそれに対応する正解ラベルのペアを...",
    "imageUrl": null
  }
]
```

### 4. 画像の取り扱い

問題文中に図表がある場合:
- 画像ファイルを `public/data/images/{問題ID}.png` に配置
- `imageUrl` フィールドに `"/data/images/AP-2024A-Q05.png"` のようにパスを設定
- 画像がない問題は `imageUrl` を `null` にする

### 5. 分野分類の方法

各問題の中分類（subCategory）は以下の方法で判定する:
- IPA公式の「解答例」PDFには分野が記載されていない
- 過去問道場サイト（ap-siken.com, sc-siken.com）の分類を参照するのが最も正確
- AIに問題文から分類させる場合は、`src/constants/categories.ts` の中分類リストを選択肢として与え、必ずその中から選ばせること

### 6. バリデーションスクリプト

`scripts/validate-data.ts` を作成する:

```typescript
/**
 * public/data/*.json のバリデーション
 * 実行: npx tsx scripts/validate-data.ts
 */

// チェック項目:
// 1. 各JSONファイルがパース可能か
// 2. 全問題が Question 型のスキーマに適合するか
//    - id が命名規則に従っているか（正規表現: /^(AP|SC)-\d{4}[SA]-Q\d{2,3}$/）
//    - exam が "AP" | "SC" のいずれか
//    - year が 2020〜2025 の範囲
//    - season が "春" | "秋" のいずれか
//    - majorCategory が有効な大分類
//    - subCategory が有効な中分類で、大分類との整合性がある
//    - choices にア・イ・ウ・エの4キーが存在
//    - correctAnswer がア・イ・ウ・エのいずれか
//    - questionText が空でない
// 3. ID の重複がないか
// 4. 各ファイルの問題数が期待値と一致するか（AP=80, SC=25）
// 5. 結果サマリを出力（ファイル数、総問題数、エラー数）
```

### 7. データ生成の推奨手順

1. IPAサイトから問題PDF・解答PDFをダウンロード
2. 1回分のPDFをClaudeに投げて以下のプロンプトで変換:

```
以下のIPAの過去問PDFの内容をJSON形式に変換してください。

試験: {AP or SC}
年度: {2024}
季節: {秋}

出力フォーマット（1問ごと）:
{
  "id": "{Exam}-{Year}{S or A}-Q{番号2桁}",
  "exam": "{AP or SC}",
  "year": {年},
  "season": "{春 or 秋}",
  "questionNumber": {番号},
  "majorCategory": "{テクノロジ系 or マネジメント系 or ストラテジ系}",
  "subCategory": "{中分類名}",
  "questionText": "問題文",
  "choices": { "ア": "...", "イ": "...", "ウ": "...", "エ": "..." },
  "correctAnswer": "{正解の選択肢キー}",
  "explanation": "解説",
  "imageUrl": null
}

中分類は以下から選択してください:
テクノロジ系: 基礎理論, アルゴリズムとプログラミング, コンピュータ構成要素, システム構成要素, ソフトウェア, ハードウェア, ヒューマンインターフェイス, マルチメディア, データベース, ネットワーク, セキュリティ, システム開発技術, ソフトウェア開発管理技術
マネジメント系: プロジェクトマネジメント, サービスマネジメント, システム監査
ストラテジ系: システム戦略, システム企画, 経営戦略マネジメント, 技術戦略マネジメント, ビジネスインダストリ, 企業活動, 法務

全問題を1つのJSON配列として出力してください。
```

3. 出力されたJSONを対応するファイルに保存
4. バリデーションスクリプトを実行してエラーを修正
5. 全ファイル完了まで繰り返し

### 8. インデックスファイル

全データファイルのメタ情報をまとめた `public/data/index.json` を作成:

```json
{
  "files": [
    { "filename": "AP-2020A.json", "exam": "AP", "year": 2020, "season": "秋", "count": 80 },
    { "filename": "SC-2020A.json", "exam": "SC", "year": 2020, "season": "秋", "count": 25 },
    ...
  ],
  "totalQuestions": 1155,
  "lastUpdated": "2025-XX-XX"
}
```

## 参照すべきファイル

- `src/types/index.ts` — Question 型の定義
- `src/constants/categories.ts` — 中分類の一覧

## 完了条件

- [ ] `public/data/` に対象回のJSONファイルが配置されている
- [ ] `public/data/index.json` が作成されている
- [ ] `scripts/validate-data.ts` が作成されている
- [ ] `npx tsx scripts/validate-data.ts` がエラー0で通る
- [ ] 全問題のIDに重複がない
- [ ] AP各回80問、SC各回25問であることが確認できる

## テスト方法

```bash
npx tsx scripts/validate-data.ts
```

出力例:
```
Validating data files...
✓ AP-2024A.json: 80 questions, 0 errors
✓ SC-2024S.json: 25 questions, 0 errors
...
Summary: 19 files, 1155 questions, 0 errors
```
