import { FormEvent, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessages } from '../api/client';

interface LocationState {
  from?: { pathname?: string };
}

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await login(email, password);
      const redirectTo = state?.from?.pathname ?? '/books';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrors(extractErrorMessages(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>ログイン</h1>
        <p className="auth-card__subtitle">
          社内図書の管理システムへログインしてください。
        </p>
        {errors.length > 0 && (
          <div className="alert alert--error">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form">
          <label className="form__label">
            メールアドレス
            <input
              className="form__input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="form__label">
            パスワード
            <input
              className="form__input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button
            className="button button--primary"
            type="submit"
            disabled={submitting}
          >
            {submitting ? '認証中...' : 'ログイン'}
          </button>
        </form>
        <div className="auth-card__footer">
          <span>アカウントをお持ちでない方は</span>
          <Link to="/register">新規登録</Link>
        </div>
      </div>
    </div>
  );
};
