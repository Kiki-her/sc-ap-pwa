# Task 11: PWA化とオフライン対応

## 背景

スマホでホーム画面に追加し、ネイティブアプリのように使えるPWAにする。
全データをクライアントに持つ設計のため、オフラインでも完全動作させる。

## ゴール

PWAとしてインストール可能になり、オフラインで全機能が動作する。

## 技術的な指示

### 1. vite-plugin-pwa 設定

`vite.config.ts` を更新:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "icon-192.png",
        "icon-512.png",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "SC過去問トレーニング",
        short_name: "SC過去問",
        description: "情報処理安全確保支援士・応用情報の過去問演習アプリ",
        theme_color: "#1e3a5f",
        background_color: "#f8fafc",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,json,png,svg,ico}"],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB（過去問JSON含む）
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
              },
            },
          },
        ],
      },
    }),
  ],
});
```

### 2. アプリアイコン

以下のファイルを `public/` に配置:

- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)
- `apple-touch-icon.png` (180x180px)
- `favicon.ico`

デザイン: 試験勉強アプリらしいシンプルなアイコン。背景色 `#1e3a5f`（ダークブルー）に白い盾＋チェックマーク等。
AIツールやシンプルなSVGで作成すればよい。

### 3. HTMLメタタグ

`index.html` の `<head>` に追加:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="theme-color" content="#1e3a5f" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

### 4. iOS Safe Area対応

スタンドアロンモードでの上下のSafe Area（ノッチ・ホームバー）に対応:

```css
/* src/index.css に追加 */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 5. アップデート通知

新バージョンがデプロイされた時にユーザーに通知する:

```typescript
// src/components/common/UpdatePrompt.tsx
// vite-plugin-pwa の useRegisterSW を使用
// 新しいSWが検出されたらトースト通知を表示し、タップでリロード
```

## 参照すべきファイル

- `vite.config.ts`
- `index.html`
- `src/index.css`

## 完了条件

- [ ] `npm run build && npm run preview` でビルド後のアプリがプレビューできる
- [ ] Chrome DevTools > Application > Manifest にマニフェスト情報が表示される
- [ ] Chrome DevTools > Application > Service Workers に SW が登録される
- [ ] Chrome で「インストール」プロンプトまたはアドレスバーのインストールアイコンが表示される
- [ ] Chrome DevTools > Network で「Offline」にチェックしてもアプリが動作する
- [ ] iOS Safari で「ホーム画面に追加」後、スタンドアロンで起動できる
- [ ] アプリアイコンが正しく表示される

## テスト方法

```bash
npm run build
npm run preview
```

1. Chrome で `http://localhost:4173` にアクセス
2. DevTools > Application で Manifest, Service Workers, Cache Storage を確認
3. DevTools > Network > Offline にチェックしてアプリ操作
4. スマホ実機（iPhone Safari / Android Chrome）で「ホーム画面に追加」を実行
5. ホーム画面からアプリを起動しスタンドアロン表示を確認
6. 機内モードでアプリが動作することを確認
