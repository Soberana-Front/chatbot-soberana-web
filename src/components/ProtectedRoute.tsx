// Importa componentes de navegação do React Router
import { Navigate, Outlet } from 'react-router';
// Importa hook de autenticação
import { useAuth } from '../contexts/AuthContext';
// Importa componente de loading
import { LoadingState } from './ui/AsyncStates';


// Componente que protege rotas privadas
export const ProtectedRoute = () => {
  // Obtém estado de autenticação e loading
  const { isAuthenticated, isLoading } = useAuth();

  // Exibe spinner enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState label="Verificando sessão..." />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Renderiza as rotas filhas (conteúdo protegido)
  return <Outlet />;
};
