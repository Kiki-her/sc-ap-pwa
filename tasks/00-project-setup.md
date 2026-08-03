# Task 00: プロジェクト初期化

## 背景

情報処理安全確保支援士（SC）と応用情報技術者（AP）の過去問演習PWAアプリを作成する。
スマホファーストのPWAとして、React + TypeScript + Vite で構築する。

## ゴール

開発環境が整い、空のページ間をルーティングで遷移できる状態にする。

## 技術的な指示

### 1. プロジェクト作成

```bash
npm create vite@latest sc-study-app -- --template react-ts
cd sc-study-app
```

### 2. 依存パッケージのインストール

```bash
# コア
npm install react-router-dom zustand dexie dexie-react-hooks

# UI
npm install -D tailwindcss @tailwindcss/vite

# PWA（後のタスクで設定するが、先にインストール）
npm install -D vite-plugin-pwa

# グラフ（後のタスクで使用）
npm install recharts

# テスト
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom fake-indexeddb
```

### 3. Tailwind CSS v4 の設定

`vite.config.ts` に Tailwind プラグインを追加:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
```

`src/index.css` の先頭に追加:

```css
@import "tailwindcss";
```

### 4. ディレクトリ構成の作成

以下のディレクトリとプレースホルダファイルを作成する:

```
src/
├── components/
│   ├── common/          # Button.tsx, ProgressBar.tsx 等（空ファイル）
│   ├── quiz/            # QuestionCard.tsx, ChoiceButton.tsx 等（空ファイル）
│   └── stats/           # DailyChart.tsx, CategoryChart.tsx 等（空ファイル）
├── pages/
│   ├── HomePage.tsx
│   ├── QuizSettingsPage.tsx
│   ├── QuizPage.tsx
│   ├── ResultPage.tsx
│   ├── MistakesPage.tsx
│   └── StatsPage.tsx
├── stores/
│   └── .gitkeep
├── db/
│   └── .gitkeep
├── hooks/
│   └── .gitkeep
├── utils/
│   └── .gitkeep
├── types/
│   └── .gitkeep
├── constants/
│   └── .gitkeep
├── App.tsx
├── main.tsx
└── index.css
public/
└── data/
    └── .gitkeep
scripts/
└── .gitkeep
tasks/
└── （タスクドキュメント群）
```

### 5. ルーティング設定

`src/App.tsx` に React Router を設定する:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuizSettingsPage from "./pages/QuizSettingsPage";
import QuizPage from "./pages/QuizPage";
import ResultPage from "./pages/ResultPage";
import MistakesPage from "./pages/MistakesPage";
import StatsPage from "./pages/StatsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<QuizSettingsPage />} />
        <Route path="/quiz/:sessionId" element={<QuizPage />} />
        <Route path="/result/:sessionId" element={<ResultPage />} />
        <Route path="/mistakes" element={<MistakesPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

各ページコンポーネントは仮実装とし、ページ名の表示と他ページへの `<Link>` を含める。

### 6. ESLint + Prettier

Vite テンプレートの ESLint 設定をベースに、Prettier を追加:

```bash
npm install -D prettier eslint-config-prettier
```

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all"
}
```

### 7. Vitest 設定

`vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
```

`src/test-setup.ts`:
```typescript
import "@testing-library/jest-dom";
import "fake-indexeddb/auto";
```

## 参照すべきファイル

なし（新規プロジェクト）

## 完了条件

- [ ] `npm run dev` でアプリが起動する
- [ ] ブラウザで `/`, `/settings`, `/quiz/test`, `/result/test`, `/mistakes`, `/stats` にアクセスでき、それぞれページ名が表示される
- [ ] 各ページ間を `<Link>` で遷移できる
- [ ] `npm run build` がエラーなく完了する
- [ ] `npm run test` が実行できる（テストファイルは0でもよい）
- [ ] Tailwind のクラスが適用される（例: 仮ページに `className="text-blue-500"` を当てて青文字になる）

## テスト方法

```bash
npm run dev        # 開発サーバー起動を確認
npm run build      # ビルド成功を確認
npm run test       # テスト実行基盤の確認
```

ブラウザで各ルートにアクセスし、画面遷移を手動確認。
