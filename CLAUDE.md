# CLAUDE.md — プロジェクト指示書

## プロジェクト概要

情報処理安全確保支援士（SC）と応用情報技術者（AP）の過去問演習PWAアプリ。
スマホファーストで、オフラインで動作し、自分一人が使う個人用ツール。

## 技術スタック

- **フレームワーク:** React 19 + TypeScript + Vite
- **UI:** Tailwind CSS v4
- **ルーティング:** React Router v7
- **状態管理:** Zustand
- **DB:** IndexedDB（Dexie.js経由）
- **グラフ:** Recharts
- **PWA:** vite-plugin-pwa
- **テスト:** Vitest + @testing-library/react + fake-indexeddb

## ディレクトリ構成

```
src/
├── components/
│   ├── common/        # 共通UIコンポーネント
│   ├── quiz/          # 出題関連コンポーネント
│   └── stats/         # 統計・グラフ系コンポーネント
├── pages/             # ページコンポーネント（1ファイル1ページ）
├── stores/            # Zustand ストア
├── db/                # Dexie DB定義とCRUD関数
├── hooks/             # カスタムフック
├── utils/             # ユーティリティ関数
├── types/             # TypeScript 型定義
├── constants/         # 定数定義
├── App.tsx
├── main.tsx
└── index.css
public/
└── data/              # 過去問JSONデータ
    ├── index.json     # データファイルのメタ情報
    ├── AP-2024A.json  # 応用情報 2024年秋
    ├── SC-2024S.json  # 支援士 2024年春
    └── images/        # 問題中の図表画像
scripts/
└── validate-data.ts   # データバリデーションスクリプト
tasks/
└── *.md               # タスク定義ドキュメント
```

## タスク管理

- タスク定義は `tasks/` ディレクトリにある
- ファイル名の番号順が実行順序を示す（依存関係は各タスク内に明記）
- 各タスクには「完了条件」が定義されている。全ての完了条件を満たしてからタスクを完了とすること

## コーディング規約

### 全般

- 言語は TypeScript を厳密に使用する。`any` は禁止。型が不明な場合は `unknown` を使い、型ガードで絞り込む
- `as` による型アサーションは最小限にする
- 未使用の変数・import は残さない

### React

- 関数コンポーネントのみ使用する（クラスコンポーネント禁止）
- コンポーネントは `function` 宣言で定義する（`const Component = () =>` ではなく `function Component()`）
- Props の型は `interface` で定義し、コンポーネントと同じファイルに置く
- `useEffect` の依存配列は正確に記述する。ESLint の警告を無視しない
- 状態が複雑になる場合はカスタムフックに切り出す

### ファイル・命名

- コンポーネントファイル: PascalCase（`QuizPage.tsx`）
- フック: camelCase で `use` プレフィックス（`useQuiz.ts`）
- ユーティリティ: camelCase（`dataLoader.ts`）
- 型定義: PascalCase（`Question`, `AnswerRecord`）
- 定数: UPPER_SNAKE_CASE（`CATEGORY_MAP`）

### スタイリング

- Tailwind CSS のユーティリティクラスのみ使用する。カスタムCSSは最小限
- レスポンシブ: モバイルファーストで記述する（`sm:`, `md:` でブレークポイント拡張）
- ダークモード: 全ての色指定に `dark:` バリアントを併記する
- タッチターゲット: タップ可能な要素は最低 44x44px（`min-h-[44px] min-w-[44px]`）

### テスト

- DB 関連（`src/db/`）はユニットテスト必須
- ユーティリティ関数（`src/utils/`）はユニットテスト必須
- ページ・コンポーネントのテストは任意（手動確認でもよい）
- テストファイルは対象ファイルと同じディレクトリの `__tests__/` に配置

### import

- パスエイリアスは使わない。相対パスで記述する
- import の順序: 1) React/外部ライブラリ → 2) 内部モジュール → 3) 型 import

## 日本語の取り扱い

- UIのテキスト（ボタンラベル、見出し等）は全て日本語
- コード中のコメントは日本語でもよい
- 変数名・関数名・型名は英語

## 作業の進め方

1. 指示されたタスクファイル（`tasks/XX-*.md`）を読む
2. 「参照すべきファイル」に挙げられたファイルを確認する
3. タスクの指示に従って実装する
4. 「完了条件」を全て満たしているか確認する
5. 「テスト方法」に記載された方法でテストする
6. テストがパスしたら完了

タスクの指示と CLAUDE.md の内容が矛盾する場合は、CLAUDE.md を優先する。
