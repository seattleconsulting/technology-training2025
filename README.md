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

## ドメインモデル
- Account（社員番号, 氏名, メール, パスワード, 権限）1:N RentalManage
- BookMst（書籍タイトル, ISBN, 削除日時）1:N Stock
- Stock（在庫ID, ステータス, 価格, 削除日時, BookMst, RentalManage*）
- RentalManage（貸出/返却予定・実績日時, ステータス, Stock, Account）
- 列挙: RentalStatus, StockStatus, AuthorizationTypes

## API サマリ
- 認証: POST `/api/auth/login`, `/register`, GET `/authorization-types`, `/me`, POST `/logout`
- 書籍: GET `/api/books`, GET `/api/books/{id}`, POST `/api/books`, PUT `/api/books/{id}`
- 在庫: GET `/api/stocks`, GET `/api/stocks/{id}`, POST `/api/stocks`, PUT `/api/stocks/{id}`
- 在庫カレンダー: GET `/api/stocks/calendar`（年/月パラメータ）
- 貸出: GET `/api/rentals`, GET `/api/rentals/{id}`, POST `/api/rentals`, PUT `/api/rentals/{id}`, GET `/api/rentals/options/accounts|stocks`
- 例外形式: `{errors:[{field,message}]}` を標準化、フロントの `extractErrorMessages` が表示。

## 画面フロー（フロント）
- `/login` ログイン。メール・パスワード入力→セッション確立。失敗時は API のエラーメッセージを表示。認証中はボタンがローディング。
- `/register` 新規登録。社員番号/氏名/メール/パスワード/権限を入力し登録、成功すると軽いサクセスメッセージ後に `/login` へ遷移。権限区分は `/auth/authorization-types` から取得。
- `/books` 書籍一覧と在庫数表示。モーダルで登録・編集（タイトル、ISBN 13 桁）。成功後にリスト再取得。空リスト時はプレースホルダー表示。再読み込みボタンあり。
- `/stocks` 在庫一覧と選択行の貸出履歴詳細。モーダルで在庫 ID・紐付く書籍・ステータス・価格を登録/更新（ID は編集時固定）。書籍候補は `/api/books` から取得。行クリックで詳細を開き、関連貸出をステータス付きで表示。再読み込みボタンあり。
- `/stocks/calendar` 書籍別月次空き状況表。年/月セレクタとリセットボタン、日付ごとの空き数（0 は ×）を表示。ターゲット年月をクエリパラメータ付きでリクエスト。
- `/rentals` 貸出一覧・詳細・登録/更新。行クリックで詳細を読み込み、モーダルに初期値をセット。登録/更新では在庫選択肢 `/rentals/options/stocks`、利用者選択肢 `/rentals/options/accounts` を使用。期間とステータスを指定し、API バリデーションエラーをモーダル上に表示。再読み込みボタンあり。

## バックエンド実装メモ
- Controller -> Service -> Repository -> Entity のレイヤ構成。
- バリデーション: `jakarta.validation` に加え、貸出のステータス遷移/期間重複チェックを Controller/DTO で実装。
- セキュリティ: Spring Security セッション方式、フォームログイン無効、`/api/auth/**` と静的リソースのみ非認証許可。
- ログ: `logging.level.org.springframework=DEBUG`、DevTools でホットリロード。

## リスク・改善ポイント
- 書籍一覧の在庫数集計が N+1（`BookMstService.findAvailableWithStockCount`）。集約クエリ化推奨。
- `Stock` が貸出履歴を EAGER 取得 → 大量データ時の応答肥大。LAZY + ページング検討。
- 在庫カレンダーは日数×書籍数の繰り返しクエリで重い。集計 SQL/ビューへの置換余地。
- DTO で `java.security.Timestamp` を import しておりコンパイル警告要因（`BookMstDto`, `StockDto`）。`java.sql.Timestamp` へ修正。
- 貸出登録後に `findAll().sorted()` で最新を推測する実装は競合時に誤る可能性。`save` 戻り値利用か ID 直接返却へ改修検討。

## テスト・運用
- フロント: CRA `npm test`（Testing Library）でコンポーネント単体テスト。
- バックエンド: Maven プロジェクト（単体/統合テストは別途追加想定）。`spring.jpa.show-sql=true` で SQL ログ確認。