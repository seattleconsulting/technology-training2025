# REST API Overview

React 版フロントエンドから利用する JSON API のエンドポイントと役割を整理します。  
すべてのレスポンスは `application/json`、エラー時には HTTP ステータスコードと `errors` 配列を返却します。

## 認証 / アカウント
- `POST /api/auth/login`  
  - リクエスト: `{ "email": string, "password": string }`  
  - レスポンス: `{ "account": AccountSummary, "token": string }`
- `POST /api/auth/logout`  
  - 実行後はセッション/API トークンを無効化。
- `GET /api/auth/me`  
  - 現在ログイン中のアカウント情報を返却。
- `GET /api/auth/authorization-types`  
  - レスポンス: `[{ "code": number, "label": string }]`
- `POST /api/auth/register`  
  - リクエスト: `AccountRegisterRequest`

AccountSummary:
```json
{
  "employeeId": "A001",
  "name": "山田 太郎",
  "email": "yamada@example.com",
  "authorizationType": 0
}
```

AccountRegisterRequest:
```json
{
  "employeeId": "A001",
  "name": "山田 太郎",
  "email": "yamada@example.com",
  "password": "secret",
  "authorizationType": 0
}
```

## 書籍 (Book)
- `GET /api/books` → `BookListItem[]`
- `GET /api/books/{id}` → `BookDetail`
- `POST /api/books` (管理者専用) → `BookDetail`
- `PUT /api/books/{id}` (管理者専用) → `BookDetail`

BookListItem:
```json
{
  "id": 1,
  "title": "React 入門",
  "isbn": "9781234567890",
  "availableStockCount": 3
}
```

BookDetail には上記に加えて関連在庫の要約を含める。

## 在庫 (Stock)
- `GET /api/stocks` → `StockSummary[]`
- `GET /api/stocks/{id}` → `StockDetail`
- `POST /api/stocks` → `StockDetail`
- `PUT /api/stocks/{id}` → `StockDetail`
- `GET /api/stocks/calendar?year=2025&month=1` → `StockCalendar`

StockDetail:
```json
{
  "id": "ST-0001",
  "status": 0,
  "price": 3800,
  "book": { "id": 1, "title": "React 入門" },
  "rentals": [
    {
      "id": 10,
      "status": 1,
      "expectedRentalOn": "2025-01-10",
      "expectedReturnOn": "2025-01-20",
      "account": { "employeeId": "A001", "name": "山田 太郎" }
    }
  ]
}
```

StockCalendar:
```json
{
  "targetYear": 2025,
  "targetMonth": 1,
  "daysOfWeek": ["01(水)", "02(木)", "..."],
  "books": [
    {
      "title": "React 入門",
      "totalAvailable": 4,
      "dailyAvailability": ["4", "3", "×", "..."]
    }
  ]
}
```

## 貸出 (Rental)
- `GET /api/rentals` → `RentalSummary[]`
- `GET /api/rentals/{id}` → `RentalDetail`
- `POST /api/rentals` → `RentalDetail`
- `PUT /api/rentals/{id}` → `RentalDetail`

RentalDetail:
```json
{
  "id": 42,
  "stockId": "ST-0001",
  "employeeId": "A001",
  "status": 1,
  "expectedRentalOn": "2025-01-10",
  "expectedReturnOn": "2025-01-20",
  "rentaledAt": "2025-01-10T09:00:00Z",
  "returnedAt": null,
  "canceledAt": null
}
```

## フォーム支援情報
- `GET /api/rentals/options/accounts` → 社員一覧
- `GET /api/rentals/options/stocks` → 在庫候補（クエリ `onlyAvailable=true` で利用可能のみ絞り込み）
- 書籍候補は `/api/books` のレスポンスを利用

## エラーレスポンス
```json
{
  "errors": [
    { "field": "email", "message": "登録済みのメールアドレスです" }
  ]
}
```

API 仕様は実装の進捗に合わせて随時アップデートします。
