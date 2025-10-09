import { Link, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";

const bookList = {
  sidebarTitle: "MT書籍管理",
  subTitle: "メニュー",
  add: "貸出登録",
  rentalEdit: "貸出編集",
  bookList: "書籍一覧",
  edit: "編集",
  bookName: "書籍名",
  isbn: "ISBN",
  stockCount: "在庫数",
};

export const CombinedPage = () => {
  const navigate = useNavigate();
  const books = [];

  const links = [
    { href: "/rental/add", label: bookList.add },
    { href: "/rental/edit", label: bookList.rentalEdit },
  ];

  return (
    <div className="flex flex-col h-screen">
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
            {links.map((link, index) => (
              <li key={index}>
                <Link to={link.href}>
                  <a
                    href={link.href}
                    style={{
                      display: "block",
                      backgroundColor: "white",
                      color: "indigo",
                      textAlign: "center",
                      textDecoration: "none",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginBottom: "10px",
                      width: "100%",
                    }}
                  >
                    {link.label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* メインコンテンツ */}
        <main style={{ flex: 1, padding: "1rem" }}>
          <h1 style={{ color: "gray" }}>{bookList.bookList}</h1>
          <hr
            style={{
              borderColor: "#eee",
              borderWidth: "1px",
              margin: "8px 0",
            }}
          />

          <table
            style={{
              borderCollapse: "collapse",
              width: "50%",
              border: "1px solid black",
            }}
          >
            <thead style={{ backgroundColor: "#eee" }}>
              <tr>
                {Object.entries(bookList).map(([key, value]) => {
                  if (["edit", "bookName", "isbn", "stockCount"].includes(key)) {
                    return (
                      <th key={key} style={{ border: "1px solid black" }}>
                        {value}
                      </th>
                    );
                  }
                  return null;
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: "1px solid black" }}>
                  <button
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate("/rental/edit")}
                  >
                    :pencil2:
                  </button>
                </td>
                <td style={{ border: "1px solid black" }}></td>
                <td style={{ border: "1px solid black" }}></td>
                <td style={{ border: "1px solid black" }}></td>
              </tr>
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
};