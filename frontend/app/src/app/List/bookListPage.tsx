"use client";

import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

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
  const [books] = useState([]);

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
                    backgroundColor: "white",
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
                    backgroundColor: "white",
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
          <h1 style={{ color: "gray" }}>{bookList.bookList}</h1>
          <hr
            style={{
              borderColor: "#eee",
              borderWidth: "1px",
              margin: "8px 0",
            }}
          />
          <div style={{ height: "16px" }}></div>

          <table
            style={{
              borderCollapse: "collapse",
              width: "50%",
              border: "1px solid black",
            }}
          >
            <thead style={{ backgroundColor: "#eee" }}>
              <tr>
                <th style={{ border: "1px solid black" }}>{bookList.edit}</th>
                <th style={{ border: "1px solid black" }}>{bookList.bookName}</th>
                <th style={{ border: "1px solid black" }}>{bookList.isbn}</th>
                <th style={{ border: "1px solid black" }}>{bookList.stockCount}</th>
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
                    ✏️
                  </button>
                </td>
                <td style={{ border: "1px solid black" }}></td>
                <td style={{ border: "1px solid black" }}></td>
                <td style={{ border: "1px solid black" }}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
