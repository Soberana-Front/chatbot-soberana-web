import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import {
  authService,
  type User,
  type LoginCredentials,
  type RegisterData,
} from "../services/authService";

import { api, ApiError } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: {
    token: string;
    password: string;
    passwordConfirmation: string;
  }) => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (data: Partial<Pick<User, "name" | "email">>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Persiste os dados da autenticação.
  const setAuthData = (token: string, user: User) => {
    localStorage.setItem("@Soberana:token", token);
    localStorage.setItem("@Soberana:user", JSON.stringify(user));

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setToken(token);
    setUser(user);
  };

  // Encerra a sessão.
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  // Consulta e valida a sessão no servidor.
  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem("@Soberana:token");
    const storedUser = localStorage.getItem("@Soberana:user");

    if (!storedToken) {
      authService.logout();
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    // Recupera os dados locais enquanto valida a sessão.
    setToken(storedToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

    let cachedUser: User | null = null;

    if (storedUser) {
      try {
        cachedUser = JSON.parse(storedUser) as User;
        setUser(cachedUser);
      } catch {
        localStorage.removeItem("@Soberana:user");
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setIsLoading(true);

    try {
      const userData = await authService.getMe();

      setUser(userData);
      setToken(storedToken);

      localStorage.setItem("@Soberana:user", JSON.stringify(userData));
    } catch (error) {
      // Token comprovadamente inválido: encerra a sessão.
      if (error instanceof ApiError && error.status === 401) {
        logout();
      } else {
        // Falha de conexão ou outro erro: preserva os dados locais.
        setToken(storedToken);
        setUser(cachedUser);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Valida a sessão automaticamente ao iniciar a aplicação.
  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  // Realiza login.
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);

    try {
      const response = await authService.login(credentials);

      if (response.success && response.data) {
        setAuthData(response.data.token, response.data.user);
      } else {
        throw new Error(response.message || "Erro ao fazer login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Realiza cadastro.
  const register = async (data: RegisterData) => {
    setIsLoading(true);

    try {
      const response = await authService.register(data);

      if (response.success && response.data) {
        setAuthData(response.data.token, response.data.user);
      } else {
        throw new Error(response.message || "Erro ao criar conta");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Atualiza os dados básicos do usuário.
  const updateUser = (data: Partial<Pick<User, "name" | "email">>) => {
    if (!user) return;

    const updatedUser = { ...user, ...data };

    setUser(updatedUser);
    localStorage.setItem("@Soberana:user", JSON.stringify(updatedUser));
  };

  // Solicita recuperação de senha.
  const forgotPassword = async (email: string) => {
    await authService.forgotPassword(email);
  };

  // Redefine a senha.
  const resetPassword = async (data: {
    token: string;
    password: string;
    passwordConfirmation: string;
  }) => {
    await authService.resetPassword(data);
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        checkAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
