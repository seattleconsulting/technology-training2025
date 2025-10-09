import { useState } from "react";
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

export default function BorrowAddPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: "",
    borrowDate: "",
    returnDate: "",
    inventoryId: "",
    status: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  navigate("/List/bookList");
};

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ display: "flex", flex: 1 }}>
        {/* サイドバー */}
        <aside style={sidebarStyle}>
          <h1>{bookList.sidebarTitle}</h1>
          <h2>{bookList.subTitle}</h2>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            <li>
              <Link to="/rental/add">
                <button style={buttonStyle}>{bookList.add}</button>
              </Link>
            </li>
            <li>
              <Link to="/rental/edit">
                <button style={buttonStyle}>{bookList.rentalEdit}</button>
              </Link>
            </li>
          </ul>
        </aside>

        {/* メインコンテンツ */}
        <main style={{ flex: 1, padding: "1rem" }}>
          <h1 style={{ color: "gray" }}>{bookList.rentalEdit}</h1>
          <hr style={{ borderColor: "#eee", borderWidth: "1px", margin: "8px 0" }} />

          {/* 注意書きと戻るリンク */}
          <div style={headerNoticeStyle}>
            <p style={{ color: "red", fontSize: "0.9rem", margin: 0 }}>＊は必須項目です</p>
            <Link to="/List/bookList">
              <span style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}>← 一覧へ戻る</span>
            </Link>
          </div>

          {/* エラーメッセージ表示 */}
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

          {/* 登録フォーム */}
          <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
            <FormField label={bookList.employeeId} required name="employeeId" value={formData.employeeId} onChange={handleChange} />
            <FormField label={bookList.borrowDate} required name="borrowDate" value={formData.borrowDate} onChange={handleChange} type="date" />
            <FormField label={bookList.returnDate} required name="returnDate" value={formData.returnDate} onChange={handleChange} type="date" />
            <FormField label={bookList.inventoryId} required name="inventoryId" value={formData.inventoryId} onChange={handleChange} />

            {/* ステータス選択プルダウン */}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ color: "gray", display: "block", marginBottom: "5px" }}>
                {bookList.status}
                <span style={{ color: "red", marginLeft: "4px" }}>＊</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              >
                <option value=""></option>
                <option value="貸出待ち">貸出待ち</option>
                <option value="貸出中">貸出中</option>
                <option value="返却済み">返却済み</option>
                <option value="キャンセル">キャンセル</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "10vh" }}>
              <button type="submit" style={submitButtonStyle}>
                {bookList.save}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  name,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  required?: boolean;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label style={{ color: "gray", display: "block", marginBottom: "5px" }}>
        {label}
        {required && <span style={{ color: "red", marginLeft: "4px" }}>＊</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
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

// スタイル定数
const sidebarStyle = {
  width: "200px",
  backgroundColor: "#333",
  color: "white",
  padding: "1rem",
  height: "100%",
};

const buttonStyle = {
  color: "indigo",
  border: "none",
  padding: "10px 20px",
  borderRadius: "5px",
  cursor: "pointer",
  marginBottom: "10px",
  width: "100%",
};

const submitButtonStyle = {
  backgroundColor: "green",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "5px",
  cursor: "pointer",
};

const headerNoticeStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  margin: "8px 0 16px",
};