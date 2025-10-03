"use client";

import { Link, useNavigate } from "react-router-dom";

const bookList = {
  sidebarTitle: "MT書籍管理",
  subTitle: "メニュー",
  add: "貸出登録",
  rentalEdit: "貸出編集",
  bookList: "書籍一覧",
  edit: "編集",
  bookName: "書籍名",
  isbn: "ISBN",
  employeeId: "社員番号",
  borrowDate: "貸出予定日",
  returnDate: "返却予定日",
  inventoryId: "在庫管理番号",
  status: "ステータス",
  save: "保存",
};

export default function BorrowEditPage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* サイドバーとメインコンテンツ */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* サイドバー */}
        <aside
          style={{
            width: "200px",
            backgroundColor: "#333",
            color: "white",
            padding: "1rem",
            height: "100%",
          }}
        >
          <h1>{bookList.sidebarTitle}</h1>
          <h2>{bookList.subTitle}</h2>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            <li>
              <Link to="/rental/add">
                <button
                  style={{
                    color: "indigo",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginBottom: "10px",
                    width: "100%",
                  }}
                >
                  {bookList.add}
                </button>
              </Link>
            </li>
            <li>
              <Link to="/rental/edit">
                <button
                  style={{
                    color: "indigo",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  {bookList.rentalEdit}
                </button>
              </Link>
            </li>
          </ul>
        </aside>

        {/* メインコンテンツ */}
        <div style={{ flex: 1, padding: "1rem" }}>
          <h1 style={{ color: "gray" }}>{bookList.rentalEdit}</h1>
          <hr
            style={{
              borderColor: "#eee",
              borderWidth: "1px",
              margin: "8px 0",
            }}
          />

          {/* 必須項目と戻るリンク */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "8px 0 16px",
            }}
          >
            <p style={{ color: "red", fontSize: "0.9rem", margin: 0 }}>
              ＊は必須項目です
            </p>
            <Link to="/List/bookList">
              <span
                style={{
                  color: "blue",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                ← 一覧へ戻る
              </span>
            </Link>
          </div>

          {/* 書籍登録フォーム */}
          <form style={{ marginTop: "20px" }}>
            {/* 社員番号 */}
            <FormField label={bookList.employeeId} required />

            {/* 貸出予定日 */}
            <FormField label={bookList.borrowDate} required />

            {/* 返却予定日 */}
            <FormField label={bookList.returnDate} required />

            {/* 在庫管理番号 */}
            <FormField label={bookList.inventoryId} required />

            {/* ステータス */}
            <FormField label={bookList.status} required />

            {/* 保存ボタン */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "10vh",
              }}
            >
              <button
                type="submit"
                style={{
                  backgroundColor: "green",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/List/bookList")}
              >
                {bookList.save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/** 共通フォームフィールドコンポーネント */
function FormField({ label, required }: { label: string; required?: boolean }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label
        style={{
          color: "gray",
          display: "block",
          marginBottom: "5px",
        }}
      >
        {label}
        {required && <span style={{ color: "red", marginLeft: "4px" }}>＊</span>}
      </label>
      <input
        type="text"
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
    </div>
  );
}
