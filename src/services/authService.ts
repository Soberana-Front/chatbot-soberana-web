// Importa instância do Axios
import { api } from './api';
import type { paths } from '../api/generated/schema';
import type { RegisterSettings } from '../types/settings';

type LoginRoute = paths['/api/auth/login']['post'];
type RegisterRoute = paths['/api/auth/register']['post'];
type RegisterRequest = RegisterRoute['requestBody']['content']['application/json'];

// Credenciais para login
export type LoginCredentials = LoginRoute['requestBody']['content']['application/json'];

// Dados para registro de usuário
export type RegisterData = Omit<
  RegisterRequest,
  'termsAccepted' | 'privacyPolicyAccepted' | 'settings'
> & {
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  settings?: RegisterSettings;
};

// Resposta padrão da API de autenticação
export type AuthResponse = LoginRoute['responses'][200]['content']['application/json'];

// Dados do usuário logado
export type User = AuthResponse['data']['user'];

// Serviço de autenticação com todos os métodos da API
export const authService = {
  // Login: envia credenciais e retorna token + usuário
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Registro: cria novo usuário com dados completos
  async register(data: RegisterData): Promise<AuthResponse> {
    if (!data.termsAccepted || !data.privacyPolicyAccepted) {
      throw new Error('Aceite os Termos de Uso e a Política de Privacidade para continuar');
    }
    const payload: RegisterRequest = { ...data, termsAccepted: true, privacyPolicyAccepted: true };
    const response = await api.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },

  // Solicita link de recuperação de senha por e-mail
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Redefine senha com token recebido por e-mail
  async resetPassword(data: { token: string; password: string; passwordConfirmation: string }): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  // Busca dados do usuário autenticado
  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Remove token e dados do localStorage e limpa header do Axios
  logout(): void {
    localStorage.removeItem('@Soberana:token');
    localStorage.removeItem('@Soberana:user');
    delete api.defaults.headers.common['Authorization'];
  },
};
