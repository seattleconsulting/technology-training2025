import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { apiFetch, ApiError } from '../api/client';
import {
  AccountSummary,
  AuthorizationType,
  LoginResponse
} from '../types';

interface RegisterPayload {
  employeeId: string;
  name: string;
  email: string;
  password: string;
  authorizationType: number;
}

interface AuthContextValue {
  account: AccountSummary | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AccountSummary>;
  logout: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<AccountSummary>;
  refresh: () => Promise<void>;
  fetchAuthorizationTypes: () => Promise<AuthorizationType[]>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    try {
      const profile = await apiFetch<AccountSummary>('/auth/me', {
        method: 'GET'
      });
      setAccount(profile);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setAccount(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAccount(response.account);
    setToken(response.token);
    return response.account;
  }, []);

  const logout = useCallback(async () => {
    await apiFetch<void>('/auth/logout', {
      method: 'POST',
      skipJsonParsing: true
    });
    setAccount(null);
    setToken(null);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await apiFetch<AccountSummary>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response;
  }, []);

  const fetchAuthorizationTypes = useCallback(async () => {
    return apiFetch<AuthorizationType[]>('/auth/authorization-types', {
      method: 'GET'
    });
  }, []);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      account,
      token,
      loading,
      login,
      logout,
      register,
      refresh,
      fetchAuthorizationTypes
    }),
    [
      account,
      fetchAuthorizationTypes,
      loading,
      login,
      logout,
      refresh,
      register,
      token
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
