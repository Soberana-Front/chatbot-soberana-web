// Importa hooks do React
import { useState } from 'react';
// Importa hook de navegação
import { useNavigate } from 'react-router';
// Importa layout de autenticação
import { AuthLayout } from '../../components/layout/AuthLayout';
// Importa formulário de login
import { LoginForm } from './LoginForm';
// Importa botões de login social
import { SocialLoginButtons } from '../../components/shared/SocialLoginButtons';
// Importa contexto de autenticação
import { useAuth } from '../../contexts/AuthContext';
// Importa tipo do formulário
import { LoginFormData } from '../../validations/authSchemas';

// Página de login
const Login = () => {
  // Obtém função de login do contexto
  const { login } = useAuth();
  const navigate = useNavigate();
  // Estados de loading e erro
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Envia credenciais para autenticação
  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await login({ email: data.email, password: data.password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder para login social (aguardando OAuth no back-end)
  const handleGoogleLogin = () => {
    alert('Login com Google (em breve)');
  };

  const handleGithubLogin = () => {
    alert('Login com GitHub (em breve)');
  };

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Faça login para acessar o sistema"
    >
      {/* Container com espaçamento entre formulário e botão social */}
      <div className="auth-form-container">
        {/* Formulário de login */}
        <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
        {/* Botões de login social */}
        <SocialLoginButtons
          onGoogleClick={handleGoogleLogin}
          onGithubClick={handleGithubLogin}
          disabled={isLoading}
        />
      </div>
    </AuthLayout>
  );
};

export default Login;