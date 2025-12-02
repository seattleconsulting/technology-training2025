# MTLibrary 設計書（ダウンロード用）

## 目的
- 社内図書の書籍・在庫・貸出を統合管理する SPA＋REST API の学習・研修用プロダクト。
- 既存 JSP を置き換え、Docker + Dev Container で誰でも同一環境を再現できるようにする。

## 全体アーキテクチャ
- インフラ: docker compose（MySQL, MinIO, Spring Boot, React）。`compose.yaml`
- コンテナ開発環境: VS Code Dev Container（Java 21, Node 18, npm、自動ビルド/起動）`.devcontainer/devcontainer.json`
- バックエンド: Spring Boot (Java 21), Spring Security（セッション認証 + Bcrypt）, Spring Data JPA, MySQL。
- フロントエンド: React 19, TypeScript, CRA, React Router 6、REST 呼び出しは `apiFetch` に集約。
- CORS: `http://localhost:3000` のみ許可、API ベース `http://localhost:8080/mt_library/api`。

## デプロイ / 実行
- `docker compose up -d` で全サービス起動（8080:API, 3000:SPA, 3306:DB, 9000/9001:MinIO）。
- Dev Container 起動時に `mvn -DskipTests package` と `npm install` を自動実行。ホットリロード有効。
- バックエンド設定: `backend/src/main/resources/application.properties`

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

---
パス: `docs/design.md`
