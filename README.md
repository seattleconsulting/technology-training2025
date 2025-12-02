# technology-training2025
Java（Spring Boot）と React で構成された研修用アプリケーションです。Docker でバックエンド・フロントエンド・MySQL・MinIO をまとめて起動できます。

## 前提ツール
- Docker Desktop（Compose v2 が使える状態）
- make は不要。ローカル実行を行う場合のみ Java 21 / Maven、Node.js 20+ / npm が必要

## クイックスタート（Docker Compose）
```bash
# リポジトリ直下で実行
docker compose build
docker compose up -d
```
- `metateam_academy_app`（Spring Boot）が立ち上がるまで 30〜60 秒ほど待つ
- フロントエンドの依存関係が無い場合は起動後に `docker compose exec frontend npm install` を一度実行しておく

### アクセス URL
- React フロントエンド: http://localhost:3000
- REST API (JSON): http://localhost:8080/mt_library/api
- MinIO コンソール: http://localhost:9001/login （ユーザー `minio` / パスワード `minio123`）

### よく使うコマンド
```bash
# ログ確認（サービスごと）
docker compose logs -f metateam_academy_app
docker compose logs -f frontend

# 停止
docker compose down
```

## サービス構成（compose.yaml）
- `metateam_academy_mysql`: MySQL 8。初期データは `docker/mysql/initdb` 配下で初回起動時に投入され、以降は Volume `db-store` に保持
- `metateam_academy_minio`: オブジェクトストレージ（コンソールは :9001）
- `metateam_academy_app`: Spring Boot アプリ。ホットリロード前提でリポジトリ全体をコンテナにマウントし、デバッグポート :5005 を公開
- `frontend`: React 開発サーバー。`./frontend` をマウントし `npm start` で起動

## ローカルで直接起動したい場合（任意）
コンテナを使わずに動かす場合は、必要なランタイムをインストールした上で以下を実行します。

```bash
# バックエンド（Java 21 が必要）
cd backend
mvn spring-boot:run

# フロントエンド（Node.js 20+）
cd frontend
npm install
npm start
```

バックエンドのベース URL は `http://localhost:8080/mt_library` を前提にしています。変更する場合はフロントエンド起動前に環境変数 `REACT_APP_API_BASE` を設定してください。
