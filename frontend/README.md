# MTLibrary React Frontend

React 製の SPA から Spring Boot REST API を利用するフロントエンドです。
ログイン後に書籍・在庫・貸出の各画面へ遷移でき、従来の JSP 画面を置き換えています。

## セットアップ

```bash
cd frontend/app
npm install
```

> **Note**: `react-router-dom` を含む依存関係を追加しています。初回は必ず `npm install` を実行してください。

## 実行

```bash
# 開発モードで起動（http://localhost:3000）
npm start
```

バックエンド（Spring Boot）がデフォルトの `http://localhost:8080/mt_library` で動作している前提です。  
異なる URL で API を公開する場合は以下の環境変数を設定してください。

```
REACT_APP_API_BASE=http://localhost:8080/mt_library/api
```

## 主な画面

- ログイン / 新規登録
- 書籍一覧・登録 / 編集
- 在庫一覧・登録 / 編集・貸出状況参照
- 在庫カレンダー（日別空き状況）
- 貸出一覧・登録 / 編集

それぞれ JSON API（`/api/**`）を利用しており、結果・エラーは画面上で確認できます。

## その他のスクリプト

```bash
# 型チェックとビルド
npm run build

# テスト
npm test
```

テスト・ビルドを実行する前にバックエンドの API が利用可能な状態であることを確認してください。
