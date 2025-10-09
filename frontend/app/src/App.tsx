import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./page";
import { CombinedPage } from "./app/List/bookList/Page";
import BorrowAddPage from "./app/rental/add/Page";
import BorrowEditPage from "./app/rental/edit/Page";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 初期表示はログイン画面 */}
        <Route path="/" element={<LoginPage />} />
        {/* 書籍一覧とホームページを統合したページ */}
        <Route path="/List/bookList" element={<CombinedPage />} />
        <Route path="/rental/add" element={<BorrowAddPage />} />
        <Route path="/rental/edit" element={<BorrowEditPage />} />
      </Routes>
    </Router>
  );
};

export default App;