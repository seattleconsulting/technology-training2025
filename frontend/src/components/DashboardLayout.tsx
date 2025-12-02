import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessages } from '../api/client';
import { useState } from 'react';

export const DashboardLayout: React.FC = () => {
  const { account, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const userInitial =
    account && account.name ? account.name.charAt(0).toUpperCase() : 'U';

  const closeNav = () => setNavOpen(false);

  const handleLogout = async () => {
    setError(null);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(extractErrorMessages(err).join('\n'));
    }
  };

  return (
    <div className="layout">
      <aside className={`sidebar ${navOpen ? 'sidebar--open' : ''}`}>
        <div className="brand">
          <span className="brand__acronym">MTL</span>
          <span className="brand__name">MTLibrary</span>
        </div>
        <nav className="sidebar__nav">
          <NavLink
            to="/books"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeNav}
          >
            <span className="sidebar__icon" aria-hidden>
              📚
            </span>
            <span className="sidebar__text">書籍一覧</span>
          </NavLink>
          <NavLink
            to="/stocks"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeNav}
          >
            <span className="sidebar__icon" aria-hidden>
              🗂
            </span>
            <span className="sidebar__text">在庫管理</span>
          </NavLink>
          <NavLink
            to="/stocks/calendar"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeNav}
          >
            <span className="sidebar__icon" aria-hidden>
              📆
            </span>
            <span className="sidebar__text">在庫カレンダー</span>
          </NavLink>
          <NavLink
            to="/rentals"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeNav}
          >
            <span className="sidebar__icon" aria-hidden>
              🔄
            </span>
            <span className="sidebar__text">貸出管理</span>
          </NavLink>
        </nav>
      </aside>
      {navOpen && <div className="sidebar-backdrop" onClick={closeNav} />}
      <div className="main">
        <header className="topbar">
          <div className="topbar__info">
            <span className="topbar__badge">Dashboard</span>
            <div className="topbar__title-group">
              <span className="topbar__title">社内図書管理システム</span>
              {account && (
                <span className="topbar__account">
                  おかえりなさい、{account.name} さん
                </span>
              )}
            </div>
          </div>
          <div className="topbar__actions">
            <div className="topbar__avatar" aria-label="ユーザー">
              {userInitial}
            </div>
            <button type="button" className="button button--secondary" onClick={handleLogout}>
              ログアウト
            </button>
          </div>
        </header>
        {error && <div className="alert alert--error">{error}</div>}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
