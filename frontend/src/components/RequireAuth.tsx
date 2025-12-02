import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RequireAuth: React.FC<{ children: React.ReactElement }> = ({
  children
}) => {
  const { account, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <p>認証情報を確認しています...</p>
      </div>
    );
  }

  if (!account) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

