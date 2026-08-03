# Task 13: デプロイ

## 背景

ローカルで完成したアプリを公開し、スマホからいつでもアクセスできるようにする。

## ゴール

本番URLでアプリにアクセスでき、PWAとしてインストール・オフライン動作する。

## 技術的な指示

### 1. デプロイ先: Cloudflare Pages

無料枠で十分（帯域無制限、月500ビルド）。静的サイトのデプロイに最適。

### 2. セットアップ手順

1. GitHubにリポジトリをpush

2. Cloudflare ダッシュボード（https://dash.cloudflare.com/）にログイン

3. Workers & Pages > Create > Pages > Connect to Git

4. リポジトリを選択し、以下を設定:
   - Framework preset: `None`（または Vite を選択できれば Vite）
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node.js version: 環境変数 `NODE_VERSION` = `20`

5. デプロイ実行

### 3. SPAのルーティング対応

React Router を使ったSPAでは、直接URLアクセス時に404になる問題がある。
Cloudflare Pages では `public/_redirects` ファイルで対応:

```
/* /index.html 200
```

または `public/_headers` と合わせて:

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
```

### 4. カスタムドメイン（任意）

Cloudflare Pages のデフォルトドメイン（`*.pages.dev`）でも十分使える。
独自ドメインを使う場合はCloudflare DNS経由で設定。

### 5. 自動デプロイ

GitHub の main ブランチに push するたびに自動でビルド・デプロイされる。
ブランチプレビュー機能も有効にしておくと、PRごとにプレビューURLが発行される。

### 6. デプロイ後の確認

- [ ] 本番URLにアクセスしてアプリが表示される
- [ ] 各ページに直接URLアクセスして404にならない
- [ ] HTTPS が有効
- [ ] スマホ（iPhone Safari）で「ホーム画面に追加」→ スタンドアロン起動
- [ ] スマホ（Android Chrome）で「インストール」→ アプリ起動
- [ ] 機内モードでアプリが動作する
- [ ] 問題を解いて解答記録が保存される
- [ ] ブラウザを閉じて再度開いても記録が残っている

### 7. 代替: Vercel

Cloudflare Pages で問題がある場合の代替。

```bash
npm install -g vercel
vercel
```

Vercel もGitHub連携で自動デプロイ可能。SPAのリワイト設定は `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 参照すべきファイル

- `vite.config.ts`
- `package.json`（build スクリプト）
- `public/_redirects`

## 完了条件

- [ ] 本番URLでアプリにアクセスできる
- [ ] 各ページに直接URLアクセスして正しく表示される
- [ ] スマホ実機でPWAインストールできる
- [ ] オフライン（機内モード）でアプリが動作する
- [ ] mainブランチへのpushで自動デプロイされる

## テスト方法

1. 本番URLにPCブラウザでアクセス
2. 全ページの表示・動作を確認
3. スマホ実機でPWAインストール
4. 機内モードで動作確認
5. GitHubにダミーコミットをpushして自動デプロイを確認
