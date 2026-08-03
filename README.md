# SC過去問トレーニング (sc-ap-pwa)

## プロジェクト概要

- **名称**: SC過去問トレーニング
- **目的**: 情報処理安全確保支援士（SC）・応用情報技術者（AP）の午前問題を、スマホでオフラインでも反復学習できるようにする
- **主な機能**:
  - 3つの出題モード（全シャッフル / 年度別 / 分野別）でのセッション学習
  - 1問ごとの正誤判定・解説表示
  - 中断／再開（セッションの進捗を IndexedDB に保持）
  - 間違えた問題の自動記録・一覧・復習セッション・アーカイブ（理解した）
  - セッション結果の分野別正答率表示
  - 学習履歴（直近30日の学習量グラフ、分野別正答率、苦手分野TOP5、連続学習日数）
  - PWA（ホーム画面に追加、オフライン動作、更新通知）
  - ダークモード（OS設定に自動追従）

## URL

- **ローカルプレビュー**: http://localhost:3000
- **GitHub**: https://github.com/Kiki-her/sc-ap-pwa
- **本番（Cloudflare Pages）**: 未デプロイ（Task 13 の手順を参照）

## 技術スタック

- React 19 + TypeScript + Vite
- Tailwind CSS v4（`@tailwindcss/vite`）
- React Router v7
- Dexie.js 4（IndexedDB）
- Recharts 3（グラフ）
- vite-plugin-pwa（Service Worker / manifest）
- Vitest 4 + @testing-library/react（テスト）
- oxlint / prettier

## データアーキテクチャ

### 問題データ（静的JSON・読み取り専用）

`public/data/` に年度・試験ごとのJSONを配置し、`index.json` のメタ情報をもとに全件を取得・統合してメモリキャッシュします。

```
public/data/
├── index.json        # { files: [{filename, exam, year, season, count}], totalQuestions, lastUpdated }
├── AP-2024A.json     # Question[]
├── AP-2023A.json
├── SC-2024S.json
└── SC-2023A.json
```

**Question**（`src/types/index.ts`）

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | string | `{Exam}-{Year}{S\|A}-Q{NN}` 形式（例: `SC-2024S-Q01`） |
| `exam` | `"AP" \| "SC"` | 試験区分 |
| `year` / `season` | number / `"春" \| "秋"` | 実施年度・季節 |
| `questionNumber` | number | 問番号 |
| `majorCategory` / `subCategory` | IPA公式分類 | 大分類3種・中分類23種 |
| `questionText` | string | 問題文 |
| `choices` | `Record<"ア"\|"イ"\|"ウ"\|"エ", string>` | 選択肢 |
| `correctAnswer` | ChoiceKey | 正解 |
| `explanation` | string | 解説 |
| `imageUrl` | string \| null | 図の相対パス（任意） |

### 学習データ（IndexedDB / Dexie）

DB名 `sc-study-app`、3テーブル構成（`src/db/`）。

| テーブル | 主キー | 内容 |
|---|---|---|
| `answerRecords` | `++id` | 1解答ごとの記録（questionId, selectedAnswer, isCorrect, answeredAt, sessionId） |
| `sessions` | `id` | 出題セッション（mode, 各フィルタ, questionIds, currentIndex, totalQuestions, correctCount, startedAt, completedAt） |
| `mistakes` | `questionId` | 間違い記録（mistakeCount, lastMistakenAt, archived） |

### データフロー

```
public/data/*.json ──(dataLoader: fetch+キャッシュ)──▶ Question[]
                                                        │
出題設定 ──(questionFilter → shuffle → slice)──▶ Session（IndexedDB）
                                                        │
出題画面 ──解答──▶ answerRecords 追加 / 不正解なら mistakes upsert / session 更新
                                                        │
結果・間違い一覧・統計 ◀──(hooks で集計: answerRecords × Question)
```

## 画面とルーティング

| パス | 画面 | 主な機能 |
|---|---|---|
| `/` | ホーム | 解答済み数・正答率・進捗バー、続きから、各画面への導線 |
| `/settings` | 出題設定 | モードタブ、試験種別、年度／季節、大分類→中分類連動、問題数、該当数リアルタイム表示 |
| `/quiz/:sessionId` | 出題 | 問題／選択肢／正誤ハイライト／解説／次の問題、終了確認ダイアログ |
| `/result/:sessionId` | 結果 | 正答数・正答率・ドット表示、分野別正答率、間違い一覧＋詳細モーダル、復習セッション |
| `/mistakes` | 間違えた問題 | 試験・分野フィルタ、回数／日時ソート、アーカイブ表示切替、詳細モーダル、復習セッション |
| `/stats` | 学習履歴 | 累計統計、直近30日棒グラフ、分野別正答率、苦手分野TOP5 |

未定義パスは `/` にリダイレクトします。

## ディレクトリ構成

```
src/
├── components/
│   ├── common/   # PageLayout, PageHeader, ProgressBar, Skeleton, MenuButton,
│   │             # SegmentControl, ChipSelect, TabBar, QuestionDetailModal,
│   │             # EmptyState, UpdatePrompt
│   ├── quiz/     # QuestionCard, ChoiceButton, ExplanationPanel, QuizHeader
│   └── stats/    # DailyChart, CategoryChart, CategoryBar
├── pages/        # HomePage, QuizSettingsPage, QuizPage, ResultPage, MistakesPage, StatsPage
├── hooks/        # useQuestions, useHomeStats, useCreateSession, useQuiz,
│                 # useSessionResult, useMistakes, useStats
├── db/           # index(Dexie), answerRecords, sessions, mistakes (+ __tests__)
├── utils/        # dataLoader, questionFilter, shuffle, format (+ __tests__)
├── types/        # 型定義
└── constants/    # categories（IPA分類・試験日程・年度）
scripts/
├── validate-data.ts     # 過去問JSONの検証
└── generate-icons.py    # PWAアイコン生成
```

## 利用方法（ユーザーガイド）

1. ホーム画面で「学習を始める」をタップ
2. 出題モード（全シャッフル／年度別／分野別）と試験種別・問題数を選び「開始する」
3. 選択肢をタップすると正誤と解説が表示されます。「次の問題」で進みます
4. 途中でやめる場合は「← 終了」→ ホームの「続きから」で再開できます
5. 全問終了で結果画面へ。間違えた問題はそのまま「間違えた問題を復習」できます
6. 「間違えた問題」画面で苦手問題を絞り込み復習。理解できた問題は詳細モーダルの「理解した」でアーカイブ
7. 「学習履歴」で学習量・分野別正答率・苦手分野を確認
8. スマホのブラウザメニューから「ホーム画面に追加」でPWAとしてインストール（以後オフラインでも利用可）

## 開発コマンド

```bash
npm run dev            # Vite 開発サーバー
npm run build          # tsc -b && vite build
npm run preview        # ビルド結果をプレビュー
npm run test           # vitest run
npm run test:watch     # vitest watch
npm run lint           # oxlint
npm run format         # prettier
npm run validate:data  # public/data の検証
python3 scripts/generate-icons.py  # PWAアイコン再生成
```

サンドボックスでのプレビュー起動:

```bash
fuser -k 3000/tcp 2>/dev/null || true
npm run build
pm2 start ecosystem.config.cjs
curl http://localhost:3000
```

## テスト

- `src/db/__tests__/` — answerRecords / sessions / mistakes の CRUD・クエリ（fake-indexeddb 使用）
- `src/utils/__tests__/` — shuffle / questionFilter
- 合計 45 テスト（`npm run test`）

## デプロイ

- **プラットフォーム**: Cloudflare Pages（静的サイト）
- **状態**: ❌ 未デプロイ
- **設定値**:
  - Build command: `npm run build`
  - Build output directory: `dist`
  - 環境変数: `NODE_VERSION=20`
- **SPA対応**: `public/_redirects`（`/* /index.html 200`）
- **セキュリティヘッダ**: `public/_headers`
- main ブランチへの push で自動デプロイされる構成を想定

## 現在の制約・未対応

- **問題データが不足**: 現在30問（うち20問は動作確認用の自作サンプル）。実際のIPA過去問（AP 80問／回、SC 25問／回、2020〜2025年度の11回分）の投入が必要です。`npm run validate:data` は期待問題数に達していない場合に警告を出します（`--strict-count` でエラー化）
- 問題文中の図（`imageUrl`）は `public/data/images/` に配置する運用ですが、実データ未投入のため未使用
- 実機（iPhone Safari / Android Chrome）でのPWAインストール・機内モード動作確認は未実施

## 次のステップ

1. 実際の過去問データを `public/data/` に投入し `npm run validate:data --strict-count` を通す
2. Cloudflare Pages へデプロイし、本番URLで PWA インストール・オフライン動作を検証
3. 実機でのレスポンシブ／ダークモード／タッチ操作の最終確認
4. バンドル分割（現在 730kB の単一チャンク。Recharts の動的 import で軽量化可能）

## 最終更新

2026-08-03
