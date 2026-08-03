import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "favicon.ico",
        "favicon.svg",
        "icon-192.png",
        "icon-512.png",
        "icon-maskable-512.png",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "SC過去問トレーニング",
        short_name: "SC過去問",
        description: "情報処理安全確保支援士・応用情報の過去問演習アプリ",
        lang: "ja",
        theme_color: "#1e3a5f",
        background_color: "#f8fafc",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,json,png,svg,ico,webp}"],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    // サンドボックス/プレビュー環境の外部ホスト名を許可する
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
