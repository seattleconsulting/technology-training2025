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
  stockCount: "在庫数",
};

const tableHeaders = ["編集", "書籍名", "ISBN", "在庫数"];

export const BookListPage = () => {
  const navigate = useNavigate();

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
            height: "100vh",
          }}
        >
          <h1>{bookList.sidebarTitle}</h1>
          <p>{bookList.subTitle}</p>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {links.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.href}
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
                    width: "80%",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* メインコンテンツ */}
        <main style={{ flex: 1, padding: "1rem" }}>
          <h2 style={{ color: "gray" }}>{bookList.bookList}</h2>
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
                {tableHeaders.map((header) => (
                  <th key={header} style={{ border: "1px solid black" }}>
                    {header}
                  </th>
                ))}
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
        </main>
      </div>
    </div>
  );
};