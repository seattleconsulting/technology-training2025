import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthorizationType } from '../types';
import { extractErrorMessages } from '../api/client';

export const RegisterPage: React.FC = () => {
  const { register, fetchAuthorizationTypes } = useAuth();
  const [authorizationTypes, setAuthorizationTypes] = useState<
    AuthorizationType[]
  >([]);
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authorizationType, setAuthorizationType] = useState<number>(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuthorizationTypes()
      .then((types) => {
        setAuthorizationTypes(types);
        if (types.length > 0) {
          setAuthorizationType(types[0].code);
        }
      })
      .catch((error) => setErrors(extractErrorMessages(error)));
  }, [fetchAuthorizationTypes]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors([]);
    setSuccess(null);
    setSubmitting(true);
    try {
      await register({
        employeeId,
        name,
        email,
        password,
        authorizationType
      });
      setSuccess('登録が完了しました。口グインしてください。');
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      setErrors(extractErrorMessages(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>新規登録</h1>
        <p className="auth-card__subtitle">
          社員情報を入力してアカウントを作成してください。
        </p>
        {errors.length > 0 && (
          <div className="alert alert--error">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
        {success && <div className="alert alert--success">{success}</div>}
        <form onSubmit={handleSubmit} className="form">
          <label className="form__label">
            社員番号
            <input
              className="form__input"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              required
            />
          </label>
          <label className="form__label">
            氏名
            <input
              className="form__input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
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
              autoComplete="new-password"
              minLength={5}
            />
          </label>
          <label className="form__label">
            権限区分
            <select
              className="form__input"
              value={authorizationType}
              onChange={(event) => setAuthorizationType(Number(event.target.value))}
            >
              {authorizationTypes.map((type) => (
                <option key={type.code} value={type.code}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button button--primary"
            type="submit"
            disabled={submitting}
          >
            {submitting ? '登録中...' : '登録する'}
          </button>
        </form>
        <div className="auth-card__footer">
          <span>すでにアカウントをお持ちの方は</span>
          <Link to="/login">ログイン</Link>
        </div>
      </div>
    </div>
  );
};

