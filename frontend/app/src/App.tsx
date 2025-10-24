import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./page";
import { BookListPage } from "./app/list/bookList/Page";
const App = () => {
  return (
    <Router>
      <Routes>
        {/* 初期表示はログイン画面 */}
        <Route path="/" element={<LoginPage />} />
        {/* 書籍一覧とホームページを統合したページ */}
        <Route path="/List/bookList" element={<BookListPage />} />
      </Routes>
    </Router>
  );
};

export default App;