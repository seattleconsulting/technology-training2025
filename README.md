# GitHub Codespaces での起動手順

## 0. Codespaces を起動する

GitHub のリポジトリ画面で `Code` ボタンを押し、`Codespaces` タブから Codespace を起動します。
起動後、ブラウザのターミナルを開きます。

## 1. Codespace 名を確認する

Codespaces のターミナルで以下を実行します。

```bash
echo $CODESPACE_NAME
```

表示された値が `<codespace-name>` です。

例:

```text
super-duper-acorn-g4x54p4gq9w4c9g9q
```

ブラウザで開いている Codespaces の URL からも確認できます。

```text
https://super-duper-acorn-g4x54p4gq9w4c9g9q.github.dev
```

この場合の `<codespace-name>` は `super-duper-acorn-g4x54p4gq9w4c9g9q` です。

## 2. DBの文字化けを確認する

フロントエンドを起動する前に、DBの初期データが文字化けしていないか確認します。

```bash
mysql -h metateam_academy_mysql -uroot -ppassword -e "SELECT id, title FROM mt_library.book_mst LIMIT 5;"
```

`title` が `ã‚¹ãƒƒ...` のように表示される場合は、初期データがDB上で文字化けしています。
以下を実行して、DBを初期データから作り直してください。

```bash
mysql -h metateam_academy_mysql -uroot -ppassword --default-character-set=utf8mb4 -e "DROP DATABASE mt_library;"
mysql -h metateam_academy_mysql -uroot -ppassword --default-character-set=utf8mb4 < docker/mysql/initdb/create_table.sql
mysql -h metateam_academy_mysql -uroot -ppassword --default-character-set=utf8mb4 < docker/mysql/initdb/data.sql
```

`mysql: command not found` が出る場合は、MySQLクライアントをインストールしてから再度実行してください。

```bash
sudo apt-get update
sudo apt-get install -y default-mysql-client
```

注意: `DROP DATABASE mt_library;` を実行すると、DB内の登録データは削除されます。

## 3. フロントエンドを起動する

```bash
cd /workspace/frontend
rm -rf node_modules
npm ci
REACT_APP_API_BASE=https://<codespace-name>-8080.app.github.dev/mt_library/api npm start
```

例:

```bash
REACT_APP_API_BASE=https://super-duper-acorn-g4x54p4gq9w4c9g9q-8080.app.github.dev/mt_library/api npm start
```

`react-scripts: not found` が出る場合は、依存パッケージが入っていません。`npm ci` を実行してから再度 `npm start` してください。

## 4. バックエンドを起動する

別ターミナルで以下を実行します。

```bash
cd /workspace/backend
mvn spring-boot:run
```

## 5. Ports 設定を確認する

Codespaces の `ポート` タブで以下を確認します。
Visibilityがprivateになっている場合privateのところを右クリックしポートの表示範囲からpublicに変更してください

| Port | Visibility |
| ---- | ---------- |
| 3000 | Public     |
| 8080 | Public     |

画面は 3000 の URL を開きます。地球みたいなマークを押すと自動的に画面を開いてくれます。

```text
https://<codespace-name>-3000.app.github.dev
```
