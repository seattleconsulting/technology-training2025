import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { DashboardLayout } from './components/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BooksPage } from './pages/BooksPage';
import { StocksPage } from './pages/StocksPage';
import { StockCalendarPage } from './pages/StockCalendarPage';
import { RentalsPage } from './pages/RentalsPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="books" replace />} />
            <Route path="books" element={<BooksPage />} />
            <Route path="stocks" element={<StocksPage />} />
            <Route path="stocks/calendar" element={<StockCalendarPage />} />
            <Route path="rentals" element={<RentalsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/books" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
